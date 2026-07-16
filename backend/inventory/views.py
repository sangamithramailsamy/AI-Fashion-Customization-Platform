from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Inventory
from .serializers import InventorySerializer
from .permissions import IsInventoryManager

from users.models import UserRole


class InventoryViewSet(viewsets.ModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated, IsInventoryManager]

    def get_queryset(self):
        user = self.request.user

        # Admin -> View all inventory
        if user.is_superuser or user.role == UserRole.ADMIN:
            return Inventory.objects.select_related("boutique")

        # Boutique Owner -> Own boutique inventory
        elif user.role == UserRole.OWNER:
            return Inventory.objects.filter(
                boutique=user.boutique
            ).select_related("boutique")

        # Tailor -> View inventory of owner's boutique
        elif user.role == UserRole.TAILOR:
            if hasattr(user, "employee_profile"):
                return Inventory.objects.filter(
                    boutique=user.employee_profile.owner.boutique
                ).select_related("boutique")

            return Inventory.objects.none()

        return Inventory.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != UserRole.OWNER:
            raise PermissionDenied(
                "Only boutique owners can add inventory."
            )

        serializer.save(
            boutique=user.boutique
        )

    def perform_update(self, serializer):
        user = self.request.user

        if user.role != UserRole.OWNER:
            raise PermissionDenied(
                "Only boutique owners can update inventory."
            )

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role != UserRole.OWNER:
            raise PermissionDenied(
                "Only boutique owners can delete inventory."
            )

        instance.delete()
