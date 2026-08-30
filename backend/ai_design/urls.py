from django.urls import path

from .views import AIDesignGenerateView


urlpatterns = [
    path("generate/", AIDesignGenerateView.as_view(), name="ai-design-generate"),
]