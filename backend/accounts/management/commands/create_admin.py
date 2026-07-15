from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decouple import config

Utilisateur = get_user_model()


class Command(BaseCommand):
    help = "Crée un superutilisateur à partir de variables d'environnement, si aucun n'existe encore."

    def handle(self, *args, **options):
        email = config("DJANGO_SUPERUSER_EMAIL", default=None)
        username = config("DJANGO_SUPERUSER_USERNAME", default=None)
        password = config("DJANGO_SUPERUSER_PASSWORD", default=None)

        if not all([email, username, password]):
            self.stdout.write(self.style.WARNING(
                "Variables DJANGO_SUPERUSER_* manquantes — aucun admin créé."
            ))
            return

        if Utilisateur.objects.filter(email__iexact=email).exists():
            self.stdout.write(self.style.SUCCESS(f"Admin '{email}' existe déjà."))
            return

        Utilisateur.objects.create_superuser(
            username=username, email=email, password=password
        )
        self.stdout.write(self.style.SUCCESS(f"Admin '{email}' créé avec succès."))