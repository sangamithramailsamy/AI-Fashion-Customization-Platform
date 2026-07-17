from rest_framework.routers import DefaultRouter

from .views import (
    WishlistViewSet,
    CartViewSet,
    CartItemViewSet,
    ShippingAddressViewSet,
)

router = DefaultRouter()

router.register(
    r"wishlist",
    WishlistViewSet,
    basename="wishlist",
)

router.register(
    r"cart",
    CartViewSet,
    basename="cart",
)

router.register(
    r"cart-items",
    CartItemViewSet,
    basename="cart-item",
)

router.register(
    r"shipping-addresses",
    ShippingAddressViewSet,
    basename="shipping-address",
)

urlpatterns = router.urls