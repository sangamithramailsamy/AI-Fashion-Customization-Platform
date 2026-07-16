from rest_framework import serializers

from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):

    boutique_name = serializers.CharField(
        source="boutique.name",
        read_only=True
    )

    low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Inventory

        fields = [
            "id",
            "boutique",
            "boutique_name",
            "item_name",
            "category",
            "unit",
            "current_stock",
            "minimum_stock",
            "purchase_price",
            "selling_price",
            "supplier",
            "notes",
            "is_active",
            "low_stock",
            "created_at",
            "updated_at",
        ]

        read_only_fields = (
            "boutique",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        current_stock = attrs.get(
            "current_stock",
            self.instance.current_stock if self.instance else 0
        )

        minimum_stock = attrs.get(
            "minimum_stock",
            self.instance.minimum_stock if self.instance else 0
        )

        if current_stock < 0:
            raise serializers.ValidationError({
                "current_stock": "Current stock cannot be negative."
            })

        if minimum_stock < 0:
            raise serializers.ValidationError({
                "minimum_stock": "Minimum stock cannot be negative."
            })

        return attrs