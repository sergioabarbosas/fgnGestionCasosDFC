from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

ROLES = {
    "gic_admin": ["ver_uiaf", "ver_gic", "ver_casos", "ver_bienes"],
    "gic_user": ["ver_uiaf", "ver_gic", "ver_casos"],
}

class Command(BaseCommand):
    help = "Crea grupos y permisos de roles"

    def handle(self, *args, **options):
        for nombre, codigos in ROLES.items():
            grupo, _ = Group.objects.get_or_create(name=nombre)
            perms = Permission.objects.filter(
                content_type__app_label="usuarios", codename__in=codigos
            )
            grupo.permissions.set(perms)
            self.stdout.write(f"{nombre}: {perms.count()} permisos")