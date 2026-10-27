from django.db import models
from django.conf import settings
import uuid


class AuditLog(models.Model):
    request_id = models.UUIDField(default=uuid.uuid4, db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL,
    )
    username = models.CharField(max_length=150, blank=True, db_index=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    method = models.CharField(max_length=10, db_index=True)
    path = models.CharField(max_length=500, db_index=True)
    action = models.CharField(max_length=60, blank=True)

    request_data = models.JSONField(null=True, blank=True)
    status_code = models.PositiveSmallIntegerField(null=True, db_index=True)
    duration_ms = models.PositiveIntegerField(null=True)

    response_summary = models.JSONField(null=True, blank=True)
    response_data = models.JSONField(null=True, blank=True)
    response_hash = models.CharField(max_length=64, blank=True)
    response_truncated = models.BooleanField(default=False)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["username", "timestamp"]),
            models.Index(fields=["path", "timestamp"]),
        ]

    def save(self, *args, **kwargs):
        if self.pk:
            raise PermissionError("Los registros de auditoría son inmutables.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise PermissionError("Los registros de auditoría no se pueden eliminar.")