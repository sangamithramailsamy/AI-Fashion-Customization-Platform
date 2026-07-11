from django.db import models


class MeasurementMaster(models.Model):
    """
    Master list of all measurements.
    Every measurement exists only once.
    """

    name = models.CharField(
        max_length=150,
        unique=True
    )

    guide_image = models.ImageField(
        upload_to="measurement_guides/",
        blank=True,
        null=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    display_order = models.PositiveIntegerField(
        default=0
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
        db_table = "measurement_master"
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name
    
class SleeveType(models.Model):

    name = models.CharField(max_length=150, unique=True)

    image = models.ImageField(
        upload_to="sleeves/",
        blank=True,
        null=True
    )

    display_order = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sleeve_type"
        ordering = ["display_order"]

    def __str__(self):
        return self.name
    
class SleeveMeasurement(models.Model):

    sleeve_type = models.ForeignKey(
        SleeveType,
        on_delete=models.CASCADE,
        related_name="measurements"
    )

    measurement = models.ForeignKey(
        MeasurementMaster,
        on_delete=models.CASCADE,
        related_name="sleeve_measurements"
    )

    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "sleeve_measurement"
        ordering = ["display_order"]
        unique_together = ("sleeve_type", "measurement")

    def __str__(self):
        return f"{self.sleeve_type.name} - {self.measurement.name}"
    

class NeckType(models.Model):

    name = models.CharField(
        max_length=150,
        unique=True
    )

    image = models.ImageField(
        upload_to="necks/",
        blank=True,
        null=True
    )

    display_order = models.PositiveIntegerField(
        default=0
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
        db_table = "neck_type"
        ordering = ["display_order"]

    def __str__(self):
        return self.name

class NeckMeasurement(models.Model):

    neck_type = models.ForeignKey(
        NeckType,
        on_delete=models.CASCADE,
        related_name="measurements"
    )

    measurement = models.ForeignKey(
        MeasurementMaster,
        on_delete=models.CASCADE,
        related_name="neck_measurements"
    )

    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "neck_measurement"
        ordering = ["display_order"]
        unique_together = ("neck_type", "measurement")

    def __str__(self):
        return f"{self.neck_type.name} - {self.measurement.name}"
    

class CommonMeasurement(models.Model):

    measurement = models.ForeignKey(
        MeasurementMaster,
        on_delete=models.CASCADE,
        related_name="common_measurements"
    )

    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "common_measurement"
        ordering = ["display_order"]
        

    def __str__(self):
        return self.measurement.name
    
class CustomerMeasurement(models.Model):

    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.CASCADE,
        related_name="customer_measurements"
    )

    measurement = models.ForeignKey(
        MeasurementMaster,
        on_delete=models.CASCADE,
        related_name="customer_measurements"
    )

    value = models.DecimalField(
        max_digits=6,
        decimal_places=2
    )

    class Meta:
        db_table = "customer_measurement"
        ordering = ["order"]
        unique_together = ("order", "measurement")

    def __str__(self):
        return f"{self.order.order_number} - {self.measurement.name}"
    
class MeasurementVideo(models.Model):

    video = models.FileField(
        upload_to="measurement_videos/"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "measurement_video"
        ordering = ["-created_at"]

    def __str__(self):
        return "Measurement Guide Video"