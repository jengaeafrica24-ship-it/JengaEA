from rest_framework import serializers
from .models import ExcelTemplate, GeneratedData

class ExcelTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExcelTemplate
        fields = ['id', 'name', 'file', 'description', 'created_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class GeneratedDataSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = GeneratedData
        fields = ['id', 'template', 'template_name', 'quota_period', 'year', 
                 'generated_file', 'created_by', 'created_at']
        read_only_fields = ['created_by', 'created_at']