from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, ReviewMediaViewSet

router = DefaultRouter()

router.register(
    "reviews",
    ReviewViewSet,
    basename="review",
)

router.register(
    "review-media",
    ReviewMediaViewSet,
    basename="review-media",
)

urlpatterns = router.urls