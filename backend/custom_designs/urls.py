from django.urls import path

from .views import (
    CustomDesignRequestListCreateView,
    CustomDesignRequestDetailView,
)


urlpatterns = [
    path(
        "",
        CustomDesignRequestListCreateView.as_view(),
        name="custom-design-list-create",
    ),
    path(
        "<int:pk>/",
        CustomDesignRequestDetailView.as_view(),
        name="custom-design-detail",
    ),
]