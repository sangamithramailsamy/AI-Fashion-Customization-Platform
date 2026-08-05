from rest_framework import serializers
from .models import CustomerProfile


class CustomerProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone_number", read_only=True)

    fullName = serializers.SerializerMethodField()

    dob = serializers.DateField(
        source="date_of_birth",
        allow_null=True,
        required=False,
    )

    def update(self, instance, validated_data):
        full_name = self.initial_data.get("fullName")

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

        instance.save()
        return instance

    class Meta:
        model = CustomerProfile
        fields = (
            "id",
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