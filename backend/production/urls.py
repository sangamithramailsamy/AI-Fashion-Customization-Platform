from rest_framework.routers import DefaultRouter

from .views import ProductionViewSet

router = DefaultRouter()

router.register(
    "",
    ProductionViewSet,
    basename="production"
)

urlpatterns = router.urls