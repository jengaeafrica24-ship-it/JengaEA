from django.contrib import admin
from .models import (
    ProjectType, MaterialCategory, Material, Location,
    MaterialPrice, LaborCategory, LaborPrice, ProjectTemplate
)


@admin.register(ProjectType)
class ProjectTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'base_cost_per_sqm', 'is_active', 'created_at']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'description']


@admin.register(MaterialCategory)
class MaterialCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active']
    search_fields = ['name']


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'unit', 'is_active']
    list_filter = ['category', 'unit', 'is_active']
    search_fields = ['name', 'description']


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['county_code', 'county_name', 'region', 'cost_multiplier', 'is_active']
    list_filter = ['region', 'is_active']
    search_fields = ['county_name', 'county_code', 'major_towns']
    ordering = ['county_code']


@admin.register(MaterialPrice)
class MaterialPriceAdmin(admin.ModelAdmin):
    list_display = ['material', 'location', 'price', 'currency', 'last_updated', 'is_active']
    list_filter = ['location', 'is_active', 'currency']
    search_fields = ['material__name', 'location__county_name']
    date_hierarchy = 'last_updated'


@admin.register(LaborCategory)
class LaborCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'skill_level', 'is_active']
    list_filter = ['skill_level', 'is_active']
    search_fields = ['name', 'description']


@admin.register(LaborPrice)
class LaborPriceAdmin(admin.ModelAdmin):
    list_display = ['category', 'location', 'daily_rate', 'currency', 'last_updated', 'is_active']
    list_filter = ['location', 'is_active', 'currency']
    search_fields = ['category__name', 'location__county_name']
    date_hierarchy = 'last_updated'


@admin.register(ProjectTemplate)
class ProjectTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'project_type', 'total_area', 'estimated_duration_days', 'is_active', 'created_at']
    list_filter = ['project_type', 'is_active']
    search_fields = ['name', 'description']
    date_hierarchy = 'created_at'