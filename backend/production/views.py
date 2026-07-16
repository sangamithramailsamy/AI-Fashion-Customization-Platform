from rest_framework import viewsets

from .models import Production
from .serializers import ProductionSerializer
from .permissions import IsProductionManager


class ProductionViewSet(viewsets.ModelViewSet):
    queryset = Production.objects.select_related(
        "boutique",
        "order",
        "tailor",
        "assigned_by",
    )

    serializer_class = ProductionSerializer
    permission_classes = [IsProductionManager]

    def perform_create(self, serializer):
        order = serializer.validated_data["order"]

        serializer.save(
            boutique=order.boutique,
            assigned_by=self.request.user
        )