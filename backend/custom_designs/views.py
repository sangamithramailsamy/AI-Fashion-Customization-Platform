from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated

from .models import CustomDesignRequest
from .serializers import CustomDesignRequestSerializer


class CustomDesignRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomDesignRequestSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return CustomDesignRequest.objects.filter(
            customer=self.request.user.customer_profile
        )

    def perform_create(self, serializer):
        serializer.save(
            customer=self.request.user.customer_profile
        )


class CustomDesignRequestDetailView(generics.RetrieveAPIView):
    serializer_class = CustomDesignRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CustomDesignRequest.objects.filter(
            customer=self.request.user.customer_profile
        )