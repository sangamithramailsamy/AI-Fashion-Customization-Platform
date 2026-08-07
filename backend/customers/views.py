from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import CustomerProfile
from .serializers import CustomerProfileSerializer


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