from rest_framework import serializers

from .models import Boutique


class BoutiqueSerializer(serializers.ModelSerializer):

    id = serializers.CharField(read_only=True)

    name = serializers.CharField(
        source="boutique_name"
    )

    owner = serializers.SerializerMethodField()

    line1 = serializers.CharField(
        source="address_line_1"
    )

    line2 = serializers.CharField(
        source="address_line_2",
        required=False,
        allow_blank=True
    )

    openingTime = serializers.SerializerMethodField()
    closingTime = serializers.SerializerMethodField()

    active = serializers.SerializerMethodField()

    logo = serializers.ImageField(
        required=False,
        allow_null=True     
    )

    class Meta:
        model = Boutique

        fields = [
            "id",
            "name",
            "owner",
            "phone",
            "email",
            "line1",
            "line2",
            "city",
            "state",
            "country",
            "pincode",
            "description",
            "gst_number",
            "openingTime",
            "closingTime",
            "active",
            "logo",
        ]

        read_only_fields = [
            "id",
            "owner",
            "openingTime",
            "closingTime",
            "active",
        ]

    def get_owner(self, obj):
        if obj.owner:
            return (
                obj.owner.get_full_name()
                or obj.owner.email
            )

        return ""

    def get_openingTime(self, obj):
        if not obj.working_hours:
            return ""

        if "-" in obj.working_hours:
            return obj.working_hours.split("-", 1)[0].strip()

        return obj.working_hours.strip()

    def get_closingTime(self, obj):
        if not obj.working_hours:
            return ""

        if "-" in obj.working_hours:
            return obj.working_hours.split("-", 1)[1].strip()

        return ""

    def get_active(self, obj):
        return obj.status == "ACTIVE"

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        if instance.logo:
            request = self.context.get("request")

            if request:
                representation["logo"] = request.build_absolute_uri(
                    instance.logo.url
                )
            else:
                representation["logo"] = instance.logo.url
        else:
            representation["logo"] = None

        return representation


    def update(self, instance, validated_data):

        instance.boutique_name = validated_data.get(
            "boutique_name",
            instance.boutique_name
        )

        instance.phone = validated_data.get(
            "phone",
            instance.phone
        )

        instance.email = validated_data.get(
            "email",
            instance.email
        )

        instance.address_line_1 = validated_data.get(
            "address_line_1",
            instance.address_line_1
        )

        instance.address_line_2 = validated_data.get(
            "address_line_2",
            instance.address_line_2
        )

        instance.city = validated_data.get(
            "city",
            instance.city
        )

        instance.state = validated_data.get(
            "state",
            instance.state
        )

        instance.country = validated_data.get(
            "country",
            instance.country
        )

        instance.pincode = validated_data.get(
            "pincode",
            instance.pincode
        )

        instance.description = validated_data.get(
            "description",
            instance.description
        )

        instance.gst_number = validated_data.get(
            "gst_number",
            instance.gst_number
        )

        if "logo" in validated_data:
            instance.logo = validated_data["logo"]

        instance.save()

        return instance