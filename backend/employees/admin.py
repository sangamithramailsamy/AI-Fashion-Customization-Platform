from django.contrib import admin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        "employee_name",
        "role",
        "phone",
        "email",
        "salary",
        "joining_date",
        "status",
    )

    search_fields = (
        "employee_name",
        "phone",
        "email",
        "role",
    )

    list_filter = (
        "status",
        "joining_date",
        "role",
    )
