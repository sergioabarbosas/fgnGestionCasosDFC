import re
from typing import Dict, List, Tuple

from busqueda.clickhouse import get_client

DB = "DataHub_analytics"

## Cols a buscar en aplica
CASOS_COLS = [ 
    "c_radicado",
    "tx_hechos",
    "tx_hipotesis",
    "tx_observaciones",
    "c_radicado_origen",
    "c_eje_tematico",
]

REL_COLS = [
    "c_radicado",
    "tipo",
    "identificador",
    "nombre",
    "alias_o_comercial",
    "telefonos",
]

# Captura: "frase exacta" o token suelto
TOKEN_RE = re.compile(r'"([^"]+)"|(\S+)')


def _escape_like(s: str, keep_percent: bool = False) -> str:
    """
    Escapa caracteres especiales de LIKE.
    - Siempre escapa la barra invertida y el guion bajo.
    - Escapa % salvo que se quiera conservar como comodín explícito del usuario.
    """
    s = s.replace("\\", "\\\\").replace("_", "\\_")
    if not keep_percent:
        s = s.replace("%", "\\%")
    return s


def parse_query(q: str) -> List[str]:
    """
    Reglas:
    - palabra suelta: contiene -> %palabra%
    - "frase exacta": contiene frase contigua -> %frase exacta%
    - token con %: patrón literal del usuario -> juan%david
    """
    q = (q or "").strip()
    patterns: List[str] = []

    for m in TOKEN_RE.finditer(q):
        phrase, word = m.group(1), m.group(2)

        if phrase is not None:
            p = phrase.strip()
            if p:
                patterns.append(f"%{_escape_like(p)}%")
            continue

        if not word:
            continue

        if "%" in word:
            core = _escape_like(word.strip("%"), keep_percent=True)
            patterns.append(f"%{core}%")

        else:
            patterns.append(f"%{_escape_like(word)}%")

    return patterns


def _haystack(cols: List[str]) -> str:
    """
    Concatena columnas en un solo texto para buscar "en cualquier columna".
    """
    return "concat(" + ", ' | ', ".join(f"toString({c})" for c in cols) + ")"


def _where(cols: List[str], patterns: List[str], prefix: str) -> Tuple[str, Dict[str, str]]:
    """
    Construye WHERE con AND entre términos:
    haystack ILIKE {p0} AND haystack ILIKE {p1} ...
    """
    hay = _haystack(cols)
    conds = []
    params: Dict[str, str] = {}

    for i, p in enumerate(patterns):
        k = f"{prefix}{i}"
        conds.append(f"{hay} ILIKE {{{k}:String}}")
        params[k] = p

    where_sql = " AND ".join(conds) if conds else "1"
    return where_sql, params


def _search_casos_adapter(q: str, limit: int = 50, offset: int = 0) -> Tuple[int, List[str]]:
    """
    Busca en casos_idx y casos_rel_idx, une resultados por radicado.
    Retorna: (total, [radicados paginados])
    """
    patterns = parse_query(q)
    if not patterns:
        return 0, []

    w_casos, p_casos = _where(CASOS_COLS, patterns, "c")
    w_rel, p_rel = _where(REL_COLS, patterns, "r")

    inner = f"""
        SELECT c_radicado
        FROM {DB}.casos_idx FINAL
        WHERE {w_casos}

        UNION DISTINCT

        SELECT c_radicado
        FROM {DB}.casos_rel_idx FINAL
        WHERE {w_rel}
    """

    params = {**p_casos, **p_rel}
    ch = get_client()

    page_q = f"""
        SELECT c_radicado
        FROM ({inner})
        ORDER BY c_radicado
        LIMIT {{lim:UInt32}} OFFSET {{off:UInt32}}
    """
    res = ch.query(
        page_q,
        parameters={**params, "lim": int(limit), "off": int(offset)},
    )
    radicados = [r[0] for r in res.result_rows]

    return radicados
