from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

from orders.models import Order
from customers.models import CustomerProfile
from catalog.models import Design


class Review(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5),
        ],
        db_index=True,
    )

    review_text = models.TextField()

    is_verified_purchase = models.BooleanField(
        default=True,
        db_index=True,
    )

    is_approved = models.BooleanField(
        default=True,
        db_index=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]
        unique_together = (
            "customer",
            "order",
            "design",
        )

    def clean(self):
        super().clean()

        if (
            self.order.customer_id
            != self.customer_id
        ):
            raise ValidationError(
                {
                    "customer": (
                        "The selected customer does not "
                        "own this order."
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.customer} - "
            f"{self.design} "
            f"({self.rating}★)"
        )


class MediaType(models.TextChoices):
    IMAGE = "IMAGE", "Image"
    VIDEO = "VIDEO", "Video"


class ReviewMedia(models.Model):
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name="media",
    )

    media_type = models.CharField(
        max_length=10,
        choices=MediaType.choices,
    )

    file = models.FileField(
        upload_to="reviews/",
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return (
            f"{self.get_media_type_display()} "
            f"- Review {self.review.id}"
        )