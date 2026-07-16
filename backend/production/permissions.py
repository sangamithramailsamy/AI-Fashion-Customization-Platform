from rest_framework.permissions import BasePermission


class IsProductionManager(BasePermission):
    """
    Only authenticated users can access production.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated