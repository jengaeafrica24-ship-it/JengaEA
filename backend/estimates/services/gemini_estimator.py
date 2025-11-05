import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Allow overriding model name via env variable for easier debugging / compatibility
MODEL_NAME = os.getenv('GEMINI_MODEL', 'gemini-pro')

def _list_available_models():
    try:
        models = genai.list_models()
        # Try to extract names if possible
        try:
            names = [m.name if hasattr(m, 'name') else str(m) for m in models]
        except Exception:
            names = [str(m) for m in models]
        return names
    except Exception as e:
        return [f"(failed to list models: {e})"]

def estimate_construction_cost(project_details):
    """
    Use Gemini to get detailed cost estimates and insights for construction projects
    """
    project_name = project_details.get('project_name', 'Construction Project')
    building_type = project_details.get('buildingType', project_details.get('building_type', 'N/A'))
    total_area = project_details.get('total_area', 0)
    location_name = project_details.get('location_name', 'N/A')
    construction_type = project_details.get('constructionType', project_details.get('construction_type', 'N/A'))
    data_period = project_details.get('data_period', 'Q1')
    project_description = project_details.get('projectDescription', project_details.get('project_description', 'N/A'))
    
    prompt = f"""
    As a construction cost estimation expert, analyze the following project details and provide a detailed cost breakdown:
    
    Project Name: {project_name}
    Building Type: {building_type}
    Construction Type: {construction_type}
    Total Area: {total_area} square meters
    Location: {location_name}
    Data Period: {data_period}
    Project Description: {project_description}

    Provide a detailed response in the following JSON format:
    {{
        "cost_analysis": {{
            "base_cost_per_sqm": float,
            "location_multiplier": float,
            "adjusted_cost_per_sqm": float
        }},
        "breakdown": {{
            "materials": {{
                "total": float,
                "details": [
                    {{"item": "concrete", "cost": float, "percentage": float}},
                    {{"item": "steel", "cost": float, "percentage": float}},
                    {{"item": "finishing", "cost": float, "percentage": float}}
                ]
            }},
            "labor": {{
                "total": float,
                "details": [
                    {{"category": "skilled", "cost": float, "percentage": float}},
                    {{"category": "unskilled", "cost": float, "percentage": float}}
                ]
            }},
            "equipment": {{
                "total": float,
                "description": "string"
            }}
        }},
        "recommendations": [
            "string"
        ],
        "risk_factors": [
            "string"
        ]
    }}

    Base your estimates on current Kenyan construction market rates and consider local factors.
    Consider the data period ({data_period}) when estimating costs as material and labor prices may vary by season.
    """

    try:
        # Check if API key is configured
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables")

        # Attempt to use the configured model name. If this fails, list available models
        try:
            model = genai.GenerativeModel(MODEL_NAME)
            response = model.generate_content(prompt)
        except Exception as gen_err:
            # If initial model fails, try to pick a sensible fallback from available models
            available = _list_available_models()
            # Preference order for model keywords
            prefs = ['pro-latest', '2.5-pro', 'gemini-pro-latest', 'gemini-2.5-pro', 'gemini-2.5-flash', 'flash', 'pro']
            tried = [MODEL_NAME]
            response = None
            for kw in prefs:
                for m in available:
                    try:
                        mname = m if isinstance(m, str) else getattr(m, 'name', str(m))
                    except Exception:
                        mname = str(m)
                    if kw in mname and mname not in tried:
                        tried.append(mname)
                        try:
                            alt_model = genai.GenerativeModel(mname)
                            response = alt_model.generate_content(prompt)
                            # if we got here, we've succeeded with an alternative
                            MODEL_USED = mname
                            break
                        except Exception:
                            # ignore and keep trying
                            response = None
                if response:
                    break

            if not response:
                # Raise a clearer error including available models to help debug
                raise Exception(
                    f"Failed to call Gemini model '{MODEL_NAME}': {gen_err}. "
                    f"Available models: {available}. "
                    f"If '{MODEL_NAME}' is not supported, set GEMINI_MODEL env var to a supported model."
                )

        # Check if response is valid
        if not response or not hasattr(response, 'text'):
            raise ValueError("Invalid response from Gemini API")
        
        # Extract the JSON from the response
        response_text = response.text
        
        # Find the JSON content between curly braces
        start_idx = response_text.find('{')
        end_idx = response_text.rfind('}')
        
        if start_idx == -1 or end_idx == -1:
            raise ValueError("Could not find JSON in Gemini response")
        
        json_str = response_text[start_idx:end_idx+1]
        result = json.loads(json_str)
        return result
    except json.JSONDecodeError as e:
        print(f"JSON decode error in Gemini response: {str(e)}")
        print(f"Response text: {response_text[:500] if 'response_text' in locals() else 'N/A'}")
        return None
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        print(f"Error generating cost estimate ({error_type}): {error_msg}")
        
        # Re-raise with more context
        raise Exception(f"Gemini API error ({error_type}): {error_msg}")