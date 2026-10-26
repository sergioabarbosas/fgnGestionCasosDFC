from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from usuarios.models import User
 
 
@admin.register(User)
class BFAUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Seguridad BFA", {"fields": ("force_password_change",)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Seguridad BFA", {"fields": ("force_password_change",)}),
    )