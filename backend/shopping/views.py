from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cart

from .models import (
    Wishlist,
    Cart,
    CartItem,
    ShippingAddress,
)

from catalog.models import DesignVariant

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

    @action(detail=False, methods=["delete"])
    def remove(self, request):
        design_id = request.data.get("design")

        Wishlist.objects.filter(
            customer=request.user.customer_profile,
            design_id=design_id,
        ).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)



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
        cart, created = Cart.objects.get_or_create(
            customer=self.request.user.customer_profile
        )

        product_id = self.request.data.get("productId")
        size = self.request.data.get("size")
        color = self.request.data.get("color")

        variant = DesignVariant.objects.get(
            design_id=product_id,
            size=size,
            color=color,
        )

        serializer.save(
            cart=cart,
            variant=variant,
        )

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