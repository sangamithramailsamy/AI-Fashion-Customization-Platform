from rest_framework import viewsets

from .models import Payment
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related(
        "order",
        "created_by",
    )
    serializer_class = PaymentSerializer