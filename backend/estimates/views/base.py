from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
import uuid

from ..models import Estimate, EstimateItem, EstimateRevision, EstimateShare, AIEstimate
from ..serializers import (
    EstimateSerializer, EstimateCreateSerializer, EstimateUpdateSerializer,
    EstimateSummarySerializer, EstimateItemSerializer, EstimateRevisionSerializer,
    EstimateShareSerializer, CostCalculationSerializer
)
from projects.models import ProjectType, Location
from django.core.exceptions import ObjectDoesNotExist
from decimal import Decimal
from ..services.gemini_estimator import estimate_construction_cost
from ..tasks import create_gemini_estimate_task
from celery.result import AsyncResult
from django.conf import settings


class EstimateListView(generics.ListCreateAPIView):
    """List and create estimates"""
    
    serializer_class = EstimateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project_type', 'location', 'status']
    search_fields = ['project_name', 'project_description']
    ordering_fields = ['created_at', 'total_estimated_cost']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Estimate.objects.all()
        return Estimate.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EstimateCreateSerializer
        return EstimateSerializer
    
    def perform_create(self, serializer):
        """Ensure created estimates are associated with the requesting user."""
        serializer.save(user=self.request.user)


class EstimateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an estimate"""
    
    serializer_class = EstimateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Estimate.objects.all()
        return Estimate.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EstimateUpdateSerializer
        return EstimateSerializer
    
    def perform_update(self, serializer):
        instance = serializer.instance
        old_total = instance.total_estimated_cost
        
        # Save the updated estimate
        estimate = serializer.save()
        
        # Create revision if total cost changed
        if estimate.total_estimated_cost != old_total:
            revision_number = EstimateRevision.objects.filter(
                estimate=estimate
            ).count() + 1
            
            EstimateRevision.objects.create(
                estimate=estimate,
                revision_number=revision_number,
                changes_summary=f"Updated estimate - Total cost changed from ${old_total} to ${estimate.total_estimated_cost}",
                previous_total_cost=old_total,
                new_total_cost=estimate.total_estimated_cost,
                created_by=self.request.user
            )


class EstimateSummaryListView(generics.ListAPIView):
    """List estimates with summary information"""
    
    serializer_class = EstimateSummarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project_type', 'location', 'status']
    search_fields = ['project_name', 'project_description']
    ordering_fields = ['created_at', 'total_estimated_cost']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Estimate.objects.all()
        return Estimate.objects.filter(user=user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_cost(request):
    """Calculate cost estimate based on input parameters."""
    serializer = CostCalculationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    project_type = get_object_or_404(ProjectType, id=serializer.validated_data['project_type_id'])
    location = get_object_or_404(Location, id=serializer.validated_data['location_id'])
    
    total_area = serializer.validated_data['total_area']
    base_cost_per_sqm = project_type.base_cost_per_sqm
    location_multiplier = location.cost_multiplier
    contingency_percentage = serializer.validated_data.get('contingency_percentage', Decimal('10.00'))
    
    adjusted_cost_per_sqm = base_cost_per_sqm * location_multiplier
    subtotal = adjusted_cost_per_sqm * total_area
    contingency_amount = (subtotal * contingency_percentage / 100)
    total_estimated_cost = subtotal + contingency_amount
    
    return Response({
        'base_cost_per_sqm': base_cost_per_sqm,
        'location_multiplier': location_multiplier,
        'adjusted_cost_per_sqm': adjusted_cost_per_sqm,
        'subtotal': subtotal,
        'contingency_percentage': contingency_percentage,
        'contingency_amount': contingency_amount,
        'total_estimated_cost': total_estimated_cost
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_estimate(request):
    """Save a new estimate."""
    serializer = EstimateCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    estimate = serializer.save(user=request.user)
    return Response(EstimateSerializer(estimate).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def duplicate_estimate(request, estimate_id):
    """Create a copy of an existing estimate."""
    original = get_object_or_404(Estimate, id=estimate_id)
    
    # Check if user has access to the estimate
    if not request.user.is_staff and original.user != request.user:
        return Response(
            {'detail': 'You do not have permission to duplicate this estimate.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Create new estimate with copied fields
    new_estimate = Estimate.objects.create(
        user=request.user,
        project_type=original.project_type,
        location=original.location,
        project_name=f"Copy of {original.project_name}",
        project_description=original.project_description,
        building_type=original.building_type,
        construction_type=original.construction_type,
        data_period=original.data_period,
        total_area=original.total_area,
        base_cost_per_sqm=original.base_cost_per_sqm,
        location_multiplier=original.location_multiplier,
        adjusted_cost_per_sqm=original.adjusted_cost_per_sqm,
        total_estimated_cost=original.total_estimated_cost,
        contingency_percentage=original.contingency_percentage,
        contingency_amount=original.contingency_amount
    )
    
    # Copy estimate items
    for item in original.items.all():
        EstimateItem.objects.create(
            estimate=new_estimate,
            category=item.category,
            name=item.name,
            description=item.description,
            quantity=item.quantity,
            unit=item.unit,
            unit_price=item.unit_price,
            total_price=item.total_price,
            notes=item.notes
        )
    
    return Response(
        EstimateSerializer(new_estimate).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_estimate(request, estimate_id):
    """Generate a sharing link for an estimate."""
    estimate = get_object_or_404(Estimate, id=estimate_id)
    
    # Check if user has access to the estimate
    if not request.user.is_staff and estimate.user != request.user:
        return Response(
            {'detail': 'You do not have permission to share this estimate.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Create a new share token valid for 7 days by default
    access_token = str(uuid.uuid4())
    expires_at = timezone.now() + timedelta(days=7)
    
    share = EstimateShare.objects.create(
        estimate=estimate,
        access_token=access_token,
        expires_at=expires_at,
        created_by=request.user,
        shared_with_email=request.data.get('email', ''),
        shared_with_name=request.data.get('name', '')
    )
    
    return Response(EstimateShareSerializer(share).data)


@api_view(['GET'])
def shared_estimate(request, access_token):
    """Access a shared estimate."""
    share = get_object_or_404(EstimateShare, access_token=access_token, is_active=True)
    
    # Check if share has expired
    if timezone.now() > share.expires_at:
        share.is_active = False
        share.save()
        return Response(
            {'detail': 'This sharing link has expired.'},
            status=status.HTTP_410_GONE
        )
    
    return Response(EstimateSerializer(share.estimate).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estimate_statistics(request):
    """Get estimate statistics."""
    user = request.user
    base_queryset = Estimate.objects.filter(user=user)
    
    today = timezone.now()
    thirty_days_ago = today - timedelta(days=30)
    
    stats = {
        'total_estimates': base_queryset.count(),
        'recent_estimates': base_queryset.filter(created_at__gte=thirty_days_ago).count(),
        'total_value': base_queryset.aggregate(Sum('total_estimated_cost'))['total_estimated_cost__sum'] or 0,
        'by_type': {
            type_name: base_queryset.filter(building_type=type_code).count()
            for type_code, type_name in Estimate.BUILDING_TYPE_CHOICES
        },
        'by_status': {
            status_name: base_queryset.filter(status=status_code).count()
            for status_code, status_name in Estimate.STATUS_CHOICES
        }
    }
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_estimate_with_gemini(request):
    """Create an estimate using Google's Gemini Pro model."""
    try:
        # Validate input
        project_details = request.data
        estimate_result = estimate_construction_cost(project_details)
        
        return Response(estimate_result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_estimate_with_gemini_async(request):
    """Create an estimate using Google's Gemini Pro model asynchronously."""
    try:
        # Create task
        task = create_gemini_estimate_task.delay(request.user.id, request.data)
        
        return Response({
            'task_id': task.id,
            'status': 'Task created successfully'
        }, status=status.HTTP_202_ACCEPTED)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estimate_task_status(request, task_id):
    """Check the status of an async estimation task."""
    task_result = AsyncResult(task_id)
    
    if task_result.ready():
        result = task_result.get() if task_result.successful() else None
        error = str(task_result.result) if task_result.failed() else None
        
        response = {
            'status': 'completed' if task_result.successful() else 'failed',
            'result': result,
            'error': error
        }
    else:
        response = {
            'status': 'pending',
            'progress': 0  # TODO: Implement progress tracking
        }
    
    return Response(response)