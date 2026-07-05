
from django.db import models
from django.conf import settings


class GenderChoices(models.TextChoices):
    MALE = "MALE", "Male"
    FEMALE = "FEMALE", "Female"
    OTHER = "OTHER", "Other"


class CustomerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customer_profile",
    )

    first_name = models.CharField(max_length=100)

    last_name = models.CharField(max_length=100)

    gender = models.CharField(
        max_length=10,
        choices=GenderChoices.choices,
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
    )

    address_line_1 = models.CharField(max_length=255)

    address_line_2 = models.CharField(
        max_length=255,
        blank=True,
    )

    city = models.CharField(max_length=100)

    state = models.CharField(max_length=100)

    country = models.CharField(max_length=100)

    pincode = models.CharField(max_length=10)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username