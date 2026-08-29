from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    custom_design_details = serializers.SerializerMethodField()

    class Meta:
        model = Notification

        fields = [
            "id",
            "recipient",
            "order",
            "custom_design",
            "custom_design_details",
            "title",
            "message",
            "notification_type",
            "is_read",
            "created_at",
        ]

        read_only_fields = (
            "recipient",
            "created_at",
            "custom_design_details",
        )

    def get_custom_design_details(self, obj):
        custom_design = obj.custom_design

        if not custom_design:
            return None

        request = self.context.get("request")

        image_url = None

        if custom_design.inspiration_image:
            if request:
                image_url = request.build_absolute_uri(
                    custom_design.inspiration_image.url
                )
            else:
                image_url = custom_design.inspiration_image.url

        return {
            "id": custom_design.id,
            "customer": custom_design.customer.id,
            "customer_name": custom_design.customer.user.get_full_name(),
            "occasion": custom_design.occasion,
            "description": custom_design.description,
            "colors": custom_design.colors,
            "fabric": custom_design.fabric,
            "silhouette": custom_design.silhouette,
            "inspiration_image": image_url,
            "status": custom_design.status,
            "created_at": custom_design.created_at,
            "updated_at": custom_design.updated_at,
        }