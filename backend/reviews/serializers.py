from rest_framework import serializers
from .models import Review, ReviewMedia


class ReviewMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewMedia
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    media = ReviewMediaSerializer(many=True, read_only=True)

    class Meta:
        model = Review
        fields = "__all__"