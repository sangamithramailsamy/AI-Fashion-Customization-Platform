from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from django.contrib.auth import get_user_model

from users.models import UserRole
from .models import Employee
from .serializers import EmployeeSerializer

User = get_user_model()


class EmployeeListCreateView(generics.ListCreateAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Employee.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):

        email = serializer.validated_data["email"]
        phone = serializer.validated_data["phone"]

        print("=" * 50)
        print("EMAIL :", email)
        print("PHONE :", phone)
        print("=" * 50)

        # Check duplicate email
        if User.objects.filter(email=email).exists():
            raise ValidationError({
                "email": "Email already exists."
            })

        # Check duplicate phone
        if User.objects.filter(phone_number=phone).exists():
            raise ValidationError({
                "phone": "Phone number already exists."
            })

        # Generate unique username
        base_username = email.split("@")[0]
        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        password = "Tailor@123"

        # Create linked user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            phone_number=phone,
            role=UserRole.TAILOR,
        )

        # Create employee profile
        serializer.save(
            owner=self.request.user,
            user=user,
        )


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Employee.objects.filter(owner=self.request.user)