from django.urls import path

from .views import (
    SleeveTypeListView,
    SleeveMeasurementListView,
    NeckTypeListView,
    NeckMeasurementListView,
    CommonMeasurementListView,
    MeasurementVideoView,
)

urlpatterns = [
    path(
        "sleeves/",
        SleeveTypeListView.as_view(),
        name="sleeve-list",
    ),

    path(
        "sleeves/<int:pk>/measurements/",
        SleeveMeasurementListView.as_view(),
        name="sleeve-measurements",
    ),

    path(
        "necks/",
        NeckTypeListView.as_view(),
        name="neck-list",
    ),

    path(
        "necks/<int:pk>/measurements/",
        NeckMeasurementListView.as_view(),
        name="neck-measurements",
    ),

    path(
        "common/",
        CommonMeasurementListView.as_view(),
        name="common-measurements",
    ),

    path(
        "video/",
        MeasurementVideoView.as_view(),
        name="measurement-video",
    ),
]