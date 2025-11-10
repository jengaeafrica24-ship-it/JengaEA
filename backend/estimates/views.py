from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import google.generativeai as genai
import json
import os

# Configure Google API
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_material_estimate(request):
    try:
        data = json.loads(request.body)
        
        # Extract data from request
        location = data.get('location')
        project_type = data.get('projectType')
        building_type = data.get('buildingType')
        data_period = data.get('dataPeriod')
        construction_phase = data.get('constructionPhase')
        dimensions = data.get('dimensions', {})
        specifications = data.get('specifications', '')
        
        # Create prompt for Gemini AI
        prompt = f"""
        Generate a detailed construction material cost estimate for:
        
        Location: {location}
        Project Type: {project_type}
        Building Type: {building_type}
        Period: {data_period}
        Construction Phase: {construction_phase}
        
        Dimensions:
        - Length: {dimensions.get('length')} meters
        - Width: {dimensions.get('width')} meters
        - Height: {dimensions.get('height')} meters
        
        Additional Specifications:
        {specifications}
        
        Please provide:
        1. Detailed material quantities needed
        2. Current market prices in KES for each material
        3. Total cost estimation
        4. Material availability analysis
        5. Price trend predictions
        6. Recommendations for cost optimization
        7. Alternative material suggestions if applicable
        8. Sustainability considerations
        """
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        
        # Process and structure the response
        if response.text:
            # Parse AI response and structure it
            structured_response = {
                'success': True,
                'data': {
                    'materials': process_materials_from_ai_response(response.text),
                    'total_cost': extract_total_cost(response.text),
                    'recommendations': extract_recommendations(response.text),
                    'market_analysis': extract_market_analysis(response.text),
                    'raw_response': response.text
                }
            }
            return JsonResponse(structured_response)
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to generate estimate'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

def process_materials_from_ai_response(text):
    # Process the AI response to extract structured material data
    # This is a placeholder - implement actual parsing logic
    return []

def extract_total_cost(text):
    # Extract the total cost from AI response
    # This is a placeholder - implement actual parsing logic
    return 0

def extract_recommendations(text):
    # Extract recommendations from AI response
    # This is a placeholder - implement actual parsing logic
    return []

def extract_market_analysis(text):
    # Extract market analysis from AI response
    # This is a placeholder - implement actual parsing logic
    return {}