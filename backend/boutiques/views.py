from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated

from .models import Boutique
from .serializers import BoutiqueSerializer



class BoutiqueCreateView(generics.CreateAPIView):
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if Boutique.objects.filter(owner=self.request.user).exists():
            raise serializers.ValidationError(
                "You already own a boutique."
            )

        serializer.save(owner=self.request.user)


from django.shortcuts import get_object_or_404


class BoutiqueProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = BoutiqueSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(
            Boutique,
            owner=self.request.user
        )  