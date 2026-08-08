from django.db import models
from customers.models import CustomerProfile


class CustomDesignRequest(models.Model):

    class StatusChoices(models.TextChoices):
        SUBMITTED = "SUBMITTED", "Submitted"
        REVIEWING = "REVIEWING", "Reviewing"
        DESIGNING = "DESIGNING", "Designing"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        COMPLETED = "COMPLETED", "Completed"

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="custom_design_requests",
    )

    occasion = models.CharField(
        max_length=150,
        blank=True,
    )

    description = models.TextField()

    colors = models.CharField(
        max_length=255,
        blank=True,
    )

    fabric = models.CharField(
        max_length=150,
        blank=True,
    )

    silhouette = models.CharField(
        max_length=150,
        blank=True,
    )

    inspiration_image = models.ImageField(
        upload_to="custom_designs/inspiration/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.SUBMITTED,
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
        return f"Custom Design #{self.id} - {self.customer.user.username}"