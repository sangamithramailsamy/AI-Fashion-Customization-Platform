from django.core.exceptions import ValidationError
from django.db import models

from customers.models import CustomerProfile
from catalog.models import Design, DesignVariant


class Wishlist(models.Model):
    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
        db_index=True,
    )

    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        unique_together = ("customer", "design")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.customer.user.username} - {self.design.name}"


class Cart(models.Model):
    customer = models.OneToOneField(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="cart",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.customer.user.username}'s Cart"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )

    variant = models.ForeignKey(
        DesignVariant,
        on_delete=models.CASCADE,
    )

    quantity = models.PositiveIntegerField(
        default=1,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        unique_together = ("cart", "variant")
        ordering = ["-created_at"]

    def clean(self):
        super().clean()

        if self.quantity <= 0:
            raise ValidationError(
                {
                    "quantity": (
                        "Quantity must be greater than zero."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.variant.design.name} "
            f"({self.variant.size})"
        )


class ShippingAddress(models.Model):
    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="shipping_addresses",
    )

    full_name = models.CharField(
        max_length=150,
    )

    phone_number = models.CharField(
        max_length=15,
        db_index=True,
    )

    address_line_1 = models.CharField(
        max_length=255,
    )

    address_line_2 = models.CharField(
        max_length=255,
        blank=True,
    )

    city = models.CharField(
        max_length=100,
        db_index=True,
    )

    state = models.CharField(
        max_length=100,
        db_index=True,
    )

    country = models.CharField(
        max_length=100,
        default="India",
    )

    pincode = models.CharField(
        max_length=10,
        db_index=True,
    )

    is_default = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} - {self.city}"