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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_project_summary(request):
    """Return aggregated project summary (materials, labor, totals) for the user.

    Query params:
    - timeframe: week | month | quarter | year (default: month)
    """
    from ..models import LaborEstimate
    
    timeframe = request.GET.get('timeframe', 'month')
    now = timezone.now()

    if timeframe == 'week':
        start = now - timedelta(weeks=1)
    elif timeframe == 'quarter':
        start = now - timedelta(days=90)
    elif timeframe == 'year':
        start = now - timedelta(days=365)
    else:
        # default to month
        start = now - timedelta(days=30)

    # Filter estimates for the user within timeframe
    estimates_qs = Estimate.objects.filter(user=request.user, created_at__gte=start)

    # Aggregate material totals from EstimateItem
    material_items_total = EstimateItem.objects.filter(
        estimate__in=estimates_qs,
        category='material'
    ).aggregate(total=Sum('total_price'))['total'] or 0

    # Aggregate material totals from AIEstimate (from materials_breakdown JSON)
    material_ai_total = 0
    ai_estimates = AIEstimate.objects.filter(estimate__in=estimates_qs)
    for ai_est in ai_estimates:
        if ai_est.materials_breakdown:
            for material in ai_est.materials_breakdown:
                material_ai_total += float(material.get('totalCost', 0))

    # Sum both sources (items table + AI estimates) - convert all to float
    material_total = float(material_items_total or 0) + float(material_ai_total or 0)

    # Aggregate labor totals from LaborEstimate if available
    labor_ai_total = LaborEstimate.objects.filter(estimate__in=estimates_qs).aggregate(total=Sum('total_cost'))['total'] or 0

    # Fallback labor totals from EstimateItem
    labor_items_total = EstimateItem.objects.filter(
        estimate__in=estimates_qs,
        category='labor'
    ).aggregate(total=Sum('total_price'))['total'] or 0

    # Prefer AI labor totals when present, otherwise use item totals (sum both to be safe) - convert to float
    labor_total = float(labor_ai_total or 0) + float(labor_items_total or 0)

    # Equipment and other categories - convert to float
    equipment_total = float(EstimateItem.objects.filter(
        estimate__in=estimates_qs,
        category='equipment'
    ).aggregate(total=Sum('total_price'))['total'] or 0)

    others_total = float(EstimateItem.objects.filter(
        estimate__in=estimates_qs
    ).exclude(category__in=['material', 'labor', 'equipment']).aggregate(total=Sum('total_price'))['total'] or 0)

    total_cost = material_total + labor_total + equipment_total + others_total

    # Build a simple cost breakdown with percentages and colors
    def pct(value):
        try:
            return round((value / total_cost) * 100, 1) if total_cost > 0 else 0
        except Exception:
            return 0

    cost_breakdown = {
        'Materials': {
            'percentage': pct(material_total),
            'color': 'bg-green-400'
        },
        'Labor': {
            'percentage': pct(labor_total),
            'color': 'bg-blue-400'
        },
        'Equipment': {
            'percentage': pct(equipment_total),
            'color': 'bg-yellow-400'
        },
        'Other': {
            'percentage': pct(others_total),
            'color': 'bg-purple-400'
        }
    }

    # Basic project health heuristics
    project_health = {
        'Budget Status': {
            'value': f"KES {total_cost:,.0f}",
            'status': 'good' if total_cost < 1_000_000 else ('warning' if total_cost < 5_000_000 else 'high')
        },
        'Material Allocation': {
            'value': f"{pct(material_total)}%",
            'status': 'good' if pct(material_total) > 40 and pct(material_total) < 70 else 'warning'
        },
        'Labor Allocation': {
            'value': f"{pct(labor_total)}%",
            'status': 'good' if pct(labor_total) > 20 and pct(labor_total) < 50 else 'warning'
        }
    }

    recommendations = {
        'costOptimization': [],
        'timelineManagement': []
    }

    if material_total > 0:
        recommendations['costOptimization'].append('Review high-cost material line items for alternative suppliers or bulk discounts')
    if labor_total > 0:
        recommendations['costOptimization'].append('Consider optimizing crew sizes or duration to reduce labor overhead')

    response = {
        'totalCost': float(total_cost or 0),
        'materialCosts': float(material_total or 0),
        'laborCosts': float(labor_total or 0),
        'timeToCompletion': None,
        'costBreakdown': cost_breakdown,
        'projectHealth': project_health,
        'risks': [],
        'recommendations': recommendations,
        'trends': {
            'totalCost': 0,
            'materials': 0,
            'labor': 0
        }
    }

    return Response(response)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_market_analysis(request):
    """Generate market analysis insights based on project costs.

    Query params:
    - timeframe: week | month | quarter | year (default: month)
    - projectType: filter by project type (optional)
    - location: filter by location (optional)
    """
    from ..models import LaborEstimate
    
    timeframe = request.GET.get('timeframe', 'month')
    project_type = request.GET.get('projectType')
    location = request.GET.get('location')
    
    now = timezone.now()
    if timeframe == 'week':
        start = now - timedelta(weeks=1)
    elif timeframe == 'quarter':
        start = now - timedelta(days=90)
    elif timeframe == 'year':
        start = now - timedelta(days=365)
    else:
        start = now - timedelta(days=30)

    # Build queryset with optional filters
    estimates_qs = Estimate.objects.filter(user=request.user, created_at__gte=start)
    if project_type:
        estimates_qs = estimates_qs.filter(project_type__name__iexact=project_type)
    if location:
        estimates_qs = estimates_qs.filter(location__county_name__iexact=location)

    # Get all estimates (not filtered by timeframe) for industry benchmarks
    all_estimates = Estimate.objects.filter(user=request.user)

    # Aggregate costs
    material_ai_total = 0
    material_items_total = float(EstimateItem.objects.filter(
        estimate__in=estimates_qs, category='material'
    ).aggregate(total=Sum('total_price'))['total'] or 0)
    
    ai_estimates = AIEstimate.objects.filter(estimate__in=estimates_qs)
    for ai_est in ai_estimates:
        if ai_est.materials_breakdown:
            for material in ai_est.materials_breakdown:
                material_ai_total += float(material.get('totalCost', 0))
    
    material_total = material_items_total + material_ai_total
    
    labor_ai_total = float(LaborEstimate.objects.filter(
        estimate__in=estimates_qs
    ).aggregate(total=Sum('total_cost'))['total'] or 0)
    
    labor_items_total = float(EstimateItem.objects.filter(
        estimate__in=estimates_qs, category='labor'
    ).aggregate(total=Sum('total_price'))['total'] or 0)
    
    labor_total = labor_ai_total + labor_items_total
    
    equipment_total = float(EstimateItem.objects.filter(
        estimate__in=estimates_qs, category='equipment'
    ).aggregate(total=Sum('total_price'))['total'] or 0)
    
    total_cost = material_total + labor_total + equipment_total

    # Calculate benchmarks (all user estimates)
    all_material_total = 0
    all_material_items = float(EstimateItem.objects.filter(
        estimate__in=all_estimates, category='material'
    ).aggregate(total=Sum('total_price'))['total'] or 0)
    
    all_ai_estimates = AIEstimate.objects.filter(estimate__in=all_estimates)
    for ai_est in all_ai_estimates:
        if ai_est.materials_breakdown:
            for material in ai_est.materials_breakdown:
                all_material_total += float(material.get('totalCost', 0))
    
    all_material = all_material_items + all_material_total
    all_labor = float(LaborEstimate.objects.filter(
        estimate__in=all_estimates
    ).aggregate(total=Sum('total_cost'))['total'] or 0) + float(EstimateItem.objects.filter(
        estimate__in=all_estimates, category='labor'
    ).aggregate(total=Sum('total_price'))['total'] or 0)
    
    all_total = all_material + all_labor + float(EstimateItem.objects.filter(
        estimate__in=all_estimates, category='equipment'
    ).aggregate(total=Sum('total_price'))['total'] or 0)

    # Calculate percentages and ratios
    material_pct = (material_total / total_cost * 100) if total_cost > 0 else 0
    labor_pct = (labor_total / total_cost * 100) if total_cost > 0 else 0
    equipment_pct = (equipment_total / total_cost * 100) if total_cost > 0 else 0
    
    material_to_labor_ratio = (material_total / labor_total) if labor_total > 0 else 0

    # Calculate cost per sqm for all estimates with area
    estimates_with_area = estimates_qs.filter(total_area__gt=0).exclude(total_area__isnull=True)
    avg_cost_per_sqm = 0
    if estimates_with_area.exists():
        total_area = estimates_with_area.aggregate(total=Sum('total_area'))['total'] or 0
        if total_area > 0:
            avg_cost_per_sqm = total_cost / float(total_area)

    # Market insights and recommendations
    insights = []
    recommendations = []

    if material_pct > 65:
        insights.append({
            'type': 'warning',
            'title': 'High Material Costs',
            'description': f'Materials represent {material_pct:.1f}% of your project costs. Consider sourcing alternatives or bulk purchasing.'
        })
        recommendations.append('Negotiate bulk discounts with suppliers for materials')
        recommendations.append('Explore alternative materials that meet specifications at lower cost')
    
    if labor_pct < 15:
        insights.append({
            'type': 'info',
            'title': 'Low Labor Allocation',
            'description': f'Labor is only {labor_pct:.1f}% of costs. Ensure adequate workforce allocation.'
        })
    elif labor_pct > 50:
        insights.append({
            'type': 'warning',
            'title': 'High Labor Costs',
            'description': f'Labor represents {labor_pct:.1f}% of your project costs. Consider optimizing crew size or duration.'
        })
        recommendations.append('Review crew scheduling to optimize labor efficiency')
        recommendations.append('Consider phased project approach to reduce peak labor requirements')

    if material_to_labor_ratio > 3:
        insights.append({
            'type': 'success',
            'title': 'Material-Intensive Project',
            'description': f'Your material-to-labor ratio is {material_to_labor_ratio:.2f}:1, typical for construction projects.'
        })
    elif material_to_labor_ratio < 1:
        insights.append({
            'type': 'info',
            'title': 'Labor-Intensive Project',
            'description': f'Your material-to-labor ratio is {material_to_labor_ratio:.2f}:1, indicating a labor-heavy project.'
        })

    # Trend analysis (compare current to average)
    avg_material_pct = (all_material / all_total * 100) if all_total > 0 else 0
    avg_labor_pct = (all_labor / all_total * 100) if all_total > 0 else 0
    
    material_trend = material_pct - avg_material_pct
    labor_trend = labor_pct - avg_labor_pct

    trends = {
        'materialTrend': round(material_trend, 1),
        'laborTrend': round(labor_trend, 1),
        'costPerSqm': round(avg_cost_per_sqm, 2),
        'estimateCount': estimates_qs.count(),
        'industryAvgMaterial': round(avg_material_pct, 1),
        'industryAvgLabor': round(avg_labor_pct, 1),
    }

    response = {
        'summary': {
            'totalCost': float(total_cost or 0),
            'materialCost': float(material_total or 0),
            'laborCost': float(labor_total or 0),
            'equipmentCost': float(equipment_total or 0),
        },
        'breakdown': {
            'materials': round(material_pct, 1),
            'labor': round(labor_pct, 1),
            'equipment': round(equipment_pct, 1),
        },
        'benchmarks': {
            'materialToLaborRatio': round(material_to_labor_ratio, 2),
            'avgCostPerSqm': round(avg_cost_per_sqm, 2),
        },
        'insights': insights,
        'recommendations': recommendations,
        'trends': trends,
    }

    return Response(response)