import razorpay

from django.conf import settings

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Payment
from .serializers import PaymentSerializer,RazorpayOrderSerializer,RazorpayVerifySerializer
from .permissions import IsPaymentAccessible

from orders.models import Order
from users.models import UserRole


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [
        IsAuthenticated,
        IsPaymentAccessible,
    ]

    def get_queryset(self):
        user = self.request.user

        # Admin
        if user.is_superuser or user.role == UserRole.ADMIN:
            return (
                Payment.objects
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                    "created_by",
                )
            )

        # Boutique Owner
        elif user.role == UserRole.OWNER:
            return (
                Payment.objects
                .filter(
                    order__owner=user
                )
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                    "created_by",
                )
            )

        # Tailor
        elif user.role == UserRole.TAILOR:
            return (
                Payment.objects
                .filter(
                    order__employee__user=user
                )
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                    "created_by",
                )
            )

        # Customer
        elif user.role == UserRole.CUSTOMER:
            return (
                Payment.objects
                .filter(
                    order__customer__user=user
                )
                .select_related(
                    "order",
                    "order__customer",
                    "order__employee",
                    "order__boutique",
                    "created_by",
                )
            )

        return Payment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user

        # Tailors cannot manually create payments
        if user.role == UserRole.TAILOR:
            raise PermissionDenied(
                "Tailors cannot record payments."
            )

        # Customers cannot manually create payments.
        # Customer online payments will use the dedicated
        # Razorpay payment endpoints.
        if user.role == UserRole.CUSTOMER:
            raise PermissionDenied(
                "Customers cannot manually record payments."
            )

        # Manual payments recorded by trusted Admin/Owner
        # are treated as completed payments.
        serializer.save(
            created_by=user,
            status="SUCCESS",
        )

    def perform_update(self, serializer):
        user = self.request.user

        # Tailors and customers cannot modify payment records
        if user.role in [
            UserRole.TAILOR,
            UserRole.CUSTOMER,
        ]:
            raise PermissionDenied(
                "You are not allowed to update payments."
            )

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        # Tailors and customers cannot delete payment records
        if user.role in [
            UserRole.TAILOR,
            UserRole.CUSTOMER,
        ]:
            raise PermissionDenied(
                "You are not allowed to delete payments."
            )

        instance.delete()

    def get_accessible_order(self, order_id):
        user = self.request.user

        # Admin can access any order
        if user.is_superuser or user.role == UserRole.ADMIN:
            return Order.objects.get(pk=order_id)

        # Boutique owner can access only their own orders
        if user.role == UserRole.OWNER:
            return Order.objects.get(
                pk=order_id,
                owner=user,
            )

        # Customer can access only their own orders
        if user.role == UserRole.CUSTOMER:
            return Order.objects.get(
                pk=order_id,
                customer__user=user,
            )

        # Other roles cannot initiate online payments
        raise Order.DoesNotExist

    @action(
            detail=False,
            methods=["post"],
            url_path="create-razorpay-order",
            serializer_class=RazorpayOrderSerializer,
    )
    def create_razorpay_order(self, request):
        serializer = RazorpayOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data["order_id"]
        amount = serializer.validated_data["amount"]
        payment_type = serializer.validated_data["payment_type"]

        # Get the order from the orders visible to this user
        try:
            order = self.get_accessible_order(order_id)
        except Order.DoesNotExist:
            return Response(
                {
                    "detail": "Order not found or you do not have permission to pay for this order."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Do not allow payment for cancelled orders
        if order.status == "CANCELLED":
            return Response(
                {
                    "detail": "Payment cannot be made for a cancelled order."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Calculate already successful payments
        successful_paid = sum(
            (
                payment.amount
                for payment in order.payments.filter(status="SUCCESS")
            ),
            start=0,
        )

        remaining_balance = order.total_amount - successful_paid

        # Prevent paying more than the remaining balance
        if amount > remaining_balance:
            return Response(
                {
                    "detail": "Payment amount exceeds the remaining balance."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Razorpay expects the amount in paise
        amount_in_paise = int(amount * 100)

        try:
            razorpay_client = razorpay.Client(
                auth=(
                    settings.RAZORPAY_KEY_ID,
                    settings.RAZORPAY_KEY_SECRET,
                )
            )

            razorpay_order = razorpay_client.order.create(
                {
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "payment_capture": 1,
                }
            )

        except Exception as e:
            print("========== RAZORPAY ORDER ERROR ==========")
            print("ERROR:", repr(e))
            print("KEY ID:", settings.RAZORPAY_KEY_ID)
            print("AMOUNT:", amount_in_paise)
            print("==========================================")

            return Response(
                {
                    "detail": "Unable to create Razorpay order.",
                    "error": str(e),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Create local payment record.
        # It is NOT successful yet.
        payment = Payment.objects.create(
            order=order,
            payment_method="UPI",
            amount=amount,
            payment_type=payment_type,
            status="CREATED",
            gateway="RAZORPAY",
            gateway_order_id=razorpay_order["id"],
            created_by=request.user,
        )

        return Response(
            {
                "payment_id": payment.id,
                "payment_number": payment.payment_number,
                "razorpay_order_id": razorpay_order["id"],
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                "amount": razorpay_order["amount"],
                "currency": razorpay_order["currency"],
                "payment_type": payment.payment_type,
                "status": payment.status,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="verify-razorpay-payment",
        serializer_class=RazorpayVerifySerializer,
    )
    def verify_razorpay_payment(self, request):
        serializer = RazorpayVerifySerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        razorpay_order_id = serializer.validated_data[
            "razorpay_order_id"
        ]
        razorpay_payment_id = serializer.validated_data[
            "razorpay_payment_id"
        ]
        razorpay_signature = serializer.validated_data[
            "razorpay_signature"
        ]

        try:
            payment = Payment.objects.select_related(
                "order",
                "order__customer",
            ).get(
                gateway_order_id=razorpay_order_id
            )

        except Payment.DoesNotExist:
            return Response(
                {
                    "detail": "Payment record not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user

        # Customer can verify only their own payment
        if user.role == UserRole.CUSTOMER:
            if (
                not payment.order.customer
                or payment.order.customer.user != user
            ):
                raise PermissionDenied(
                    "You are not allowed to verify this payment."
                )

        # Prevent processing an already successful payment again
        if payment.status == "SUCCESS":
            return Response(
                {
                    "message": "Payment already verified.",
                    "payment_number": payment.payment_number,
                    "status": payment.status,
                },
                status=status.HTTP_200_OK,
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        try:
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )

        except razorpay.errors.SignatureVerificationError:
            payment.status = "FAILED"
            payment.save()

            return Response(
                {
                    "detail": "Payment verification failed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Razorpay signature is valid
        payment.gateway_payment_id = razorpay_payment_id
        payment.reference_number = razorpay_payment_id
        payment.status = "SUCCESS"

        payment.save()

        # Payment.save() recalculates the order balance
        payment.order.refresh_from_db()

        return Response(
            {
                "message": "Payment verified successfully.",
                "payment_id": payment.id,
                "payment_number": payment.payment_number,
                "transaction_id": payment.gateway_payment_id,
                "amount_paid": str(payment.amount),
                "payment_type": payment.payment_type,
                "status": payment.status,
                "order_number": payment.order.order_number,
                "total_order_amount": str(
                    payment.order.total_amount
                ),
                "advance_paid": str(
                    payment.order.advance_paid
                ),
                "remaining_balance": str(
                    payment.order.balance_amount
                ),
            },
            status=status.HTTP_200_OK,
        )

        

        