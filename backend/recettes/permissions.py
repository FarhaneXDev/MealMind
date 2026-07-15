from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    message = "Accès réservé à l'administration."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)