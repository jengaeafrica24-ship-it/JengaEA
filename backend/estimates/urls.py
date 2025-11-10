from django.urls import path
from .views import (
    EstimateListView, EstimateDetailView, EstimateSummaryListView,
    calculate_cost, save_estimate, duplicate_estimate, share_estimate,
    shared_estimate, estimate_statistics, create_estimate_with_gemini,
    create_estimate_with_gemini_async, estimate_task_status,
    generate_material_estimate
)
from .views.sharing import share_material_estimate
from .views.upload import EstimateUploadView
from .views.labor import generate_labor_estimate

urlpatterns = [
    # Estimate CRUD
    path('', EstimateListView.as_view(), name='estimate_list'),
    path('summaries/', EstimateSummaryListView.as_view(), name='estimate_summaries'),
    path('<int:pk>/', EstimateDetailView.as_view(), name='estimate_detail'),
    
    # Estimate operations
    path('calculate/', calculate_cost, name='calculate_cost'),
    path('save/', save_estimate, name='save_estimate'),
    path('create-with-gemini/', create_estimate_with_gemini, name='create_estimate_with_gemini'),
    path('share/', share_material_estimate, name='share_material_estimate'),
    path('create-with-gemini-async/', create_estimate_with_gemini_async, name='create_estimate_with_gemini_async'),
    path('materials/generate/', generate_material_estimate, name='generate_material_estimate'),
    path('tasks/<str:task_id>/', estimate_task_status, name='estimate_task_status'),
    path('<int:estimate_id>/duplicate/', duplicate_estimate, name='duplicate_estimate'),
    path('<int:estimate_id>/share/', share_estimate, name='share_estimate'),
    path('upload/', EstimateUploadView.as_view(), name='estimate_upload'),
    
    # Shared estimates
    path('shared/<str:access_token>/', shared_estimate, name='shared_estimate'),
    
    # Statistics
    path('statistics/', estimate_statistics, name='estimate_statistics'),
    
    # Labor estimate
    path('labor/generate/', generate_labor_estimate, name='generate_labor_estimate'),
]



