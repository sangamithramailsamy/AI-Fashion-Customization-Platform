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

    productId = serializers.IntegerField(write_only=True, required=False)
    size = serializers.CharField(write_only=True, required=False)
    color = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CartItem
        fields = (
            "id",
            "cart",
            "variant",
            "quantity",
            "productId",
            "size",
            "color",
        )
        read_only_fields = ("cart", "variant")

    def create(self, validated_data):
        validated_data.pop("productId", None)
        validated_data.pop("size", None)
        validated_data.pop("color", None)
        return super().create(validated_data)


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