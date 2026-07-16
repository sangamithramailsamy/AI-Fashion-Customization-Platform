from rest_framework import serializers

from .models import Production


class ProductionSerializer(serializers.ModelSerializer):

    order_number = serializers.CharField(
        source="order.order_number",
        read_only=True
    )

    tailor_name = serializers.CharField(
        source="tailor.employee_name",
        read_only=True
    )

    boutique_name = serializers.CharField(
        source="boutique.name",
        read_only=True
    )

    class Meta:
        model = Production

        fields = [
            "id",
            "boutique",
            "boutique_name",
            "order",
            "order_number",
            "tailor",
            "tailor_name",
            "assigned_by",
            "status",
            "assigned_date",
            "expected_completion_date",
            "completed_date",
            "remarks",
            "created_at",
            "updated_at",
        ]

        read_only_fields = (
            "boutique",
            "assigned_by",
            "assigned_date",
            "created_at",
            "updated_at",
        )