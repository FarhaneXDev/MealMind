from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    ordering = ["email"]
    list_display = ["email", "username", "is_staff", "is_active", "date_joined"]
    search_fields = ["email", "username"]