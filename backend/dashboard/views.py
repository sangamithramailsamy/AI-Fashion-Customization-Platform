from django.db import models
from django.db.models import Sum, Avg
from django.utils import timezone
from django.db.models.functions import TruncMonth

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminOrOwner

from customers.models import CustomerProfile
from orders.models import Order
from payments.models import Payment
from reviews.models import Review
from catalog.models import Design
from employees.models import Employee
from inventory.models import Inventory
from production.models import Production


class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get(self, request):
        user = request.user

        # ---------------------------------------------------------
        # ORDERS
        # ---------------------------------------------------------

        if user.is_superuser:
            orders = Order.objects.all()
        else:
            orders = Order.objects.filter(owner=user)

        total_orders = orders.count()

        active_orders = orders.filter(
            status__in=[
                "PENDING",
                "IN_PROGRESS",
                "READY",
            ]
        ).count()

        completed_orders = orders.filter(
            status="DELIVERED"
        ).count()

        cancelled_orders = orders.filter(
            status="CANCELLED"
        ).count()

        # ---------------------------------------------------------
        # PAYMENTS
        # ---------------------------------------------------------

        payments = Payment.objects.filter(
            order__in=orders,
            status="SUCCESS",
        )

        total_revenue = (
            payments.aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        now = timezone.now()

        monthly_revenue = (
            payments.filter(
                payment_date__year=now.year,
                payment_date__month=now.month,
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        # ---------------------------------------------------------
        # PENDING PAYMENTS
        # ---------------------------------------------------------

        pending_payments = (
            orders.aggregate(
                total=Sum("balance_amount")
            )["total"]
            or 0
        )

        # ---------------------------------------------------------
        # CUSTOMERS
        # ---------------------------------------------------------

        if user.is_superuser:
            total_customers = CustomerProfile.objects.count()
        else:
            total_customers = (
                CustomerProfile.objects
                .filter(orders__owner=user)
                .distinct()
                .count()
            )

        # ---------------------------------------------------------
        # EMPLOYEES
        # ---------------------------------------------------------

        if user.is_superuser:
            total_employees = Employee.objects.count()
        else:
            total_employees = Employee.objects.filter(
                owner=user
            ).count()

        # ---------------------------------------------------------
        # INVENTORY
        # ---------------------------------------------------------

        if user.is_superuser:
            inventory = Inventory.objects.all()
        else:
            inventory = Inventory.objects.filter(
                boutique__owner=user
            )

        low_stock_count = inventory.filter(
            current_stock__lte=models.F("minimum_stock")
        ).count()

        # ---------------------------------------------------------
        # PRODUCTION
        # ---------------------------------------------------------

        production = Production.objects.filter(
            order__in=orders
        )

        pending_production = production.exclude(
            status__in=[
                "DELIVERED",
                "COMPLETED",
            ]
        ).count()

        # ---------------------------------------------------------
        # PRODUCTS
        # ---------------------------------------------------------

        total_products = Design.objects.filter(
            is_active=True
        ).count()

        # ---------------------------------------------------------
        # REVIEWS
        # ---------------------------------------------------------

        reviews = Review.objects.filter(
            order__in=orders
        )

        total_reviews = reviews.count()

        average_rating = (
            reviews.aggregate(
                avg=Avg("rating")
            )["avg"]
            or 0
        )

        # ---------------------------------------------------------
        # NOTIFICATIONS
        # ---------------------------------------------------------

        total_notifications = request.user.notifications.count()

        unread_notifications = request.user.notifications.filter(
            is_read=False
        ).count()

        # ---------------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------------

        data = {
            "totalRevenue": float(total_revenue),
            "monthlyRevenue": float(monthly_revenue),

            "totalOrders": total_orders,
            "pendingOrders": orders.filter(
                status="PENDING"
            ).count(),

            "completedOrders": completed_orders,

            "totalCustomers": total_customers,
            "totalEmployees": total_employees,

            "lowStockCount": low_stock_count,

            "pendingProduction": pending_production,

            "pendingPayments": float(pending_payments),

            "totalProducts": total_products,

            "totalReviews": total_reviews,

            "totalNotifications": total_notifications,

            "unreadNotifications": unread_notifications,

            "activeOrders": active_orders,
            "deliveredOrders": completed_orders,
            "cancelledOrders": cancelled_orders,

            "averageRating": float(average_rating),
        }

        return Response(data)