from rest_framework import serializers
from .models import Estimate, EstimateItem, EstimateRevision, EstimateShare
from projects.serializers import ProjectTypeSerializer, LocationSerializer, ProjectTemplateSerializer
from accounts.serializers import UserProfileSerializer


class EstimateItemSerializer(serializers.ModelSerializer):
    """Serializer for estimate items"""
    
    class Meta:
        model = EstimateItem
        fields = ('id', 'category', 'name', 'description', 'quantity', 'unit', 'unit_price', 'total_price', 'notes')
        read_only_fields = ('total_price',)


class EstimateRevisionSerializer(serializers.ModelSerializer):
    """Serializer for estimate revisions"""
    
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = EstimateRevision
        fields = ('id', 'revision_number', 'changes_summary', 'previous_total_cost', 'new_total_cost', 'created_by_name', 'created_at')
        read_only_fields = ('created_at',)


class EstimateShareSerializer(serializers.ModelSerializer):
    """Serializer for estimate shares"""
    
    estimate_name = serializers.CharField(source='estimate.project_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = EstimateShare
        fields = ('id', 'estimate', 'estimate_name', 'shared_with_email', 'shared_with_name', 'access_token', 'is_active', 'expires_at', 'created_by_name', 'created_at')
        read_only_fields = ('access_token', 'created_at')


class EstimateSerializer(serializers.ModelSerializer):
    """Serializer for estimates"""
    
    project_type_data = ProjectTypeSerializer(source='project_type', read_only=True)
    location_data = LocationSerializer(source='location', read_only=True)
    project_template_data = ProjectTemplateSerializer(source='project_template', read_only=True)
    user_data = UserProfileSerializer(source='user', read_only=True)
    items = EstimateItemSerializer(many=True, read_only=True)
    revisions = EstimateRevisionSerializer(many=True, read_only=True)
    shares = EstimateShareSerializer(many=True, read_only=True)
    
    class Meta:
        model = Estimate
        fields = (
            'id', 'user', 'user_data', 'project_type', 'project_type_data', 'location', 'location_data',
            'project_template', 'project_template_data', 'project_name', 'project_description',
            'construction_type', 'building_type', 'data_period',
            'total_area', 'base_cost_per_sqm', 'location_multiplier', 'adjusted_cost_per_sqm',
            'total_estimated_cost', 'contingency_percentage', 'contingency_amount',
            'source', 'original_filename',
            'status', 'is_public', 'items', 'revisions', 'shares', 'created_at', 'updated_at'
        )
        read_only_fields = ('total_estimated_cost', 'adjusted_cost_per_sqm', 'contingency_amount', 'created_at', 'updated_at', 'source', 'original_filename')


class EstimateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating estimates"""
    
    items = EstimateItemSerializer(many=True, required=False)
    
    class Meta:
        model = Estimate
        fields = (
            'project_type', 'location', 'project_template', 'project_name', 'project_description',
            'total_area', 'base_cost_per_sqm', 'location_multiplier', 'contingency_percentage',
            'items', 'building_type', 'construction_type', 'data_period'
        )
        
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        estimate = Estimate.objects.create(**validated_data)
        
        for item_data in items_data:
            EstimateItem.objects.create(estimate=estimate, **item_data)
            
        return estimate


class EstimateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating estimates"""
    
    items = EstimateItemSerializer(many=True, required=False)
    
    class Meta:
        model = Estimate
        fields = (
            'project_name', 'project_description', 'total_area', 'location_multiplier',
            'contingency_percentage', 'status', 'is_public', 'items'
        )
        
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update estimate fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            # Delete existing items
            instance.items.all().delete()
            # Create new items
            for item_data in items_data:
                EstimateItem.objects.create(estimate=instance, **item_data)
                
        return instance


class EstimateSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for estimate summaries"""
    
    project_type_name = serializers.CharField(source='project_type.name', read_only=True)
    location_name = serializers.CharField(source='location.county_name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Estimate
        fields = (
            'id', 'project_name', 'project_type_name', 'location_name', 'user_name',
            'total_estimated_cost', 'status', 'created_at'
        )


class CostCalculationSerializer(serializers.Serializer):
    """Serializer for cost calculation requests"""
    
    project_type_id = serializers.IntegerField()
    location_id = serializers.IntegerField()
    total_area = serializers.DecimalField(max_digits=10, decimal_places=2)
    contingency_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    custom_items = EstimateItemSerializer(many=True, required=False)



