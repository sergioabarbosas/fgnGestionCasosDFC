import os
from icecream import ic
import pandas as pd
from busqueda.utils import safe_str_contains
from pathlib import Path
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(DEBUG=(bool, False),)
environ.Env.read_env(BASE_DIR / ".env")

GIC_MAIN_XLSX = env("GIC_MAIN_XLSX")
GIC_PERSONAS_XLSX = env("GIC_PERSONAS_XLSX")
GIC_TRAMITES_XLSX = env("GIC_TRAMITES_XLSX")

# cache en memoria
_cache = {"main_df": None, "personas_df": None, "tramites_df": None,"loaded": False}

## Cargar los excels
def _load_excels():
    """Carga y cachea los excels 
    (si ya están cargados no vuelve a cargarlos)
    """
    if _cache["loaded"]:
        ic(" Cargando caché de GIC")
        return
    ic(" Cargando archivos de consulta GIC")
    try:
        _cache["main_df"] = pd.read_excel(GIC_MAIN_XLSX, dtype=str).fillna("") if os.path.exists(GIC_MAIN_XLSX) else pd.DataFrame()
    except Exception as e:
        ic("No se pudo leer GIC_MAIN_XLSX: %s", e)
        _cache["main_df"] = pd.DataFrame()
    try:
        _cache["personas_df"] = pd.read_excel(GIC_PERSONAS_XLSX, dtype=str).fillna("") if os.path.exists(GIC_PERSONAS_XLSX) else pd.DataFrame()
    except Exception as e:
        ic("No se pudo leer GIC_PERSONAS_XLSX: %s", e)
        _cache["personas_df"] = pd.DataFrame()
    try:
        _cache["tramites_df"] = pd.read_excel(GIC_TRAMITES_XLSX, dtype=str).fillna("") if os.path.exists(GIC_TRAMITES_XLSX) else pd.DataFrame()
    except Exception as e:
        ic("No se pudo leer GIC_TRAMITES_XLSX: %s", e)
        _cache["tramites_df"] = pd.DataFrame()    
    _cache["loaded"] = True

## Normalizar columnas
def _normalize_cols(df):
    """Normaliza nombres de columnas: reemplaza ':' por '_' y strip."""
    df = df.copy()
    df.columns = [str(c).replace(":", "_").strip() for c in df.columns]
    return df


def _row_to_dict(row):
    """Convierte una fila pandas a dict con strings y sin NaN."""
    return {str(k): ("" if pd.isna(v) else v) for k, v in row.items()}


def _unique_personas(personas_list):
    """Dedup de personas por Identificacion 
    / NombreCompleto / Title, preservando orden."""
    seen = set()
    out = []
    for p in personas_list or []:
        if not isinstance(p, dict):
            key = str(p)
        else:
            key = str(p.get("Identificacion") or p.get("NombreCompleto") or p.get("Title") or "").strip()
        if not key:
            out.append(p)
            continue
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


def _list_to_personas_list_string(personas):
    if not personas:
        return ""
    parts = []
    for p in personas:
        if not isinstance(p, dict):
            parts.append(str(p))
            continue
        name = p.get("NombreCompleto") or (f"{p.get('Nombre_1','')} {p.get('Apellido_1','')}").strip()
        if name:
            parts.append(name)
        else:
            idn = p.get("Identificacion") or p.get("Title") or ""
            if idn:
                parts.append(str(idn))
    return ", ".join([x for x in parts if x])


def _is_non_empty_value(v):
    """
    Decide si un valor del q se considera 'no vacío' para búsquedas.
    Ignora: None, '', strings solo espacios, 'null', 'undefined'.
    """
    if v is None:
        return False
    if isinstance(v, (list, tuple)):
        # list non-empty handled by caller
        return any(_is_non_empty_value(x) for x in v)
    s = str(v).strip()
    if s == "":
        return False
    if s.lower() in ("null", "undefined"):
        return False
    return True


