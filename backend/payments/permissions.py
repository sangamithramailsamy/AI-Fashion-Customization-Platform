from rest_framework.permissions import BasePermission, SAFE_METHODS

from users.models import UserRole


class IsPaymentAccessible(BasePermission):
    """
    Role-based permissions for Payment objects.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user

        # Admin
        if user.is_superuser or user.role == UserRole.ADMIN:
            return True

        # Boutique Owner
        if user.role == UserRole.OWNER:
            return obj.order.owner == user

        # Tailor
        if user.role == UserRole.TAILOR:
            return (
                obj.order.employee
                and obj.order.employee.user == user
                and request.method in SAFE_METHODS
            )

        # Customer
        if user.role == UserRole.CUSTOMER:
            return (
                obj.order.customer
                and obj.order.customer.user == user
                and request.method in SAFE_METHODS
            )

        return False