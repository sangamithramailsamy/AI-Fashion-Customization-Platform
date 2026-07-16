from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Review, ReviewMedia
from .serializers import ReviewSerializer, ReviewMediaSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().prefetch_related("media")
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]


class ReviewMediaViewSet(viewsets.ModelViewSet):
    queryset = ReviewMedia.objects.all()
    serializer_class = ReviewMediaSerializer
    permission_classes = [IsAuthenticated]