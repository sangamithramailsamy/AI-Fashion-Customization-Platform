from rest_framework import serializers
from .models import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee

        fields = [
            "id",
            "owner",
            "employee_name",
            "phone",
            "email",
            "role",
            "salary",
            "joining_date",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = (
            "id",
            "owner",          # <-- Add this comma
            "created_at",
            "updated_at",
        )   