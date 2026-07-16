from .models import Notification


def create_notification(
    recipient,
    title,
    message,
    notification_type,
    order=None,
):
    return Notification.objects.create(
        recipient=recipient,
        order=order,
        title=title,
        message=message,
        notification_type=notification_type,
    )