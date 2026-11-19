import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from icecream import ic
from busqueda.search_casos import _search_casos_adapter
from busqueda.casos_detalle import obtener_casos
from busqueda.search_gic import _search_gic_adapter
from busqueda.search_uiaf import _search_uiaf_adapter

ALLOWED = {"uiaf", "gic", "casos", "bienes"}

# class BusquedaView(APIView):

#     permission_classes = [IsAuthenticated]

#     def post(self, request):
        
#         search_term = (request.data.get("libre") or "").strip() # temporal
#         sources = request.data.get("fuentes") or []
#         ic(search_term, sources)

#         if not search_term:
#             return Response({"error": "El término de búsqueda es obligatorio."}, status=400)
#         if not isinstance(sources, list) or not sources:
#             return Response({"error": "Debe seleccionar al menos una fuente."}, status=400)

#         invalidas = [f for f in sources if f not in ALLOWED]
#         if invalidas:
#             return Response({"error": f"Fuentes inválidas: {invalidas}"}, status=400)

#         not_allowed = [f for f in sources if not request.user.has_perm(f"usuarios.ver_{f}")]
#         if not_allowed:
#             return Response({"error": f"Perfil NO autorizado para consultar en: {not_allowed}"}, status=403)

#         # TODO: conectar a ClickHouse / otras fuentes
#         results = {f: [] for f in sources}
#         ic(results)

#         return Response(
#             {"query": search_term, "fuentes": sources, "resultados": results},
#             status=200,
#         )

MAX_CASOS = 500

# mapea cada function de busqueda
ADAPTERS = {
    "casos": {"search": _search_casos_adapter},
    "gic": {"search": _search_gic_adapter},
    "uiaf": {"search": _search_uiaf_adapter}
}


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


class BusquedaView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        search_term = (request.data.get("libre") or "").strip()
        sources = request.data.get("fuentes") or []

        if not search_term:
            return Response({"error": "El término de búsqueda es obligatorio."}, status=400)
        if not isinstance(sources, list) or not sources:
            return Response({"error": "Debe seleccionar al menos una fuente."}, status=400)

        invalidas = [f for f in sources if f not in ALLOWED]
        if invalidas:
            return Response({"error": f"Fuentes inválidas: {invalidas}"}, status=400)

        not_allowed = [f for f in sources if not request.user.has_perm(f"usuarios.ver_{f}")]
        if not_allowed:
            return Response({"error": f"Perfil NO autorizado para consultar en: {not_allowed}"}, status=403)

        #obtener parametros y normalizar
        param_search = normalize_search_params({"libre": search_term})
        ic(param_search)

        results_sources = {}
        errors = {}

        for source in sources:
            ic(source)
            # mapaer adapter
            adapter = ADAPTERS.get(source)
            ic(adapter)
            # validar
            if not adapter:
                errors.append({"source": source, "error": "BusquedaViews: adapter no encontrado"})
                ic(errors)
                continue

            ## App Aplica en clickhouse
            try:
                # radicados = _search_casos_adapter(search_term, limit=MAX_CASOS, offset=0)
                if "casos" in source: 
                    radicados = adapter["search"](q=search_term, limit=MAX_CASOS, offset=0)
                    results_sources[source] = obtener_casos(radicados)
                ## gic, uiaf, bienes
                else: 
                    result_source = adapter["search"](q=param_search, limit=MAX_CASOS)
                    results_sources[source] = result_source if result_source is not None else []

            except Exception as e:
                errors[source] = str(e)
                results_sources[source] = []
        
        response = {
            "success": True,
            "casos": results_sources.get("casos", []),
            "uiaf": results_sources.get("uiaf", []),
            "gic": results_sources.get("gic", []),
            "bienes": results_sources.get("bienes", []),
            "errors": errors,
            "message": "" if not errors else "Algunas fuentes tuvieron errores",
        }
        ic(response)

        return Response(response, status=200)
