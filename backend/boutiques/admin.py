from django.contrib import admin
from .models import Boutique


@admin.register(Boutique)
class BoutiqueAdmin(admin.ModelAdmin):
    list_display = (
        "boutique_name",
        "owner",
        "phone",
        "email",
        "city",
        "status",
    )

    search_fields = (
        "boutique_name",
        "owner__username",
        "phone",
        "email",
    )

    list_filter = (
        "status",
        "city",
        "state",
        "country",
    )