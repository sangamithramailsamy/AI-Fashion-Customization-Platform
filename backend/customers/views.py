from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import CustomerProfile
from .serializers import (
    CustomerProfileSerializer,
    OwnerCustomerSerializer,
)

class CustomerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        profile, created = CustomerProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class OwnerCustomerListView(generics.ListAPIView):
    serializer_class = OwnerCustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser or user.role == "ADMIN":
            return (
                CustomerProfile.objects
                .select_related("user")
                .all()
            )

        return (
            CustomerProfile.objects
            .select_related("user")
            .filter(orders__owner=user)
            .distinct()
        )

class OwnerCustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomerProfile.objects.select_related("user").all()