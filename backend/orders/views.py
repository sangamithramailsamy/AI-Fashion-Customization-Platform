from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from .permissions import IsOrderAccessible

from users.models import UserRole


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsOrderAccessible]

    def get_queryset(self):
        user = self.request.user

        # Admin -> All orders
        if user.is_superuser or user.role == UserRole.ADMIN:
            return (
                Order.objects
                .select_related(
                    "customer",
                    "employee",
                    "boutique",
                )
                .prefetch_related("items")
            )

        # Boutique Owner -> Own boutique orders
        elif user.role == UserRole.OWNER:
            return (
                Order.objects.filter(owner=user)
                .select_related(
                    "customer",
                    "employee",
                    "boutique",
                )
                .prefetch_related("items")
            )

        # Tailor -> Assigned orders only
        elif user.role == UserRole.TAILOR:
            return (
                Order.objects.filter(employee__user=user)
                .select_related(
                    "customer",
                    "employee",
                    "boutique",
                )
                .prefetch_related("items")
            )

        # Customer -> Own orders only
        elif user.role == UserRole.CUSTOMER:
            return (
                Order.objects.filter(customer__user=user)
                .select_related(
                    "customer",
                    "employee",
                    "boutique",
                )
                .prefetch_related("items")
            )

        return Order.objects.none()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        user = self.request.user

        # Tailor can update only status
        if user.role == UserRole.TAILOR:
            allowed_fields = {"status"}

            received_fields = set(self.request.data.keys())

            if not received_fields.issubset(allowed_fields):
                raise PermissionDenied(
                    "Tailors can only update the order status."
                )

        serializer.save()

    def perform_destroy(self, instance):
        try:
            instance.delete()
        except Exception as e:
            raise ValidationError({"detail": str(e)})


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin
        if user.is_superuser or user.role == UserRole.ADMIN:
            return (
                OrderItem.objects
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                )
            )

        # Owner
        elif user.role == UserRole.OWNER:
            return (
                OrderItem.objects.filter(order__owner=user)
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                )
            )

        # Tailor
        elif user.role == UserRole.TAILOR:
            return (
                OrderItem.objects.filter(order__employee__user=user)
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                )
            )

        # Customer
        elif user.role == UserRole.CUSTOMER:
            return (
                OrderItem.objects.filter(order__customer__user=user)
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                )
            )

        return OrderItem.objects.none()

    def perform_create(self, serializer):
        order = serializer.validated_data["order"]
        user = self.request.user

        # Owner can only add items to their own orders
        if (
            user.role == UserRole.OWNER
            and order.owner != user
        ):
            raise PermissionDenied(
                "You cannot add items to another owner's order."
            )

        # Tailor cannot create order items
        if user.role == UserRole.TAILOR:
            raise PermissionDenied(
                "Tailors cannot create order items."
            )

        # Customer cannot create order items
        if user.role == UserRole.CUSTOMER:
            raise PermissionDenied(
                "Customers cannot create order items."
            )

        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user

        if user.role in [UserRole.TAILOR, UserRole.CUSTOMER]:
            raise PermissionDenied(
                "You are not allowed to update order items."
            )

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if user.role in [UserRole.TAILOR, UserRole.CUSTOMER]:
            raise PermissionDenied(
                "You are not allowed to delete order items."
            )

        instance.delete()