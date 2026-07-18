from django.contrib.auth.models import AbstractUser
from django.db import models


class Utilisateur(AbstractUser):
    email = models.EmailField(unique=True)
    avatar = models.CharField(max_length=30, default="chef-palm")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email