from rest_framework import generics

from .permissions import IsMeasurementManager

from .models import (
    SleeveType,
    SleeveMeasurement,
    NeckType,
    NeckMeasurement,
    CommonMeasurement,
    MeasurementVideo,
)

from .serializers import (
    SleeveTypeSerializer,
    SleeveMeasurementSerializer,
    NeckTypeSerializer,
    NeckMeasurementSerializer,
    CommonMeasurementSerializer,
    MeasurementVideoSerializer,
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