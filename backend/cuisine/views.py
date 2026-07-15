from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from recettes.models import Ingredient
from .models import GardeManger
import random
from datetime import date
from datetime import timedelta
from rest_framework.generics import ListAPIView
from recettes.models import Recette, Repas
from cuisine.models import Favori, Historique, MenuSemaine, MenuJour
from .serializers import GardeMangerSerializer, FavoriSerializer, HistoriqueSerializer, MenuSemaineSerializer, MenuJourSerializer


class GardeMangerView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stock = GardeManger.objects.filter(utilisateur=request.user).select_related("ingredient")
        noms = [g.ingredient.nom for g in stock]
        return Response({"ingredients": noms})

    def post(self, request):
        nom = request.data.get("ingredient")
        if not nom:
            return Response({"detail": "Le champ 'ingredient' est requis."}, status=400)

        try:
            ingredient = Ingredient.objects.get(nom=nom)
        except Ingredient.DoesNotExist:
            return Response({"detail": "Ingrédient introuvable."}, status=404)

        entry = GardeManger.objects.filter(utilisateur=request.user, ingredient=ingredient).first()
        if entry:
            entry.delete()
            present = False
        else:
            GardeManger.objects.create(utilisateur=request.user, ingredient=ingredient)
            present = True

        return Response({"ingredient": nom, "present": present})

class FavoriView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favoris = Favori.objects.filter(utilisateur=request.user).select_related("recette")
        return Response(FavoriSerializer(favoris, many=True).data)

    def post(self, request):
        recette_id = request.data.get("recette")
        if not recette_id:
            return Response({"detail": "Le champ 'recette' est requis."}, status=400)

        try:
            recette = Recette.objects.get(id=recette_id)
        except Recette.DoesNotExist:
            return Response({"detail": "Recette introuvable."}, status=404)

        entry = Favori.objects.filter(utilisateur=request.user, recette=recette).first()
        if entry:
            entry.delete()
            present = False
        else:
            Favori.objects.create(utilisateur=request.user, recette=recette)
            present = True

        return Response({"recette": recette_id, "present": present})


class HistoriqueListView(ListAPIView):
    serializer_class = HistoriqueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Historique.objects.filter(utilisateur=self.request.user).select_related(
            "recette", "repas"
        )

class MarquerCuisineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        recette_id = request.data.get("recette")
        repas_nom = request.data.get("repas")

        if not recette_id:
            return Response({"detail": "Le champ 'recette' est requis."}, status=400)

        try:
            recette = Recette.objects.get(id=recette_id)
        except Recette.DoesNotExist:
            return Response({"detail": "Recette introuvable."}, status=404)

        repas_obj = Repas.objects.filter(nom=repas_nom).first() if repas_nom else None

        entry = Historique.objects.create(
            utilisateur=request.user, recette=recette, repas=repas_obj
        )
        return Response(HistoriqueSerializer(entry).data, status=201)


class MenuView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        menu = MenuSemaine.objects.filter(utilisateur=request.user).order_by("-date_debut").first()
        if not menu:
            return Response({"jours": []})
        return Response(MenuSemaineSerializer(menu).data)

    def post(self, request):
        duree = int(request.data.get("duree", 7))
        duree = max(1, min(duree, 7))

        repas_noms = request.data.get("repas", [])
        if not repas_noms:
            return Response({"detail": "Sélectionne au moins un repas à planifier."}, status=400)

        repas_objs = list(Repas.objects.filter(nom__in=repas_noms))
        if not repas_objs:
            return Response({"detail": "Aucun repas valide fourni."}, status=400)

        MenuSemaine.objects.filter(utilisateur=request.user).delete()
        menu = MenuSemaine.objects.create(utilisateur=request.user, date_debut=date.today())

        for i in range(duree):
            jour_date = date.today() + timedelta(days=i)
            for repas_obj in repas_objs:
                pool = list(Recette.objects.filter(repas=repas_obj))
                recette = random.choice(pool) if pool else None
                MenuJour.objects.create(
                    menu=menu, date=jour_date, repas=repas_obj, recette=recette
                )

        return Response(MenuSemaineSerializer(menu).data, status=201)
        duree = int(request.data.get("duree", 7))
        duree = max(1, min(duree, 7))

        repas_noms = request.data.get("repas", [])
        if not repas_noms:
            return Response({"detail": "Sélectionne au moins un repas à planifier."}, status=400)

        repas_objs = list(Repas.objects.filter(nom__in=repas_noms))
        if not repas_objs:
            return Response({"detail": "Aucun repas valide fourni."}, status=400)

        MenuSemaine.objects.filter(utilisateur=request.user).delete()
        menu = MenuSemaine.objects.create(utilisateur=request.user, date_debut=date.today())

        for i, jour_nom in enumerate(JOURS_ORDRE[:duree]):
            for repas_obj in repas_objs:
                pool = list(Recette.objects.filter(repas=repas_obj))
                recette = random.choice(pool) if pool else None
                MenuJour.objects.create(
                    menu=menu, jour=jour_nom, repas=repas_obj, recette=recette
                )

        return Response(MenuSemaineSerializer(menu).data, status=201)