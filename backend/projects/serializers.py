from rest_framework import serializers
from .models import (
    ProjectType, MaterialCategory, Material, Location, MaterialPrice,
    LaborCategory, LaborPrice, ProjectTemplate
)


class LocationSerializer(serializers.ModelSerializer):
    """Serializer for locations"""
    
    class Meta:
        model = Location
        fields = ('id', 'county_code', 'county_name', 'region', 'major_towns', 
                 'latitude', 'longitude', 'cost_multiplier', 'is_active')


class MaterialCategorySerializer(serializers.ModelSerializer):
    """Serializer for material categories"""
    
    class Meta:
        model = MaterialCategory
        fields = ('id', 'name', 'description')


class MaterialSerializer(serializers.ModelSerializer):
    """Serializer for materials"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Material
        fields = ('id', 'name', 'category', 'category_name', 'unit', 'description')


class MaterialPriceSerializer(serializers.ModelSerializer):
    """Serializer for material prices"""
    
    material_name = serializers.CharField(source='material.name', read_only=True)
    location_name = serializers.CharField(source='location.county_name', read_only=True)
    
    class Meta:
        model = MaterialPrice
        fields = ('id', 'material', 'material_name', 'location', 'location_name', 'price', 'currency', 'last_updated')


class LaborCategorySerializer(serializers.ModelSerializer):
    """Serializer for labor categories"""
    
    class Meta:
        model = LaborCategory
        fields = ('id', 'name', 'description')


class LaborPriceSerializer(serializers.ModelSerializer):
    """Serializer for labor prices"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    location_name = serializers.CharField(source='location.county_name', read_only=True)
    
    class Meta:
        model = LaborPrice
        fields = ('id', 'category', 'category_name', 'location', 'location_name', 'daily_rate', 'currency', 'last_updated')


class ProjectTypeSerializer(serializers.ModelSerializer):
    """Serializer for project types"""
    
    class Meta:
        model = ProjectType
        fields = ('id', 'name', 'category', 'description', 'base_cost_per_sqm', 'is_active')


class ProjectTemplateSerializer(serializers.ModelSerializer):
    """Serializer for project templates"""
    
    project_type_name = serializers.CharField(source='project_type.name', read_only=True)
    
    class Meta:
        model = ProjectTemplate
        fields = ('id', 'project_type', 'project_type_name', 'name', 'description', 'total_area', 'specifications')


class ProjectFilterSerializer(serializers.Serializer):
    """Serializer for project filtering"""
    
    category = serializers.ChoiceField(
        choices=ProjectType.CATEGORY_CHOICES,
        required=False,
        allow_blank=True
    )
    location_id = serializers.IntegerField(required=False)
    min_budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    max_budget = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    search = serializers.CharField(required=False, allow_blank=True)



