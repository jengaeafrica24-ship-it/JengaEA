"""
Middleware to log all incoming requests for debugging
"""
import logging
import os

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    """Log all incoming requests for debugging"""
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log ALL requests including OPTIONS
        print("\n" + "="*80)
        print(f"[MIDDLEWARE] {request.method} {request.path}")
        print(f"  Host: {request.get_host()}")
        print(f"  Origin: {request.META.get('HTTP_ORIGIN', 'N/A')}")
        print(f"  Referer: {request.META.get('HTTP_REFERER', 'N/A')}")
        print(f"  User-Agent: {request.META.get('HTTP_USER_AGENT', 'N/A')[:50]}...")
        
        if request.method == 'OPTIONS':
            print(f"  ⚠️  CORS PREFLIGHT REQUEST")
            print(f"  Access-Control-Request-Method: {request.META.get('HTTP_ACCESS_CONTROL_REQUEST_METHOD', 'N/A')}")
            print(f"  Access-Control-Request-Headers: {request.META.get('HTTP_ACCESS_CONTROL_REQUEST_HEADERS', 'N/A')}")
        else:
            print(f"  User: {request.user if hasattr(request, 'user') else 'Anonymous'}")
            print(f"  Content-Type: {request.META.get('CONTENT_TYPE', 'N/A')}")
            print(f"  Authorization: {request.META.get('HTTP_AUTHORIZATION', 'N/A')[:50]}...")
            if request.method in ['POST', 'PUT', 'PATCH']:
                body_size = len(request.body) if hasattr(request, 'body') else 0
                print(f"  Body size: {body_size} bytes")
                if body_size > 0 and body_size < 1000:
                    try:
                        import json
                        body_data = json.loads(request.body.decode('utf-8'))
                        print(f"  Body data: {body_data}")
                    except:
                        print(f"  Body preview: {request.body.decode('utf-8')[:100]}...")
        
        print("="*80)
        
        # Process request
        response = self.get_response(request)
        
        # Log response
        print(f"[MIDDLEWARE] RESPONSE: {response.status_code} for {request.method} {request.path}")

        # Ensure CORS headers are present for development if not already set by corsheaders
        try:
            origin = request.META.get('HTTP_ORIGIN')
            # If the CORS middleware didn't set headers, inject safe development defaults
            if not response.get('Access-Control-Allow-Origin'):
                if origin:
                    response['Access-Control-Allow-Origin'] = origin
                else:
                    response['Access-Control-Allow-Origin'] = '*'

            if not response.get('Access-Control-Allow-Methods'):
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'

            if not response.get('Access-Control-Allow-Headers'):
                # Prefer the request's requested headers where possible
                req_hdrs = request.META.get('HTTP_ACCESS_CONTROL_REQUEST_HEADERS')
                response['Access-Control-Allow-Headers'] = req_hdrs if req_hdrs else 'Authorization, Content-Type'

            if not response.get('Access-Control-Allow-Credentials'):
                response['Access-Control-Allow-Credentials'] = 'true'
        except Exception as e:
            # Don't break response logging if header injection fails
            logger.debug('Failed to inject CORS headers: %s', e)

        # Log CORS headers in response
        if hasattr(response, 'headers'):
            cors_origin = response.get('Access-Control-Allow-Origin', 'Not set')
            cors_methods = response.get('Access-Control-Allow-Methods', 'Not set')
            print(f"  CORS Headers:")
            print(f"    Access-Control-Allow-Origin: {cors_origin}")
            print(f"    Access-Control-Allow-Methods: {cors_methods}")
            print(f"    Access-Control-Allow-Headers: {response.get('Access-Control-Allow-Headers', 'Not set')}")
            print(f"    Access-Control-Allow-Credentials: {response.get('Access-Control-Allow-Credentials', 'Not set')}")
        
        print("="*80 + "\n")
        
        return response

