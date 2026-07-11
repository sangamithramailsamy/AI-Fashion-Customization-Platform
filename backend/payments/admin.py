from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "payment_number",
        "order",
        "payment_date",
        "payment_method",
        "amount",
        "created_by",
    )

    list_filter = (
        "payment_method",
        "payment_date",
        "created_at",
    )

    search_fields = (
        "payment_number",
        "order__order_number",
        "reference_number",
    )

    readonly_fields = (
        "payment_number",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-payment_date",
        "-created_at",
    )
