from django.urls import path

from .views import DashboardAPIView, ReportsAPIView

urlpatterns = [
    path("", DashboardAPIView.as_view(), name="dashboard"),
    path("reports/", ReportsAPIView.as_view(), name="reports"),
]