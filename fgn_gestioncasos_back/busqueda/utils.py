import pandas as pd
import re

## Normalizar espacios y 
# eliminar caracteres de control
def _sanitize_term(t):
    if t is None:
        return ""
    s = str(t)
    # elimina caracter de control y espacios
    s = re.sub(r'[\x00-\x1f\x7f]', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

## Wildcard para regex
def _wildcard_to_regex(s):
    out = []
    for ch in s:
        if ch == '*' or ch == '%':
            out.append('.*')
        else:
            out.append(re.escape(ch))
    return "".join(out)


def term_to_regex(term):
    """Devuelve una regex (string) o 
    None si term vacío.
    """
    if term is None:
        return None
    
    t = _sanitize_term(term)
    if not t:
        return None

    # cuando tiene comillas envolventes => frase exacta y los espacios colapsados
    if len(t) >= 2 and ((t[0] == '"' and t[-1] == '"') or (t[0] == "'" and t[-1] == "'")):
        inner = t[1:-1].strip()
        if not inner:
            return None
        inner_esc = re.sub(r'\s+', r'\\s+', re.escape(inner))
        return r'\b' + inner_esc + r'\b'

    # collapsa espacios
    t_collapsed = re.sub(r'\s+', ' ', t)

    # wildcard explícito
    if '*' in t_collapsed or '%' in t_collapsed:
        try:
            return _wildcard_to_regex(t_collapsed)
        except Exception:
            return None

    tokens = [tok.strip() for tok in t_collapsed.split(' ') if tok.strip()]
    if not tokens:
        return None
    if len(tokens) == 1:
        return r'\b' + re.escape(tokens[0]) + r'\b'

    # AND de tokens (lookaheads)
    try:
        lookaheads = "".join([f"(?=.*\\b{re.escape(tok)}\\b)" for tok in tokens])
        return lookaheads + ".*"
    except Exception:
        return None


def safe_str_contains(series, term):
    """
    series: pandas.Series (o convertible)
    term: raw term entered by user
    Retorna pandas.Series(bool)
    """
    try:
        if series is None:
            return pd.Series([], dtype=bool)
        if not isinstance(series, pd.Series):
            series = pd.Series(series)

        if term is None:
            return pd.Series([False] * len(series), index=series.index)

        regex = term_to_regex(term)
        if not regex:
            return pd.Series([False] * len(series), index=series.index)

        # validar compilación
        try:
            re.compile(regex, flags=re.IGNORECASE)
        except re.error as e:
            simple = _sanitize_term(term).replace('"', '').replace("'", '')
            return series.astype(str).str.contains(simple, case=False, na=False, regex=False)

        # usar pandas regex
        return series.astype(str).str.contains(regex, case=False, na=False, regex=True)
    except Exception as ex:
        # fallback robusto
        try:
            simple = _sanitize_term(term).replace('"', '').replace("'", '')
            return series.astype(str).str.contains(simple, case=False, na=False, regex=False)
        except Exception:
            return pd.Series([False] * len(series), index=series.index)

## use in views.py request
def normalize_search_params(params):
    """
    Normaliza los parámetros de búsqueda recibidos desde el frontend.
    - Si el valor es string: colapsa espacios, strip, convierte '' a None.
    - Si el valor es lista: aplica la normalización a cada elemento y filtra vacíos.
    - Mantiene comodines (*) y comillas intactas para que los adaptadores las interpreten.
    Devuelve dict con los mismos keys y valores saneados (None o list o string).
    """
    if params is None:
        return {}

    out = {}
    for k, v in (params or {}).items():
        if k is None:
            continue
        key = str(k).strip()
        if key == "":
            continue

        # listas/tuplas
        if isinstance(v, (list, tuple)):
            vals = []
            for vv in v:
                if vv is None:
                    continue
                if isinstance(vv, str):
                    s = re.sub(r'\s+', ' ', vv).strip()
                    if s != "":
                        vals.append(s)
                else:
                    vals.append(str(vv))
            if vals:
                out[key] = vals
            else:
                out[key] = None
            continue

        # strings u otros tipos
        if isinstance(v, str):
            s = re.sub(r'\s+', ' ', v).strip()
            out[key] = s if s != "" else None
        else:
            # números, booleans, etc.
            out[key] = v

    return out