from django.db import models

# Create your models here.
from django.db import models


class Repas(models.Model):
    class Nom(models.TextChoices):
        PETIT_DEJEUNER = "Petit-déjeuner", "Petit-déjeuner"
        DEJEUNER = "Déjeuner", "Déjeuner"
        DINER = "Dîner", "Dîner"

    nom = models.CharField(max_length=30, choices=Nom.choices, unique=True)

    def __str__(self):
        return self.nom


class Envie(models.Model):
    class Code(models.TextChoices):
        FATIGUE = "fatigue", "Je suis fatigué(e), un truc simple"
        ECONOMIQUE = "economique", "Je fais attention à mon budget"
        ENERGETIQUE = "energetique", "J'ai besoin d'énergie"
        PLAISIR = "plaisir", "Je me fais plaisir aujourd'hui"
        SURPRISE = "surprise", "Surprends-moi"

    code = models.CharField(max_length=20, choices=Code.choices, unique=True)

    def __str__(self):
        return self.get_code_display()


class Ingredient(models.Model):
    class Categorie(models.TextChoices):
        CEREALES = "cereales", "Céréales & féculents"
        PROTEINES = "proteines", "Protéines"
        LEGUMES = "legumes", "Légumes"
        BASIQUES = "basiques", "Basiques & sauces"
        AUTRE = "autre", "Autre"

    nom = models.CharField(max_length=100, unique=True)
    categorie = models.CharField(
        max_length=20, choices=Categorie.choices, default=Categorie.AUTRE
    )

    class Meta:
        ordering = ["categorie", "nom"]

    def __str__(self):
        return self.nom


class Recette(models.Model):
    class Difficulte(models.TextChoices):
        FACILE = "Facile", "Facile"
        MOYEN = "Moyen", "Moyen"
        DIFFICILE = "Difficile", "Difficile"

    titre = models.CharField(max_length=150)
    difficulte = models.CharField(
        max_length=20, choices=Difficulte.choices, default=Difficulte.FACILE
    )
    duree_min = models.PositiveIntegerField(help_text="Temps de préparation en minutes")
    budget_fcfa = models.PositiveIntegerField(help_text="Coût estimé en FCFA")
    image = models.ImageField(upload_to="recettes/", blank=True, null=True)

    repas = models.ManyToManyField(Repas, related_name="recettes")
    envies = models.ManyToManyField(Envie, related_name="recettes")
    ingredients = models.ManyToManyField(
        Ingredient, through="RecetteIngredient", related_name="recettes"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.titre


class RecetteIngredient(models.Model):
    recette = models.ForeignKey(Recette, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    essentiel = models.BooleanField(default=True)

    class Meta:
        unique_together = ("recette", "ingredient")

    def __str__(self):
        return f"{self.recette.titre} — {self.ingredient.nom}"

class EtapeRecette(models.Model):
    recette = models.ForeignKey(Recette, on_delete=models.CASCADE, related_name="etapes")
    ordre = models.PositiveIntegerField()
    description = models.TextField()

    class Meta:
        ordering = ["ordre"]
        unique_together = ("recette", "ordre")

    def __str__(self):
        return f"{self.recette.titre} — étape {self.ordre}"