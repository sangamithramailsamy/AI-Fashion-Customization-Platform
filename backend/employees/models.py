from django.db import models
from django.conf import settings


class Employee(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employees"
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="employee_profile",
        null=True,
        blank=True,
    )

    employee_name = models.CharField(max_length=100)

    phone = models.CharField(
        max_length=15,
        blank=True,
        db_index=True,
    )

    email = models.EmailField(
        blank=True,
        db_index=True,
    )

    role = models.CharField(
        max_length=100
    )

    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    joining_date = models.DateField()

    status = models.BooleanField(
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
        return self.employee_name
