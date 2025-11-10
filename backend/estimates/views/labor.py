import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from ..models import Estimate, LaborEstimate
from projects.models import ProjectType

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

# Model fallback order
MODEL_PREFERENCES = [
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-pro'
]

def get_available_model():
    """Get the first available model from our preference list."""
    try:
        available_models = genai.list_models()
        available_names = [m.name.replace('models/', '') for m in available_models 
                          if 'generateContent' in m.supported_generation_methods]
        
        logger.info(f"Available models: {available_names}")
        
        # Try to find first preferred model that's available
        for preferred in MODEL_PREFERENCES:
            if preferred in available_names:
                logger.info(f"Selected model: {preferred}")
                return preferred
        
        # Fallback to first available model
        if available_names:
            logger.warning(f"None of preferred models available, using: {available_names[0]}")
            return available_names[0]
        
        raise Exception("No models available for content generation")
    
    except Exception as e:
        logger.error(f"Error listing models: {str(e)}")
        # Fallback to a safe default
        return 'gemini-pro'

def generate_labor_prompt(data, area_data):
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
    - Project Name: {data.get('project_name', 'Not specified')}
    - Construction Type: {data.get('construction_type', 'Not specified')}
    - Data Period: {data.get('data_period', 'Not specified')}
    - Additional Specifications: {data.get('specifications', 'None provided')}
    """
    
    prompt = f"""
    As a construction labor cost estimation expert for the Kenyan market, provide a detailed labor cost estimate for the following construction project:
    
    {project_info}
    
    Please provide:
    1. A comprehensive list of required labor roles with:
       - Role/Position name
       - Required skill level
       - Number of workers needed
       - Duration (in days)
       - Daily rate in KES (Kenyan Shillings)
       - Total cost for each role
    
    2. Cost breakdown including:
       - Subtotal (sum of all labor costs)
       - Statutory deductions and benefits (typically 15-20% in Kenya)
       - Final total cost
    
    3. 2-3 practical workforce optimization recommendations based on:
       - Current Kenyan labor market conditions
       - Local workforce availability
       - Project timeline optimization
       - Skills distribution
    
    IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown formatting, code blocks, or explanatory text.
    
    Use this exact JSON structure:
    {{
        "labor_roles": [
            {{
                "role": "Role name",
                "skillLevel": "Required skill level",
                "numberOfWorkers": numeric_value,
                "durationDays": numeric_value,
                "dailyRate": numeric_value,
                "totalCost": numeric_value
            }}
        ],
        "subtotal": numeric_value,
        "statutoryDeductions": numeric_value,
        "totalCost": numeric_value,
        "recommendations": [
            "Recommendation 1",
            "Recommendation 2",
            "Recommendation 3"
        ]
    }}
    """
    return prompt

def clean_json_response(text):
    """Clean and extract JSON from AI response."""
    import re
    
    # Remove markdown code blocks if present
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    
    # Strip whitespace
    text = text.strip()
    
    # Find JSON content between curly braces if needed
    if not text.startswith('{'):
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        if start_idx != -1 and end_idx != -1:
            text = text[start_idx:end_idx+1]
    
    return text

def call_gemini_with_sdk(prompt):
    """Call Gemini API using the official SDK."""
    try:
        # Get available model
        model_name = get_available_model()
        
        # Create model instance
        model = genai.GenerativeModel(model_name)
        
        # Generate content
        logger.info(f"Generating content with model: {model_name}")
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_k=40,
                top_p=0.95,
                max_output_tokens=2048,
            )
        )
        
        # Check if response is valid
        if not response or not hasattr(response, 'text'):
            raise ValueError("Invalid response from Gemini API")
        
        logger.info(f"Successfully generated content with {model_name}")
        return response.text, model_name
        
    except Exception as e:
        logger.error(f"Error calling Gemini SDK: {str(e)}", exc_info=True)
        raise

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_labor_estimate(request):
    """Generate labor cost estimate using Gemini AI."""
    try:
        logger.info(f"Received estimate request from user {request.user.id}")
        data = request.data
        logger.debug(f"Request data: {data}")

        # Parse area data
        area = data.get('area')
        if isinstance(area, str):
            try:
                area_data = json.loads(area)
            except json.JSONDecodeError:
                logger.error(f"Invalid area format: {area}")
                return Response(
                    {"error": "Invalid area format"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            area_data = area or {}

        # Get location and project type
        location_name = data.get('location')
        project_type_name = data.get('projectType')

        try:
            project_type = ProjectType.objects.get(name=project_type_name)
        except ProjectType.DoesNotExist:
            logger.error(f"ProjectType not found: {project_type_name}")
            return Response(
                {"error": f"Project type '{project_type_name}' not found"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate AI estimate
        prompt = generate_labor_prompt(data, area_data)
        
        try:
            # Call Gemini API using SDK
            response_text, model_name = call_gemini_with_sdk(prompt)
            
            # Clean and parse the response
            cleaned_text = clean_json_response(response_text)
            logger.debug(f"Cleaned response: {cleaned_text[:500]}...")
            
            estimate_data = json.loads(cleaned_text)
            
            # Validate the response has required fields
            required_fields = ['labor_roles', 'subtotal', 'totalCost', 'recommendations']
            if not all(field in estimate_data for field in required_fields):
                logger.error(f"Missing required fields in AI response: {estimate_data.keys()}")
                return Response(
                    {"error": "AI response is missing required fields"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Create estimate record - matching your Estimate model fields
            estimate = Estimate.objects.create(
                user=request.user,
                project_type=project_type,
                project_name=data.get('project_name', 'Labor Estimate'),
                construction_type=data.get('construction_type', 'new_construction'),
                building_type=data.get('buildingType', None),
                data_period=data.get('data_period', 'Q1'),
                project_description=data.get('specifications', '')[:150],
                total_area=float(area_data.get('total', 0)) if area_data.get('total') else None,
                total_estimated_cost=estimate_data.get('totalCost', 0),
                status='approved',
                source='ai'  # Changed to 'ai' since this is AI-generated
            )

            # Create labor-specific estimate record
            labor_estimate = LaborEstimate.objects.create(
                estimate=estimate,
                raw_response=estimate_data,
                model_version=model_name,
                labor_roles=estimate_data.get('labor_roles', []),
                subtotal=estimate_data.get('subtotal', 0),
                statutory_deductions=estimate_data.get('statutoryDeductions', 0),
                total_cost=estimate_data.get('totalCost', 0),
                recommendations=estimate_data.get('recommendations', [])
            )
            
            logger.info(f"Successfully created estimate {estimate.id} and labor estimate {labor_estimate.id} using {model_name}")

            # Return the estimate data
            return Response({
                'id': estimate.id,
                'data': estimate_data,
                'model_used': model_name
            }, status=status.HTTP_200_OK)

        except json.JSONDecodeError as je:
            logger.error(f"JSON parsing error: {str(je)}")
            logger.error(f"Raw response: {response_text if 'response_text' in locals() else 'No response'}")
            return Response(
                {"error": "Failed to parse AI response. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Error generating estimate: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Failed to generate estimate: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return Response(
            {"error": "An unexpected error occurred"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )