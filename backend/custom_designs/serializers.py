from rest_framework import serializers

from .models import CustomDesignRequest


class CustomDesignRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomDesignRequest
        fields = [
            "id",
            "customer",
            "occasion",
            "description",
            "colors",
            "fabric",
            "silhouette",
            "inspiration_image",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "customer",
            "status",
            "created_at",
            "updated_at",
        ]