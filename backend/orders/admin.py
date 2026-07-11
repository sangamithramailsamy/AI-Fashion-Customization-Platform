from django import forms
from django.contrib import admin

from .models import Order, OrderItem


class OrderAdminForm(forms.ModelForm):

    class Meta:
        model = Order
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance.pk:

            current = self.instance.status

            if current == "PENDING":
                allowed = [
                    ("PENDING", "Pending"),
                    ("IN_PROGRESS", "In Progress"),
                    ("CANCELLED", "Cancelled"),
                ]

            elif current == "IN_PROGRESS":
                allowed = [
                    ("IN_PROGRESS", "In Progress"),
                    ("READY", "Ready"),
                ]

            elif current == "READY":
                allowed = [
                    ("READY", "Ready"),
                    ("DELIVERED", "Delivered"),
                ]

            elif current == "DELIVERED":
                allowed = [
                    ("DELIVERED", "Delivered"),
                ]

            else:
                allowed = Order.STATUS_CHOICES

            self.fields["status"].choices = allowed

            # Hide cancellation reason unless the order is cancelled
            if (
                current != "CANCELLED"
                and "cancellation_reason" in self.fields
            ):
                self.fields["cancellation_reason"].widget = forms.HiddenInput()


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    form = OrderAdminForm

    list_display = (
        "order_number",
        "customer",
        "employee",
        "status",
        "total_amount",
        "advance_paid",
        "balance_amount",
        "delivery_date",
    )

    search_fields = (
        "order_number",
        "customer__first_name",
        "customer__last_name",
        "customer__user__username",
        "employee__employee_name",
        "boutique__boutique_name",
    )

    list_filter = (
        "status",
        "boutique",
        "employee",
        "order_date",
        "delivery_date",
    )

    readonly_fields = (
        "order_number",
        "total_amount",
        "balance_amount",
        "started_at",
        "ready_at",
        "delivered_at",
        "cancelled_at",
        "created_at",
        "updated_at",
    )

    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)

        if obj and obj.status == "DELIVERED":
            readonly.extend(field.name for field in self.model._meta.fields)
            return readonly

        return readonly

    inlines = [
        OrderItemInline,
    ]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "item_type",
        "quantity",
        "unit_price",
        "subtotal",
    )

    search_fields = (
        "order__order_number",
    )

    list_filter = (
        "item_type",
    )

    readonly_fields = (
        "subtotal",
    )