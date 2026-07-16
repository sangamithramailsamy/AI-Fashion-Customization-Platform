from rest_framework.permissions import BasePermission


class IsInventoryManager(BasePermission):
    """
    Only authenticated users can access inventory.
    """

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated