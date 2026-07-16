from rest_framework.permissions import BasePermission
from users.models import UserRole


class IsAdmin(BasePermission):
    """
    Allows access only to Admin users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )
    
class IsOwner(BasePermission):
    """
    Allows access only to Boutique Owners.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.OWNER
        )
    
class IsAdminOrOwner(BasePermission):
    """
    Allows access to Admin and Boutique Owner.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in [
                UserRole.ADMIN,
                UserRole.OWNER,
            ]
        )