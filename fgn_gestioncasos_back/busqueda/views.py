import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from icecream import ic
from busqueda.casos_detalle import obtener_casos
from busqueda.utils import normalize_search_params
from busqueda.search_casos import _search_casos_adapter
from busqueda.search_gic import _search_gic_adapter
from busqueda.search_uiaf import _search_uiaf_adapter
import time


ALLOWED = {"uiaf", "gic", "aplica", "bienes"}
MAX_CASOS = 500
ADAPTERS = { # mapea cada function de busqueda
    "aplica": {"search": _search_casos_adapter},
    "gic": {"search": _search_gic_adapter},
    "uiaf": {"search": _search_uiaf_adapter}
}


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
            # mapaer adapter
            adapter = ADAPTERS.get(source)
            # validar
            if not adapter:
                errors.append({"source": source, "error": "BusquedaViews: adapter no encontrado"})
                continue

            try:
                ## aplica (clickhouse)
                if "aplica" in source:

                    t = time.perf_counter()
                    radicados = adapter["search"](q=search_term, limit=MAX_CASOS, offset=0)
                    ic(source, "buscar", time.perf_counter() - t)

                    t = time.perf_counter()
                    results_sources[source] = obtener_casos(radicados)
                    ic("detalle", time.perf_counter() - t)
                
                ## gic, uiaf
                else: 
                    result_source = adapter["search"](q=param_search, limit=MAX_CASOS)
                    results_sources[source] = result_source if result_source is not None else []

            except Exception as e:
                errors[source] = str(e)
                results_sources[source] = []
        
        response = {
            "success": True,
            "aplica": results_sources.get("aplica", []),
            "uiaf": results_sources.get("uiaf", []),
            "gic": results_sources.get("gic", []),
            "bienes": results_sources.get("bienes", []),
            "errors": errors,
            "message": "" if not errors else "Algunas fuentes tuvieron errores",
        }

        return Response(response, status=200)
