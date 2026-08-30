from rest_framework import serializers


class AIDesignSerializer(serializers.Serializer):
    prompt = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=2000,
    )

    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
    )