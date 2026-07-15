from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    RepasViewSet, EnvieViewSet, IngredientViewSet, RecetteAdminViewSet,
    IngredientPublicListView, SuggestionView, RecettePublicDetailView, StatsView,
)

router = DefaultRouter()
router.register("backstage/recettes", RecetteAdminViewSet, basename="backstage-recettes")
router.register("backstage/ingredients", IngredientViewSet, basename="backstage-ingredients")
router.register("backstage/repas", RepasViewSet, basename="backstage-repas")
router.register("backstage/envies", EnvieViewSet, basename="backstage-envies")

urlpatterns = router.urls + [
    path("ingredients/", IngredientPublicListView.as_view(), name="ingredients-public"),
    path("suggestion/", SuggestionView.as_view(), name="suggestion"),
    path("recettes/<int:pk>/", RecettePublicDetailView.as_view(), name="recette-detail"),
    path("backstage/stats/", StatsView.as_view(), name="backstage-stats"),
]