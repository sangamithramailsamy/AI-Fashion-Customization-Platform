from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import Sum
from django.utils import timezone
from django.core.exceptions import ValidationError

from boutiques.models import Boutique
from customers.models import CustomerProfile
from employees.models import Employee


class Order(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_PROGRESS", "In Progress"),
        ("READY", "Ready"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    boutique = models.ForeignKey(
        Boutique,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )

    order_number = models.CharField(
        max_length=30,
        unique=True,
        blank=True
    )

    order_date = models.DateField()

    delivery_date = models.DateField()

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        editable=False
    )

    advance_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    balance_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        editable=False
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    notes = models.TextField(blank=True)

    cancelled_at = models.DateTimeField(
        null=True,
        blank=True
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True
    )

    ready_at = models.DateTimeField(
        null=True,
        blank=True
    )

    delivered_at = models.DateTimeField(
        null=True,
        blank=True
    )

    cancellation_reason = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def recalculate_totals(self):
        """
        Recalculate total amount and balance amount
        whenever an OrderItem changes.
        """

        total = (
            self.items.aggregate(
                total=Sum("subtotal")
            )["total"]
            or Decimal("0.00")
        )

        self.total_amount = total
        self.balance_amount = total - self.advance_paid

        Order.objects.filter(pk=self.pk).update(
            total_amount=self.total_amount,
            balance_amount=self.balance_amount,
        )

    def clean(self):
        super().clean()

        if (
            self.order_date
            and self.delivery_date
            and self.delivery_date < self.order_date
        ):
            raise ValidationError({
                "delivery_date": "Delivery date cannot be earlier than the order date."
            })


    def save(self, *args, **kwargs):

        # Prevent editing delivered orders
        if self.pk:
            old_order = Order.objects.get(pk=self.pk)

            if old_order.status == "DELIVERED":
                raise ValidationError(
                    "Delivered orders cannot be modified."
                )
        self.full_clean()

        # Generate order number only once
        if not self.order_number:
            today = timezone.now().strftime("%Y%m%d")

            last_order = (
                Order.objects.filter(
                    order_number__startswith=f"ORD{today}"
                )
                .order_by("-id")
                .first()
            )

            if last_order:
                last_number = int(last_order.order_number[-4:])
                next_number = last_number + 1
            else:
                next_number = 1

            self.order_number = f"ORD{today}{next_number:04d}"

        self.balance_amount = self.total_amount - self.advance_paid

        # Automatically save status timestamps
        if self.status == "IN_PROGRESS" and not self.started_at:
            self.started_at = timezone.now()

        elif self.status == "READY" and not self.ready_at:
            self.ready_at = timezone.now()

        elif self.status == "DELIVERED" and not self.delivered_at:
            self.delivered_at = timezone.now()

        elif self.status == "CANCELLED" and not self.cancelled_at:
            self.cancelled_at = timezone.now()

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Prevent deleting delivered orders
        if self.status == "DELIVERED":
            raise ValidationError(
                "Delivered orders cannot be deleted."
            )

        super().delete(*args, **kwargs)


    def __str__(self):
        return self.order_number


class OrderItem(models.Model):

    ITEM_CHOICES = [
        ("SHIRT", "Shirt"),
        ("PANT", "Pant"),
        ("BLOUSE", "Blouse"),
        ("KURTI", "Kurti"),
        ("SAREE_BLOUSE", "Saree Blouse"),
        ("COAT", "Coat"),
        ("OTHERS", "Others"),
    ]

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    item_type = models.CharField(
        max_length=30,
        choices=ITEM_CHOICES
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        editable=False
    )

    notes = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        # Prevent editing items of delivered orders
        if self.order.status == "DELIVERED":
            raise ValidationError(
                "Items cannot be modified after the order is delivered."
            )

        # Calculate subtotal
        self.subtotal = self.quantity * self.unit_price

        super().save(*args, **kwargs)

        # Update order totals
        self.order.recalculate_totals()

    def delete(self, *args, **kwargs):

        # Prevent deleting items of delivered orders
        if self.order.status == "DELIVERED":
            raise ValidationError(
                "Items cannot be deleted after the order is delivered."
            )

        order = self.order

        super().delete(*args, **kwargs)

        order.recalculate_totals()

    def __str__(self):
        return f"{self.order.order_number} - {self.item_type}"
    
