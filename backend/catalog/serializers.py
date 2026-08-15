import json

from rest_framework import serializers
from django.db import transaction   
from urllib3 import request

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
    images = DesignImageSerializer(many=True, read_only=True)
    variants = DesignVariantSerializer(many=True, read_only=True)

    price = serializers.DecimalField(
        source="base_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    image = serializers.SerializerMethodField()
    category = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    collection = serializers.CharField(source="category.section.slug", read_only=True)
    collection_name = serializers.CharField(source="category.section.name", read_only=True)
    featured = serializers.BooleanField(source="is_featured", read_only=True)
    newArrival = serializers.BooleanField(source="is_new_arrival", read_only=True)
    customizable = serializers.BooleanField(source="is_customizable", read_only=True)
    active = serializers.BooleanField(source="is_active", read_only=True)

    class Meta:
        model = Design
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "thumbnail",
            "image",
            "base_price",
            "price",
            "category",
            "category_slug",
            "collection",
            "collection_name",
            "featured",
            "newArrival",
            "customizable",
            "active",
            "images",
            "variants",
            "is_featured",
            "is_new_arrival",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if not obj.thumbnail:
            return None
        return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url


class CollectionCategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    design_count = serializers.SerializerMethodField()
    section_name = serializers.CharField(source="section.name", read_only=True)
    section_slug = serializers.CharField(source="section.slug", read_only=True)

    class Meta:
        model = CollectionCategory
        fields = [
            "id",
            "section",
            "section_name",
            "section_slug",
            "name",
            "slug",
            "description",
            "cover_image",
            "image",
            "display_order",
            "is_active",
            "design_count",
            "created_at",
            "updated_at",
        ]

    def get_design_count(self, obj):
        return obj.designs.filter(is_active=True).count()

    def get_image(self, obj):
        request = self.context.get("request")
        if not obj.cover_image:
            return None
        return request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url


class SectionSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    def get_item_count(self, obj):
        return Design.objects.filter(section=obj, is_active=True).count()
    
    def get_image(self, obj):
        request = self.context.get("request")

        if not obj.cover_image:
            return None

        return request.build_absolute_uri(obj.cover_image.url)

    class Meta:
        model = Section
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "cover_image",
            "image",
            "display_order",
            "is_active",
            "item_count",
            "created_at",
            "updated_at",
        ]


