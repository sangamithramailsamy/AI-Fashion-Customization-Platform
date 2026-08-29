from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser

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

    def get_permissions(self):
        if self.action == "product_reviews":
            return [AllowAny()]

        return [
            IsAuthenticated(),
            IsReviewOwner(),
        ]

    def get_queryset(self):

        # Public endpoint:
        # Anyone can view approved reviews for a product.
        if self.action == "product_reviews":
            return (
                Review.objects
                .filter(
                    is_approved=True
                )
                .select_related(
                    "customer__user",
                    "design",
                    "order",
                )
                .prefetch_related(
                    "media"
                )
            )

        # Owner/staff can see all reviews.
        if self.request.user.is_staff:
            return (
                Review.objects
                .select_related(
                    "customer__user",
                    "design",
                    "order",
                )
                .prefetch_related(
                    "media"
                )
            )

        # Normal customer can see only their own reviews.
        if not self.request.user.is_authenticated:
            return Review.objects.none()

        return (
            Review.objects
            .filter(
                customer__user=self.request.user
            )
            .select_related(
                "customer__user",
                "design",
                "order",
            )
            .prefetch_related(
                "media"
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

    @action(
        detail=False,
        methods=["get"],
        url_path="product/(?P<design_id>[^/.]+)",
        permission_classes=[AllowAny],
    )
    def product_reviews(self, request, design_id=None):
        reviews = self.get_queryset().filter(
            design_id=design_id
        )

        serializer = self.get_serializer(
          reviews,
          many=True,
          context={"request": request},
        )

        return Response(serializer.data)

class ReviewMediaViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewMediaSerializer
    permission_classes = [IsAuthenticated]

    # ✅ Required for file uploads
    parser_classes = (
        MultiPartParser,
        FormParser,
    )

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