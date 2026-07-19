from django.contrib import admin

from .models import (
    Section,
    CollectionCategory,
    Design,
    DesignImage,
    DesignVariant,
)


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "display_order",
        "is_active",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "is_active",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    ordering = (
        "display_order",
    )

    list_per_page = 20


@admin.register(CollectionCategory)
class CollectionCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "section",
        "display_order",
        "is_active",
    )

    list_filter = (
        "section",
        "is_active",
    )

    search_fields = (
        "name",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    ordering = (
        "display_order",
    )

    list_per_page = 20


@admin.register(Design)
class DesignAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "base_price",
        "is_featured",
        "is_new_arrival",
        "is_active",
    )

    list_filter = (
        "category",
        "is_active",
        "is_featured",
        "is_new_arrival",
    )

    search_fields = (
        "name",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    list_per_page = 20


@admin.register(DesignImage)
class DesignImageAdmin(admin.ModelAdmin):
    list_display = (
        "design",
        "display_order",
        "is_primary",
    )

    list_filter = (
        "is_primary",
    )

    ordering = (
        "display_order",
    )

    list_per_page = 20


@admin.register(DesignVariant)
class DesignVariantAdmin(admin.ModelAdmin):
    list_display = (
        "design",
        "size",
        "color",
        "stock",
        "price",
        "is_active",
    )

    list_filter = (
        "size",
        "is_active",
    )

    search_fields = (
        "design__name",
        "sku",
    )

    ordering = (
        "design",
    )

    list_per_page = 20