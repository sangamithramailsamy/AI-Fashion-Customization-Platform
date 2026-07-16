from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = (
            "owner",
            "order_number",
            "total_amount",
            "balance_amount",
            "created_at",
            "updated_at",
        )

    def validate(self, attrs):
        instance = getattr(self, "instance", None)

        order_date = attrs.get(
            "order_date",
            instance.order_date if instance else None
        )

        delivery_date = attrs.get(
            "delivery_date",
            instance.delivery_date if instance else None
        )

        advance_paid = attrs.get(
            "advance_paid",
            instance.advance_paid if instance else 0
        )

        total_amount = (
            instance.total_amount if instance else 0
        )

        status = attrs.get(
            "status",
            instance.status if instance else "PENDING"
        )

        # Delivery date validation
        if order_date and delivery_date:
            if delivery_date < order_date:
                raise serializers.ValidationError({
                    "delivery_date": "Delivery date cannot be before the order date."
                })

        # Advance payment validation
        if instance and advance_paid > total_amount:
            raise serializers.ValidationError({
                "advance_paid": "Advance payment cannot exceed the total amount."
            })

        # Status workflow validation
        if instance:
            allowed = {
                "PENDING": ["IN_PROGRESS", "CANCELLED"],
                "IN_PROGRESS": ["READY", "CANCELLED"],
                "READY": ["DELIVERED"],
                "DELIVERED": [],
                "CANCELLED": [],
            }

            if (
                status != instance.status
                and status not in allowed[instance.status]
            ):
                raise serializers.ValidationError({
                    "status": (
                        f"Cannot change status from "
                        f"{instance.status} to {status}."
                    )
                })

        return attrs