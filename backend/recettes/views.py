from rest_framework import viewsets
from .models import Repas, Envie, Ingredient, Recette
from .serializers import RepasSerializer, EnvieSerializer, IngredientSerializer, RecetteAdminSerializer
from .permissions import IsStaffUser
import random
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import RecettePublicSerializer
from django.db.models import Count
from accounts.models import Utilisateur
from cuisine.models import Historique, Favori


class RepasViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Repas.objects.all()
    serializer_class = RepasSerializer
    permission_classes = [IsStaffUser]


class EnvieViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Envie.objects.all()
    serializer_class = EnvieSerializer
    permission_classes = [IsStaffUser]


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [IsStaffUser]


class RecetteAdminViewSet(viewsets.ModelViewSet):
    queryset = Recette.objects.all().prefetch_related(
        "repas", "envies", "etapes", "recetteingredient_set__ingredient"
    )
    serializer_class = RecetteAdminSerializer
    permission_classes = [IsStaffUser]

class IngredientPublicListView(generics.ListAPIView):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [AllowAny]


TEMPS_LIMITES = {
    "<10 min": 10,
    "10-20 min": 20,
    "20-30 min": 30,
}


class SuggestionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        repas = request.GET.get("repas")
        temps = request.GET.get("temps")
        envie = request.GET.get("envie")
        scenario = request.GET.get("scenario")
        budget = request.GET.get("budget")
        ingredients_param = request.GET.get("ingredients", "")
        exclude_param = request.GET.get("exclude", "")

        if not repas:
            return Response({"detail": "Le paramètre 'repas' est requis."}, status=400)

        selected_ingredients = [i.strip() for i in ingredients_param.split(",") if i.strip()]
        exclude_ids = [int(i) for i in exclude_param.split(",") if i.strip().isdigit()]

        pool_avec_exclusion = (
            Recette.objects.filter(repas__nom=repas).exclude(id__in=exclude_ids).distinct()
        )
        tour_complet = bool(exclude_ids) and not pool_avec_exclusion.exists()

        if pool_avec_exclusion.exists():
            pool = pool_avec_exclusion
        else:
            pool = Recette.objects.filter(repas__nom=repas).distinct()

        if not pool.exists():
            repas_disponibles = list(
                Repas.objects.filter(recettes__isnull=False)
                .distinct()
                .values_list("nom", flat=True)
            )
            return Response(
                {
                    "detail": f"Pas encore de recette pour \"{repas}\".",
                    "repas_disponibles": repas_disponibles,
                },
                status=404,
            )

        temps_max = TEMPS_LIMITES.get(temps)
        if temps_max is not None:
            avec_temps = pool.filter(duree_min__lte=temps_max)
            temps_respectable = avec_temps.exists()
            if temps_respectable:
                pool = avec_temps
        else:
            temps_respectable = True

        envie_respectable = True
        if envie:
            avec_envie = pool.filter(envies__code=envie).distinct()
            envie_respectable = avec_envie.exists()
            if envie_respectable:
                pool = avec_envie

        if scenario == "courses" and budget == "petit":
            avec_budget = pool.filter(budget_fcfa__lte=1000)
            if avec_budget.exists():
                pool = avec_budget

        pool = list(pool.distinct())

        # Filet de sécurité : si pool est vide ici pour une raison inattendue,
        # on retombe sur toutes les recettes du repas plutôt que de planter.
        if not pool:
            pool = list(Recette.objects.filter(repas__nom=repas).distinct())

        def couverture(recette):
            if not selected_ingredients:
                return 0, 0
            liaisons = list(recette.recetteingredient_set.select_related("ingredient").all())
            essentiels = [l for l in liaisons if l.essentiel]
            essentiels_possedes = [
                l for l in essentiels if l.ingredient.nom in selected_ingredients
            ]
            optionnels_possedes = [
                l for l in liaisons if not l.essentiel and l.ingredient.nom in selected_ingredients
            ]
            ratio = len(essentiels_possedes) / len(essentiels) if essentiels else 0
            return ratio, len(optionnels_possedes)

        if selected_ingredients:
            avec_match = [r for r in pool if couverture(r)[0] > 0]
            if avec_match:
                pool = avec_match

        # Deuxième filet de sécurité, juste avant le calcul du score
        if not pool:
            return Response(
                {"detail": "Aucune recette ne correspond, réessaie avec d'autres critères."},
                status=404,
            )

        scored = [(r, *couverture(r)) for r in pool]
        meilleur_ratio = max(s[1] for s in scored)
        top = [s for s in scored if s[1] == meilleur_ratio]
        meilleur_optionnels = max(s[2] for s in top)
        top = [s for s in top if s[2] == meilleur_optionnels]

        choix, ratio_final, _ = random.choice(top)

        data = RecettePublicSerializer(choix).data
        data["compromis"] = {
            "temps_respecte": temps_respectable,
            "envie_respectee": envie_respectable,
            "couverture_ingredients": round(ratio_final * 100) if selected_ingredients else None,
        }
        data["tour_complet"] = tour_complet
        return Response(data)    

