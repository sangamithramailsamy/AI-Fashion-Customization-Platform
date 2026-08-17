from rest_framework import filters, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated

from .models import Section, CollectionCategory, Design, DesignImage, DesignVariant
from .serializers import (
    SectionSerializer,
    CollectionCategorySerializer,
    DesignSerializer,
    DesignImageSerializer,
    DesignVariantSerializer,
    OwnerProductSerializer,
)
from .permissions import IsCatalogManager


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [IsCatalogManager]

    def get_queryset(self):
        qs = Section.objects.all()
        if self.request.method in ["GET", "HEAD", "OPTIONS"]:
            return qs.filter(is_active=True)
        return qs


class CollectionCategoryViewSet(viewsets.ModelViewSet):
    queryset = CollectionCategory.objects.select_related("section")
    serializer_class = CollectionCategorySerializer
    permission_classes = [IsCatalogManager]

    def get_queryset(self):
        qs = CollectionCategory.objects.select_related("section")
        if self.request.method in ["GET", "HEAD", "OPTIONS"]:
            qs = qs.filter(is_active=True, section__is_active=True)
        section = self.request.query_params.get("section")
        if section:
            if section.isdigit():
                qs = qs.filter(section_id=int(section))
            else:
                qs = qs.filter(section__slug=section)
        return qs


class DesignViewSet(viewsets.ModelViewSet):
    serializer_class = DesignSerializer
    permission_classes = [IsCatalogManager]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "base_price", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Design.objects.select_related(
            "section",
        ).prefetch_related("images","variants")

        # Public catalog must never expose inactive products.
        if self.request.method in ["GET", "HEAD", "OPTIONS"]:
            qs = qs.filter(
                is_active=True,
                section__is_active=True,
            )

        params = self.request.query_params

        collection = params.get("collection")

        if collection:
            qs = qs.filter(
                section__slug=collection
            )

        search = params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)

        new_arrival = params.get("new_arrival")
        if new_arrival in ["true", "1"]:
            qs = qs.filter(is_new_arrival=True)
        elif new_arrival in ["false", "0"]:
            qs = qs.filter(is_new_arrival=False)

        featured = params.get("featured")
        if featured in ["true", "1"]:
            qs = qs.filter(is_featured=True)
        elif featured in ["false", "0"]:
            qs = qs.filter(is_featured=False)

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class OwnerProductViewSet(viewsets.ModelViewSet):
    """Owner CRUD over the exact Design records displayed in the public shop."""

    queryset = Design.objects.select_related(
        "section",
    ).prefetch_related("variants")
    serializer_class = OwnerProductSerializer
    permission_classes = [IsAuthenticated, IsCatalogManager]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
    "name",
    "description",
    "section__name",
    ]
    ordering_fields = ["created_at", "base_price", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = self.queryset
        category = self.request.query_params.get("category")
        collection = self.request.query_params.get("collection")
        active = self.request.query_params.get("active")

        if collection:
            qs = qs.filter(
                section__slug=collection
            )
        if active in ["true", "1"]:
            qs = qs.filter(is_active=True)
        elif active in ["false", "0"]:
            qs = qs.filter(is_active=False)

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class DesignImageViewSet(viewsets.ModelViewSet):
    queryset = DesignImage.objects.select_related("design")
    serializer_class = DesignImageSerializer
    permission_classes = [IsCatalogManager]


class DesignVariantViewSet(viewsets.ModelViewSet):
    queryset = DesignVariant.objects.select_related("design")
    serializer_class = DesignVariantSerializer
    permission_classes = [IsCatalogManager]
