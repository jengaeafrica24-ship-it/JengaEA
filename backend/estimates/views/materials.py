import google.generativeai as genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.files.base import ContentFile
from django.shortcuts import get_object_or_404
import json
import logging

from ..models import Estimate, AIEstimate
from ..serializers import EstimateSerializer
from projects.models import ProjectType, Location

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini API with proper model
genai.configure(api_key='AIzaSyDPVIy7kLzBE5-mUVn3Dy82QtekeT6QLvA')

# Try to use the latest model, fall back if not available
try:
    model = genai.GenerativeModel('models/gemini-1.5-flash-latest')
except:
    try:
        model = genai.GenerativeModel('models/gemini-pro')
    except:
        # Last resort fallback
        model = genai.GenerativeModel('gemini-pro')


def generate_prompt(data, area_data):
    """Generate a structured prompt for the Gemini AI model."""
    
    total_area = area_data.get('total', '0')
    area_units = area_data.get('units', 'square_km')
    
    project_info = f"""
    Project Information:
    - Location: {data.get('location', 'Not specified')}
    - Project Type: {data.get('projectType', 'Not specified')}
    - Building Type: {data.get('buildingType', 'Not specified')}
    - Construction Phase: {data.get('constructionPhase', 'Not specified')}
    - Area: {total_area} {area_units}
    - Additional Specifications: {data.get('specifications', 'None provided')}
    """
    
    prompt = f"""
    As a construction cost estimation expert for the Kenyan market, provide a detailed material cost estimate for the following construction project:
    
    {project_info}
    
    Please provide:
    1. A comprehensive list of required materials with:
       - Material name
       - Detailed specifications
       - Quantity needed (with appropriate units)
       - Estimated unit cost in KES (Kenyan Shillings)
       - Total cost for each material
    
    2. Cost breakdown including:
       - Subtotal (sum of all materials)
       - VAT at 16%
       - Final total cost
    
    3. 2-3 practical cost-saving recommendations based on:
       - Current Kenyan market conditions
       - Local supplier options
       - Bulk purchasing opportunities
       - Alternative materials where applicable
    
    IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.
    
    Use this exact JSON structure:
    {{
        "materials": [
            {{
                "name": "Material name",
                "specification": "Detailed specification",
                "quantity": "Numeric value",
                "unit": "Unit of measurement",
                "unitCost": numeric_value,
                "totalCost": numeric_value
            }}
        ],
        "subtotal": numeric_value,
        "vat": numeric_value,
        "totalCost": numeric_value,
        "recommendations": [
            "Recommendation 1",
            "Recommendation 2",
            "Recommendation 3"
        ]
    }}
    """
    return prompt


def create_fallback_estimate(data, area_data):
    """Create a fallback estimate with realistic mock data based on project details."""
    
    total_area = float(area_data.get('total', 100))
    location = data.get('location', 'Nairobi')
    building_type = data.get('buildingType', 'General')
    
    # Base materials list (adjustable based on project)
    materials = [
        {
            'name': 'Cement',
            'specification': 'Portland Cement Type I/II - 50kg bags',
            'quantity': str(int(total_area * 10)),
            'unit': 'bags',
            'unitCost': 800,
            'totalCost': int(total_area * 10 * 800)
        },
        {
            'name': 'Steel Reinforcement',
            'specification': 'Grade 60, High Tensile Deformed Bars',
            'quantity': str(int(total_area * 20)),
            'unit': 'kg',
            'unitCost': 120,
            'totalCost': int(total_area * 20 * 120)
        },
        {
            'name': 'Aggregate (Ballast)',
            'specification': 'Machine crushed - 20mm nominal size',
            'quantity': str(int(total_area * 5)),
            'unit': 'tonnes',
            'unitCost': 3500,
            'totalCost': int(total_area * 5 * 3500)
        },
        {
            'name': 'Sand',
            'specification': 'River sand - washed and screened',
            'quantity': str(int(total_area * 3)),
            'unit': 'tonnes',
            'unitCost': 2500,
            'totalCost': int(total_area * 3 * 2500)
        },
        {
            'name': 'Timber',
            'specification': 'Cyprus timber - treated for formwork',
            'quantity': str(int(total_area * 0.5)),
            'unit': 'cubic meters',
            'unitCost': 35000,
            'totalCost': int(total_area * 0.5 * 35000)
        }
    ]
    
    subtotal = sum(material['totalCost'] for material in materials)
    vat = int(subtotal * 0.16)
    total_cost = subtotal + vat
    
    location_str = str(location)
    building_type_str = str(building_type)
    recommendations = [
        f'Consider bulk purchasing from suppliers in {location_str} to negotiate better rates (potential 10-15% savings)',
        'Current market trends suggest stable prices for the next quarter - lock in rates early',
        f'Local {building_type_str} projects have found cost savings by using alternative formwork systems'
    ]
    
    return {
        'materials': materials,
        'subtotal': subtotal,
        'vat': vat,
        'totalCost': total_cost,
        'recommendations': recommendations
    }


def map_building_type_to_choice(building_type_str):
    """Map frontend building type string to model BUILDING_TYPE_CHOICES."""
    building_type_map = {
        'single family home': 'residential',
        'apartment building': 'residential',
        'townhouse': 'residential',
        'villa': 'residential',
        'bungalow': 'residential',
        'office building': 'commercial',
        'retail center': 'commercial',
        'hotel': 'commercial',
        'restaurant': 'commercial',
        'shopping mall': 'commercial',
        'factory': 'industrial',
        'warehouse': 'industrial',
        'manufacturing plant': 'industrial',
        'storage facility': 'industrial',
        'research facility': 'industrial',
        'road': 'infrastructure',
        'bridge': 'infrastructure',
        'tunnel': 'infrastructure',
        'railway': 'infrastructure',
        'airport': 'infrastructure',
    }
    
    # Try to match the building type
    key = building_type_str.lower().strip() if building_type_str else ''
    return building_type_map.get(key, 'residential')  # Default to residential


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_material_estimate(request):
    """
    Generate a material cost estimate using Gemini AI.
    
    Expected request data (JSON or FormData):
    - location: str (required) - Location name
    - projectType: str (required) - Project type name
    - buildingType: str (required) - Building type description
    - constructionPhase: str (required) - Construction phase
    - area: str (JSON string) or dict (required) - Area information
    - specifications: str (optional) - Additional specifications
    - estimationType: str (optional, default: 'manual')
    - dataPeriod: str (optional) - Data period (Q1, Q2, etc.)
    - file: file upload (optional, for 'upload' estimation type)
    """
    
    try:
        # Extract data from request
        data = request.data.copy()
        logger.info(f"Received estimate request from user {request.user.id}")
        logger.debug(f"Request data: {data}")
        
        # Validate required fields
        required_fields = ['location', 'projectType', 'buildingType', 'constructionPhase', 'area']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            error_msg = f"Missing required fields: {', '.join(missing_fields)}"
            logger.warning(f"Validation failed: {error_msg}")
            return Response({
                'success': False,
                'error': error_msg
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Parse and validate area data
        area_data = data.get('area')
        try:
            if isinstance(area_data, str):
                area_data = json.loads(area_data)
            
            # Validate area structure
            if not isinstance(area_data, dict) or 'total' not in area_data:
                raise ValueError("Area must contain 'total' field")
            
            # Ensure total is a valid number
            total_area_value = float(area_data.get('total', 0))
            if total_area_value <= 0:
                raise ValueError("Total area must be greater than 0")
            
        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Invalid area format: {e}")
            return Response({
                'success': False,
                'error': f"Invalid area format. Expected JSON with 'total' and 'units' fields. Error: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Look up ProjectType by name (case-insensitive)
        project_type_name = data.get('projectType')
        try:
            project_type = ProjectType.objects.get(name__iexact=project_type_name)
            logger.info(f"Found project type: {project_type}")
        except ProjectType.DoesNotExist:
            logger.error(f"ProjectType not found: {project_type_name}")
            return Response({
                'success': False,
                'error': f"Project type '{project_type_name}' not found. Please select a valid project type."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Look up Location by name (case-insensitive)
        location_name = data.get('location')
        try:
            location = Location.objects.get(county_name__iexact=location_name)
            logger.info(f"Found location: {location}")
        except Location.DoesNotExist:
            logger.error(f"Location not found: {location_name}")
            return Response({
                'success': False,
                'error': f"Location '{location_name}' not found. Please select a valid location."
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Map building type to model choices
        building_type = map_building_type_to_choice(data.get('buildingType'))
        logger.info(f"Mapped building type: {building_type}")
        
        # Handle file upload if present
        building_plan = request.FILES.get('file')
        if building_plan:
            logger.info(f"Building plan file uploaded: {building_plan.name}")
        
        # Store area as provided (don't convert to square meters)
        # The user's input is already in their preferred units
        area_units = area_data.get('units', 'square_km')
        
        # Store the area value directly without conversion
        # This prevents numeric overflow for large areas
        total_area_value_to_store = total_area_value
        
        # Prepare estimate data for database
        estimate_data = {
            'user': request.user,
            'project_type': project_type,  # ForeignKey instance
            'location': location,  # ForeignKey instance
            'building_type': building_type,  # CharField from BUILDING_TYPE_CHOICES
            'project_name': f"{building_type.title()} in {location_name}",
            'construction_type': 'new_construction',  # Default
            'data_period': data.get('dataPeriod', 'Q1'),
            'project_description': data.get('specifications', '')[:150],  # Limit to 150 chars
            'total_area': total_area_value_to_store,  # Store in original units
            'status': 'processing',
            'source': data.get('estimationType', 'manual'),
        }
        
        logger.debug(f"Creating estimate with data: {estimate_data}")
        
        # Create the estimate object
        try:
            estimate = Estimate.objects.create(**estimate_data)
            logger.info(f"Created estimate object with ID: {estimate.id}")
        except Exception as db_error:
            logger.error(f"Database error creating estimate: {db_error}")
            return Response({
                'success': False,
                'error': f"Failed to create estimate: {str(db_error)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Save the building plan if provided
        if building_plan:
            try:
                file_extension = building_plan.name.split('.')[-1]
                estimate.original_filename = building_plan.name
                estimate.file_path = f'estimates/plans/plan_{estimate.id}.{file_extension}'
                estimate.save()
                # Note: You'll need to add a FileField to your model to actually save the file
                logger.info(f"Saved building plan metadata for estimate {estimate.id}")
            except Exception as file_error:
                logger.error(f"Error saving building plan: {file_error}")
                # Continue even if file save fails
        
        # Generate the prompt for Gemini AI
        prompt = generate_prompt(data, area_data)
        logger.debug("Generated AI prompt")
        
        # Try to get response from Gemini AI
        try:
            logger.info("Requesting estimate from Gemini AI")
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            logger.debug(f"Gemini AI raw response: {response_text[:200]}...")
            
            # Clean up response (remove markdown code blocks if present)
            if response_text.startswith('```'):
                lines = response_text.split('\n')
                response_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else response_text
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            # Parse the JSON response
            try:
                estimate_result = json.loads(response_text)
                logger.info("Successfully parsed Gemini AI response")
            except json.JSONDecodeError as json_error:
                logger.error(f"Failed to parse AI response as JSON: {json_error}")
                logger.debug(f"Problematic response: {response_text}")
                raise ValueError("AI returned invalid JSON format")
            
            # Validate the response structure
            required_keys = ['materials', 'subtotal', 'vat', 'totalCost', 'recommendations']
            if not all(key in estimate_result for key in required_keys):
                logger.warning("AI response missing required keys, using fallback")
                raise ValueError("AI response missing required fields")
            
            # Create AIEstimate record
            ai_estimate = AIEstimate.objects.create(
                estimate=estimate,
                base_cost_per_sqm=estimate.base_cost_per_sqm,
                location_multiplier=estimate.location_multiplier,
                adjusted_cost_per_sqm=estimate.adjusted_cost_per_sqm,
                materials_breakdown=estimate_result.get('materials', []),
                labor_breakdown=[],  # Empty for material-only estimates
                equipment_details={},
                recommendations=estimate_result.get('recommendations', []),
                risk_factors=[],
                confidence_score=85.0  # Default confidence
            )
            
            # Update estimate status
            estimate.status = 'approved'
            estimate.save()
            logger.info(f"Estimate {estimate.id} completed successfully with AI data")
            
            serializer = EstimateSerializer(estimate)
            return Response({
                'success': True,
                'data': estimate_result,
                'estimate': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as ai_error:
            logger.warning(f"AI generation failed: {ai_error}. Using fallback data.")
            
            # Generate fallback estimate
            fallback_estimate = create_fallback_estimate(data, area_data)
            
            # Create AIEstimate record with fallback data
            ai_estimate = AIEstimate.objects.create(
                estimate=estimate,
                base_cost_per_sqm=estimate.base_cost_per_sqm,
                location_multiplier=estimate.location_multiplier,
                adjusted_cost_per_sqm=estimate.adjusted_cost_per_sqm,
                materials_breakdown=fallback_estimate.get('materials', []),
                labor_breakdown=[],
                equipment_details={},
                recommendations=fallback_estimate.get('recommendations', []),
                risk_factors=['Using fallback estimate due to AI service unavailability'],
                confidence_score=70.0  # Lower confidence for fallback
            )
            
            # Update estimate status
            estimate.status = 'approved'
            estimate.save()
            logger.info(f"Estimate {estimate.id} completed with fallback data")
            
            serializer = EstimateSerializer(estimate)
            return Response({
                'success': True,
                'data': fallback_estimate,
                'estimate': serializer.data,
                'note': 'AI service temporarily unavailable. Using calculated estimate based on standard rates.'
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Unexpected error in generate_material_estimate: {e}", exc_info=True)
        return Response({
            'success': False,
            'error': f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)