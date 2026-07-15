from django.core.management.base import BaseCommand
from recettes.models import Repas, Envie


class Command(BaseCommand):
    help = "Crée les valeurs fixes de Repas et Envie si elles n'existent pas déjà."

    def handle(self, *args, **options):
        for value, _ in Repas.Nom.choices:
            obj, created = Repas.objects.get_or_create(nom=value)
            statut = "créé" if created else "déjà présent"
            self.stdout.write(f"Repas '{value}' — {statut}")

        for value, _ in Envie.Code.choices:
            obj, created = Envie.objects.get_or_create(code=value)
            statut = "créé" if created else "déjà présent"
            self.stdout.write(f"Envie '{value}' — {statut}")

        self.stdout.write(self.style.SUCCESS("Seed des choix terminée."))