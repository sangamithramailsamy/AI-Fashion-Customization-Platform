from django.contrib import admin
from .models import Wishlist, Cart, CartItem ,  ShippingAddress


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = (
        "customer",
        "design",
        "created_at",
    )

    search_fields = (
        "customer__user__username",
        "design__name",
    )

    list_filter = (
        "created_at",
    )

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = (
        "customer",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "customer__user__username",
    )

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = (
        "cart",
        "variant",
        "quantity",
        "created_at",
    )

    list_filter = (
        "created_at",
    )

    search_fields = (
        "variant__design__name",
        "cart__customer__user__username",
    )

@admin.register(ShippingAddress)
class ShippingAddressAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "customer",
        "phone_number",
        "city",
        "state",
        "is_default",
    )

    list_filter = (
        "state",
        "is_default",
    )

    search_fields = (
        "full_name",
        "phone_number",
        "customer__user__username",
        "city",
    )