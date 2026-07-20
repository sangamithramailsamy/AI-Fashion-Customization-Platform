from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Boutique
from .serializers import BoutiqueSerializer


class BoutiqueCreateView(generics.CreateAPIView):
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

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