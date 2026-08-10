from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Design
from .owner_serializers import OwnerProductSerializer


class OwnerProductViewSet(viewsets.ModelViewSet):

    serializer_class = OwnerProductSerializer
    permission_classes = [IsAuthenticated]

    queryset = (
        Design.objects
        .select_related("category")
        .prefetch_related("variants")
        .order_by("-created_at")
    )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):

        user = self.request.user

        # Only owner/admin users can use this endpoint.
        if not (
            user.is_superuser
            or getattr(user, "role", None) in ["OWNER", "ADMIN"]
        ):
            return Design.objects.none()

        return super().get_queryset()