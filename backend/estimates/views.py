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

from .models import Estimate, EstimateItem, EstimateRevision, EstimateShare, AIEstimate
from .serializers import (
    EstimateSerializer, EstimateCreateSerializer, EstimateUpdateSerializer,
    EstimateSummarySerializer, EstimateItemSerializer, EstimateRevisionSerializer,
    EstimateShareSerializer, CostCalculationSerializer
)
from projects.models import ProjectType, Location
from django.core.exceptions import ObjectDoesNotExist
from decimal import Decimal
from .services.gemini_estimator import estimate_construction_cost
from .tasks import create_gemini_estimate_task
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
    search_fields = ['project_name']
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
    """Calculate project cost based on parameters"""
    
    serializer = CostCalculationSerializer(data=request.data)
    if not serializer.is_valid():
        # Log validation errors for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error('Cost calculation serializer invalid: %s', serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        import logging
        logger = logging.getLogger(__name__)
        # Log incoming request data for debugging
        logger.info('calculate_cost request.data: %s', request.data)
        logger.info('calculate_cost validated_data: %s', serializer.validated_data)

        project_type = get_object_or_404(ProjectType, id=serializer.validated_data['project_type_id'])

        # Location lookup: accept either PK or county_code (e.g., '001')
        location_id = serializer.validated_data['location_id']
        try:
            location = Location.objects.get(pk=location_id)
        except Exception:
            # try by county_code (zero-pad numeric ids)
            county_code = str(location_id).zfill(3)
            try:
                location = Location.objects.get(county_code=county_code)
            except Exception:
                # Re-raise to be handled by outer exception block
                raise
        total_area = serializer.validated_data['total_area']
        contingency_percentage = serializer.validated_data.get('contingency_percentage', 10.00)
        custom_items = serializer.validated_data.get('custom_items', [])

        # Calculate base cost (use Decimal arithmetic)
        base_cost_per_sqm = Decimal(project_type.base_cost_per_sqm)
        location_multiplier = Decimal(location.cost_multiplier)
        adjusted_cost_per_sqm = (base_cost_per_sqm * location_multiplier)
        total_area_dec = Decimal(total_area)
        total_estimated_cost = (adjusted_cost_per_sqm * total_area_dec)

        # Calculate contingency
        contingency_percentage_dec = Decimal(contingency_percentage)
        contingency_amount = (total_estimated_cost * contingency_percentage_dec) / Decimal('100')

        # Calculate custom items total
        custom_items_total = Decimal('0')
        if custom_items:
            for item in custom_items:
                qty = Decimal(str(item.get('quantity', 0)))
                unit_price = Decimal(str(item.get('unit_price', 0)))
                custom_items_total += qty * unit_price

        # Final total
        final_total = total_estimated_cost + contingency_amount + custom_items_total

        return Response({
            'project_type': {
                'id': project_type.id,
                'name': project_type.name,
                'base_cost_per_sqm': float(base_cost_per_sqm)
            },
            'location': {
                'id': location.id,
                'county_code': location.county_code,
                'name': location.county_name,
                'cost_multiplier': float(location_multiplier)
            },
            'calculations': {
                'total_area': float(total_area_dec),
                'base_cost_per_sqm': float(base_cost_per_sqm),
                'adjusted_cost_per_sqm': float(adjusted_cost_per_sqm),
                'base_total_cost': float(total_estimated_cost),
                'contingency_percentage': float(contingency_percentage_dec),
                'contingency_amount': float(contingency_amount),
                'custom_items_total': float(custom_items_total),
                'final_total_cost': float(final_total)
            },
            'breakdown': {
                'materials': float((total_estimated_cost * Decimal('0.60'))),  # 60% materials
                'labor': float((total_estimated_cost * Decimal('0.30'))),      # 30% labor
                'equipment': float((total_estimated_cost * Decimal('0.10'))),  # 10% equipment
                'contingency': float(contingency_amount),
                'custom_items': float(custom_items_total)
            }
        })

    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.exception('Error calculating cost: %s', e)
        # Return a generic error message but log full traceback to server logs
        return Response(
            {'error': 'Server error while calculating estimate'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_estimate(request):
    """Save calculated estimate"""
    
    serializer = EstimateCreateSerializer(data=request.data)
    if serializer.is_valid():
        estimate = serializer.save(user=request.user)
        return Response(
            EstimateSerializer(estimate).data,
            status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def duplicate_estimate(request, estimate_id):
    """Duplicate an existing estimate"""
    
    try:
        original_estimate = get_object_or_404(Estimate, id=estimate_id, user=request.user)
        
        # Create new estimate
        new_estimate = Estimate.objects.create(
            user=request.user,
            project_type=original_estimate.project_type,
            location=original_estimate.location,
            project_template=original_estimate.project_template,
            project_name=f"{original_estimate.project_name} (Copy)",
            project_description=original_estimate.project_description,
            total_area=original_estimate.total_area,
            base_cost_per_sqm=original_estimate.base_cost_per_sqm,
            location_multiplier=original_estimate.location_multiplier,
            contingency_percentage=original_estimate.contingency_percentage
        )
        
        # Copy items
        for item in original_estimate.items.all():
            EstimateItem.objects.create(
                estimate=new_estimate,
                category=item.category,
                name=item.name,
                description=item.description,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                notes=item.notes
            )
        
        return Response(
            EstimateSerializer(new_estimate).data,
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_estimate(request, estimate_id):
    """Share an estimate with someone via email"""
    
    try:
        estimate = get_object_or_404(Estimate, id=estimate_id, user=request.user)
        
        shared_with_email = request.data.get('email')
        shared_with_name = request.data.get('name', '')
        expires_days = request.data.get('expires_days', 30)
        
        if not shared_with_email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate access token
        access_token = str(uuid.uuid4())
        expires_at = timezone.now() + timedelta(days=expires_days)
        
        # Create share record
        share = EstimateShare.objects.create(
            estimate=estimate,
            shared_with_email=shared_with_email,
            shared_with_name=shared_with_name,
            access_token=access_token,
            expires_at=expires_at,
            created_by=request.user
        )
        
        # TODO: Send email with share link
        # For now, return the access token
        
        return Response({
            'message': 'Estimate shared successfully',
            'share_token': access_token,
            'expires_at': expires_at,
            'share_url': f"/shared-estimate/{access_token}"
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([])  # No authentication required for shared estimates
def shared_estimate(request, access_token):
    """Access a shared estimate"""
    
    try:
        share = get_object_or_404(
            EstimateShare, 
            access_token=access_token, 
            is_active=True
        )
        
        # Check if share has expired
        if timezone.now() > share.expires_at:
            return Response(
                {'error': 'This shared estimate has expired'}, 
                status=status.HTTP_410_GONE
            )
        
        return Response(
            EstimateSerializer(share.estimate).data
        )
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estimate_statistics(request):
    """Get user's estimate statistics"""
    
    user = request.user
    estimates = Estimate.objects.filter(user=user)
    
    stats = {
        'total_estimates': estimates.count(),
        'total_value': estimates.aggregate(Sum('total_estimated_cost'))['total_estimated_cost__sum'] or 0,
        'average_cost': estimates.aggregate(Sum('total_estimated_cost'))['total_estimated_cost__sum'] / estimates.count() if estimates.count() > 0 else 0,
        'by_status': {
            'draft': estimates.filter(status='draft').count(),
            'pending': estimates.filter(status='pending').count(),
            'approved': estimates.filter(status='approved').count(),
            'rejected': estimates.filter(status='rejected').count(),
        },
        'by_project_type': {}
    }
    
    # Group by project type
    for estimate in estimates:
        project_type = estimate.project_type.name
        if project_type not in stats['by_project_type']:
            stats['by_project_type'][project_type] = 0
        stats['by_project_type'][project_type] += 1
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_estimate(request):
    """Upload an Excel file (xlsx) to create an estimate and its items.

    Expected formats (flexible):
    - Sheet named 'Estimate' (single-row with columns: project_name, project_type, location, total_area, base_cost_per_sqm, location_multiplier, contingency_percentage)
    - Sheet named 'Items' for item rows (category, name, description, quantity, unit, unit_price, notes)
    If only one sheet is provided, the first row will be treated as estimate metadata and remaining rows (if they contain item columns) as items.
    """
    uploaded_file = request.FILES.get('file') or request.FILES.get('excel')
    if not uploaded_file:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        import pandas as pd

        xl = pd.ExcelFile(uploaded_file)

        # Parse estimate metadata
        if 'Estimate' in xl.sheet_names:
            df_meta = xl.parse('Estimate')
            if df_meta.empty:
                return Response({'error': 'Estimate sheet is empty'}, status=status.HTTP_400_BAD_REQUEST)
            meta_row = df_meta.iloc[0].to_dict()
        else:
            # Fallback to first sheet
            df_first = xl.parse(xl.sheet_names[0])
            if df_first.empty:
                return Response({'error': 'Uploaded file contains no usable data'}, status=status.HTTP_400_BAD_REQUEST)
            # If first sheet looks like metadata (has project_name column) take first row
            if 'project_name' in [c.lower() for c in df_first.columns]:
                # normalize column names
                df_first.columns = [c.lower() for c in df_first.columns]
                meta_row = df_first.iloc[0].to_dict()
                # remaining rows may be items
                df_items = df_first.iloc[1:]
            else:
                return Response({'error': 'Could not detect estimate metadata in first sheet. Use sheet named "Estimate" or include a header with project_name.'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse items
        df_items = None
        if 'Items' in xl.sheet_names:
            df_items = xl.parse('Items')
        elif 'df_items' in locals() and not df_items.empty:
            pass
        else:
            # try second sheet
            if len(xl.sheet_names) > 1:
                candidate = xl.parse(xl.sheet_names[1])
                if 'name' in [c.lower() for c in candidate.columns]:
                    df_items = candidate
            # else no items sheet

        # Required metadata fields
        required_meta = ['project_name', 'project_type', 'location', 'total_area', 'base_cost_per_sqm']
        meta_lower = {k.lower(): v for k, v in meta_row.items()}
        missing = [f for f in required_meta if f not in meta_lower or pd.isna(meta_lower.get(f))]
        if missing:
            return Response({'error': f'Missing required metadata fields: {missing}'}, status=status.HTTP_400_BAD_REQUEST)

        # Resolve project_type and location (by id or name)
        project_type_val = meta_lower.get('project_type')
        location_val = meta_lower.get('location')

        try:
            if isinstance(project_type_val, (int, float)) and not pd.isna(project_type_val):
                project_type = ProjectType.objects.get(id=int(project_type_val))
            else:
                project_type = ProjectType.objects.filter(name__iexact=str(project_type_val).strip()).first()
        except ObjectDoesNotExist:
            project_type = None

        try:
            if isinstance(location_val, (int, float)) and not pd.isna(location_val):
                location = Location.objects.get(id=int(location_val))
            else:
                location = Location.objects.filter(name__iexact=str(location_val).strip()).first()
        except ObjectDoesNotExist:
            location = None

        if not project_type or not location:
            return Response({'error': 'Could not resolve project_type or location. Use existing names or ids.'}, status=status.HTTP_400_BAD_REQUEST)

        # Build estimate kwargs
        estimate_kwargs = {
            'user': request.user,
            'project_type': project_type,
            'location': location,
            'project_name': str(meta_lower.get('project_name')).strip(),
            'project_description': str(meta_lower.get('project_description', '') or ''),
            'total_area': float(meta_lower.get('total_area')),
            'base_cost_per_sqm': float(meta_lower.get('base_cost_per_sqm')),
            'location_multiplier': float(meta_lower.get('location_multiplier') or 1.0),
            'contingency_percentage': float(meta_lower.get('contingency_percentage') or 10.0),
            'source': 'upload',
            'original_filename': uploaded_file.name
        }

        estimate = Estimate.objects.create(**estimate_kwargs)

        # Create items if present and collect per-row errors
        created_items = []
        row_errors = []
        if df_items is not None and not df_items.empty:
            # normalize column names
            df_items.columns = [c.lower() for c in df_items.columns]
            for idx, row in df_items.iterrows():
                row_number = int(idx) + 2  # approximate Excel row number (header + 1)
                try:
                    # Basic validation
                    name = row.get('name')
                    if not name or pd.isna(name):
                        raise ValueError('Missing item name')

                    quantity = row.get('quantity')
                    unit_price = row.get('unit_price')
                    try:
                        q = float(quantity) if not pd.isna(quantity) else 0.0
                    except Exception:
                        raise ValueError('Invalid quantity')
                    try:
                        up = float(unit_price) if not pd.isna(unit_price) else 0.0
                    except Exception:
                        raise ValueError('Invalid unit_price')

                    item_kwargs = {
                        'estimate': estimate,
                        'category': str(row.get('category', 'other') or 'other'),
                        'name': str(name)[:200],
                        'description': str(row.get('description') or ''),
                        'quantity': q,
                        'unit': str(row.get('unit') or ''),
                        'unit_price': up,
                        'notes': str(row.get('notes') or '')
                    }
                    EstimateItem.objects.create(**item_kwargs)
                    created_items.append(item_kwargs)
                except Exception as e:
                    row_errors.append({'row': row_number, 'error': str(e)})

        response_payload = {
            'message': 'Estimate uploaded successfully',
            'estimate': EstimateSerializer(estimate).data,
        }

        if row_errors:
            response_payload['row_errors'] = row_errors

        return Response(response_payload, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_estimate_with_gemini(request):
    """Create an estimate using Gemini AI based on project details"""
    
    import logging
    import sys
    logger = logging.getLogger(__name__)
    
    # Print to console for immediate visibility
    print("\n" + "="*80)
    print("=== CREATE ESTIMATE WITH GEMINI REQUEST RECEIVED ===")
    print("="*80)
    print(f"Request method: {request.method}")
    print(f"Request path: {request.path}")
    print(f"User: {request.user} (ID: {request.user.id if hasattr(request.user, 'id') else 'N/A'})")
    print(f"User authenticated: {request.user.is_authenticated}")
    print(f"Request data: {request.data}")
    print(f"Request META keys: {list(request.META.keys())[:10]}...")
    print(f"Content-Type: {request.META.get('CONTENT_TYPE', 'N/A')}")
    print(f"HTTP_AUTHORIZATION: {request.META.get('HTTP_AUTHORIZATION', 'N/A')[:50]}...")
    print("="*80 + "\n")
    
    # Also log using logger
    logger.info('=== CREATE ESTIMATE WITH GEMINI REQUEST ===')
    logger.info(f'Request method: {request.method}')
    logger.info(f'Request path: {request.path}')
    logger.info(f'User: {request.user}')
    logger.info(f'User authenticated: {request.user.is_authenticated}')
    logger.info(f'Request data: {request.data}')
    logger.info(f'Request headers: {dict(request.headers)}')
    
    # Validate required fields
    required_fields = ['project_name', 'data_period', 'building_type', 'construction_type', 'location_id']
    missing_fields = [field for field in required_fields if field not in request.data]
    if missing_fields:
        error_msg = f'Missing required fields: {missing_fields}'
        print(f"ERROR: {error_msg}")
        logger.error(error_msg)
        return Response(
            {'error': f'Missing required fields: {", ".join(missing_fields)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    print(f"✓ All required fields present")
    
    try:
        print("Starting location lookup...")
        # Get location - can be ID or county_code
        location_id = request.data.get('location_id')
        print(f"Location ID received: {location_id} (type: {type(location_id)})")
        location = None
        
        # Try to get by ID first
        if location_id:
            try:
                # Check if it's a numeric ID
                if isinstance(location_id, (int, str)) and str(location_id).isdigit():
                    location = Location.objects.get(pk=int(location_id))
                # If not numeric, try as county_code
                elif isinstance(location_id, str) and len(location_id) == 3:
                    location = Location.objects.get(county_code=location_id)
                # Try to find by county name
                else:
                    location = Location.objects.filter(county_name__iexact=str(location_id)).first()
            except (Location.DoesNotExist, ValueError):
                # Try as county_code
                try:
                    location = Location.objects.get(county_code=str(location_id).zfill(3))
                except Location.DoesNotExist:
                    # Try by county name
                    location = Location.objects.filter(county_name__iexact=str(location_id)).first()
        
        if not location:
            error_msg = f'Location not found for location_id: {location_id}'
            print(f"ERROR: {error_msg}")
            print(f"Available locations count: {Location.objects.count()}")
            logger.error(error_msg)
            logger.error(f'Available locations count: {Location.objects.count()}')
            return Response(
                {'error': f'Location not found for "{location_id}". Please provide a valid location_id or ensure locations are populated in the database. Run: python manage.py populate_locations'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        location_info = f'Location found: {location.county_name} (ID: {location.id}, Code: {location.county_code})'
        print(f"✓ {location_info}")
        logger.info(location_info)
        
        # Get or create project type based on building type
        building_type = request.data.get('building_type')
        # Try to find an existing project type with this category
        project_type = ProjectType.objects.filter(category=building_type, is_active=True).first()
        
        # If not found, create a new one
        if not project_type:
            project_type = ProjectType.objects.create(
                name=f'{building_type.title()} Project',
                category=building_type,
                base_cost_per_sqm=Decimal('50000.00'),  # Default base cost
                description=f'Standard {building_type} construction project'
            )
        
        # Prepare project details for Gemini
        project_details = {
            'project_name': request.data.get('project_name'),
            'building_type': building_type,
            'construction_type': request.data.get('construction_type'),
            'data_period': request.data.get('data_period'),
            'location_name': location.county_name,
            'total_area': float(request.data.get('total_area', 100)),
            'project_description': request.data.get('project_description', '')
        }
        
        # Generate estimate using Gemini
        print("Calling Gemini API with project details...")
        logger.info('Calling Gemini API with project details...')
        try:
            gemini_result = estimate_construction_cost(project_details)
            print("✓ Gemini API call completed")
            logger.info('Gemini API call completed')
        except Exception as gemini_error:
            error_msg = f'Gemini API call failed: {str(gemini_error)}'
            print(f"ERROR: {error_msg}")
            logger.exception('Gemini API call failed: %s', gemini_error)
            return Response(
                {'error': f'Failed to generate estimate using AI: {str(gemini_error)}. Please check GEMINI_API_KEY configuration.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        if not gemini_result:
            error_msg = 'Gemini API returned None result'
            print(f"ERROR: {error_msg}")
            logger.error(error_msg)
            return Response(
                {'error': 'Failed to generate estimate using AI. The API returned an empty response. Please try again.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        print("✓ Gemini result received successfully")
        logger.info('Gemini result received successfully')
        
        # Extract cost analysis data
        cost_analysis = gemini_result.get('cost_analysis', {})
        base_cost_per_sqm = Decimal(str(cost_analysis.get('base_cost_per_sqm', 50000)))
        location_multiplier = Decimal(str(location.cost_multiplier))
        adjusted_cost_per_sqm = Decimal(str(cost_analysis.get('adjusted_cost_per_sqm', base_cost_per_sqm * location_multiplier)))
        
        total_area = Decimal(str(request.data.get('total_area', 100)))
        contingency_percentage = Decimal(str(request.data.get('contingency_percentage', 10.0)))
        
        # Create the estimate
        estimate = Estimate.objects.create(
            user=request.user,
            project_type=project_type,
            location=location,
            project_name=request.data.get('project_name'),
            project_description=request.data.get('project_description', ''),
            building_type=building_type,
            construction_type=request.data.get('construction_type'),
            data_period=request.data.get('data_period'),
            total_area=total_area,
            base_cost_per_sqm=base_cost_per_sqm,
            location_multiplier=location_multiplier,
            contingency_percentage=contingency_percentage,
            source='gemini_ai'
        )
        
        # Create AI estimate record
        ai_estimate = AIEstimate.objects.create(
            estimate=estimate,
            base_cost_per_sqm=base_cost_per_sqm,
            location_multiplier=location_multiplier,
            adjusted_cost_per_sqm=adjusted_cost_per_sqm,
            materials_breakdown=gemini_result.get('breakdown', {}).get('materials', {}),
            labor_breakdown=gemini_result.get('breakdown', {}).get('labor', {}),
            equipment_details=gemini_result.get('breakdown', {}).get('equipment', {}),
            recommendations=gemini_result.get('recommendations', []),
            risk_factors=gemini_result.get('risk_factors', []),
            confidence_score=Decimal('85.00')  # Default confidence score
        )
        
        # Return the created estimate with AI details
        estimate_serializer = EstimateSerializer(estimate)
        
        print("✓ Estimate created successfully!")
        print(f"  Estimate ID: {estimate.id}")
        print(f"  Project Name: {estimate.project_name}")
        print(f"  Total Cost: {estimate.total_estimated_cost}")
        print("="*80)
        print("REQUEST COMPLETED SUCCESSFULLY")
        print("="*80 + "\n")
        
        return Response({
            'estimate': estimate_serializer.data,
            'ai_estimate': {
                'materials_breakdown': ai_estimate.materials_breakdown,
                'labor_breakdown': ai_estimate.labor_breakdown,
                'equipment_details': ai_estimate.equipment_details,
                'recommendations': ai_estimate.recommendations,
                'risk_factors': ai_estimate.risk_factors,
                'confidence_score': float(ai_estimate.confidence_score)
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        error_type = type(e).__name__
        error_details = str(e)
        
        print("\n" + "="*80)
        print("ERROR OCCURRED!")
        print("="*80)
        print(f"Error type: {error_type}")
        print(f"Error message: {error_details}")
        import traceback
        print("Traceback:")
        traceback.print_exc()
        print("="*80 + "\n")
        
        logger.exception('Error creating estimate with Gemini: %s', e)
        
        # Check if it's a Gemini API error
        if 'GEMINI_API_KEY' in error_details or 'api_key' in error_details.lower():
            logger.error('Gemini API key issue detected')
            return Response(
                {'error': 'Gemini API configuration error. Please check GEMINI_API_KEY in environment variables.'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {'error': f'Failed to create estimate: {error_type}: {error_details}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_estimate_with_gemini_async(request):
    """Enqueue a background Celery task to create an estimate using Gemini and return 202 with task id."""
    # Validate required fields (reuse same validation)
    required_fields = ['project_name', 'data_period', 'building_type', 'construction_type', 'location_id']
    missing_fields = [field for field in required_fields if field not in request.data]
    if missing_fields:
        return Response({'error': f'Missing required fields: {missing_fields}'}, status=status.HTTP_400_BAD_REQUEST)

    project_details = {
        'project_name': request.data.get('project_name'),
        'building_type': request.data.get('building_type'),
        'construction_type': request.data.get('construction_type'),
        'data_period': request.data.get('data_period'),
        'location_id': request.data.get('location_id'),
        'total_area': request.data.get('total_area', 100),
        'project_description': request.data.get('project_description', ''),
        'contingency_percentage': request.data.get('contingency_percentage', 10.0)
    }

    # Enqueue task
    task = create_gemini_estimate_task.delay(request.user.id, project_details)

    return Response({'task_id': task.id, 'status': 'queued'}, status=status.HTTP_202_ACCEPTED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estimate_task_status(request, task_id):
    """Poll Celery task status and return result when ready."""
    try:
        async_res = AsyncResult(task_id)
        result = None
        if async_res.ready():
            result = async_res.result
            return Response({'task_id': task_id, 'status': async_res.status, 'result': result}, status=status.HTTP_200_OK)
        else:
            return Response({'task_id': task_id, 'status': async_res.status}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'task_id': task_id, 'status': 'error', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



