from django.db import models
from django.utils.text import slugify


class Section(models.Model):
    name = models.CharField(max_length=150, unique=True)

    slug = models.SlugField(max_length=170, unique=True)

    description = models.TextField(blank=True)

    cover_image = models.ImageField(
        upload_to="catalog/sections/",
        blank=True,
        null=True
    )

    display_order = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name


class CollectionCategory(models.Model):
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="categories"
    )

    name = models.CharField(max_length=150)

    slug = models.SlugField(max_length=170)

    description = models.TextField(blank=True)

    cover_image = models.ImageField(
        upload_to="catalog/categories/",
        blank=True,
        null=True
    )

    display_order = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]
        unique_together = ("section", "name")

    def __str__(self):
        return f"{self.section.name} - {self.name}"
    
class Design(models.Model):
    category = models.ForeignKey(
        CollectionCategory,
        on_delete=models.CASCADE,
        related_name="designs"
    )

    name = models.CharField(max_length=200)

    slug = models.SlugField(max_length=220, unique=True, blank=True)

    description = models.TextField(blank=True)

    thumbnail = models.ImageField(
        upload_to="catalog/designs/thumbnails/",
        blank=True,
        null=True
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    is_featured = models.BooleanField(default=False)

    is_new_arrival = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class DesignImage(models.Model):
    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(
        upload_to="catalog/designs/"
    )

    alt_text = models.CharField(
        max_length=255,
        blank=True
    )

    display_order = models.PositiveIntegerField(default=0)

    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order"]

    def __str__(self):
        return f"{self.design.name} Image"
    
class DesignVariant(models.Model):
    SIZE_CHOICES = [
        ("XS", "XS"),
        ("S", "S"),
        ("M", "M"),
        ("L", "L"),
        ("XL", "XL"),
        ("XXL", "XXL"),
    ]

    design = models.ForeignKey(
        Design,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    size = models.CharField(
        max_length=5,
        choices=SIZE_CHOICES
    )

    color = models.CharField(
        max_length=100,
        blank=True
    )

    stock = models.PositiveIntegerField(default=0)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    sku = models.CharField(
        max_length=50,
        unique=True
    )

    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("design", "size", "color")

    def __str__(self):
        return f"{self.design.name} - {self.size}"
    



