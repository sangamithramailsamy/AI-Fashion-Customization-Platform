from django.db import models
from django.contrib.auth.models import AbstractUser


class UserRole(models.TextChoices):
    CUSTOMER = "CUSTOMER", "Customer"
    OWNER = "OWNER", "Boutique Owner"
    MANAGER = "MANAGER", "Manager"
    TAILOR = "TAILOR", "Tailor"
    DESIGNER = "DESIGNER", "Designer"
    RECEPTIONIST = "RECEPTIONIST", "Receptionist"
    DELIVERY = "DELIVERY", "Delivery Staff"
    ADMIN = "ADMIN", "Admin"



class User(AbstractUser):
    """
    Custom User Model
  """
    phone_number = models.CharField(max_length=15, unique=True)

    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True,
    )

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"