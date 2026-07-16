from rest_framework.routers import DefaultRouter

from .views import (
    SectionViewSet,
    CollectionCategoryViewSet,
    DesignViewSet,
    DesignImageViewSet,
    DesignVariantViewSet,
)

router = DefaultRouter()

router.register(
    "sections",
    SectionViewSet,
    basename="sections"
)

router.register(
    "categories",
    CollectionCategoryViewSet,
    basename="categories"
)

router.register(
    "designs",
    DesignViewSet,
    basename="designs"
)

router.register(
    "images",
    DesignImageViewSet,
    basename="images"
)

router.register(
    "variants",
    DesignVariantViewSet,
    basename="variants"
)

urlpatterns = router.urls