from rest_framework import generics

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

    queryset = SleeveType.objects.filter(is_active=True)
    serializer_class = SleeveTypeSerializer


class SleeveMeasurementListView(generics.ListAPIView):

    serializer_class = SleeveMeasurementSerializer

    def get_queryset(self):
        sleeve_id = self.kwargs["pk"]

        return SleeveMeasurement.objects.filter(
            sleeve_type_id=sleeve_id
        ).order_by("display_order")


class NeckTypeListView(generics.ListAPIView):

    queryset = NeckType.objects.filter(is_active=True)
    serializer_class = NeckTypeSerializer


class NeckMeasurementListView(generics.ListAPIView):

    serializer_class = NeckMeasurementSerializer

    def get_queryset(self):
        neck_id = self.kwargs["pk"]

        return NeckMeasurement.objects.filter(
            neck_type_id=neck_id
        ).order_by("display_order")


class CommonMeasurementListView(generics.ListAPIView):

    queryset = CommonMeasurement.objects.all()
    serializer_class = CommonMeasurementSerializer


class MeasurementVideoView(generics.ListAPIView):

    queryset = MeasurementVideo.objects.all()
    serializer_class = MeasurementVideoSerializer