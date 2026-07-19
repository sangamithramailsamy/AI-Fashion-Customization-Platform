from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

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
            return (
                Review.objects
                .select_related(
                    "customer__user",
                    "design",
                    "order",
                )
                .prefetch_related(
                    "media",
                )
            )

        return (
            Review.objects.filter(
                customer__user=self.request.user
            )
            .select_related(
                "customer__user",
                "design",
                "order",
            )
            .prefetch_related(
                "media",
            )
        )

    def perform_create(self, serializer):
        customer = self.request.user.customer_profile
        order = serializer.validated_data["order"]

        if order.customer != customer:
            raise PermissionDenied(
                "You can review only your own orders."
            )

        serializer.save(
            customer=customer
        )


class ReviewMediaViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewMediaSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        if self.request.user.is_staff:
            return (
                ReviewMedia.objects
                .select_related(
                    "review",
                    "review__customer__user",
                )
            )

        return (
            ReviewMedia.objects.filter(
                review__customer__user=self.request.user
            )
            .select_related(
                "review",
                "review__customer__user",
            )
        )

    def perform_create(self, serializer):
        review = serializer.validated_data["review"]

        if review.customer.user != self.request.user:
            raise PermissionDenied(
                "You can upload media only to your own reviews."
            )

        serializer.save()