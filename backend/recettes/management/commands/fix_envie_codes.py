from django.core.management.base import BaseCommand
from recettes.models import Envie


class Command(BaseCommand):
    help = "Renomme les anciens codes d'envie obsolètes vers leur nouvelle valeur, sans risque si déjà fait."

    def handle(self, *args, **options):
        ancien = Envie.objects.filter(code="fatigue").first()
        if ancien:
            ancien.code = "simple"
            ancien.save()
            self.stdout.write(self.style.SUCCESS("Renommé 'fatigue' → 'simple'."))
        else:
            self.stdout.write("Rien à renommer, déjà à jour.")