from django.db import models


class DiscountType(models.TextChoices):
    PERCENTAGE = "PERCENTAGE", "Percentage"
    FLAT = "FLAT", "Flat"


class Coupon(models.Model):
    code = models.CharField(
        max_length=50,
        unique=True
    )

    description = models.TextField(
        blank=True
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    maximum_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    usage_limit = models.PositiveIntegerField(
        default=1
    )

    used_count = models.PositiveIntegerField(
        default=0
    )

    valid_from = models.DateTimeField()

    valid_until = models.DateTimeField()

    is_active = models.BooleanField(
        default=True
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
        return self.code
