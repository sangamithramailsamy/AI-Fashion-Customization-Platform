from datetime import timedelta

from django.db.models import Sum, Avg
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.permissions import IsAdminOrOwner
from customers.models import CustomerProfile
from orders.models import Order
from payments.models import Payment
from reviews.models import Review
from catalog.models import Design



class DashboardAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrOwner]
    
    def get(self, request):

        data = {

            "total_customers": CustomerProfile.objects.count(),

            "total_orders": Order.objects.count(),

            "pending_orders": Order.objects.filter(
                status="PENDING"
            ).count(),

            "in_progress_orders": Order.objects.filter(
                status="IN_PROGRESS"
            ).count(),

            "ready_orders": Order.objects.filter(
                status="READY"
            ).count(),

            "completed_orders": Order.objects.filter(
                status="DELIVERED"
            ).count(),

            "cancelled_orders": Order.objects.filter(
                status="CANCELLED"
            ).count(),

            "total_revenue": Payment.objects.aggregate(
                total=Sum("amount")
            )["total"] or 0,

            "revenue_last_30_days": Payment.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).aggregate(
                total=Sum("amount")
            )["total"] or 0,

            "orders_last_30_days": Order.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).count(),

            "total_reviews": Review.objects.count(),

            "average_rating": Review.objects.aggregate(
                avg=Avg("rating")
            )["avg"] or 0,

            "total_designs": Design.objects.count(),

            "unread_notifications": request.user.notifications.filter(
                is_read=False
            ).count(),
        }

        top_designs = Review.objects.values(
            "design__name"
        ).annotate(
            average=Avg("rating")
        ).order_by("-average")[:5]

        data["top_rated_designs"] = list(top_designs)

        return Response(data)