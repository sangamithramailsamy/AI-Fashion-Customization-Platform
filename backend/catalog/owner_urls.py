from rest_framework.routers import DefaultRouter

from .views import OwnerProductViewSet

router = DefaultRouter()
router.register("products", OwnerProductViewSet, basename="owner-products")

urlpatterns = router.urls
