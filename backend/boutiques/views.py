from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Boutique
from .serializers import BoutiqueSerializer


class BoutiqueCreateView(generics.ListCreateAPIView):
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Boutique.objects.filter(owner=self.request.user)

    def get(self, request, *args, **kwargs):
        boutique = self.get_queryset().first()

        if not boutique:
            return Response(
                {"detail": "Boutique not found."},
                status=404
            )

        serializer = self.get_serializer(boutique)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        boutique = self.get_queryset().first()

        if not boutique:
            return Response(
                {"detail": "Boutique not found."},
                status=404
            )

        serializer = self.get_serializer(
            boutique,
            data=request.data,
            partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class BoutiqueListView(generics.ListAPIView):
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Boutique.objects.filter(owner=self.request.user)


class BoutiqueDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Boutique.objects.filter(owner=self.request.user)