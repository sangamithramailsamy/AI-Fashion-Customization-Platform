from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly

from .models import (
    Section,
    CollectionCategory,
    Design,
    DesignImage,
    DesignVariant,
)

from .serializers import (
    SectionSerializer,
    CollectionCategorySerializer,
    DesignSerializer,
    DesignImageSerializer,
    DesignVariantSerializer,
)

from .permissions import IsCatalogManager


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsCatalogManager,
    ]


class CollectionCategoryViewSet(viewsets.ModelViewSet):
    queryset = CollectionCategory.objects.select_related(
        "section"
    )
    serializer_class = CollectionCategorySerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsCatalogManager,
    ]


class DesignViewSet(viewsets.ModelViewSet):
    queryset = Design.objects.select_related(
        "category"
    ).prefetch_related(
        "images",
        "variants",
    )
    serializer_class = DesignSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsCatalogManager,
    ]


class DesignImageViewSet(viewsets.ModelViewSet):
    queryset = DesignImage.objects.select_related(
        "design"
    )
    serializer_class = DesignImageSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsCatalogManager,
    ]


class DesignVariantViewSet(viewsets.ModelViewSet):
    queryset = DesignVariant.objects.select_related(
        "design"
    )
    serializer_class = DesignVariantSerializer
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsCatalogManager,
    ]
