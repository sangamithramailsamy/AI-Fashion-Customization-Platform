from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Boutique
from .serializers import BoutiqueSerializer


class BoutiqueCreateView(generics.CreateAPIView):
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class BoutiqueProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return Boutique.objects.get(owner=self.request.user)    