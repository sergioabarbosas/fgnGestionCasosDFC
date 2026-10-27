from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """admin solo lectura"""
    list_display = ("timestamp", "username", "method", "path", "status_code", "ip")
    list_filter = ("method", "status_code")
    search_fields = ("username", "path", "request_id")

    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
    def has_delete_permission(self, request, obj=None): return False