from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action
from rest_framework.response import Response

from django.utils import timezone

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from .permissions import IsOrderAccessible

from users.models import UserRole
from shopping.models import ShippingAddress


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsOrderAccessible]

    def get_queryset(self):
        user = self.request.user

        # -----------------------------------------
        # Admin -> All orders
        # -----------------------------------------
        if user.is_superuser or user.role == UserRole.ADMIN:
            return (
                Order.objects
                .select_related(
                    "customer",
                    "employee",
                    "boutique",
                    "shipping_address",
                )
                .prefetch_related(
                    "items",
                    "items__variant",
                    "items__variant__design",
                    "items__variant__design__images",
                )
            )

        # -----------------------------------------
        # Boutique Owner -> Own boutique orders
        # -----------------------------------------
        elif user.role == UserRole.OWNER:
            return (
                Order.objects
                .filter(owner=user)
                .select_related(
                    "customer",
                    "employee",
                    "boutique",
                    "shipping_address",
                )
                .prefetch_related(
                    "items",
                    "items__variant",
                    "items__variant__design",
                    "items__variant__design__images",
                )
            )

        # -----------------------------------------
        # Tailor -> Assigned orders only
        # -----------------------------------------
        elif user.role == UserRole.TAILOR:
            return (
                Order.objects
                .filter(employee__user=user)
                .select_related(
                    "customer",
                    "employee",
                    "boutique",
                    "shipping_address",
                )
                .prefetch_related(
                    "items",
                    "items__variant",
                    "items__variant__design",
                    "items__variant__design__images",
                )
            )

        # -----------------------------------------
        # Customer -> Own orders only
        # -----------------------------------------
        elif user.role == UserRole.CUSTOMER:
            return (
                Order.objects
                .filter(customer__user=user)
                .select_related(
                    "customer",
                    "employee",
                    "boutique",
                    "shipping_address",
                )
                .prefetch_related(
                    "items",
                    "items__variant",
                    "items__variant__design",
                    "items__variant__design__images",
                )
            )

        return Order.objects.none()

    # -----------------------------------------
    # CREATE ORDER
    # -----------------------------------------
    def perform_create(self, serializer):
        user = self.request.user

        # Customer profile of the logged-in customer
        try:
            customer = user.customer_profile
        except Exception:
            raise ValidationError(
                {
                    "customer":
                    "Customer profile not found for this user."
                }
            )

        # -----------------------------------------
        # Boutique
        # -----------------------------------------
        boutique_id = self.request.data.get("boutique")

        if not boutique_id:
            raise ValidationError(
                {
                    "boutique":
                    "Boutique is required."
                }
            )

        try:
            from boutiques.models import Boutique

            boutique = Boutique.objects.get(
                id=boutique_id,
                status="ACTIVE",
            )

        except Boutique.DoesNotExist:
            raise ValidationError(
                {
                    "boutique":
                    "Selected boutique does not exist or is inactive."
                }
            )

        # -----------------------------------------
        # Shipping Address
        # -----------------------------------------
        shipping_address_id = (
            self.request.data.get("shippingAddress")
        )

        shipping_address = None

        if shipping_address_id:

            try:
                shipping_address = ShippingAddress.objects.get(
                    id=shipping_address_id,
                    customer=customer,
                )

            except ShippingAddress.DoesNotExist:
                raise ValidationError(
                    {
                        "shippingAddress":
                        "Selected shipping address does not exist."
                    }
                )

        # -----------------------------------------
        # Save Order
        # -----------------------------------------
        serializer.save(
            owner=boutique.owner,
            customer=customer,
            boutique=boutique,
            shipping_address=shipping_address,
        )

    # -----------------------------------------
    # UPDATE ORDER
    # -----------------------------------------
    def perform_update(self, serializer):
        user = self.request.user

        # Tailor can update only status
        if user.role == UserRole.TAILOR:

            allowed_fields = {"status"}

            received_fields = set(
                self.request.data.keys()
            )

            if not received_fields.issubset(
                allowed_fields
            ):
                raise PermissionDenied(
                    "Tailors can only update the order status."
                )

        serializer.save()

    # -----------------------------------------
    # CANCEL ORDER
    # -----------------------------------------
    @action(
        detail=True,
        methods=["post"],
        url_path="cancel"
    )
    def cancel(self, request, pk=None):

        order = self.get_object()

        # Only pending or in-progress orders
        # can be cancelled
        if order.status not in [
            "PENDING",
            "IN_PROGRESS",
        ]:
            return Response(
                {
                    "detail":
                    "This order cannot be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get(
            "reason",
            ""
        ).strip()

        if not reason:
            return Response(
                {
                    "reason":
                    "Cancellation reason is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = "CANCELLED"
        order.cancellation_reason = reason
        order.cancelled_at = timezone.now()

        order.save()

        return Response(
            OrderSerializer(
                order,
                context={
                    "request": request
                }
            ).data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------
    # PAYMENT
    # -----------------------------------------
    @action(
        detail=True,
        methods=["post"],
        url_path="pay"
    )
    def pay(self, request, pk=None):

        order = self.get_object()

        if order.status == "CANCELLED":
            return Response(
                {
                    "detail":
                    "Cannot make payment for a cancelled order."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        amount = request.data.get("amount")

        if amount is None:
            return Response(
                {
                    "amount":
                    "Payment amount is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from decimal import Decimal

            amount = Decimal(
                str(amount)
            )

        except Exception:
            return Response(
                {
                    "amount":
                    "Invalid payment amount."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if amount <= 0:
            return Response(
                {
                    "amount":
                    "Payment amount must be greater than zero."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if amount > order.balance_amount:
            return Response(
                {
                    "amount":
                    "Payment cannot exceed the balance amount."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.advance_paid += amount

        order.balance_amount = (
            order.total_amount
            - order.advance_paid
        )

        order.save()

        return Response(
            OrderSerializer(
                order,
                context={
                    "request": request
                }
            ).data,
            status=status.HTTP_200_OK
        )

    # -----------------------------------------
    # DELETE ORDER
    # -----------------------------------------
    def perform_destroy(self, instance):

        try:
            instance.delete()

        except Exception as e:
            raise ValidationError(
                {
                    "detail": str(e)
                }
            )


# =====================================================
# ORDER ITEM VIEWSET
# =====================================================

class OrderItemViewSet(viewsets.ModelViewSet):

    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # -----------------------------------------
        # Admin
        # -----------------------------------------
        if (
            user.is_superuser
            or user.role == UserRole.ADMIN
        ):
            return (
                OrderItem.objects
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                    "order__shipping_address",
                    "variant",
                    "variant__design",
                )
                .prefetch_related(
                    "variant__design__images",
                )
            )

        # -----------------------------------------
        # Owner
        # -----------------------------------------
        elif user.role == UserRole.OWNER:
            return (
                OrderItem.objects
                .filter(
                    order__owner=user
                )
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                    "order__shipping_address",
                    "variant",
                    "variant__design",
                )
                .prefetch_related(
                    "variant__design__images",
                )
            )

        # -----------------------------------------
        # Tailor
        # -----------------------------------------
        elif user.role == UserRole.TAILOR:
            return (
                OrderItem.objects
                .filter(
                    order__employee__user=user
                )
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                    "order__shipping_address",
                    "variant",
                    "variant__design",
                )
                .prefetch_related(
                    "variant__design__images",
                )
            )

        # -----------------------------------------
        # Customer
        # -----------------------------------------
        elif user.role == UserRole.CUSTOMER:
            return (
                OrderItem.objects
                .filter(
                    order__customer__user=user
                )
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                    "order__shipping_address",
                    "variant",
                    "variant__design",
                )
                .prefetch_related(
                    "variant__design__images",
                )
            )

        return OrderItem.objects.none()

    # -----------------------------------------
    # CREATE ORDER ITEM
    # -----------------------------------------
    def perform_create(self, serializer):

        order = serializer.validated_data["order"]
        user = self.request.user

        # Owner can only add items
        # to their own orders
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

    # -----------------------------------------
    # UPDATE ORDER ITEM
    # -----------------------------------------
    def perform_update(self, serializer):

        user = self.request.user

        if user.role in [
            UserRole.TAILOR,
            UserRole.CUSTOMER,
        ]:
            raise PermissionDenied(
                "You are not allowed to update order items."
            )

        serializer.save()

    # -----------------------------------------
    # DELETE ORDER ITEM
    # -----------------------------------------
    def perform_destroy(self, instance):

        user = self.request.user

        if user.role in [
            UserRole.TAILOR,
            UserRole.CUSTOMER,
        ]:
            raise PermissionDenied(
                "You are not allowed to delete order items."
            )

        instance.delete()