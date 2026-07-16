from rest_framework.permissions import BasePermission, SAFE_METHODS
from users.models import UserRole


class IsOrderAccessible(BasePermission):
    """
    Role-based permissions for Order objects.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin
        if user.is_superuser or user.role == UserRole.ADMIN:
            return True

        # Boutique Owner
        if user.role == UserRole.OWNER:
            return obj.owner == user

        # Tailor
        if user.role == UserRole.TAILOR:
            if obj.employee and obj.employee.user == user:
                # Tailor can view
                if request.method in SAFE_METHODS:
                    return True

                # Tailor can only update
                if request.method in ["PUT", "PATCH"]:
                    return True

            return False

        # Customer
        if user.role == UserRole.CUSTOMER:
            return (
                obj.customer
                and obj.customer.user == user
                and request.method in SAFE_METHODS
            )

        return False