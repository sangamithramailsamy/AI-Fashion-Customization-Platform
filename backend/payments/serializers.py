from decimal import Decimal

from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = (
            "payment_number",
            "status",
            "gateway",
            "gateway_order_id",
            "gateway_payment_id",
            "created_by",
            "created_at",
            "updated_at",
        )

class RazorpayOrderSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        min_value=Decimal("1.00"),
    )
    payment_type = serializers.ChoiceField(
        choices=[
            ("FULL", "Full Payment"),
            ("ADVANCE", "Advance Payment"),
            ("BALANCE", "Balance Payment"),
        ]
    )

    def validate(self, attrs):
        order = self.context["order"]
        amount = attrs["amount"]

        if order.status == "CANCELLED":
            raise serializers.ValidationError(
                "Payment cannot be made for a cancelled order."
            )

        if amount > order.balance_amount:
            raise serializers.ValidationError({
                "amount": "Payment exceeds the remaining order balance."
            })

        return attrs

    def validate(self, attrs):
        instance = getattr(self, "instance", None)

        order = attrs.get(
            "order",
            instance.order if instance else None
        )

        amount = attrs.get(
            "amount",
            instance.amount if instance else Decimal("0.00")
        )

        if not order:
            return attrs

        # Total payments excluding current payment (during update)
        total_paid = Decimal("0.00")

        for payment in order.payments.filter(status="SUCCESS"):
            if instance and payment.pk == instance.pk:
                continue
            total_paid += payment.amount

        # Prevent overpayment
        if total_paid + amount > order.total_amount:
            raise serializers.ValidationError({
                "amount": (
                    "Payment exceeds the remaining balance."
                )
            })

        return attrs

class RazorpayVerifySerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()