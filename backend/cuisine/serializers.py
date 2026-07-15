from rest_framework import serializers
from .models import GardeManger, Favori, Historique, MenuSemaine, MenuJour



class GardeMangerSerializer(serializers.ModelSerializer):
    ingredient_nom = serializers.CharField(source="ingredient.nom", read_only=True)

    class Meta:
        model = GardeManger
        fields = ["id", "ingredient", "ingredient_nom", "quantite", "ajoute_le"]

from .models import Favori, Historique


class FavoriSerializer(serializers.ModelSerializer):
    recette_titre = serializers.CharField(source="recette.titre", read_only=True)
    recette_duree = serializers.IntegerField(source="recette.duree_min", read_only=True)
    recette_difficulte = serializers.CharField(source="recette.difficulte", read_only=True)

    class Meta:
        model = Favori
        fields = ["id", "recette", "recette_titre", "recette_duree", "recette_difficulte", "ajoute_le"]


class HistoriqueSerializer(serializers.ModelSerializer):
    recette_titre = serializers.CharField(source="recette.titre", read_only=True)
    repas_nom = serializers.CharField(source="repas.nom", read_only=True)

    class Meta:
        model = Historique
        fields = ["id", "recette", "recette_titre", "repas_nom", "cuisine_le"]


JOURS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

class MenuJourSerializer(serializers.ModelSerializer):
    recette_titre = serializers.CharField(source="recette.titre", read_only=True)
    recette_duree = serializers.IntegerField(source="recette.duree_min", read_only=True)
    recette_budget = serializers.IntegerField(source="recette.budget_fcfa", read_only=True)
    recette_ingredients = serializers.SerializerMethodField()
    repas_nom = serializers.CharField(source="repas.nom", read_only=True)
    jour_nom = serializers.SerializerMethodField()

    class Meta:
        model = MenuJour
        fields = [
            "id", "date", "jour_nom", "repas_nom", "recette", "recette_titre",
            "recette_duree", "recette_budget", "recette_ingredients",
        ]

    def get_jour_nom(self, obj):
        return JOURS_FR[obj.date.weekday()]

    def get_recette_ingredients(self, obj):
        if not obj.recette:
            return []
        return [ri.ingredient.nom for ri in obj.recette.recetteingredient_set.all()]

class MenuSemaineSerializer(serializers.ModelSerializer):
    jours = MenuJourSerializer(many=True, read_only=True)

    class Meta:
        model = MenuSemaine
        fields = ["id", "date_debut", "created_at", "jours"]