from rest_framework import serializers

from .models import (
    MeasurementMaster,
    SleeveType,
    SleeveMeasurement,
    NeckType,
    NeckMeasurement,
    CommonMeasurement,
    CustomerMeasurement,
    MeasurementVideo,
)


class MeasurementMasterSerializer(serializers.ModelSerializer):

    class Meta:
        model = MeasurementMaster
        fields = "__all__"


class SleeveTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = SleeveType
        fields = "__all__"


class SleeveMeasurementSerializer(serializers.ModelSerializer):

    measurement = MeasurementMasterSerializer(read_only=True)

    class Meta:
        model = SleeveMeasurement
        fields = "__all__"


class NeckTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = NeckType
        fields = "__all__"


class NeckMeasurementSerializer(serializers.ModelSerializer):

    measurement = MeasurementMasterSerializer(read_only=True)

    class Meta:
        model = NeckMeasurement
        fields = "__all__"


class CommonMeasurementSerializer(serializers.ModelSerializer):

    measurement = MeasurementMasterSerializer(read_only=True)

    class Meta:
        model = CommonMeasurement
        fields = "__all__"


class CustomerMeasurementSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomerMeasurement
        fields = "__all__"


class MeasurementVideoSerializer(serializers.ModelSerializer):

    class Meta:
        model = MeasurementVideo
        fields = "__all__"