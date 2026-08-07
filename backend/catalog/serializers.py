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

    price = serializers.DecimalField(
        source="base_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    image = serializers.SerializerMethodField()

    featured = serializers.BooleanField(
        source="is_featured",
        read_only=True,
    )

    newArrival = serializers.BooleanField(
        source="is_new_arrival",
        read_only=True,
    )

    # ⭐ ADD THIS
    category_slug = serializers.CharField(
        source="category.slug",
        read_only=True,
    )

    class Meta:
        model = Design
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "thumbnail",
            "base_price",
            "price",
            "image",
            "featured",
            "newArrival",
            "images",
            "variants",
            "is_featured",
            "is_new_arrival",
            "is_active",
            "created_at",
            "updated_at",
            "category",
            "category_slug",
        ]

    def get_image(self, obj):
        request = self.context.get("request")

        if obj.thumbnail:
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url

        return None


class CollectionCategorySerializer(serializers.ModelSerializer):
    designs = DesignSerializer(
        many=True,
        read_only=True,
    )

    image = serializers.SerializerMethodField()

    class Meta:
        model = CollectionCategory
        fields = [
            "id",
            "section",
            "name",
            "slug",
            "description",
            "cover_image",
            "image",
            "display_order",
            "is_active",
            "created_at",
            "updated_at",
            "designs",
        ]

    def get_image(self, obj):
        request = self.context.get("request")

        if obj.cover_image:
            if request:
                return request.build_absolute_uri(obj.cover_image.url)
            return obj.cover_image.url

        return None


class SectionSerializer(serializers.ModelSerializer):
    categories = CollectionCategorySerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Section
        fields = "__all__"