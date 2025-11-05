from django.urls import path
from .views import (
    ProjectTypeListView, ProjectTemplateListView, MaterialCategoryListView,
    MaterialListView, LocationListView, MaterialPriceListView,
    LaborCategoryListView, LaborPriceListView, project_filter_options,
    search_projects, location_details, project_cost_breakdown
)

urlpatterns = [
    # Project types and templates
    path('types/', ProjectTypeListView.as_view(), name='project_types'),
    path('templates/', ProjectTemplateListView.as_view(), name='project_templates'),
    path('types/<int:project_type_id>/breakdown/', project_cost_breakdown, name='project_cost_breakdown'),
    
    # Materials
    path('materials/categories/', MaterialCategoryListView.as_view(), name='material_categories'),
    path('materials/', MaterialListView.as_view(), name='materials'),
    path('materials/prices/', MaterialPriceListView.as_view(), name='material_prices'),
    
    # Labor
    path('labor/categories/', LaborCategoryListView.as_view(), name='labor_categories'),
    path('labor/prices/', LaborPriceListView.as_view(), name='labor_prices'),
    
    # Locations
    path('locations/', LocationListView.as_view(), name='locations'),
    path('locations/<int:location_id>/', location_details, name='location_details'),
    
    # Search and filtering
    path('filter-options/', project_filter_options, name='project_filter_options'),
    path('search/', search_projects, name='search_projects'),
]



