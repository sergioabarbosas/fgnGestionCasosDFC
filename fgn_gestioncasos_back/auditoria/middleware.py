import json
import logging
import time
import uuid
import hashlib

from .models import AuditLog

audit_logger = logging.getLogger("audit")

SENSITIVE_KEYS = {
    "password", "new_password", "old_password",
    "token", "access", "refresh",
    "authorization", "cookie", "set-cookie",
    "csrfmiddlewaretoken", "csrftoken",
}
SKIP_PREFIXES = ("/static/", "/health/")
MAX_RESPONSE_BYTES = 1_000_000  # 1 MB


def _clean(data):
    if isinstance(data, dict):
        cleaned = {}
        for k, v in data.items():
            key = str(k).lower()
            if key in SENSITIVE_KEYS:
                cleaned[k] = "***"
            else:
                cleaned[k] = _clean(v)
        return cleaned
    if isinstance(data, list):
        return [_clean(i) for i in data]
    return data


def _client_ip(request):
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    return xff.split(",")[0].strip() if xff else request.META.get("REMOTE_ADDR")


def _response_summary(response_data):
    if isinstance(response_data, dict):
        keys = list(response_data.keys())[:20]
        return {"type": "dict", "keys": keys}
    if isinstance(response_data, list):
        return {"type": "list", "len": len(response_data)}
    return {"type": type(response_data).__name__}


class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith(SKIP_PREFIXES):
            return self.get_response(request)

        request_id = uuid.uuid4()
        request.request_id = request_id
        start = time.monotonic()

        body = None
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            try:
                if request.body:
                    body = _clean(json.loads(request.body))
            except (ValueError, UnicodeDecodeError):
                body = {"_raw": "no-json"}

        pre_user = getattr(request, "user", None)
        pre_username = pre_user.get_username() if pre_user and pre_user.is_authenticated else None
        pre_user_obj = pre_user if pre_username else None

        response = self.get_response(request)

        user = getattr(request, "user", None)
        
        authenticated = bool(user and user.is_authenticated)
        if not authenticated and pre_user_obj:
            user, authenticated = pre_user_obj, True

        duration = int((time.monotonic() - start) * 1000)

        # Captura respuesta
        response_data = None
        response_truncated = False
        response_hash = ""

        if hasattr(response, "content"):
            raw = response.content or b""
            response_hash = hashlib.sha256(raw).hexdigest() if raw else ""

            if len(raw) <= MAX_RESPONSE_BYTES:
                try:
                    parsed = json.loads(raw.decode("utf-8"))
                    response_data = _clean(parsed)
                except Exception:
                    response_data = {"_raw": "non-json"}
            else:
                response_truncated = True

        resp_summary = _response_summary(response_data)

        # Log de archivo (metadata, no respuesta completa)
        entry = {
            "request_id": str(request_id),
            # "username": user.username if authenticated else "anonymous",
            "username": user.get_username() if authenticated else "anonymous",
            "ip": _client_ip(request),
            "method": request.method,
            "path": request.path,
            "status_code": response.status_code,
            "duration_ms": duration,
            "response_hash": response_hash,
            "response_truncated": response_truncated,
            "response_summary": resp_summary,
        }
        audit_logger.info(json.dumps(entry, ensure_ascii=False))

        # Persistencia en BD
        try:
            AuditLog.objects.create(
                request_id=request_id,
                user=user if authenticated else None,
                username=entry["username"],
                ip=entry["ip"],
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:300],
                method=request.method,
                path=request.path,
                request_data=body,
                status_code=response.status_code,
                duration_ms=duration,
                response_summary=resp_summary,
                response_data=response_data,
                response_hash=response_hash,
                response_truncated=response_truncated,
            )
        except Exception:
            audit_logger.exception("Fallo al guardar auditoría en BD")

        response["X-Request-ID"] = str(request_id)
        return response
    