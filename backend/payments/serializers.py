from decimal import Decimal

from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = (
            "payment_number",
            "created_by",
            "created_at",
            "updated_at",
        )

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

        for payment in order.payments.all():
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