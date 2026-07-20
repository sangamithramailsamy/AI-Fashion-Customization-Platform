from django.urls import path
from .views import (
    BoutiqueCreateView,
    BoutiqueListView,
    BoutiqueDetailView,
)

urlpatterns = [
    # Create Boutique
    path(
        "",
        BoutiqueCreateView.as_view(),
        name="boutique-create",
    ),

    # List all boutiques of logged-in owner
    path(
        "list/",
        BoutiqueListView.as_view(),
        name="boutique-list",
    ),

    # Get / Update a specific boutique
    path(
        "<int:pk>/",
        BoutiqueDetailView.as_view(),
        name="boutique-detail",
    ),
]