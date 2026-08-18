from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone
from rest_framework import serializers

from .models import Order, OrderItem
from discounts.models import Coupon, DiscountType


MONEY = Decimal("0.01")


def money(value):
    return Decimal(str(value)).quantize(
        MONEY,
        rounding=ROUND_HALF_UP
    )


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"
        extra_kwargs = {
            "order": {"required": False}
        }


class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(many=True)

    coupon_code = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    class Meta:
        model = Order

        fields = "__all__"

        read_only_fields = (
            "owner",
            "customer",
            "order_number",
            "total_amount",
            "balance_amount",
            "delivery_charge",
            "discount_amount",
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
            instance.advance_paid if instance else Decimal("0.00")
        )

        status = attrs.get(
            "status",
            instance.status if instance else "PENDING"
        )

        # -----------------------------
        # Date validation
        # -----------------------------

        if order_date and delivery_date:
            if delivery_date < order_date:
                raise serializers.ValidationError({
                    "delivery_date":
                        "Delivery date cannot be before the order date."
                })

        # -----------------------------
        # Status validation
        # -----------------------------

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

        # -----------------------------
        # Coupon validation
        # -----------------------------

        coupon_code = attrs.pop("coupon_code", None)

        if coupon_code:
            coupon_code = coupon_code.strip().upper()

            try:
                coupon = Coupon.objects.get(
                    code=coupon_code,
                    is_active=True,
                )
            except Coupon.DoesNotExist:
                raise serializers.ValidationError({
                    "coupon_code": "Invalid coupon."
                })

            now = timezone.now()

            if now < coupon.valid_from:
                raise serializers.ValidationError({
                    "coupon_code": "Coupon is not active yet."
                })

            if now > coupon.valid_until:
                raise serializers.ValidationError({
                    "coupon_code": "Coupon has expired."
                })

            if coupon.used_count >= coupon.usage_limit:
                raise serializers.ValidationError({
                    "coupon_code": "Coupon usage limit reached."
                })

            # Store validated coupon temporarily
            attrs["_coupon"] = coupon

        # Make sure advance payment has exactly 2 decimals
        attrs["advance_paid"] = money(advance_paid)

        return attrs

    def create(self, validated_data):

        coupon = validated_data.pop("_coupon", None)

        items_data = validated_data.pop(
            "items",
            []
        )

        # Create order first
        order = Order.objects.create(
            **validated_data
        )

        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                **item_data
            )

        # Calculate subtotal from actual saved items
        subtotal = sum(
            (
                item.subtotal
                for item in order.items.all()
            ),
            Decimal("0.00")
        )

        subtotal = money(subtotal)

        # -----------------------------
        # Calculate coupon discount
        # -----------------------------

        discount = Decimal("0.00")

        if coupon:

            # Check minimum order amount again
            if subtotal < coupon.minimum_order_amount:
                raise serializers.ValidationError({
                    "coupon_code": (
                        f"Minimum order amount is "
                        f"₹{coupon.minimum_order_amount}"
                    )
                })

            if coupon.discount_type == DiscountType.PERCENTAGE:

                discount = (
                    subtotal * coupon.discount_value
                ) / Decimal("100")

                if (
                    coupon.maximum_discount_amount
                    and discount > coupon.maximum_discount_amount
                ):
                    discount = coupon.maximum_discount_amount

            else:
                discount = coupon.discount_value

            # Never allow discount above subtotal
            if discount > subtotal:
                discount = subtotal

        # IMPORTANT:
        # Force money values to exactly 2 decimal places
        discount = money(discount)

        delivery_charge = money(
            order.delivery_charge
        )

        # -----------------------------
        # Calculate final total
        # -----------------------------

        total_amount = money(
            subtotal
            - discount
            + delivery_charge
        )

        if total_amount < Decimal("0.00"):
            total_amount = Decimal("0.00")

        advance_paid = money(
            order.advance_paid
        )

        balance_amount = money(
            total_amount - advance_paid
        )

        if balance_amount < Decimal("0.00"):
            balance_amount = Decimal("0.00")

        # -----------------------------
        # Save final order amounts
        # -----------------------------

        order.discount_amount = discount
        order.total_amount = total_amount
        order.balance_amount = balance_amount

        order.save(
            update_fields=[
                "discount_amount",
                "total_amount",
                "balance_amount",
                "updated_at",
            ]
        )

        return order