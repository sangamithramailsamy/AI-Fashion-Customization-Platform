from django.db.models import Sum, Count
from rest_framework import serializers

from .models import CustomerProfile
from orders.models import Order
from payments.models import Payment
from shopping.models import ShippingAddress

class OwnerCustomerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)

    fullName = serializers.SerializerMethodField()
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(
        source="user.phone_number",
        read_only=True
    )

    joinedAt = serializers.DateTimeField(
        source="created_at",
        read_only=True
    )

    ordersCount = serializers.SerializerMethodField()
    totalSpent = serializers.SerializerMethodField()
    addressCount = serializers.SerializerMethodField()
    measurementsCount = serializers.SerializerMethodField()
    paymentHistoryCount = serializers.SerializerMethodField()

    def get_fullName(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_owner_orders(self, obj):
        owner = self.context["request"].user

        return obj.orders.filter(
            owner=owner
        )

    def get_ordersCount(self, obj):
        return self.get_owner_orders(obj).count()

    def get_totalSpent(self, obj):
        total = self.get_owner_orders(obj).aggregate(
            total=Sum("total_amount")
        )["total"]

        return float(total or 0)

    def get_addressCount(self, obj):
        return ShippingAddress.objects.filter(
            customer=obj
        ).count()

    def get_measurementsCount(self, obj):
        return obj.orders.filter(
            owner=self.context["request"].user,
            customer_measurements__isnull=False,
        ).distinct().count()

    def get_paymentHistoryCount(self, obj):
        return Payment.objects.filter(
            order__customer=obj,
            order__owner=self.context["request"].user,
        ).count()

    class Meta:
        model = CustomerProfile
        fields = [
            "id",
            "fullName",
            "email",
            "phone",
            "joinedAt",
            "ordersCount",
            "totalSpent",
            "addressCount",
            "measurementsCount",
            "paymentHistoryCount",
        ]


class CustomerProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone_number", read_only=True)

    profile_image = serializers.FileField(
        source="user.profile_image",
        required=False,
        allow_null=True,
        write_only=True,
    )

    profile_image_url = serializers.SerializerMethodField()

    def get_profile_image_url(self, obj):
        if obj.user.profile_image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.user.profile_image.url)
            return obj.user.profile_image.url
        return None

    fullName = serializers.SerializerMethodField()

    dob = serializers.DateField(
        source="date_of_birth",
        allow_null=True,
        required=False,
    )

    def update(self, instance, validated_data):
        full_name = self.initial_data.get("fullName")

        user_data = validated_data.pop("user", {})

        if full_name is not None:
            parts = full_name.strip().split(" ", 1)
            instance.first_name = parts[0]
            instance.last_name = parts[1] if len(parts) > 1 else ""
        else:
            instance.first_name = ""
            instance.last_name = ""

        if "date_of_birth" in validated_data:
            instance.date_of_birth = validated_data["date_of_birth"]

        if "gender" in validated_data:
            instance.gender = validated_data["gender"]

        if "profile_image" in user_data:
            instance.user.profile_image = user_data["profile_image"]
            instance.user.save()

        instance.save()
        return instance

    class Meta:
        model = CustomerProfile
        fields = (
            "id",
            "profile_image",
            "profile_image_url",
            "fullName",
            "email",
            "phone",
            "gender",
            "dob",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "country",
            "pincode",
        )

    def get_fullName(self, obj):
        first = obj.first_name or ""
        last = obj.last_name or ""
        return f"{first} {last}".strip()