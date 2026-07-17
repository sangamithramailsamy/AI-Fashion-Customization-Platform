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
    path("api/notifications/", include("notifications.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/production/", include("production.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/catalog/", include("catalog.urls")),
    path("api/shopping/", include("shopping.urls")),
    path("api/reviews/",include("reviews.urls")),
]