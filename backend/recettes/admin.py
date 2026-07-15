from django.contrib import admin
from django.utils.html import format_html
from .models import Repas, Envie, Ingredient, Recette, RecetteIngredient, EtapeRecette

admin.site.site_header = "MealMind — Administration"
admin.site.site_title = "MealMind Admin"
admin.site.index_title = "Gestion du contenu"


@admin.register(Repas)
class RepasAdmin(admin.ModelAdmin):
    list_display = ["nom"]


@admin.register(Envie)
class EnvieAdmin(admin.ModelAdmin):
    list_display = ["code"]


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ["nom", "categorie"]
    list_filter = ["categorie"]
    search_fields = ["nom"]
    ordering = ["categorie", "nom"]


class RecetteIngredientInline(admin.TabularInline):
    model = RecetteIngredient
    extra = 1
    autocomplete_fields = ["ingredient"]

class EtapeRecetteInline(admin.TabularInline):
    model = EtapeRecette
    extra = 3
    ordering = ["ordre"]

@admin.register(Recette)
class RecetteAdmin(admin.ModelAdmin):
    list_display = ["apercu", "titre", "difficulte", "duree_min", "budget_fcfa", "nb_ingredients"]
    list_display_links = ["titre"]
    list_filter = ["difficulte", "repas", "envies"]
    search_fields = ["titre"]
    filter_horizontal = ["repas", "envies"]
    inlines = [RecetteIngredientInline, EtapeRecetteInline]
    readonly_fields = ["created_at"]

    fieldsets = (
        (None, {"fields": ("titre", "image")}),
        ("Caractéristiques", {"fields": ("difficulte", "duree_min", "budget_fcfa")}),
        ("Classification", {"fields": ("repas", "envies")}),
        ("Préparation", {"fields": ("etapes",)}),
        ("Infos", {"fields": ("created_at",)}),
    )

    def apercu(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:40px;width:40px;object-fit:cover;border-radius:6px;" />',
                obj.image.url,
            )
        return "—"
    apercu.short_description = ""

    def nb_ingredients(self, obj):
        return obj.ingredients.count()
    nb_ingredients.short_description = "Ingrédients"