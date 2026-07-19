from django.contrib import admin

from .models import CustomerProfile


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "first_name",
        "last_name",
        "gender",
        "city",
        "state",
    )

    search_fields = (
        "user__username",
        "first_name",
        "last_name",
        "city",
        "state",
    )

    list_filter = (
        "gender",
        "city",
        "state",
        "country",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 20