from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Notification
from .serializers import NotificationSerializer

from users.models import UserRole


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin -> All notifications
        if user.is_superuser or user.role == UserRole.ADMIN:
            return Notification.objects.all().order_by("-created_at")

        # Everyone else -> Own notifications
        return Notification.objects.filter(
            recipient=user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user

        # Only Admin and Owner can create notifications
        if user.role not in [UserRole.ADMIN, UserRole.OWNER]:
            raise PermissionDenied(
                "You are not allowed to create notifications."
            )

        serializer.save(
            recipient=user
        )

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()

    @action(detail=True, methods=["post"], url_path="read")
    def mark_read(self, request, pk=None):
        notification = self.get_object()

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response({
            "message": "Notification marked as read."
        })

    @action(detail=False, methods=["post"], url_path="read-all")
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)

        return Response({
            "message": "All notifications marked as read."
        })