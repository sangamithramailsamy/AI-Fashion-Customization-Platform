from django.db import models
from django.conf import settings


class Boutique(models.Model):
    """
    Stores boutique/business information.
    """

    STATUS_CHOICES = [
        ("ACTIVE", "Active"),
        ("INACTIVE", "Inactive"),
    ]

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="boutiques"
    )

    boutique_name = models.CharField(max_length=200)

    logo = models.ImageField(
        upload_to="boutique_logos/",
        blank=True,
        null=True
    )

    description = models.TextField(blank=True)

    gst_number = models.CharField(
        max_length=20,
        unique=True
    )

    phone = models.CharField(max_length=15)

    email = models.EmailField()

    address_line_1 = models.CharField(max_length=255)

    address_line_2 = models.CharField(
        max_length=255,
        blank=True
    )

    city = models.CharField(max_length=100,db_index=True)

    state = models.CharField(max_length=100)

    country = models.CharField(max_length=100)

    pincode = models.CharField(max_length=10)

    working_hours = models.CharField(
        max_length=150,
        blank=True
    )

    website = models.URLField(blank=True)

    instagram = models.URLField(blank=True)

    facebook = models.URLField(blank=True)

    whatsapp = models.CharField(
        max_length=20,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE",
        db_index=True
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
        return self.boutique_name
