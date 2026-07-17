from rest_framework import serializers

from .models import (
    Wishlist,
    Cart,
    CartItem,
    ShippingAddress,
)

class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = "__all__"
        read_only_fields = ["customer", "created_at"]


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = "__all__"


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = "__all__"
        read_only_fields = [
            "customer",
            "created_at",
            "updated_at",
        ]

class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = "__all__"
        read_only_fields = [
            "customer",
            "created_at",
            "updated_at",
        ]