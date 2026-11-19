import os
import re
from icecream import ic
import pandas as pd
from busqueda.utils import safe_str_contains
from pathlib import Path
import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(DEBUG=(bool, False),)
environ.Env.read_env(BASE_DIR / ".env")

UIAF_MAIN_XLSX = env("UIAF_MAIN_XLSX")
UIAF_PERSONAS_XLSX = env("UIAF_PERSONAS_XLSX")

# cache en memoria
_cache = {"uiaf_main_df": None, "uiaf_personas_df": None, "uiaf_loaded": False}


## Cargar los excels
def _load_excels():
    """Carga y cachea los excels 
    (si están cargados no vuelve a cargarlos).
    """
    if _cache["uiaf_loaded"]:
        ic(" Cargando caché de UIAF")
        return
    ic(" Cargando archivos de consulta UIAF")
    try:
        _cache["uiaf_main_df"] = pd.read_excel(UIAF_MAIN_XLSX, dtype=str).fillna("") if os.path.exists(UIAF_MAIN_XLSX) else pd.DataFrame()
    except Exception as e:
        ic("No se pudo leer UIAF_MAIN_XLSX: %s", e)
        _cache["uiaf_main_df"] = pd.DataFrame()
    try:
        _cache["uiaf_personas_df"] = pd.read_excel(UIAF_PERSONAS_XLSX, dtype=str).fillna("") if os.path.exists(UIAF_PERSONAS_XLSX) else pd.DataFrame()
    except Exception as e:
        ic("No se pudo leer UIAF_PERSONAS_XLSX: %s", e)
        _cache["uiaf_personas_df"] = pd.DataFrame()
    _cache["uiaf_loaded"] = True # estado del cache


def _row_to_dict(row):
    """Convierte una fila pandas a 
    dict con strings y sin NaN."""
    return {str(k): ("" if pd.isna(v) else v) for k, v in row.items()}


def _is_non_empty_value(v):
    """
    Decide si un valor del request se considera 'no vacío' para búsquedas.
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


def _list_to_personas_list_string(personas):
    if not personas:
        return ""
    parts = []
    for p in personas:
        if not isinstance(p, dict):
            parts.append(str(p))
            continue
        name = p.get("nombre_completo")
        if name:
            parts.append(name)
        else:
            idn = p.get("num_id") or ""
            if idn:
                parts.append(str(idn))
    return ", ".join([x for x in parts if x])


def _search_uiaf_adapter(q: dict, limit: int = 50):
    """
    Búsqueda en exceles de UIAF (main y personas)
    Retorna: lista
    """
    try:
        _load_excels()
    
        # aceptar dicts o request-like
        if isinstance(q, dict):
            args = q
        else:
            # obtener json
            try:
                json_body = q.get_json(silent=True) if hasattr(q, "get_json") else None
            except Exception:
                json_body = None
            args = json_body if json_body else (getattr(q, "args", {}) or {})

        # claves de control que no se deben tomar como términos de búsqueda
        EXCLUDE_KEYS = {"fuentes", "page"}

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
        
        main_df = _cache.get("uiaf_main_df")
        personas_df = _cache.get("uiaf_personas_df")

        # Normalizar DataFrames
        if main_df is None or not isinstance(main_df, pd.DataFrame):
            main_df = pd.DataFrame()
        if personas_df is None or not isinstance(personas_df, pd.DataFrame):
            personas_df = pd.DataFrame()

        # si no hay datos en ambos, no hay nada que devolver
        if main_df.empty and personas_df.empty:
            return []
    
        matched_radicados = []
        
        if not search_map:
            return []
        
        else:
            # Buscar en main
            if not main_df.empty:
                combined_mask = pd.Series([True] * len(main_df), index=main_df.index)
                cols_for_key = list(main_df.columns) # cols del main

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
                    rad = str(row.get("num_informe") or "")
                    if rad:
                        matched_radicados.append(rad)

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
                        ref = r.get("num_informe") or ""
                        if ref:
                            matched_radicados.append(str(ref))

        # limitar cantidad por seguridad
        radicados_to_process = list(matched_radicados)[:limit]
        results = []

        # determinar columna identificadora principal en main (num_informe)
        id_col = None
        if not main_df.empty:
            for c in ["num_informe"]:
                if c in main_df.columns:
                    id_col = c
                    break

        # Recolectar para cada num_informe el 
        # registro completo (o None) y todas las personas
        for rad in radicados_to_process:
            main_row = None
            if id_col and (not main_df.empty):
                mm = main_df[main_df[id_col].astype(str) == str(rad)]
                if not mm.empty:
                    r = mm.iloc[0]
                    main_row = _row_to_dict(r)
            
            personas_list = []
            if not personas_df.empty:
                if "num_informe" in personas_df.columns:
                    matched_p = personas_df[personas_df["num_informe"].astype(str) == str(rad)]
                else:
                    matched_p = pd.DataFrame()
                if not matched_p.empty:
                    for _, pr in matched_p.iterrows():
                        p = _row_to_dict(pr)
                        personas_list.append(p)

            result_item = {
                    "UIAFinforme": str(main_row.get("num_informe") if main_row else rad),
                    "main": main_row,
                    "personas": personas_list,
                    "personasList": _list_to_personas_list_string(personas_list),
                }
            results.append(result_item)

        # Elimina duplicados y consolida resultados al final
        consolidated_results = {}
        for item in results:
            informe = item["UIAFinforme"]
            if informe not in consolidated_results:
                # Si el informe no está en consolidado lo agrega
                consolidated_results[informe] = {
                    "UIAFinforme": informe,
                    "main": item["main"],
                    "personas": item["personas"][:],  # Clonar lista
                }
            else:
                # Si ya existe, agrega las personas al informe existente
                consolidated_results[informe]["personas"].extend(item["personas"])

        # Elimina duplicados en la lista de personas
        for informe, consolidated_item in consolidated_results.items():
            unique_personas = {tuple(p.items()) for p in consolidated_item["personas"]}
            consolidated_results[informe]["personas"] = [dict(t) for t in unique_personas]
            consolidated_results[informe]["personasList"] = _list_to_personas_list_string(
                consolidated_results[informe]["personas"]
            )
        
        # Convertir dict consolidado en lista final de resultados
        final_results = list(consolidated_results.values())

        return final_results

    except Exception as e:
        return []
