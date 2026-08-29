from rest_framework import serializers

from .models import Review, ReviewMedia


class ReviewMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewMedia
        fields = "__all__"
        read_only_fields = [
            "uploaded_at",
        ]


class ReviewSerializer(serializers.ModelSerializer):
    media = ReviewMediaSerializer(
        many=True,
        read_only=True,
    )

    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = [
            "customer",
            "created_at",
            "updated_at",
        ]

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return (
                getattr(obj.customer.user, "full_name", None)
                or getattr(obj.customer.user, "username", None)
                or getattr(obj.customer.user, "email", None)
                or f"Customer {obj.customer.id}"
            )

        return f"Customer {obj.customer.id}"