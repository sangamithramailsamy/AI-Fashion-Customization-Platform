from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from orders.models import Order
from customers.models import CustomerProfile
from catalog.models import Design


class Review(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    rating = models.PositiveSmallIntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

    # Renamed from review -> review_text
    review_text = models.TextField()

    # New fields
    is_verified_purchase = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("customer","order", "design")

    def __str__(self):
        return f"{self.customer} - {self.design} ({self.rating}★)"
    

class ReviewMedia(models.Model):

    IMAGE = "IMAGE"
    VIDEO = "VIDEO"

    MEDIA_TYPES = [
        (IMAGE, "Image"),
        (VIDEO, "Video"),
    ]

    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name="media"
    )

    media_type = models.CharField(
        max_length=10,
        choices=MEDIA_TYPES
    )

    file = models.FileField(
        upload_to="reviews/"
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.media_type} - Review {self.review.id}"