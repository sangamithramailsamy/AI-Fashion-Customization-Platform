from django.db import models
from django.conf import settings
from orders.models import Order


class Notification(models.Model):

    ORDER_PLACED = "ORDER_PLACED"
    ORDER_ACCEPTED = "ORDER_ACCEPTED"
    ORDER_STARTED = "ORDER_STARTED"
    ORDER_READY = "ORDER_READY"
    ORDER_DELIVERED = "ORDER_DELIVERED"
    ORDER_CANCELLED = "ORDER_CANCELLED"
    PAYMENT_RECEIVED = "PAYMENT_RECEIVED"
    NEW_REVIEW = "NEW_REVIEW"

    TYPES = [
        (ORDER_PLACED, "Order Placed"),
        (ORDER_ACCEPTED, "Order Accepted"),
        (ORDER_STARTED, "Tailoring Started"),
        (ORDER_READY, "Order Ready"),
        (ORDER_DELIVERED, "Order Delivered"),
        (ORDER_CANCELLED, "Order Cancelled"),
        (PAYMENT_RECEIVED, "Payment Received"),
        (NEW_REVIEW, "New Review"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )

    title = models.CharField(max_length=255)
    message = models.TextField()

    notification_type = models.CharField(
        max_length=30,
        choices=TYPES,
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient} - {self.title}"