def _search_gic_adapter(q: dict, limit: int = 50):
    """
    Búsqueda en los excels GIC (main y personas) usando Title <-> IdEntrada como relación.
    q puede ser:
      - un objeto Flask q (con .get_json / .args), o
      - un dict con parámetros normalizados (recomendado desde app.py)
    Retorna lista de { IdEntrada, main, personas, personasList }.
    """
    try:
        _load_excels()

        # aceptar dicts o q-like
        if isinstance(q, dict):
            args = q
        else:
            # tratar de obtener JSON primero, si existe; fallback a args (querystring)
            try:
                json_body = q.get_json(silent=True) if hasattr(q, "get_json") else None
            except Exception:
                json_body = None
            args = json_body if json_body else (getattr(q, "args", {}) or {})


        # claves de control que no se deben tomar como términos de búsqueda
        EXCLUDE_KEYS = {"fuentes", "page", "limit", "perPage", "offset"}

        # construir dict key -> lista de valores NO VACÍOS
        search_map = {}
        for k, v in dict(args).items():
            if k is None:
                continue
            key = str(k).strip()
            if not key or key.lower() in EXCLUDE_KEYS:
                continue
            # soportar listas/tuplas o valores simples
            vals = []
            if isinstance(v, (list, tuple)):
                for vv in v:
                    if _is_non_empty_value(vv):
                        vals.append(str(vv).strip())
            else:
                if _is_non_empty_value(v):
                    vals.append(str(v).strip())
            if vals:
                # Sólo añadir la clave si hay al menos un valor no vacío
                search_map[key] = vals


        main_df = _cache.get("main_df")
        personas_df = _cache.get("personas_df")
        tramites_df = _cache.get("tramites_df")

        # Normalizar DataFrames
        if main_df is None or not isinstance(main_df, pd.DataFrame):
            main_df = pd.DataFrame()
        if personas_df is None or not isinstance(personas_df, pd.DataFrame):
            personas_df = pd.DataFrame()
        if tramites_df is None or not isinstance(tramites_df, pd.DataFrame):
            tramites_df = pd.DataFrame()

        if not main_df.empty:
            main_df = _normalize_cols(main_df)
        if not personas_df.empty:
            personas_df = _normalize_cols(personas_df)
        if not tramites_df.empty:
            tramites_df = _normalize_cols(tramites_df)

        # si no hay datos en ambos, no hay nada que devolver
        if main_df.empty and personas_df.empty and tramites_df.empty:
            return []

        matched_radicados = set()

        if not search_map:   
            return []

        else:
            # Buscar en main: aplicar AND entre claves (más restrictivo)
            if not main_df.empty:
                combined_mask = pd.Series([True] * len(main_df), index=main_df.index)
                cols_for_key = list(main_df.columns)
                for key, values in search_map.items():
                    # mask_key = OR sobre columnas y valores
                    mask_key = pd.Series([False] * len(main_df), index=main_df.index)
                    for v in values:
                        term_mask = pd.Series([False] * len(main_df), index=main_df.index)
                        for c in cols_for_key:
                            # usar safe_str_contains compartida
                            term_mask = term_mask | safe_str_contains(main_df[c], v)
                        mask_key = mask_key | term_mask
                    combined_mask = combined_mask & mask_key
                main_hits = main_df[combined_mask]
                for _, r in main_hits.iterrows():
                    row = _row_to_dict(r)
                    rad = str(row.get("Title") or row.get("IdEntrada") or row.get("RefEntrada") or "")
                    if rad:
                        matched_radicados.add(rad)

            # Buscar en personas: mismo enfoque (AND entre claves)
            if not personas_df.empty:
                combined_mask_p = pd.Series([True] * len(personas_df), index=personas_df.index)
                cols_for_key = list(personas_df.columns)
                for key, values in search_map.items():
                    mask_key_p = pd.Series([False] * len(personas_df), index=personas_df.index)
                    for v in values:
                        term_mask_p = pd.Series([False] * len(personas_df), index=personas_df.index)
                        for c in cols_for_key:
                            # uso de safe_str_contains (unificado en search_utils)
                            term_mask_p = term_mask_p | safe_str_contains(personas_df[c], v)
                        mask_key_p = mask_key_p | term_mask_p
                    combined_mask_p = combined_mask_p & mask_key_p
                matched_personas = personas_df[combined_mask_p]
                if not matched_personas.empty:
                    for _, r in matched_personas.iterrows():
                        ref = r.get("IdEntrada") or r.get("RefEntrada") or r.get("Title") or ""
                        if ref:
                            matched_radicados.add(str(ref))

            # Buscar en tramites:
            if not tramites_df.empty:
                combined_mask_p = pd.Series([True] * len(tramites_df), index=tramites_df.index)
                cols_for_key = list(tramites_df.columns)
                for key, values in search_map.items():
                    mask_key_p = pd.Series([False] * len(tramites_df), index=tramites_df.index)
                    for v in values:
                        term_mask_p = pd.Series([False] * len(tramites_df), index=tramites_df.index)
                        for c in cols_for_key:
                            # uso de safe_str_contains (unificado en search_utils)
                            term_mask_p = term_mask_p | safe_str_contains(tramites_df[c], v)
                        mask_key_p = mask_key_p | term_mask_p
                    combined_mask_p = combined_mask_p & mask_key_p
                matched_tramites = tramites_df[combined_mask_p]
                if not matched_tramites.empty:
                    for _, r in matched_tramites.iterrows():
                        ref = r.get("IdEntrada") or r.get("Title") or ""
                        if ref:
                            matched_radicados.add(str(ref))

        # limitar cantidad por seguridad
        radicados_to_process = list(matched_radicados)[:limit]
        results = []

        # determinar columna identificadora principal en main (preferir Title)
        id_col = None
        if not main_df.empty:
            for c in ["Title", "IdEntrada", "RefEntrada"]:
                if c in main_df.columns:
                    id_col = c
                    break

        # Recolectar para cada radicado el registro main completo 
        # (o None) y todas las personas donde IdEntrada == Title
        for rad in radicados_to_process:
            main_row = None
            if id_col and (not main_df.empty):
                mm = main_df[main_df[id_col].astype(str) == str(rad)]
                if not mm.empty:
                    r = mm.iloc[0]
                    main_row = _row_to_dict(r)

            personas_list = []
            if not personas_df.empty:
                if "IdEntrada" in personas_df.columns: # Title main hace match con IdEntrada
                    matched_p = personas_df[personas_df["IdEntrada"].astype(str) == str(rad)]    
                elif "RefEntrada" in personas_df.columns:
                    matched_p = personas_df[personas_df["RefEntrada"].astype(str) == str(rad)]
                else:
                    matched_p = pd.DataFrame()
                if not matched_p.empty:
                    for _, pr in matched_p.iterrows():
                        p = _row_to_dict(pr)
                        personas_list.append(p)
                    personas_list = _unique_personas(personas_list)

            tramites_list = [] 
            if not tramites_df.empty:
                if "IdEntrada" in tramites_df.columns:
                    matched_t = tramites_df[tramites_df["IdEntrada"].astype(str) == str(rad)]
                elif "Title" in tramites_df.columns:
                    matched_t = tramites_df[tramites_df["Title"].astype(str) == str(rad)]
                else:
                    matched_t = pd.DataFrame()
                if not matched_t.empty:
                    for _, tr in matched_t.iterrows():
                        t = _row_to_dict(tr)
                        tramites_list.append(t)

            result_item = {
                "IdEntrada": str(main_row.get("Title") if main_row else rad),
                "main": main_row,
                "personas": personas_list,
                "tramites": tramites_list,
                "personasList": _list_to_personas_list_string(personas_list),
            }
            results.append(result_item)

        return results

    except Exception as e:
        return []
