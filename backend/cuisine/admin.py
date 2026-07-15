from django.contrib import admin
from .models import GardeManger, Favori, Historique, MenuSemaine, MenuJour


@admin.register(GardeManger)
class GardeMangerAdmin(admin.ModelAdmin):
    list_display = ["utilisateur", "ingredient", "quantite", "ajoute_le"]
    list_filter = ["ingredient__categorie"]
    search_fields = ["utilisateur__email", "ingredient__nom"]


@admin.register(Favori)
class FavoriAdmin(admin.ModelAdmin):
    list_display = ["utilisateur", "recette", "ajoute_le"]
    search_fields = ["utilisateur__email", "recette__titre"]


@admin.register(Historique)
class HistoriqueAdmin(admin.ModelAdmin):
    list_display = ["utilisateur", "recette", "repas", "cuisine_le"]
    list_filter = ["repas"]
    search_fields = ["utilisateur__email", "recette__titre"]


class MenuJourInline(admin.TabularInline):
    model = MenuJour
    extra = 7


@admin.register(MenuSemaine)
class MenuSemaineAdmin(admin.ModelAdmin):
    list_display = ["utilisateur", "date_debut", "created_at"]
    inlines = [MenuJourInline]