class OwnerProductSerializer(serializers.ModelSerializer):
    """Owner-facing CRUD serializer for the same Design records used by the shop."""

    section = serializers.CharField(write_only=True)
    collection = serializers.CharField(write_only=True, required=False, allow_blank=True)

    price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)
    stock = serializers.IntegerField(write_only=True, min_value=0)
    sizes = serializers.ListField(child=serializers.CharField(), write_only=True)
    colors = serializers.ListField(child=serializers.CharField(), write_only=True, required=False, default=list)

    customizable = serializers.BooleanField(source="is_customizable", write_only=True, required=False)
    active = serializers.BooleanField(source="is_active", write_only=True, required=False)
    featured = serializers.BooleanField(source="is_featured", write_only=True, required=False)
    newArrival = serializers.BooleanField(source="is_new_arrival", write_only=True, required=False)

    image = serializers.ImageField(source="thumbnail", write_only=True, required=False, allow_null=True)

    class Meta:
        model = Design
        fields = [
            "id",
            "name",
            "description",
            "category",
            "collection",
            "price",
            "stock",
            "sizes",
            "colors",
            "customizable",
            "active",
            "featured",
            "newArrival",
            "image",
        ]

    def to_internal_value(self, data):
    # Do NOT use data.copy() here.
    # QueryDict.copy() can fail when an uploaded image is present.

        if hasattr(data, "getlist"):
            converted_data = {
                key: data.get(key)
                for key in data.keys()
            }

            for field in ("sizes", "colors"):
                values = data.getlist(field)

                if len(values) == 1 and isinstance(values[0], str):
                    raw = values[0]

                    try:
                        parsed = json.loads(raw)
                        converted_data[field] = (
                            parsed if isinstance(parsed, list) else [raw]
                        )
                    except (json.JSONDecodeError, TypeError):
                        converted_data[field] = [
                            x.strip()
                            for x in raw.split(",")
                            if x.strip()
                        ]

                elif values:
                    converted_data[field] = values

            data = converted_data

        elif isinstance(data, dict):
            data = data.copy()

            for field in ("sizes", "colors"):
                if isinstance(data.get(field), str):
                    raw = data[field]

                    try:
                        parsed = json.loads(raw)
                        data[field] = (
                            parsed if isinstance(parsed, list) else [raw]
                        )
                    except (json.JSONDecodeError, TypeError):
                        data[field] = [
                            x.strip()
                            for x in raw.split(",")
                            if x.strip()
                        ]

        return super().to_internal_value(data)

    def _get_section(self, value):
        value = str(value).strip()

        if not value:
            raise serializers.ValidationError(
                {"section": "Section is required."}
            )

        if value.isdigit():
            try:
                return Section.objects.get(
                    id=int(value),
                    is_active=True,
                )
            except Section.DoesNotExist:
                raise serializers.ValidationError(
                    {"section": f"Section with ID '{value}' not found."}
                )

        section = Section.objects.filter(
            name__iexact=value,
            is_active=True,
        ).first()

        if section:
            return section

        section = Section.objects.filter(
            slug__iexact=value,
            is_active=True,
        ).first()

        if section:
            return section

        raise serializers.ValidationError(
            {"section": f"Section '{value}' not found."}
        )
    
    def _get_section(self, value):
        value = str(value).strip()

        if not value:
            raise serializers.ValidationError(
                {"section": "Section is required."}
            )

        if value.isdigit():
            try:
                return Section.objects.get(
                    id=int(value),
                    is_active=True,
                )
            except Section.DoesNotExist:
                raise serializers.ValidationError(
                    {"section": f"Section with ID '{value}' not found."}
                )

        section = Section.objects.filter(
            name__iexact=value,
            is_active=True,
        ).first()

        if section:
            return section

        section = Section.objects.filter(
            slug__iexact=value,
            is_active=True,
        ).first()

        if section:
            return section

        raise serializers.ValidationError(
            {"section": f"Section '{value}' not found."}
        )
    
    def _get_collection(self, value):
        value = str(value).strip()
        if not value:
            raise serializers.ValidationError({"collection": "Collection is required."})
        qs = Section.objects.all()
        if value.isdigit():
            collection = qs.filter(id=int(value)).first()
        else:
            collection = qs.filter(slug__iexact=value).first() or qs.filter(name__iexact=value).first()
        if not collection:
            raise serializers.ValidationError({"collection": f"Collection '{value}' not found."})
        return collection

    def _create_variants(self, design, sizes, colors, price, stock):
        sizes = [str(x).strip().upper() for x in sizes if str(x).strip()]
        colors = [str(x).strip() for x in colors if str(x).strip()] or [""]
        if not sizes:
            raise serializers.ValidationError({"sizes": "At least one size is required."})

        for size in sizes:
            if size not in dict(DesignVariant.SIZE_CHOICES):
                raise serializers.ValidationError({"sizes": f"Invalid size '{size}'. Allowed sizes: XS, S, M, L, XL, XXL."})
            for color in colors:
                base_sku = f"DESIGN-{design.id}-{size}-{color.upper().replace(' ', '-') or 'DEFAULT'}"
                sku = base_sku
                counter = 1
                while DesignVariant.objects.filter(sku=sku).exists():
                    sku = f"{base_sku}-{counter}"
                    counter += 1
                DesignVariant.objects.create(
                    design=design,
                    size=size,
                    color=color,
                    stock=stock,
                    price=price,
                    sku=sku,
                    is_active=design.is_active,
                )

    def to_representation(self, instance):
        variants = instance.variants.filter(is_active=True)
        sizes = list(variants.values_list("size", flat=True).distinct())
        colors = list(variants.exclude(color="").values_list("color", flat=True).distinct())
        stock = sum(v.stock for v in variants)
        price = variants.first().price if variants.exists() else instance.base_price

        request = self.context.get("request")
        image = None
        if instance.thumbnail:
            image = request.build_absolute_uri(instance.thumbnail.url) if request else instance.thumbnail.url

        return {
            "id": instance.id,
            "name": instance.name,
            "description": instance.description,
            "category": instance.category.name,
            "collection": instance.category.section.slug,
            "collectionName": instance.category.section.name,
            "price": float(price),
            "stock": stock,
            "sizes": sizes,
            "colors": colors,
            "customizable": instance.is_customizable,
            "active": instance.is_active,
            "featured": instance.is_featured,
            "newArrival": instance.is_new_arrival,
            "image": image,
            "createdAt": instance.created_at,
        }

    @transaction.atomic
    def create(self, validated_data):
        section_value = validated_data.pop("section")

        price = validated_data.pop("price")
        stock = validated_data.pop("stock")
        sizes = validated_data.pop("sizes")
        colors = validated_data.pop("colors", [])

        customizable = validated_data.pop(
            "is_customizable",
            False,
        )

        active = validated_data.pop(
            "is_active",
            True,
        )

        featured = validated_data.pop(
            "is_featured",
            False,
        )

        new_arrival = validated_data.pop(
            "is_new_arrival",
            False,
        )

        thumbnail = validated_data.pop(
            "thumbnail",
            None,
        )

        section = self._get_section(section_value)

        design = Design.objects.create(
            section=section,
            name=validated_data.get("name", ""),
            description=validated_data.get("description", ""),
            base_price=price,
            is_featured=featured,
            is_new_arrival=new_arrival,
            is_customizable=customizable,
            is_active=active,
            thumbnail=thumbnail,
        )

        self._create_variants(
            design=design,
            sizes=sizes,
            colors=colors,
            price=price,
            stock=stock,
        )

        return design
    
    def update(self, instance, validated_data):
        category_value = validated_data.pop("category", None)
        collection_value = validated_data.pop("collection", None)
        price = validated_data.pop("price", None)
        stock = validated_data.pop("stock", None)
        sizes = validated_data.pop("sizes", None)
        colors = validated_data.pop("colors", None)
        thumbnail = validated_data.pop("thumbnail", None)

        if category_value is not None:
            instance.section = self._get_section(category_value, collection_value)
        elif collection_value is not None:
            collection = self._get_collection(collection_value)
            if instance.category.section_id != collection.id:
                raise serializers.ValidationError({"collection": "Selected collection does not match the product category."})

        if "is_customizable" in validated_data:
            instance.is_customizable = validated_data.pop("is_customizable")
        if "is_active" in validated_data:
            instance.is_active = validated_data.pop("is_active")
        if "is_featured" in validated_data:
            instance.is_featured = validated_data.pop("is_featured")
        if "is_new_arrival" in validated_data:
            instance.is_new_arrival = validated_data.pop("is_new_arrival")
        if price is not None:
            instance.base_price = price
        if thumbnail is not None:
            instance.thumbnail = thumbnail

        instance.name = validated_data.get("name", instance.name)
        instance.description = validated_data.get("description", instance.description)
        instance.save()

        if price is not None or stock is not None or sizes is not None or colors is not None:
            existing = list(instance.variants.all())
            current_price = price if price is not None else (existing[0].price if existing else instance.base_price)
            current_stock = stock if stock is not None else (existing[0].stock if existing else 0)
            current_sizes = sizes if sizes is not None else [v.size for v in existing]
            current_colors = colors if colors is not None else [v.color for v in existing]
            instance.variants.all().delete()
            self._create_variants(instance, current_sizes, current_colors, current_price, current_stock)

        return instance
