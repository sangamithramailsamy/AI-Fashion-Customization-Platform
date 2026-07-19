from django.contrib import admin

from .models import Production


@admin.register(Production)
class ProductionAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "tailor",
        "status",
        "expected_completion_date",
        "completed_date",
    )

    list_filter = (
        "status",
        "assigned_date",
    )

    search_fields = (
        "order__order_number",
        "tailor__employee_name",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 20