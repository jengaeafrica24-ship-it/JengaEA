from rest_framework import serializers
from .models import Report, ReportTemplate, ReportShare
from estimates.serializers import EstimateSerializer


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for report templates"""
    
    class Meta:
        model = ReportTemplate
        fields = (
            'id', 'name', 'description', 'template_type', 'format',
            'header_template', 'body_template', 'footer_template', 'styles', 'is_active'
        )


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for reports"""
    
    estimate_data = EstimateSerializer(source='estimate', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Report
        fields = (
            'id', 'user', 'user_name', 'estimate', 'estimate_data', 'report_type',
            'format', 'title', 'description', 'file_path', 'file_size',
            'download_count', 'is_public', 'share_token', 'generated_at', 'expires_at'
        )
        read_only_fields = ('download_count', 'generated_at', 'file_size')


class ReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reports"""
    
    class Meta:
        model = Report
        fields = (
            'estimate', 'report_type', 'format', 'title', 'description',
            'is_public'
        )


class ReportShareSerializer(serializers.ModelSerializer):
    """Serializer for report shares"""
    
    report_title = serializers.CharField(source='report.title', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ReportShare
        fields = (
            'id', 'report', 'report_title', 'shared_with_email', 'shared_with_name',
            'access_token', 'is_active', 'expires_at', 'created_by_name', 'created_at'
        )
        read_only_fields = ('access_token', 'created_at')


class ReportGenerationSerializer(serializers.Serializer):
    """Serializer for report generation requests"""
    
    estimate_id = serializers.IntegerField()
    report_type = serializers.ChoiceField(choices=Report.REPORT_TYPES)
    format = serializers.ChoiceField(choices=Report.FORMAT_CHOICES)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    template_id = serializers.IntegerField(required=False)
    include_logo = serializers.BooleanField(default=True)
    include_company_details = serializers.BooleanField(default=True)
    custom_styling = serializers.JSONField(required=False)



