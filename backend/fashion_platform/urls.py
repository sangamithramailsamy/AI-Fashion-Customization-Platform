from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/customer/", include("customers.urls")),
    path("api/boutique/", include("boutiques.urls")),
    path("api/employees/", include("employees.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/measurements/", include("measurements.urls")),
    path("api/discounts/", include("discounts.urls")),
]