from django.contrib import admin

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

admin.site.register(MeasurementMaster)
admin.site.register(SleeveType)
admin.site.register(SleeveMeasurement)
admin.site.register(NeckType)
admin.site.register(NeckMeasurement)
admin.site.register(CommonMeasurement)
admin.site.register(CustomerMeasurement)
admin.site.register(MeasurementVideo)