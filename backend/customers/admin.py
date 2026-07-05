from django.contrib import admin
from .models import CustomerProfile


@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "first_name",
        "last_name",
        "city",
        "state",
    )