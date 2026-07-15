from django.urls import path
from .views import GardeMangerView, FavoriView, HistoriqueListView, MarquerCuisineView, MenuView

urlpatterns = [
    path("garde-manger/", GardeMangerView.as_view(), name="garde-manger"),
    path("favoris/", FavoriView.as_view(), name="favoris"),
    path("historique/", HistoriqueListView.as_view(), name="historique"),
    path("historique/marquer/", MarquerCuisineView.as_view(), name="marquer-cuisine"),
    path("menu/", MenuView.as_view(), name="menu"),
]