from django.db import models
from django.conf import settings

from boutiques.models import Boutique
from orders.models import Order
from employees.models import Employee


class Production(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("ASSIGNED", "Assigned to Tailor"),
        ("CUTTING", "Fabric Cutting"),
        ("STITCHING", "Stitching in Progress"),
        ("TRIAL", "Ready for Trial"),
        ("ALTERATION", "Under Alteration"),
        ("READY", "Ready for Delivery"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    boutique = models.ForeignKey(
        Boutique,
        on_delete=models.CASCADE,
        related_name="productions"
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="production"
    )

    tailor = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_productions"
    )

    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="assigned_productions"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ASSIGNED"
    )

    assigned_date = models.DateField(auto_now_add=True)

    expected_completion_date = models.DateField()

    completed_date = models.DateField(
        null=True,
        blank=True
    )

    remarks = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"