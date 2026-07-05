from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import CustomerProfile
from .serializers import CustomerProfileSerializer


class CustomerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = CustomerProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile