from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, ReviewMediaViewSet

router = DefaultRouter()

router.register("reviews", ReviewViewSet)
router.register("review-media", ReviewMediaViewSet)

urlpatterns = router.urls