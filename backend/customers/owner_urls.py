from django.urls import path

from .views import (
    OwnerCustomerListView,
    OwnerCustomerDetailView,
)

urlpatterns = [
    path(
        "",
        OwnerCustomerListView.as_view(),
        name="owner-customer-list",
    ),
    path(
        "<int:pk>/",
        OwnerCustomerDetailView.as_view(),
        name="owner-customer-detail",
    ),
]