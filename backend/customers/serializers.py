from rest_framework import serializers
from .models import CustomerProfile


class CustomerProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomerProfile
        fields = (
            "first_name",
            "last_name",
            "gender",
            "date_of_birth",
            "address_line_1",
            "address_line_2",
            "city",
            "state",
            "country",
            "pincode",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "created_at",
            "updated_at",
        )