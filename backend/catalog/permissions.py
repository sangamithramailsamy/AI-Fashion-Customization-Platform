from rest_framework.permissions import BasePermission


class IsCatalogManager(BasePermission):
    """
    Admin and Boutique Owner can manage catalog.
    Customers can only view.
    """

    def has_permission(self, request, view):

        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        if not request.user.is_authenticated:
            return False

        return (
            request.user.is_superuser
            or request.user.role in ["ADMIN", "OWNER"]
        )

    def has_object_permission(self, request, view, obj):

        return self.has_permission(request, view)