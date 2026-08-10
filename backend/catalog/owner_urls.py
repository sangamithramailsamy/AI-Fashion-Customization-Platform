from rest_framework.routers import DefaultRouter

from .owner_views import OwnerProductViewSet


router = DefaultRouter()

router.register(
    "",
    OwnerProductViewSet,
    basename="owner-products"
)

urlpatterns = router.urls