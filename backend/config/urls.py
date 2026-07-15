from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("accounts.urls")),
    path("cuisine/", include("cuisine.urls")),
    path("", include("recettes.urls")),
]