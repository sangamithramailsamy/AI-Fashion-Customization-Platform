from rest_framework.permissions import BasePermission


class IsShoppingOwner(BasePermission):
    """
    Allow customers to access only their own shopping resources.
    Admin users have full access.
    """

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.is_superuser:
            return True

        if hasattr(obj, "customer"):
            return obj.customer.user == request.user

        if hasattr(obj, "cart"):
            return obj.cart.customer.user == request.user

        return False