from decimal import Decimal

from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import viewsets

from .models import Coupon, DiscountType
from .serializers import CouponSerializer


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"])
    def validate(self, request):

        code = request.data.get("code", "").strip().upper()
        subtotal = Decimal(str(request.data.get("subtotal", 0)))

        try:
            coupon = Coupon.objects.get(
                code=code,
                is_active=True,
            )

        except Coupon.DoesNotExist:
            return Response(
                {
                    "message": "Invalid coupon."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()

        if now < coupon.valid_from:
            return Response(
                {
                    "message": "Coupon is not active yet."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if now > coupon.valid_until:
            return Response(
                {
                    "message": "Coupon has expired."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if subtotal < coupon.minimum_order_amount:
            return Response(
                {
                    "message": f"Minimum order amount is ₹{coupon.minimum_order_amount}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if coupon.used_count >= coupon.usage_limit:
            return Response(
                {
                    "message": "Coupon usage limit reached."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if coupon.discount_type == DiscountType.PERCENTAGE:

            discount = (
                subtotal * coupon.discount_value
            ) / Decimal("100")

            if (
                coupon.maximum_discount_amount
                and discount > coupon.maximum_discount_amount
            ):
                discount = coupon.maximum_discount_amount

        else:
            discount = coupon.discount_value

        return Response(
            {
                "code": coupon.code,
                "description": coupon.description,
                "discountAmount": float(discount),
            }
        )