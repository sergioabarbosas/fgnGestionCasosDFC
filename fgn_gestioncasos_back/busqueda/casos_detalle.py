from collections import defaultdict

import pymysql

from busqueda.mysql_origen import get_origen_conn


def _fetch(cur, table, radicados):
    ph = ",".join(["%s"] * len(radicados))
    cur.execute(f"SELECT * FROM dbo_dfc.{table} WHERE c_radicado IN ({ph})", radicados)
    return cur.fetchall()


def obtener_casos(radicados):
    """Caso completo + sus personas y empresas, en el orden de `radicados`."""
    if not radicados:
        return []

    conn = get_origen_conn()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            casos = _fetch(cur, "gestion_casos_main", radicados)
            personas = _fetch(cur, "gestion_casos_personas", radicados)
            empresas = _fetch(cur, "gestion_casos_empresas", radicados)
    finally:
        conn.close()

    p_by, e_by = defaultdict(list), defaultdict(list)
    for p in personas:
        p_by[p["c_radicado"]].append(p)
    for e in empresas:
        e_by[e["c_radicado"]].append(e)

    by_rad = {c["c_radicado"]: c for c in casos}
    out = []
    for rad in radicados:
        caso = by_rad.get(rad)
        if not caso:
            continue  # existe en ClickHouse pero ya no en origen
        caso["personas"] = p_by.get(rad, [])
        caso["empresas"] = e_by.get(rad, [])
        out.append(caso)
    return out