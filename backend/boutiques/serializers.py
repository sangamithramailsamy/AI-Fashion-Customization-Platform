from rest_framework import serializers
from .models import Boutique


class BoutiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Boutique
        fields = "__all__"
        read_only_fields = (
            "owner",
            "created_at",
            "updated_at",
        )