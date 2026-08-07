from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from orders.models import Order

from .permissions import IsMeasurementManager

from .models import (
    SleeveType,
    SleeveMeasurement,
    NeckType,
    NeckMeasurement,
    CommonMeasurement,
    CustomerMeasurement,
    MeasurementVideo,
)

from .serializers import (
    SleeveTypeSerializer,
    SleeveMeasurementSerializer,
    NeckTypeSerializer,
    NeckMeasurementSerializer,
    CommonMeasurementSerializer,
    MeasurementVideoSerializer,
    CustomerMeasurementSerializer,
)


class SleeveTypeListView(generics.ListAPIView):
    """
    Returns all active sleeve types.
    """
    queryset = SleeveType.objects.filter(is_active=True)
    serializer_class = SleeveTypeSerializer
    permission_classes = [IsMeasurementManager]


class SleeveMeasurementListView(generics.ListAPIView):
    """
    Returns measurements for a selected sleeve type.
    """
    serializer_class = SleeveMeasurementSerializer
    permission_classes = [IsMeasurementManager]

    def get_queryset(self):
        sleeve_id = self.kwargs["pk"]
        return SleeveMeasurement.objects.filter(
            sleeve_type_id=sleeve_id
        ).order_by("display_order")


class NeckTypeListView(generics.ListAPIView):
    """
    Returns all active neck types.
    """
    queryset = NeckType.objects.filter(is_active=True)
    serializer_class = NeckTypeSerializer
    permission_classes = [IsMeasurementManager]


class NeckMeasurementListView(generics.ListAPIView):
    """
    Returns measurements for a selected neck type.
    """
    serializer_class = NeckMeasurementSerializer
    permission_classes = [IsMeasurementManager]

    def get_queryset(self):
        neck_id = self.kwargs["pk"]
        return NeckMeasurement.objects.filter(
            neck_type_id=neck_id
        ).order_by("display_order")


class CommonMeasurementListView(generics.ListAPIView):
    """
    Returns all common measurements.
    """
    queryset = CommonMeasurement.objects.all().order_by("display_order")
    serializer_class = CommonMeasurementSerializer
    permission_classes = [IsMeasurementManager]


class MeasurementVideoView(generics.ListAPIView):
    """
    Returns all measurement tutorial videos.
    """
    queryset = MeasurementVideo.objects.all()
    serializer_class = MeasurementVideoSerializer
    permission_classes = [IsMeasurementManager]


class CustomerMeasurementView(generics.ListCreateAPIView):
    serializer_class = CustomerMeasurementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        latest_order = (
            Order.objects.filter(
                customer__user=self.request.user
            )
            .order_by("-created_at")
            .first()
        )

        if not latest_order:
            return CustomerMeasurement.objects.none()

        return CustomerMeasurement.objects.filter(
            order=latest_order
        )

    def perform_create(self, serializer):
        latest_order = (
            Order.objects.filter(
                customer__user=self.request.user
            )
            .order_by("-created_at")
            .first()
        )

        serializer.save(order=latest_order)