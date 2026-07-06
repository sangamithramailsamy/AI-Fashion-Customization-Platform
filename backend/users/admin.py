from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        "username",
        "email",
        "phone_number",
        "role",
        "is_verified",
        "is_staff",
    )

    list_filter = (
        "role",
        "is_verified",
        "is_staff",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "Additional Information",
            {
                "fields": (
                    "phone_number",
                    "role",
                    "profile_image",
                    "is_verified",
                )
            },
        ),
    )
