from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.middleware.csrf import get_token
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView


def user_data(user):
    return {
        "id": user.id, 
        "username": user.username, 
        "email": user.email,
        "force_password_change": user.force_password_change,
        "is_superuser": user.is_superuser,
        "roles": list(user.groups.values_list("name", flat=True)),
        "fuentes": [
            f for f in ("uiaf", "gic", "casos", "bienes")
            if user.has_perm(f"usuarios.ver_{f}")
        ],
    }


class CsrfView(APIView):
    """Entrega la cookie CSRF al frontend."""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"csrfToken": get_token(request)})


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response({"error": "Usuario y contraseña son obligatorios"}, status=400)
        if User.objects.filter(username=username).exists():
            return Response({"error": "El usuario ya existe"}, status=400)
        try:
            validate_password(password)
        except ValidationError as e:
            return Response({"error": list(e.messages)}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)
        return Response(user_data(user), status=201)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        user = authenticate(
            request,
            username=request.data.get("username"),
            password=request.data.get("password"),
        )
        if user is None:
            return Response({"error": "Credenciales inválidas"}, status=400)
        login(request, user)
        return Response(user_data(user))


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response({"ok": True})


class MeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"detail": "No autenticado"}, status=401)
        return Response(user_data(request.user))


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        old = request.data.get("old_password", "")
        new = request.data.get("new_password", "")

        if not request.user.check_password(old):
            return Response({"error": "La contraseña actual es incorrecta"}, status=400)
        try:
            validate_password(new, request.user)
        except ValidationError as e:
            return Response({"error": list(e.messages)}, status=400)

        request.user.set_password(new)
        request.user.force_password_change = False
        request.user.save(update_fields=["password", "force_password_change"])
        update_session_auth_hash(request, request.user)
        return Response({"ok": True})