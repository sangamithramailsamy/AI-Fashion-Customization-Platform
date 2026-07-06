from django.urls import path
from .views import BoutiqueCreateView, BoutiqueProfileView

urlpatterns = [
    path(
        "",
        BoutiqueCreateView.as_view(),
        name="boutique-create",
    ),
    path(
        "profile/",
        BoutiqueProfileView.as_view(),
        name="boutique-profile",
    ),
]