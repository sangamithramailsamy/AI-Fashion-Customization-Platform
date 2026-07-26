from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Sum
from django.utils import timezone

from orders.models import Order


PAYMENT_METHOD_CHOICES = [
    ("CASH", "Cash"),
    ("UPI", "UPI"),
    ("CREDIT_CARD", "Credit Card"),
    ("DEBIT_CARD", "Debit Card"),
    ("BANK_TRANSFER", "Bank Transfer"),
    ("CHEQUE", "Cheque"),
    ("OTHER", "Other"),
]

PAYMENT_STATUS_CHOICES = [
    ("CREATED", "Created"),
    ("SUCCESS", "Success"),
    ("FAILED", "Failed"),
    ("REFUNDED", "Refunded"),
]

PAYMENT_TYPE_CHOICES = [
    ("FULL", "Full Payment"),
    ("ADVANCE", "Advance Payment"),
    ("BALANCE", "Balance Payment"),
]


class Payment(models.Model):

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    payment_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
    )

    payment_date = models.DateField(
        default=timezone.now,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    payment_type = models.CharField(
        max_length=20,
        choices=PAYMENT_TYPE_CHOICES,
        default="FULL",
    )

    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="CREATED",
    )

    gateway = models.CharField(
        max_length=30,
        blank=True,
        default="",
    )

    gateway_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
    )

    gateway_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
    )

    reference_number = models.CharField(
        max_length=100,
        blank=True,
    )

    notes = models.TextField(
        blank=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="payments_created",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-payment_date", "-created_at"]

    def __str__(self):
        return (
            f"{self.payment_number} - "
            f"{self.order.order_number}"
        )

    def clean(self):
        super().clean()

        # Payment amount must be greater than zero
        if self.amount <= Decimal("0.00"):
            raise ValidationError({
                "amount": (
                    "Payment amount must be greater than zero."
                )
            })

        # Payments cannot be created for cancelled orders
        if self.order.status == "CANCELLED":
            raise ValidationError(
                "Cannot record payments for a cancelled order."
            )

        # A Razorpay payment initially has status CREATED.
        # The reference/payment ID becomes available only
        # after the gateway payment succeeds.
        if (
            self.status == "SUCCESS"
            and self.payment_method != "CASH"
            and not (self.reference_number or "").strip()
        ):
            raise ValidationError({
                "reference_number": (
                    "Reference number is required for "
                    "successful non-cash payments."
                )
            })

    def generate_payment_number(self):
        """
        Generate payment number in format:
        PAY202607260001
        """

        today = timezone.now().date()

        prefix = f"PAY{today.strftime('%Y%m%d')}"

        last_payment = (
            Payment.objects
            .filter(payment_number__startswith=prefix)
            .order_by("-payment_number")
            .first()
        )

        if last_payment:
            last_sequence = int(
                last_payment.payment_number[-4:]
            )
            new_sequence = last_sequence + 1
        else:
            new_sequence = 1

        return f"{prefix}{new_sequence:04d}"

    def update_order_balance(self):
        """
        Update order payment totals using only
        successfully completed payments.
        """

        total_paid = (
            self.order.payments
            .filter(status="SUCCESS")
            .aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        balance = self.order.total_amount - total_paid

        # Safety guard
        if balance < Decimal("0.00"):
            balance = Decimal("0.00")

        Order.objects.filter(
            pk=self.order.pk
        ).update(
            advance_paid=total_paid,
            balance_amount=balance,
        )

    def save(self, *args, **kwargs):

        # Generate payment number for new payment
        if not self.payment_number:
            self.payment_number = (
                self.generate_payment_number()
            )

        # Run model validation
        self.full_clean()

        # Save payment
        super().save(*args, **kwargs)

        # Recalculate order payment balance
        self.update_order_balance()

    def delete(self, *args, **kwargs):

        order = self.order

        # Delete payment
        super().delete(*args, **kwargs)

        # Recalculate successful payments
        total_paid = (
            order.payments
            .filter(status="SUCCESS")
            .aggregate(total=Sum("amount"))["total"]
            or Decimal("0.00")
        )

        balance = order.total_amount - total_paid

        # Safety guard
        if balance < Decimal("0.00"):
            balance = Decimal("0.00")

        Order.objects.filter(
            pk=order.pk
        ).update(
            advance_paid=total_paid,
            balance_amount=balance,
        )