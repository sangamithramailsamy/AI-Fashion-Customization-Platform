import ast
import json

from django.db import transaction
from rest_framework import serializers

from .models import Design, DesignVariant, CollectionCategory


class OwnerProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Design
        fields = [
            "id",
            "name",
            "description",
            "category",
            "price",
            "stock",
            "sizes",
            "colors",
            "customizable",
            "active",
            "image",
        ]

    category = serializers.CharField(write_only=True)

    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        write_only=True,
    )

    stock = serializers.IntegerField(
        write_only=True,
        min_value=0,
    )

    sizes = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
    )

    colors = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        default=list,
    )

    customizable = serializers.BooleanField(
        source="is_customizable",
        write_only=True,
        required=False,
    )

    active = serializers.BooleanField(
        source="is_active",
        write_only=True,
        required=False,
    )

    image = serializers.ImageField(
        source="thumbnail",
        write_only=True,
        required=False,
        allow_null=True,
    )

    # ---------------------------------------------------------
    # Convert multipart values into proper Python lists
    # ---------------------------------------------------------
    def _parse_list_value(self, value):
        if isinstance(value, list):
            return value

        if isinstance(value, tuple):
            return list(value)

        if not isinstance(value, str):
            return value

        value = value.strip()

        if not value:
            return []

        # JSON:
        # ["XS", "S", "M"]
        try:
            parsed = json.loads(value)

            if isinstance(parsed, list):
                return parsed
        except (json.JSONDecodeError, TypeError):
            pass

        # Python-style list:
        # ['XS', 'S', 'M']
        try:
            parsed = ast.literal_eval(value)

            if isinstance(parsed, (list, tuple)):
                return list(parsed)
        except (ValueError, SyntaxError):
            pass

        # Comma-separated:
        # XS, S, M
        return [
            item.strip()
            for item in value.split(",")
            if item.strip()
        ]

    def to_internal_value(self, data):
        data = data.copy()

        # -----------------------------------------------------
        # SIZES
        # -----------------------------------------------------
        if hasattr(data, "getlist"):
            raw_sizes = data.getlist("sizes")

            # Example:
            # sizes=XS
            # sizes=S
            # sizes=M
            if len(raw_sizes) > 1:
                parsed_sizes = []

                for value in raw_sizes:
                    parsed_sizes.extend(
                        self._parse_list_value(value)
                    )

                data.setlist("sizes", parsed_sizes)

            elif len(raw_sizes) == 1:
                data.setlist(
                    "sizes",
                    self._parse_list_value(raw_sizes[0]),
                )

        elif "sizes" in data:
            data["sizes"] = self._parse_list_value(
                data["sizes"]
            )

        # -----------------------------------------------------
        # COLORS
        # -----------------------------------------------------
        if hasattr(data, "getlist"):
            raw_colors = data.getlist("colors")

            if len(raw_colors) > 1:
                parsed_colors = []

                for value in raw_colors:
                    parsed_colors.extend(
                        self._parse_list_value(value)
                    )

                data.setlist("colors", parsed_colors)

            elif len(raw_colors) == 1:
                data.setlist(
                    "colors",
                    self._parse_list_value(raw_colors[0]),
                )

        elif "colors" in data:
            data["colors"] = self._parse_list_value(
                data["colors"]
            )

        return super().to_internal_value(data)

    # ---------------------------------------------------------
    # CATEGORY
    # ---------------------------------------------------------
    def _get_category(self, value):
        value = str(value).strip()

        if not value:
            raise serializers.ValidationError(
                {
                    "category": "Category is required."
                }
            )

        # Category ID
        if value.isdigit():
            try:
                return CollectionCategory.objects.get(
                    id=int(value)
                )
            except CollectionCategory.DoesNotExist:
                raise serializers.ValidationError(
                    {
                        "category": (
                            f"Category with ID '{value}' "
                            "not found."
                        )
                    }
                )

        # Category name
        category = CollectionCategory.objects.filter(
            name__iexact=value
        ).first()

        if category:
            return category

        # Category slug
        category = CollectionCategory.objects.filter(
            slug__iexact=value
        ).first()

        if category:
            return category

        raise serializers.ValidationError(
            {
                "category": (
                    f"Category '{value}' not found."
                )
            }
        )

    # ---------------------------------------------------------
    # VALIDATE SIZES
    # ---------------------------------------------------------
    def _normalize_sizes(self, sizes):
        normalized = []

        for size in sizes:
            # Handle accidental nested/list-string values
            if isinstance(size, str):
                parsed = self._parse_list_value(size)

                if isinstance(parsed, list):
                    for item in parsed:
                        item = str(item).strip().upper()

                        if item:
                            normalized.append(item)
                else:
                    item = str(size).strip().upper()

                    if item:
                        normalized.append(item)

            else:
                item = str(size).strip().upper()

                if item:
                    normalized.append(item)

        return normalized

    # ---------------------------------------------------------
    # CREATE VARIANTS
    # ---------------------------------------------------------
    def _create_variants(
        self,
        design,
        sizes,
        colors,
        price,
        stock,
    ):
    # Normalize and REMOVE duplicates
        sizes = list(dict.fromkeys(
            str(size).strip().upper()
            for size in sizes
            if str(size).strip()
        ))

        colors = list(dict.fromkeys(
            str(color).strip()
            for color in colors
            if str(color).strip()
        ))

        if not sizes:
            raise serializers.ValidationError(
                {
                    "sizes": "At least one size is required."
                }
            )

        allowed_sizes = {
            choice[0]
            for choice in DesignVariant.SIZE_CHOICES
        }

        invalid_sizes = [
            size
            for size in sizes
            if size not in allowed_sizes
        ]

        if invalid_sizes:
            raise serializers.ValidationError(
                {
                    "sizes": (
                        f"Invalid size(s): "
                        f"{', '.join(invalid_sizes)}. "
                        "Allowed sizes: XS, S, M, L, XL, XXL."
                    )
                }
            )

        if not colors:
            colors = [""]

        # Prevent duplicate size + color combinations
        combinations = set()

        for size in sizes:
            for color in colors:

                combination = (size, color.lower())

                if combination in combinations:
                    continue

                combinations.add(combination)

                sku = (
                    f"DESIGN-{design.id}-"
                    f"{size}-"
                    f"{color.upper().replace(' ', '-') or 'DEFAULT'}"
                )

                base_sku = sku
                counter = 1

                while DesignVariant.objects.filter(
                    sku=sku
                ).exists():
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

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------
    def to_representation(self, instance):
        request = self.context.get("request")

        variants = instance.variants.filter(
            is_active=True
        )

        sizes = list(
            variants.values_list(
                "size",
                flat=True,
            ).distinct()
        )

        colors = list(
            variants.exclude(
                color=""
            ).values_list(
                "color",
                flat=True,
            ).distinct()
        )

        stock = sum(
            variant.stock
            for variant in variants
        )

        first_variant = variants.first()

        price = (
            first_variant.price
            if first_variant
            else instance.base_price
        )

        image = None

        if instance.thumbnail:
            if request:
                image = request.build_absolute_uri(
                    instance.thumbnail.url
                )
            else:
                image = instance.thumbnail.url

        return {
            "id": instance.id,
            "name": instance.name,
            "description": instance.description,
            "category": instance.category.name,
            "price": float(price),
            "stock": stock,
            "sizes": sizes,
            "colors": colors,
            "customizable": instance.is_customizable,
            "active": instance.is_active,
            "image": image,
            "createdAt": instance.created_at,
        }

    # ---------------------------------------------------------
    # CREATE PRODUCT
    # ---------------------------------------------------------
    @transaction.atomic
    def create(self, validated_data):
        category_value = validated_data.pop(
            "category"
        )

        price = validated_data.pop("price")
        stock = validated_data.pop("stock")
        sizes = validated_data.pop("sizes")
        colors = validated_data.pop(
            "colors",
            []
        )

        customizable = validated_data.pop(
            "is_customizable",
            False,
        )

        active = validated_data.pop(
            "is_active",
            True,
        )

        thumbnail = validated_data.pop(
            "thumbnail",
            None,
        )

        category = self._get_category(
            category_value
        )

        design = Design.objects.create(
            category=category,
            name=validated_data.get(
                "name",
                "",
            ),
            description=validated_data.get(
                "description",
                "",
            ),
            base_price=price,
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

    # ---------------------------------------------------------
    # UPDATE PRODUCT
    # ---------------------------------------------------------
    @transaction.atomic
    def update(self, instance, validated_data):

        category_value = validated_data.pop(
            "category",
            None,
        )

        price = validated_data.pop(
            "price",
            None,
        )

        stock = validated_data.pop(
            "stock",
            None,
        )

        sizes = validated_data.pop(
            "sizes",
            None,
        )

        colors = validated_data.pop(
            "colors",
            None,
        )

        thumbnail = validated_data.pop(
            "thumbnail",
            None,
        )

        if category_value is not None:
            instance.category = self._get_category(
                category_value
            )

        if "is_customizable" in validated_data:
            instance.is_customizable = (
                validated_data.pop(
                    "is_customizable"
                )
            )

        if "is_active" in validated_data:
            instance.is_active = (
                validated_data.pop(
                    "is_active"
                )
            )

        if price is not None:
            instance.base_price = price

        if thumbnail is not None:
            instance.thumbnail = thumbnail

        instance.name = validated_data.get(
            "name",
            instance.name,
        )

        instance.description = validated_data.get(
            "description",
            instance.description,
        )

        # -----------------------------------------------------
        # Prepare variant values BEFORE deleting old variants
        # -----------------------------------------------------
        rebuild_variants = (
            price is not None
            or stock is not None
            or sizes is not None
            or colors is not None
        )

        if rebuild_variants:

            existing_variants = list(
                instance.variants.all()
            )

            current_price = (
                price
                if price is not None
                else (
                    existing_variants[0].price
                    if existing_variants
                    else instance.base_price
                )
            )

            current_stock = (
                stock
                if stock is not None
                else (
                    existing_variants[0].stock
                    if existing_variants
                    else 0
                )
            )

            current_sizes = (
                sizes
                if sizes is not None
                else [
                    variant.size
                    for variant in existing_variants
                ]
            )

            current_colors = (
                colors
                if colors is not None
                else [
                    variant.color
                    for variant in existing_variants
                ]
            )

            # Validate before deleting
            normalized_sizes = self._normalize_sizes(
                current_sizes
            )

            allowed_sizes = {
                choice[0]
                for choice in DesignVariant.SIZE_CHOICES
            }

            invalid_sizes = [
                size
                for size in normalized_sizes
                if size not in allowed_sizes
            ]

            if not normalized_sizes:
                raise serializers.ValidationError(
                    {
                        "sizes": (
                            "At least one size is required."
                        )
                    }
                )

            if invalid_sizes:
                raise serializers.ValidationError(
                    {
                        "sizes": (
                            f"Invalid size(s): "
                            f"{', '.join(invalid_sizes)}. "
                            "Allowed sizes: "
                            "XS, S, M, L, XL, XXL."
                        )
                    }
                )

            # Save product first
            instance.save()

            # Delete old variants
            instance.variants.all().delete()

            # Create new variants
            self._create_variants(
                design=instance,
                sizes=normalized_sizes,
                colors=current_colors,
                price=current_price,
                stock=current_stock,
            )

        else:
            instance.save()

        return instance