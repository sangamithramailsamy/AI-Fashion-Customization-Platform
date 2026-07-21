from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Inventory
from .serializers import InventorySerializer
from .permissions import IsInventoryManager

from users.models import UserRole
from boutiques.models import Boutique


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

            boutique = user.boutiques.first()

            if not boutique:
                return Inventory.objects.none()

            return Inventory.objects.filter(
                boutique=boutique
            ).select_related("boutique")

        # Tailor -> View owner's boutique inventory
        elif user.role == UserRole.TAILOR:

            if hasattr(user, "employee_profile"):

                owner = user.employee_profile.owner
                boutique = owner.boutiques.first()

                if not boutique:
                    return Inventory.objects.none()

                return Inventory.objects.filter(
                    boutique=boutique
                ).select_related("boutique")

            return Inventory.objects.none()

        return Inventory.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != UserRole.OWNER:
            raise PermissionDenied(
                "Only boutique owners can add inventory."
            )

        boutique = user.boutiques.first()

        if not boutique:
            raise PermissionDenied(
                "Please create your boutique first."
            )

        serializer.save(
            boutique=boutique
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