from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Payment
from .serializers import PaymentSerializer
from .permissions import IsPaymentAccessible

from users.models import UserRole


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsPaymentAccessible]

    def get_queryset(self):
        user = self.request.user

        # Admin
        if user.is_superuser or user.role == UserRole.ADMIN:
            return Payment.objects.select_related("order")

        # Boutique Owner
        elif user.role == UserRole.OWNER:
            return Payment.objects.filter(
                order__owner=user
            ).select_related("order")

        # Tailor
        elif user.role == UserRole.TAILOR:
            return Payment.objects.filter(
                order__employee__user=user
            ).select_related("order")

        # Customer
        elif user.role == UserRole.CUSTOMER:
            return Payment.objects.filter(
                order__customer__user=user
            ).select_related("order")

        return Payment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        # Tailors cannot create payments
        if user.role == UserRole.TAILOR:
            raise PermissionDenied(
                "Tailors cannot record payments."
            )

        # Customers cannot create payments
        if user.role == UserRole.CUSTOMER:
            raise PermissionDenied(
                "Customers cannot record payments."
            )

        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user

        if user.role in [UserRole.TAILOR, UserRole.CUSTOMER]:
            raise PermissionDenied(
                "You are not allowed to update payments."
            )

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role in [UserRole.TAILOR, UserRole.CUSTOMER]:
            raise PermissionDenied(
                "You are not allowed to delete payments."
            )

        instance.delete()