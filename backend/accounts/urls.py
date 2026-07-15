from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, RefreshView, MeView,
    ChangePasswordView, DeleteAccountView, DemandeResetView, ConfirmerResetView,
)

urlpatterns = [
    path("inscription/", RegisterView.as_view(), name="inscription"),
    path("connexion/", LoginView.as_view(), name="connexion"),
    path("deconnexion/", LogoutView.as_view(), name="deconnexion"),
    path("rafraichir/", RefreshView.as_view(), name="rafraichir"),
    path("moi/", MeView.as_view(), name="moi"),
    path("changer-mot-de-passe/", ChangePasswordView.as_view(), name="changer-mot-de-passe"),
    path("supprimer-compte/", DeleteAccountView.as_view(), name="supprimer-compte"),
    path("mot-de-passe-oublie/", DemandeResetView.as_view(), name="mot-de-passe-oublie"),
    path("reinitialiser-mot-de-passe/", ConfirmerResetView.as_view(), name="reinitialiser-mot-de-passe"),
]