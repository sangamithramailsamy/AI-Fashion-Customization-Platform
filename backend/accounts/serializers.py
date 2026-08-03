from django.contrib.auth import authenticate
from rest_framework import serializers

from users.models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "phone_number",
            "password",
            "confirm_password",
            "role",
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )
        return value

    def validate_phone_number(self, value):
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError(
                "Phone number already exists."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        if attrs.get("role") == "ADMIN":
            raise serializers.ValidationError(
                {
                    "role": "You cannot register as an Admin."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            phone_number=validated_data.get("phone_number"),
            role=validated_data.get("role"),
            password=validated_data["password"],
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        user = authenticate(
            username=user_obj.username,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        attrs["user"] = user
        return attrs