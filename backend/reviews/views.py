from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Review, ReviewMedia
from .serializers import (
    ReviewSerializer,
    ReviewMediaSerializer,
)
from .permissions import IsReviewOwner


class ReviewViewSet(viewsets.ModelViewSet):

    serializer_class = ReviewSerializer
    permission_classes = [
        IsAuthenticated,
        IsReviewOwner,
    ]

    def get_queryset(self):

        if self.request.user.is_staff:
            return Review.objects.all().select_related(
                "customer__user",
                "design",
                "order",
            ).prefetch_related(
                "media",
            )

        return Review.objects.filter(
            customer__user=self.request.user
        ).select_related(
            "customer__user",
            "design",
            "order",
        ).prefetch_related(
            "media",
        )

    def perform_create(self, serializer):
        serializer.save(
            customer=self.request.user.customer_profile
        )


class ReviewMediaViewSet(viewsets.ModelViewSet):

    serializer_class = ReviewMediaSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):

        if self.request.user.is_staff:
            return ReviewMedia.objects.all().select_related(
                "review",
            )

        return ReviewMedia.objects.filter(
            review__customer__user=self.request.user
        ).select_related(
            "review",
        )