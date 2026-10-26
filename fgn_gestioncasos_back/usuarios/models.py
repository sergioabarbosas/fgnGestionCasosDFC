from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    force_password_change = models.BooleanField(default=False)

    class Meta:
        permissions = [
            ("ver_uiaf", "Puede consultar UIAF"),
            ("ver_gic", "Puede consultar GIC"),
            ("ver_casos", "Puede consultar Casos"),
            ("ver_bienes", "Puede consultar Bienes"),
        ]

    def __str__(self):
        return self.username