class RecettePublicDetailView(generics.RetrieveAPIView):
    queryset = Recette.objects.all()
    serializer_class = RecettePublicSerializer
    permission_classes = [AllowAny]


class StatsView(APIView):
    permission_classes = [IsStaffUser]

    def get(self, request):
        total_recettes = Recette.objects.count()
        total_ingredients = Ingredient.objects.count()
        total_utilisateurs = Utilisateur.objects.count()

        recettes_par_repas = list(
            Repas.objects.annotate(count=Count("recettes")).values("nom", "count")
        )
        recettes_par_envie = list(
            Envie.objects.annotate(count=Count("recettes")).values("code", "count")
        )

        recettes_sans_envie = Recette.objects.filter(envies__isnull=True).count()
        recettes_sans_ingredient = Recette.objects.filter(ingredients__isnull=True).count()
        recettes_sans_etape = Recette.objects.filter(etapes__isnull=True).distinct().count()

        ingredients_orphelins = list(
            Ingredient.objects.filter(recettes__isnull=True).values("id", "nom")[:20]
        )

        recettes_populaires = list(
            Recette.objects.annotate(nb_cuisine=Count("historique"))
            .filter(nb_cuisine__gt=0)
            .order_by("-nb_cuisine")
            .values("id", "titre", "nb_cuisine")[:5]
        )

        recettes_favorites = list(
            Recette.objects.annotate(nb_favoris=Count("favoris"))
            .filter(nb_favoris__gt=0)
            .order_by("-nb_favoris")
            .values("id", "titre", "nb_favoris")[:5]
        )

        utilisateurs_recents = list(
            Utilisateur.objects.order_by("-date_joined").values(
                "id", "username", "email", "date_joined"
            )[:5]
        )

        activite_recente = list(
            Historique.objects.select_related("utilisateur", "recette", "repas")
            .order_by("-cuisine_le")
            .values(
                "id", "utilisateur__username", "recette__titre", "repas__nom", "cuisine_le"
            )[:10]
        )

        return Response({
            "totaux": {
                "recettes": total_recettes,
                "ingredients": total_ingredients,
                "utilisateurs": total_utilisateurs,
            },
            "recettes_par_repas": recettes_par_repas,
            "recettes_par_envie": recettes_par_envie,
            "qualite": {
                "recettes_sans_envie": recettes_sans_envie,
                "recettes_sans_ingredient": recettes_sans_ingredient,
                "recettes_sans_etape": recettes_sans_etape,
                "ingredients_orphelins": ingredients_orphelins,
            },
            "recettes_populaires": recettes_populaires,
            "recettes_favorites": recettes_favorites,
            "utilisateurs_recents": utilisateurs_recents,
            "activite_recente": activite_recente,
        })