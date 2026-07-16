from rest_framework import serializers

from .models import (
    Section,
    CollectionCategory,
    Design,
    DesignImage,
    DesignVariant,
)


class DesignImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = DesignImage
        fields = "__all__"


class DesignVariantSerializer(serializers.ModelSerializer):

    class Meta:
        model = DesignVariant
        fields = "__all__"


class DesignSerializer(serializers.ModelSerializer):

    images = DesignImageSerializer(
        many=True,
        read_only=True
    )

    variants = DesignVariantSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Design
        fields = "__all__"


class CollectionCategorySerializer(serializers.ModelSerializer):

    designs = DesignSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = CollectionCategory
        fields = "__all__"


class SectionSerializer(serializers.ModelSerializer):

    categories = CollectionCategorySerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Section
        fields = "__all__"