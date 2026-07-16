from django.contrib import admin
from .models import Review, ReviewMedia

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer",
        "design",
        "rating",
        "is_verified_purchase",
        "is_approved",
        "created_at",
    )

    list_filter = (
        "rating",
        "is_verified_purchase",
        "is_approved",
    )

    search_fields = (
        "customer__full_name",
        "design__name",
        "review_text",
    )

    raw_id_fields = (
        "customer",
        "design",
        "order",
    )


@admin.register(ReviewMedia)
class ReviewMediaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "review",
        "media_type",
        "uploaded_at",
    )

    list_filter = (
        "media_type",
    )

    raw_id_fields = (
        "review",
    )