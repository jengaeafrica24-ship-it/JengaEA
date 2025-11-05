from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import (
    ProjectType, MaterialCategory, Material, Location, MaterialPrice,
    LaborCategory, LaborPrice, ProjectTemplate
)
from .serializers import (
    ProjectTypeSerializer, MaterialCategorySerializer, MaterialSerializer,
    LocationSerializer, MaterialPriceSerializer, LaborCategorySerializer,
    LaborPriceSerializer, ProjectTemplateSerializer, ProjectFilterSerializer
)


class ProjectTypeListView(generics.ListAPIView):
    """List all project types with filtering"""
    
    queryset = ProjectType.objects.filter(is_active=True)
    serializer_class = ProjectTypeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'base_cost_per_sqm']
    ordering = ['category', 'name']


class ProjectTemplateListView(generics.ListAPIView):
    """List project templates"""
    
    queryset = ProjectTemplate.objects.filter(is_active=True)
    serializer_class = ProjectTemplateSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['project_type']
    search_fields = ['name', 'description']


class MaterialCategoryListView(generics.ListAPIView):
    """List all material categories"""
    
    queryset = MaterialCategory.objects.filter(is_active=True)
    serializer_class = MaterialCategorySerializer
    ordering = ['name']


class MaterialListView(generics.ListAPIView):
    """List materials with filtering"""
    
    queryset = Material.objects.filter(is_active=True)
    serializer_class = MaterialSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering = ['category__name', 'name']


class LocationListView(generics.ListAPIView):
    """List all locations"""
    
    queryset = Location.objects.filter(is_active=True)
    serializer_class = LocationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['region']
    search_fields = ['county_name', 'region', 'major_towns']
    ordering_fields = ['county_name', 'region']
    ordering = ['county_code']


class MaterialPriceListView(generics.ListAPIView):
    """List material prices with filtering"""
    
    queryset = MaterialPrice.objects.filter(is_active=True)
    serializer_class = MaterialPriceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['material', 'location', 'currency']
    search_fields = ['material__name', 'location__city']
    ordering = ['material__category__name', 'material__name']


class LaborCategoryListView(generics.ListAPIView):
    """List all labor categories"""
    
    queryset = LaborCategory.objects.filter(is_active=True)
    serializer_class = LaborCategorySerializer
    ordering = ['name']


class LaborPriceListView(generics.ListAPIView):
    """List labor prices with filtering"""
    
    queryset = LaborPrice.objects.filter(is_active=True)
    serializer_class = LaborPriceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'location', 'currency']
    search_fields = ['category__name', 'location__city']
    ordering = ['category__name']


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_filter_options(request):
    """Get filter options for projects"""
    
    return Response({
        'categories': ProjectType.CATEGORY_CHOICES,
        'countries': Location.COUNTRY_CHOICES,
        'locations': LocationSerializer(
            Location.objects.filter(is_active=True).order_by('country', 'region', 'city'),
            many=True
        ).data,
        'material_categories': MaterialCategorySerializer(
            MaterialCategory.objects.filter(is_active=True),
            many=True
        ).data,
        'labor_categories': LaborCategorySerializer(
            LaborCategory.objects.filter(is_active=True),
            many=True
        ).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_projects(request):
    """Advanced project search with multiple filters"""
    
    serializer = ProjectFilterSerializer(data=request.query_params)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    queryset = ProjectType.objects.filter(is_active=True)
    
    # Apply filters
    if serializer.validated_data.get('category'):
        queryset = queryset.filter(category=serializer.validated_data['category'])
    
    if serializer.validated_data.get('search'):
        search_term = serializer.validated_data['search']
        queryset = queryset.filter(
            Q(name__icontains=search_term) | Q(description__icontains=search_term)
        )
    
    # Budget filtering would require additional calculation
    # For now, we'll skip budget filtering or implement it in the frontend
    
    project_serializer = ProjectTypeSerializer(queryset, many=True)
    
    return Response({
        'projects': project_serializer.data,
        'total_count': queryset.count()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def location_details(request, location_id):
    """Get detailed information about a specific location"""
    
    try:
        location = Location.objects.get(id=location_id, is_active=True)
        
        # Get material prices for this location
        material_prices = MaterialPrice.objects.filter(
            location=location, is_active=True
        ).select_related('material', 'material__category')
        
        # Get labor prices for this location
        labor_prices = LaborPrice.objects.filter(
            location=location, is_active=True
        ).select_related('category')
        
        return Response({
            'location': LocationSerializer(location).data,
            'material_prices': MaterialPriceSerializer(material_prices, many=True).data,
            'labor_prices': LaborPriceSerializer(labor_prices, many=True).data,
            'cost_multiplier': location.cost_multiplier
        })
        
    except Location.DoesNotExist:
        return Response(
            {'error': 'Location not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_cost_breakdown(request, project_type_id):
    """Get cost breakdown for a specific project type"""
    
    try:
        project_type = ProjectType.objects.get(id=project_type_id, is_active=True)
        location_id = request.query_params.get('location_id')
        
        # Base cost calculation
        base_cost = project_type.base_cost_per_sqm
        
        # Apply location multiplier if location is specified
        if location_id:
            try:
                location = Location.objects.get(id=location_id, is_active=True)
                adjusted_cost = base_cost * location.cost_multiplier
            except Location.DoesNotExist:
                adjusted_cost = base_cost
        else:
            adjusted_cost = base_cost
        
        return Response({
            'project_type': ProjectTypeSerializer(project_type).data,
            'base_cost_per_sqm': base_cost,
            'adjusted_cost_per_sqm': adjusted_cost,
            'location_multiplier': location.cost_multiplier if location_id else 1.00
        })
        
    except ProjectType.DoesNotExist:
        return Response(
            {'error': 'Project type not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )



