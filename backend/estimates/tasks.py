from celery import shared_task
from django.contrib.auth import get_user_model
from projects.models import ProjectType, Location
from .models import Estimate, AIEstimate
from decimal import Decimal
from .services.gemini_estimator import estimate_construction_cost
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def create_gemini_estimate_task(self, user_id, project_details):
    """Background task to call Gemini and create Estimate + AIEstimate records."""
    try:
        User = get_user_model()
        user = User.objects.get(pk=user_id)

        # Resolve location
        location_id = project_details.get('location_id')
        location = None
        if location_id:
            try:
                location = Location.objects.get(pk=int(location_id))
            except Exception:
                try:
                    location = Location.objects.get(county_code=str(location_id).zfill(3))
                except Exception:
                    location = Location.objects.filter(county_name__iexact=str(location_id)).first()
        if not location:
            msg = f'Location not found for id: {location_id}'
            logger.error(msg)
            return {'status': 'failed', 'error': msg}

        building_type = project_details.get('building_type')
        project_type = ProjectType.objects.filter(category=building_type, is_active=True).first()
        if not project_type:
            project_type = ProjectType.objects.create(
                name=f"{building_type.title()} Project",
                category=building_type,
                base_cost_per_sqm=Decimal('50000.00'),
                description=f"Standard {building_type} construction project"
            )

        # Call Gemini estimator
        try:
            gemini_result = estimate_construction_cost(project_details)
        except Exception as e:
            logger.exception('Gemini estimator failed: %s', e)
            return {'status': 'failed', 'error': str(e)}

        if not gemini_result:
            return {'status': 'failed', 'error': 'Gemini returned no result'}

        cost_analysis = gemini_result.get('cost_analysis', {})
        base_cost_per_sqm = Decimal(str(cost_analysis.get('base_cost_per_sqm', 50000)))
        location_multiplier = Decimal(str(location.cost_multiplier))
        adjusted_cost_per_sqm = Decimal(str(cost_analysis.get('adjusted_cost_per_sqm', base_cost_per_sqm * location_multiplier)))

        total_area = Decimal(str(project_details.get('total_area', 100)))
        contingency_percentage = Decimal(str(project_details.get('contingency_percentage', 10.0)))

        estimate = Estimate.objects.create(
            user=user,
            project_type=project_type,
            location=location,
            project_name=project_details.get('project_name'),
            project_description=project_details.get('project_description', ''),
            building_type=building_type,
            construction_type=project_details.get('construction_type'),
            data_period=project_details.get('data_period'),
            total_area=total_area,
            base_cost_per_sqm=base_cost_per_sqm,
            location_multiplier=location_multiplier,
            contingency_percentage=contingency_percentage,
            source='gemini_ai'
        )

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
            confidence_score=Decimal('85.00')
        )

        return {'status': 'success', 'estimate_id': estimate.id}

    except Exception as exc:
        logger.exception('Background create_gemini_estimate_task failed: %s', exc)
        return {'status': 'failed', 'error': str(exc)}
