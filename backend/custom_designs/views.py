from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated

from .models import CustomDesignRequest
from .serializers import CustomDesignRequestSerializer

from notifications.models import Notification
from users.models import UserRole

class CustomDesignRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomDesignRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return CustomDesignRequest.objects.filter(
            customer=self.request.user.customer_profile
        )

    def perform_create(self, serializer):
        customer = self.request.user.customer_profile

        custom_design = serializer.save(
            customer=customer
        )

        Notification.objects.create(
            recipient=self.request.user,
            custom_design=custom_design,
            title="New Custom Design Request",
            message=f"{customer.user.get_full_name()} submitted a new custom design request.",
            notification_type=Notification.CUSTOM_DESIGN_REQUEST,
        )

        owners = self.request.user.__class__.objects.filter(
            role=UserRole.OWNER
        )

        for owner in owners:
            Notification.objects.create(
            recipient=owner,
            custom_design=custom_design,
            title="New Custom Design Request",
            message=f"{customer.user.get_full_name()} submitted a new custom design request.",
            notification_type=Notification.CUSTOM_DESIGN_REQUEST,
        )

class CustomDesignRequestDetailView(generics.RetrieveAPIView):
    serializer_class = CustomDesignRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomDesignRequest.objects.filter(
            customer=self.request.user.customer_profile
        )