from django.urls import path
from .views import (
    ReportListView, ReportDetailView, ReportTemplateListView,
    generate_report, download_report, share_report, shared_report
)

urlpatterns = [
    # Reports
    path('', ReportListView.as_view(), name='report_list'),
    path('templates/', ReportTemplateListView.as_view(), name='report_templates'),
    path('<int:pk>/', ReportDetailView.as_view(), name='report_detail'),
    path('<int:report_id>/download/', download_report, name='download_report'),
    path('<int:report_id>/share/', share_report, name='share_report'),
    
    # Report generation
    path('generate/', generate_report, name='generate_report'),
    
    # Shared reports
    path('shared/<str:access_token>/', shared_report, name='shared_report'),
]



