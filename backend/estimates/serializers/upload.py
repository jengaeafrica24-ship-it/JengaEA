import os
from rest_framework import serializers
from decimal import Decimal
from django.core.exceptions import ValidationError

from ..models import Estimate
from projects.models import ProjectType, Location
from ..services.file_processor import validate_file, handle_uploaded_file
from ..tasks import process_building_plan


class EstimateUploadSerializer(serializers.Serializer):
    """Serializer for handling estimate creation with file upload."""
    
    project_name = serializers.CharField(max_length=200)
    project_type = serializers.PrimaryKeyRelatedField(queryset=ProjectType.objects.all())
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    building_type = serializers.ChoiceField(choices=Estimate.BUILDING_TYPE_CHOICES)
    construction_type = serializers.ChoiceField(choices=Estimate.PROJECT_TYPE_CHOICES, default='new_construction')
    data_period = serializers.ChoiceField(choices=Estimate.DATA_PERIOD_CHOICES, default='Q1')
    project_description = serializers.CharField(max_length=150)
    total_area = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[lambda x: x if x > 0 else ValidationError('Total area must be greater than 0')]
    )
    contingency_percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('10.00')
    )
    building_plan = serializers.FileField(required=False)

    def validate_building_plan(self, value):
        if value:
            is_valid, error_msg = validate_file(value)
            if not is_valid:
                raise ValidationError(error_msg)
        return value

    def create(self, validated_data):
        # Get user from context
        user = self.context['request'].user
        
        # Handle file upload first if present
        building_plan = validated_data.pop('building_plan', None)
        
        # Create estimate instance
        estimate = Estimate.objects.create(
            user=user,
            source='upload' if building_plan else 'manual',
            **validated_data
        )
        
        # Handle file storage if present
        if building_plan:
            try:
                # Store original filename
                estimate.original_filename = building_plan.name
                
                # Process and store the file
                file_path = handle_uploaded_file(building_plan, estimate.id)
                if file_path:
                    estimate.file_path = file_path
                    estimate.status = 'processing'  # Set status for async processing
                    estimate.save()
                    
                    # Trigger async processing task
                    process_building_plan.delay(estimate.id)
                else:
                    estimate.status = 'error'
                    estimate.processing_error = 'Failed to process file'
                    estimate.save()
            
            except Exception as e:
                estimate.status = 'error'
                estimate.processing_error = str(e)
                estimate.save()
        
        return estimate