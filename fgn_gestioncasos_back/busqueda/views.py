from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

ALLOWED = {"uiaf", "gic", "casos", "bienes"}

class BusquedaView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):
        libre = (request.data.get("libre") or "").strip() # temporal
        fuentes = request.data.get("fuentes") or []

        if not libre:
            return Response({"error": "El término de búsqueda es obligatorio."}, status=400)
        if not isinstance(fuentes, list) or not fuentes:
            return Response({"error": "Debe seleccionar al menos una fuente."}, status=400)

        invalidas = [f for f in fuentes if f not in ALLOWED]
        if invalidas:
            return Response({"error": f"Fuentes inválidas: {invalidas}"}, status=400)

        no_permitidas = [f for f in fuentes if not request.user.has_perm(f"usuarios.ver_{f}")]
        if no_permitidas:
            return Response({"error": f"No tiene permiso para: {no_permitidas}"}, status=403)

        # TODO: conectar a ClickHouse / otras fuentes
        resultados = {f: [] for f in fuentes}

        return Response(
            {"query": libre, "fuentes": fuentes, "resultados": resultados},
            status=200,
        )