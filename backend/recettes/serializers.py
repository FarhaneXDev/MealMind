from rest_framework import serializers
from .models import Repas, Envie, Ingredient, Recette, RecetteIngredient, EtapeRecette


class RepasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repas
        fields = ["id", "nom"]


class EnvieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Envie
        fields = ["id", "code"]


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ["id", "nom", "categorie"]


class RecetteIngredientSerializer(serializers.ModelSerializer):
    ingredient = serializers.PrimaryKeyRelatedField(queryset=Ingredient.objects.all())
    ingredient_nom = serializers.CharField(source="ingredient.nom", read_only=True)

    class Meta:
        model = RecetteIngredient
        fields = ["id", "ingredient", "ingredient_nom", "essentiel"]


class EtapeRecetteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EtapeRecette
        fields = ["id", "ordre", "description"]


class RecetteAdminSerializer(serializers.ModelSerializer):
    ingredients_liste = RecetteIngredientSerializer(source="recetteingredient_set", many=True)
    etapes = EtapeRecetteSerializer(many=True)
    repas = serializers.PrimaryKeyRelatedField(queryset=Repas.objects.all(), many=True)
    envies = serializers.PrimaryKeyRelatedField(queryset=Envie.objects.all(), many=True)

    class Meta:
        model = Recette
        fields = [
            "id", "titre", "difficulte", "duree_min", "budget_fcfa", "image",
            "repas", "envies", "ingredients_liste", "etapes", "created_at",
        ]
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        ingredients_data = validated_data.pop("recetteingredient_set")
        etapes_data = validated_data.pop("etapes")
        repas_data = validated_data.pop("repas")
        envies_data = validated_data.pop("envies")

        recette = Recette.objects.create(**validated_data)
        recette.repas.set(repas_data)
        recette.envies.set(envies_data)

        for ing in ingredients_data:
            RecetteIngredient.objects.create(recette=recette, **ing)
        for etape in etapes_data:
            EtapeRecette.objects.create(recette=recette, **etape)

        return recette

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop("recetteingredient_set", None)
        etapes_data = validated_data.pop("etapes", None)
        repas_data = validated_data.pop("repas", None)
        envies_data = validated_data.pop("envies", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if repas_data is not None:
            instance.repas.set(repas_data)
        if envies_data is not None:
            instance.envies.set(envies_data)

        if ingredients_data is not None:
            instance.recetteingredient_set.all().delete()
            for ing in ingredients_data:
                RecetteIngredient.objects.create(recette=instance, **ing)

        if etapes_data is not None:
            instance.etapes.all().delete()
            for etape in etapes_data:
                EtapeRecette.objects.create(recette=instance, **etape)

        return instance

class RecettePublicSerializer(serializers.ModelSerializer):
    repas = serializers.SlugRelatedField(slug_field="nom", many=True, read_only=True)
    envies = serializers.SlugRelatedField(slug_field="code", many=True, read_only=True)
    ingredients = serializers.SerializerMethodField()
    etapes = serializers.SerializerMethodField()

    class Meta:
        model = Recette
        fields = [
            "id", "titre", "difficulte", "duree_min", "budget_fcfa",
            "repas", "envies", "ingredients", "etapes",
        ]

    def get_ingredients(self, obj):
        liaisons = obj.recetteingredient_set.select_related("ingredient").all()
        return [{"nom": l.ingredient.nom, "essentiel": l.essentiel} for l in liaisons]

    def get_etapes(self, obj):
        return [e.description for e in obj.etapes.all()]