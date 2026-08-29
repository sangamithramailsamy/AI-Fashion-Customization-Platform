from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone
from rest_framework import serializers

from .models import Order, OrderItem
from discounts.models import Coupon, DiscountType
from shopping.models import ShippingAddress
from catalog.models import DesignVariant


MONEY = Decimal("0.01")


def money(value):
    return Decimal(str(value)).quantize(
        MONEY,
        rounding=ROUND_HALF_UP
    )


# ==========================================================
# ORDER ITEM SERIALIZER
# ==========================================================

class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.SerializerMethodField(
        read_only=True
    )

    product_image = serializers.SerializerMethodField(
        read_only=True
    )

    product_id = serializers.SerializerMethodField(
        read_only=True
    )

    variant = serializers.PrimaryKeyRelatedField(
        queryset=DesignVariant.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = OrderItem

        fields = [
            "id",
            "order",
            "variant",
            "item_type",
            "quantity",
            "unit_price",
            "subtotal",
            "notes",
            "created_at",
            "updated_at",
            "product_id",
            "product_name",
            "product_image",
        ]

        extra_kwargs = {
            "order": {
                "required": False
            },
            "subtotal": {
                "required": False
            },
        }

    def get_product_id(self, obj):
        if obj.variant:
            return obj.variant.design_id

        return None

    def get_product_name(self, obj):

        if getattr(obj, "product_name", None):
            return obj.product_name

        variant = getattr(obj, "variant", None)

        if variant:
            design = getattr(
                variant,
                "design",
                None
            )

            if design:
                return design.name

        return None
    # ------------------------------------------------------
    # PRODUCT NAME
    # ------------------------------------------------------

    def get_product_name(self, obj):

        # First use saved product name if available
        if getattr(obj, "product_name", None):
            return obj.product_name

        # Otherwise get product through variant
        variant = getattr(obj, "variant", None)

        if variant:
            design = getattr(
                variant,
                "design",
                None
            )

            if design:
                return design.name

        return None

    # ------------------------------------------------------
    # PRODUCT IMAGE
    # ------------------------------------------------------

    def get_product_image(self, obj):

        request = self.context.get("request")

        # First use saved product image
        # First use saved product image
        saved_image = getattr(
            obj,
            "product_image",
            None
        )

        if saved_image:
        # If already an absolute URL, return it directly
            if saved_image.startswith("http://") or saved_image.startswith("https://"):
                return saved_image

        # If it's a relative media path like /media/...
        # convert it to the Django backend URL
            if request:
                return request.build_absolute_uri(saved_image)

            return saved_image

        # Get variant
        variant = getattr(
            obj,
            "variant",
            None
        )

        if not variant:
            return None

        # Get design
        design = getattr(
            variant,
            "design",
            None
        )

        if not design:
            return None

        # --------------------------------------------------
        # PRIMARY DESIGN IMAGE
        # --------------------------------------------------

        primary_image = (
            design.images
            .filter(is_primary=True)
            .first()
        )

        if primary_image and primary_image.image:

            if request:
                return request.build_absolute_uri(
                    primary_image.image.url
                )

            return primary_image.image.url

        # --------------------------------------------------
        # FIRST DESIGN IMAGE
        # --------------------------------------------------

        first_image = (
            design.images
            .order_by("display_order")
            .first()
        )

        if first_image and first_image.image:

            if request:
                return request.build_absolute_uri(
                    first_image.image.url
                )

            return first_image.image.url

        # --------------------------------------------------
        # DESIGN THUMBNAIL
        # --------------------------------------------------

        if design.thumbnail:

            if request:
                return request.build_absolute_uri(
                    design.thumbnail.url
                )

            return design.thumbnail.url

        return None


# ==========================================================
# SHIPPING ADDRESS SERIALIZER
# ==========================================================

class ShippingAddressSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ShippingAddress

        fields = [
            "id",
            "full_name",
            "phone_number",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "country",
            "pincode",
        ]


# ==========================================================
# ORDER SERIALIZER
# ==========================================================

class OrderSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True
    )

    coupon_code = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    # Return complete shipping address
    shipping_address = serializers.SerializerMethodField()

    # Accept ShippingAddress ID while creating order
    shipping_address_id = serializers.PrimaryKeyRelatedField(
        source="shipping_address",
        queryset=ShippingAddress.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Order

        fields = "__all__"

        read_only_fields = (
            "owner",
            "customer",
            "order_number",
            "total_amount",
            "balance_amount",
            "delivery_charge",
            "discount_amount",
            "created_at",
            "updated_at",
        )

    # ------------------------------------------------------
    # SHIPPING ADDRESS
    # ------------------------------------------------------

    def get_shipping_address(self, obj):

        if not obj.shipping_address:
            return None

        return ShippingAddressSerializer(
            obj.shipping_address,
            context=self.context
        ).data

    # ------------------------------------------------------
    # VALIDATE
    # ------------------------------------------------------

    def validate(self, attrs):

        instance = getattr(
            self,
            "instance",
            None
        )

        order_date = attrs.get(
            "order_date",
            instance.order_date
            if instance
            else None
        )

        delivery_date = attrs.get(
            "delivery_date",
            instance.delivery_date
            if instance
            else None
        )

        advance_paid = attrs.get(
            "advance_paid",
            instance.advance_paid
            if instance
            else Decimal("0.00")
        )

        status = attrs.get(
            "status",
            instance.status
            if instance
            else "PENDING"
        )

        # --------------------------------------------------
        # DATE VALIDATION
        # --------------------------------------------------

        if order_date and delivery_date:

            if delivery_date < order_date:

                raise serializers.ValidationError({
                    "delivery_date":
                        "Delivery date cannot be before the order date."
                })

        # --------------------------------------------------
        # STATUS VALIDATION
        # --------------------------------------------------

        if instance:

            allowed = {

                "PENDING": [
                    "IN_PROGRESS",
                    "CANCELLED"
                ],

                "IN_PROGRESS": [
                    "READY",
                    "CANCELLED"
                ],

                "READY": [
                    "DELIVERED"
                ],

                "DELIVERED": [],

                "CANCELLED": [],
            }

            if (
                status != instance.status
                and status not in allowed[instance.status]
            ):

                raise serializers.ValidationError({
                    "status": (
                        f"Cannot change status from "
                        f"{instance.status} to {status}."
                    )
                })

        # --------------------------------------------------
        # COUPON VALIDATION
        # --------------------------------------------------

        coupon_code = attrs.pop(
            "coupon_code",
            None
        )

        if coupon_code:

            coupon_code = (
                coupon_code
                .strip()
                .upper()
            )

            try:

                coupon = Coupon.objects.get(
                    code=coupon_code,
                    is_active=True,
                )

            except Coupon.DoesNotExist:

                raise serializers.ValidationError({
                    "coupon_code":
                        "Invalid coupon."
                })

            now = timezone.now()

            if now < coupon.valid_from:

                raise serializers.ValidationError({
                    "coupon_code":
                        "Coupon is not active yet."
                })

            if now > coupon.valid_until:

                raise serializers.ValidationError({
                    "coupon_code":
                        "Coupon has expired."
                })

            if coupon.used_count >= coupon.usage_limit:

                raise serializers.ValidationError({
                    "coupon_code":
                        "Coupon usage limit reached."
                })

            attrs["_coupon"] = coupon

        # --------------------------------------------------
        # ADVANCE PAYMENT
        # --------------------------------------------------

        attrs["advance_paid"] = money(
            advance_paid
        )

        return attrs

    # ======================================================
    # CREATE ORDER
    # ======================================================

    def create(self, validated_data):

        coupon = validated_data.pop(
            "_coupon",
            None
        )

        items_data = validated_data.pop(
            "items",
            []
        )

        # --------------------------------------------------
        # CREATE ORDER
        # --------------------------------------------------

        order = Order.objects.create(
            delivery_charge=Decimal("150.00"),
            **validated_data
        )

        # --------------------------------------------------
        # CREATE ORDER ITEMS
        # --------------------------------------------------

        for item_data in items_data:

            # Get variant from validated data
            variant = item_data.get(
                "variant"
            )

            # ------------------------------------------------
            # Calculate subtotal
            # ------------------------------------------------

            quantity = int(
                item_data.get(
                    "quantity",
                    1
                )
            )

            unit_price = money(
                item_data.get(
                    "unit_price",
                    Decimal("0.00")
                )
            )

            subtotal = money(
                unit_price * quantity
            )

            # ------------------------------------------------
            # Save product information if model supports it
            # ------------------------------------------------

            create_data = {
                "order": order,
                **item_data,
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": subtotal,
            }

            # ------------------------------------------------
            # IMPORTANT:
            # Ensure variant is actually stored
            # ------------------------------------------------

            if variant:

                create_data["variant"] = variant

                design = getattr(
                    variant,
                    "design",
                    None
                )

                if design:

                    # Save product name if OrderItem model
                    # contains this field
                    if hasattr(
                        OrderItem,
                        "product_name"
                    ):
                        create_data["product_name"] = (
                            design.name
                        )

                    # Save product image if OrderItem model
                    # contains this field
                    if hasattr(
                        OrderItem,
                        "product_image"
                    ):

                        image_url = None

                        primary_image = (
                            design.images
                            .filter(
                                is_primary=True
                            )
                            .first()
                        )

                        if (
                            primary_image
                            and primary_image.image
                        ):
                            image_url = (
                                primary_image.image.url
                            )

                        elif design.thumbnail:
                            image_url = (
                                design.thumbnail.url
                            )

                        if image_url:
                            create_data[
                                "product_image"
                            ] = image_url

            OrderItem.objects.create(
                **create_data
            )

        # --------------------------------------------------
        # CALCULATE SUBTOTAL
        # --------------------------------------------------

        subtotal = sum(
            (
                item.subtotal
                for item in order.items.all()
            ),
            Decimal("0.00")
        )

        subtotal = money(
            subtotal
        )

        # --------------------------------------------------
        # COUPON DISCOUNT
        # --------------------------------------------------

        discount = Decimal("0.00")

        if coupon:

            if subtotal < coupon.minimum_order_amount:

                raise serializers.ValidationError({
                    "coupon_code": (
                        f"Minimum order amount is "
                        f"₹{coupon.minimum_order_amount}"
                    )
                })

            if (
                coupon.discount_type
                == DiscountType.PERCENTAGE
            ):

                discount = (
                    subtotal
                    * coupon.discount_value
                ) / Decimal("100")

                if (
                    coupon.maximum_discount_amount
                    and discount
                    > coupon.maximum_discount_amount
                ):

                    discount = (
                        coupon.maximum_discount_amount
                    )

            else:

                discount = (
                    coupon.discount_value
                )

            if discount > subtotal:
                discount = subtotal

        discount = money(
            discount
        )

        # --------------------------------------------------
        # DELIVERY CHARGE
        # --------------------------------------------------

        delivery_charge = money(
            order.delivery_charge
        )

        # --------------------------------------------------
        # FINAL TOTAL
        # --------------------------------------------------

        total_amount = money(
            subtotal
            - discount
            + delivery_charge
        )

        if total_amount < Decimal("0.00"):
            total_amount = Decimal("0.00")

        # --------------------------------------------------
        # ADVANCE
        # --------------------------------------------------

        advance_paid = money(
            order.advance_paid
        )

        # --------------------------------------------------
        # BALANCE
        # --------------------------------------------------

        balance_amount = money(
            total_amount
            - advance_paid
        )

        if balance_amount < Decimal("0.00"):
            balance_amount = Decimal("0.00")

        # --------------------------------------------------
        # SAVE FINAL AMOUNTS
        # --------------------------------------------------

        order.discount_amount = discount

        order.total_amount = total_amount

        order.balance_amount = balance_amount

        order.save(
            update_fields=[
                "discount_amount",
                "total_amount",
                "balance_amount",
                "updated_at",
            ]
        )

        return order