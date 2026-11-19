import time
from collections import defaultdict
from datetime import datetime, timezone

from django.core.management.base import BaseCommand

from busqueda.clickhouse import get_client
from busqueda.mysql_origen import get_origen_conn

BATCH_SIZE = 1000


def now_version() -> int:
    """milisegundos desde 1970-01-01 UTC en el momento del sync."""
    return int(time.time() * 1000)


def chunked(items, size):
    for i in range(0, len(items), size):
        yield items[i:i + size]


def to_dt(value):
    """Convierte a datetime naive. Si es 
    inválido o vacío, usa now()."""
    if isinstance(value, datetime):
        return value.replace(tzinfo=None)
    if isinstance(value, str):
        v = value.strip()
        if v and not v.startswith("0000"):
            for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M:%S.%f",
                        "%Y-%m-%d", "%d/%m/%Y %H:%M:%S", "%d/%m/%Y"):
                try:
                    return datetime.strptime(v, fmt)
                except ValueError:
                    continue
    return datetime.now(timezone.utc)


class Command(BaseCommand):
    help = "Sincroniza casos MySQL remoto -> ClickHouse (casos_idx y casos_rel_idx)."

    def add_arguments(self, parser):
        parser.add_argument("--full", action="store_true", help="Carga completa")
        parser.add_argument("--since", type=str, default=None, help="YYYY-mm-dd HH:MM:SS (opcional)")

    def handle(self, *args, **opts):
        src = get_origen_conn()
        try:
            self._run(src, opts)
        finally:
            src.close()

    def _run(self, src, opts):
        ch = get_client()
        full = opts["full"]
        since = opts["since"]

        self.stdout.write(self.style.NOTICE("Iniciando sync..."))

        with src.cursor() as cur:
            cur.execute("SELECT DATABASE()")
            dbname = cur.fetchone()[0]
        self.stdout.write(self.style.WARNING(f"MySQL origen DB actual: {dbname}"))

        where = ""
        params = []
        if not full and since:
            where = "WHERE m.dt_fecha_modifica >= %s"
            params.append(since)

        main_sql = f"""
            SELECT
                m.c_radicado,
                COALESCE(m.tx_hechos, '') AS tx_hechos,
                COALESCE(m.tx_hipotesis, '') AS tx_hipotesis,
                COALESCE(m.tx_observaciones, '') AS tx_observaciones,
                COALESCE(m.c_radicado_origen, '') AS c_radicado_origen,
                COALESCE(m.c_eje_tematico, '') AS c_eje_tematico,
                m.dt_fecha_modifica
            FROM dbo_dfc.gestion_casos_main m
            {where}
        """

        with src.cursor() as cur:
            cur.execute(main_sql, params)
            rows = cur.fetchall()

        if not rows:
            self.stdout.write(self.style.WARNING("No hay casos para sincronizar."))
            return

        radicados = [r[0] for r in rows]
        self.stdout.write(self.style.SUCCESS(f"Casos a sync: {len(radicados)}"))

        ver = now_version()

        # 1) casos_idx
        total_casos = 0
        for batch in chunked(rows, BATCH_SIZE):
            casos_data = []
            for r in batch:
                dt_mod = to_dt(r[6])
                casos_data.append([
                    r[0], r[1], r[2], r[3], r[4], r[5], dt_mod, ver
                ])

            ch.insert(
                "casos_idx",
                casos_data,
                column_names=[
                    "c_radicado",
                    "tx_hechos",
                    "tx_hipotesis",
                    "tx_observaciones",
                    "c_radicado_origen",
                    "c_eje_tematico",
                    "updated_at",
                    "sync_version",
                ],
            )
            total_casos += len(casos_data)

        # 2) limpiar rels viejas
        for rad_batch in chunked(radicados, BATCH_SIZE):
            ch.command(
                "ALTER TABLE casos_rel_idx DELETE WHERE c_radicado IN {rads:Array(String)} SETTINGS mutations_sync=1",
                parameters={"rads": rad_batch},
            )

        # 3) rels (personas + empresas)
        total_rel = 0
        for rad_batch in chunked(radicados, BATCH_SIZE):
            placeholders = ",".join(["%s"] * len(rad_batch))

            persons_by_rad = defaultdict(list)
            p_sql = f"""
                SELECT
                    p.id_consecutivo,
                    p.c_radicado,
                    COALESCE(p.c_numero_identificacion, ''),
                    COALESCE(p.c_nombre_completo, ''),
                    COALESCE(p.c_alias_persona, ''),
                    COALESCE(p.c_abonados_telefonicos, '')
                FROM dbo_dfc.gestion_casos_personas p
                WHERE p.c_radicado IN ({placeholders})
            """
            with src.cursor() as cur:
                cur.execute(p_sql, rad_batch)
                for pid, rad, ident, nom, alias, tels in cur.fetchall():
                    persons_by_rad[rad].append((int(pid), ident, nom, alias, tels))

            comps_by_rad = defaultdict(list)
            e_sql = f"""
                SELECT
                    e.id_consecutivo,
                    e.c_radicado,
                    COALESCE(e.c_nit, ''),
                    COALESCE(e.c_razon_social, ''),
                    COALESCE(e.c_nombre_comercial, ''),
                    COALESCE(e.c_abonados_telefonicos, '')
                FROM dbo_dfc.gestion_casos_empresas e
                WHERE e.c_radicado IN ({placeholders})
            """
            with src.cursor() as cur:
                cur.execute(e_sql, rad_batch)
                for eid, rad, nit, razon, nomcom, tels in cur.fetchall():
                    comps_by_rad[rad].append((int(eid), nit, razon, nomcom, tels))

            rel_data = []
            now_dt = datetime.utcnow()
            for rad in rad_batch:
                for pid, ident, nom, alias, tels in persons_by_rad.get(rad, []):
                    rel_data.append([rad, "persona", pid, ident, nom, alias, tels, now_dt, ver])
                for eid, nit, razon, nomcom, tels in comps_by_rad.get(rad, []):
                    rel_data.append([rad, "empresa", eid, nit, razon, nomcom, tels, now_dt, ver])

            if rel_data:
                ch.insert(
                    "casos_rel_idx",
                    rel_data,
                    column_names=[
                        "c_radicado",
                        "tipo",
                        "id_consecutivo",
                        "identificador",
                        "nombre",
                        "alias_o_comercial",
                        "telefonos",
                        "updated_at",
                        "sync_version",
                    ],
                )
                total_rel += len(rel_data)

        self.stdout.write(self.style.SUCCESS(f"Sync OK. casos={total_casos} rel={total_rel}"))
