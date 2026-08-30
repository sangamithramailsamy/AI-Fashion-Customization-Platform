from django.conf import settings
from django.conf.urls.static import static


from django.contrib import admin
from django.urls import include, path
from dashboard.views import ReportsAPIView

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)


urlpatterns = [
    path("admin/", admin.site.urls),
    path('api/contact/', include('contact.urls')),
    path("api/ai-design/", include("ai_design.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/customer/", include("customers.urls")),
    path("api/owner/customers/", include("customers.owner_urls")),
    path("api/boutique/", include("boutiques.urls")),
    path("api/owner/boutique/", include("boutiques.urls")),
    path("api/employees/", include("employees.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/measurements/", include("measurements.urls")),
    path("api/discounts/", include("discounts.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/owner/reports/", ReportsAPIView.as_view(), name="owner-reports"),
    path("api/production/", include("production.urls")),
    path("api/inventory/", include("inventory.urls")),
    path("api/catalog/", include("catalog.urls")),
    path("api/owner/products/", include("catalog.owner_urls")),
    path("api/shopping/", include("shopping.urls")),
    path("api/reviews/",include("reviews.urls")),
    path("api/custom-designs/", include("custom_designs.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema/swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )