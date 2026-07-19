from django.db import models

from boutiques.models import Boutique
from django.core.exceptions import ValidationError


class Inventory(models.Model):

    CATEGORY_CHOICES = [
        ("FABRIC", "Fabric"),
        ("THREAD", "Thread"),
        ("BUTTON", "Button"),
        ("ZIP", "Zip"),
        ("LACE", "Lace"),
        ("LINING", "Lining"),
        ("ELASTIC", "Elastic"),
        ("HOOK", "Hook"),
        ("OTHER", "Other"),
    ]

    UNIT_CHOICES = [
        ("METER", "Meter"),
        ("PIECE", "Piece"),
        ("BOX", "Box"),
        ("KG", "Kilogram"),
        ("ROLL", "Roll"),
    ]

    boutique = models.ForeignKey(
        Boutique,
        on_delete=models.CASCADE,
        related_name="inventory_items"
    )

    item_name = models.CharField(
        max_length=150
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES
    )

    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES
    )

    current_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    minimum_stock = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    purchase_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    selling_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    supplier = models.CharField(
        max_length=150,
        blank=True
    )

    notes = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["item_name"]
        unique_together = ("boutique", "item_name")

    def clean(self):
        if self.current_stock < 0:
            raise ValidationError({"current_stock": "Current stock cannot be negative."})
        
        if self.minimum_stock < 0:
            raise ValidationError({"minimum_stock": "Minimum stock cannot be negative."})

    @property
    def low_stock(self):
        return self.current_stock <= self.minimum_stock

    def __str__(self):
        return self.item_name
