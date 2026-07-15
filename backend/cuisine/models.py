from django.conf import settings
from django.db import models

from recettes.models import Recette, Ingredient, Repas


class GardeManger(models.Model):
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="garde_manger"
    )
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantite = models.CharField(max_length=50, blank=True)
    ajoute_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("utilisateur", "ingredient")
        ordering = ["ingredient__categorie", "ingredient__nom"]

    def __str__(self):
        return f"{self.utilisateur} — {self.ingredient.nom}"


class Favori(models.Model):
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favoris"
    )
    recette = models.ForeignKey(Recette, on_delete=models.CASCADE, related_name="favoris")
    ajoute_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("utilisateur", "recette")
        ordering = ["-ajoute_le"]

    def __str__(self):
        return f"{self.utilisateur} ❤ {self.recette.titre}"


class Historique(models.Model):
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="historique"
    )
    recette = models.ForeignKey(Recette, on_delete=models.CASCADE)
    repas = models.ForeignKey(Repas, on_delete=models.SET_NULL, null=True)
    cuisine_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-cuisine_le"]
        verbose_name_plural = "Historique"

    def __str__(self):
        return f"{self.utilisateur} — {self.recette.titre} ({self.cuisine_le:%d/%m/%Y})"


class MenuSemaine(models.Model):
    utilisateur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="menus"
    )
    date_debut = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_debut"]

    def __str__(self):
        return f"Menu du {self.date_debut:%d/%m/%Y} — {self.utilisateur}"


class MenuJour(models.Model):
    menu = models.ForeignKey(MenuSemaine, on_delete=models.CASCADE, related_name="jours")
    date = models.DateField()
    repas = models.ForeignKey(Repas, on_delete=models.CASCADE)
    recette = models.ForeignKey(
        Recette, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        unique_together = ("menu", "date", "repas")
        ordering = ["date", "id"]

    def __str__(self):
        titre = self.recette.titre if self.recette else "Libre"
        return f"{self.date} ({self.repas.nom}) — {titre}"