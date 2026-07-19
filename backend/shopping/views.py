from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import (
    Wishlist,
    Cart,
    CartItem,
    ShippingAddress,
)

from .serializers import (
    WishlistSerializer,
    CartSerializer,
    CartItemSerializer,
    ShippingAddressSerializer,
)

from .permissions import IsShoppingOwner


class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated, IsShoppingOwner]

    def get_queryset(self):
        if self.request.user.is_staff:
            return (
                Wishlist.objects
                .select_related(
                    "customer__user",
                    "design",
                )
            )

        return (
            Wishlist.objects.filter(
                customer__user=self.request.user
            )
            .select_related(
                "customer__user",
                "design",
            )
        )

    def perform_create(self, serializer):
        serializer.save(
            customer=self.request.user.customer_profile
        )


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated, IsShoppingOwner]

    def get_queryset(self):
        if self.request.user.is_staff:
            return (
                Cart.objects
                .select_related("customer__user")
                .prefetch_related("items")
            )

        return (
            Cart.objects.filter(
                customer__user=self.request.user
            )
            .select_related("customer__user")
            .prefetch_related("items")
        )

    def perform_create(self, serializer):
        serializer.save(
            customer=self.request.user.customer_profile
        )


class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated, IsShoppingOwner]

    def get_queryset(self):
        if self.request.user.is_staff:
            return (
                CartItem.objects
                .select_related(
                    "cart__customer__user",
                    "variant",
                    "variant__design",
                )
            )

        return (
            CartItem.objects.filter(
                cart__customer__user=self.request.user
            )
            .select_related(
                "cart__customer__user",
                "variant",
                "variant__design",
            )
        )

    def perform_create(self, serializer):
        cart = serializer.validated_data["cart"]

        if cart.customer.user != self.request.user:
            raise PermissionDenied(
                "You cannot add items to another customer's cart."
            )

        serializer.save()


class ShippingAddressViewSet(viewsets.ModelViewSet):
    serializer_class = ShippingAddressSerializer
    permission_classes = [IsAuthenticated, IsShoppingOwner]

    def get_queryset(self):
        if self.request.user.is_staff:
            return (
                ShippingAddress.objects
                .select_related("customer__user")
            )

        return (
            ShippingAddress.objects.filter(
                customer__user=self.request.user
            )
            .select_related("customer__user")
        )

    def perform_create(self, serializer):
        serializer.save(
            customer=self.request.user.customer_profile
        )