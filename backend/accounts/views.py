from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.authtoken.models import Token as AuthToken
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from datetime import timedelta
import random
import logging

from .models import User, OTPVerification
from .serializers import (
    UserRegistrationSerializer, 
    UserProfileSerializer,
)

logger = logging.getLogger(__name__)


@csrf_exempt
def simple_register(request):
    """Simplest possible registration endpoint for testing"""
    if request.method == 'POST':
        logger.debug("=== Simple Register Debug Info ===")
        logger.debug(f"Request method: {request.method}")
        logger.debug(f"Content type: {request.content_type}")
        logger.debug(f"Headers: {dict(request.headers)}")
        logger.debug("=== End Simple Register Debug Info ===")
        
        return JsonResponse({
            'success': True,
            'message': 'Simple registration endpoint reached successfully',
            'data': {'received': True}
        }, status=200)
    
    return JsonResponse({
        'success': False,
        'message': 'Method not allowed'
    }, status=405)


@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(generics.CreateAPIView):
    """User registration endpoint"""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        logger.debug("=== Registration Request Debug Info ===")
        logger.debug(f"Registration request data: {request.data}")
        logger.debug(f"Content type: {request.content_type}")
        logger.debug(f"Request method: {request.method}")
        logger.debug(f"Request user: {request.user}")
        logger.debug(f"Request auth: {request.auth}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        logger.debug(f"Request META: {request.META}")
        logger.debug("=== End Debug Info ===")
        
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            logger.debug(f"Serializer errors: {serializer.errors}")
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create user
            user = serializer.save()
            
            # Send OTP
            otp_result = self._send_otp_internal(user.phone_number, user)
            
            logger.info(f"User registered successfully: {user.email}")
            
            return Response({
                'success': True,
                'message': 'Registration successful. Please verify your phone number.',
                'data': {
                    'user_id': user.id,
                    'email': user.email,
                    'phone_number': user.phone_number,
                    'role': user.role,
                    'otp_sent': otp_result['success']
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': 'An error occurred during registration',
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _send_otp_internal(self, phone_number, user=None):
        """Internal method to send OTP"""
        try:
            # Generate 6-digit OTP
            otp_code = str(random.randint(100000, 999999))
            
            # Invalidate old OTPs
            OTPVerification.objects.filter(
                phone_number=phone_number,
                is_verified=False
            ).delete()
            
            # Create new OTP
            otp_obj = OTPVerification.objects.create(
                user=user,
                phone_number=phone_number,
                otp_code=otp_code,
                expires_at=timezone.now() + timedelta(minutes=10)
            )
            
            # Send OTP via SMS
            from .utils import send_sms
            message = f"Your JengaEst verification code is: {otp_code}. Valid for 10 minutes."
            sms_result = send_sms(phone_number, message)
            
            if not sms_result['success']:
                logger.error(f"Failed to send SMS: {sms_result['message']}")
                # Log OTP for development as fallback (REMOVE IN PRODUCTION)
                logger.warning(f"[DEV MODE] OTP for {phone_number}: {otp_code}")
            
            return {
                'success': True,
                'message': 'OTP sent successfully',
                'sms_sent': sms_result['success']
            }
            
        except Exception as e:
            logger.error(f"OTP send error: {str(e)}", exc_info=True)
            return {'success': False, 'message': str(e)}


class UserLoginView(generics.GenericAPIView):
    """User login endpoint"""

    permission_classes = [permissions.AllowAny]

    def dispatch(self, request, *args, **kwargs):
        """Log request details for debugging"""
        logger.debug("=== Login Request Debug Info ===")
        logger.debug(f"Request method: {request.method}")
        logger.debug(f"Request headers: {dict(request.headers)}")
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                body = request.body.decode('utf-8')
                logger.debug(f"Request body: {body}")
            except Exception as e:
                logger.debug(f"Could not decode request body: {str(e)}")
        logger.debug("=== End Debug Info ===")
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        """Handle user login"""
        logger.debug("=== Processing Login Request ===")
        try:
            data = request.data
            logger.debug(f"Processed request data: {data}")
        except Exception as e:
            logger.error(f"Error processing request data: {str(e)}")
            return Response({
                'success': False,
                'message': 'Invalid request format'
            }, status=status.HTTP_400_BAD_REQUEST)

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            logger.warning("Login attempt with missing credentials")
            return Response({
                'success': False,
                'message': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Authenticate user
            logger.debug(f"Attempting to authenticate user: {email}")
            user = authenticate(request, username=email, password=password)

            if user is None:
                logger.warning(f"Failed login attempt for email: {email}")
                return Response({
                    'success': False,
                    'message': 'Invalid email or password'
                }, status=status.HTTP_401_UNAUTHORIZED)

            # Check if user is verified
            if not user.is_verified:
                logger.info(f"Unverified user login attempt: {email}")
                return Response({
                    'success': False,
                    'message': 'Please verify your phone number first',
                    'phone_number': user.phone_number,
                    'requires_verification': True
                }, status=status.HTTP_403_FORBIDDEN)

            # Login user
            login(request, user)

            # Get or create token
            token, created = AuthToken.objects.get_or_create(user=user)

            logger.info(f"Successful login for user: {email}")
            return Response({
                'success': True,
                'message': 'Login successful',
                'token': token.key,
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': 'An error occurred during login'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def send_otp(request):
    """Send OTP to phone number"""
    
    phone_number = request.data.get('phone_number')
    
    if not phone_number:
        return Response({
            'success': False,
            'message': 'Phone number is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate 6-digit OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Get user if exists
        user = None
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            pass
        
        # Invalidate old OTPs
        OTPVerification.objects.filter(
            phone_number=phone_number,
            is_verified=False
        ).delete()
        
        # Create new OTP
        otp_obj = OTPVerification.objects.create(
            user=user,
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Log OTP for development (REMOVE IN PRODUCTION)
        logger.warning(f"[DEV MODE] OTP for {phone_number}: {otp_code}")
        
        # TODO: Send SMS via Africa's Talking
        # from .utils import send_otp_sms
        # send_otp_sms(phone_number, otp_code)
        
        return Response({
            'success': True,
            'message': 'OTP sent successfully',
            'phone_number': phone_number,
            # Remove this in production:
            'otp_code': otp_code  # Only for development
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Send OTP error: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'Failed to send OTP'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp(request):
    """Verify OTP code"""
    logger.debug("=== OTP Verification Debug Info ===")
    logger.debug(f"Request data: {request.data}")
    logger.debug(f"Request headers: {dict(request.headers)}")
    logger.debug("=== End Debug Info ===")
    
    phone_number = request.data.get('phone_number')
    otp_code = request.data.get('otp_code')
    
    if not phone_number or not otp_code:
        return Response({
            'success': False,
            'message': 'Phone number and OTP code are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Find the most recent unverified OTP
        otp_obj = OTPVerification.objects.filter(
            phone_number=phone_number,
            otp_code=otp_code,
            is_verified=False
        ).order_by('-created_at').first()
        
        if not otp_obj:
            return Response({
                'success': False,
                'message': 'Invalid OTP code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if expired
        if timezone.now() > otp_obj.expires_at:
            return Response({
                'success': False,
                'message': 'OTP has expired. Please request a new one.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check attempts
        if otp_obj.attempts >= 5:
            return Response({
                'success': False,
                'message': 'Too many failed attempts. Please request a new OTP.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as verified
        otp_obj.is_verified = True
        otp_obj.save()
        
        # Verify user if exists
        try:
            user = User.objects.get(phone_number=phone_number)
            user.is_verified = True
            user.save()
            logger.info(f"User {user.email} verified successfully")
        except User.DoesNotExist:
            logger.warning(f"No user found for phone {phone_number}")
        
        return Response({
            'success': True,
            'message': 'Phone number verified successfully',
            'phone_number': phone_number
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"OTP verification error: {str(e)}", exc_info=True)
        
        # Increment attempts on error
        if 'otp_obj' in locals():
            otp_obj.attempts += 1
            otp_obj.save()
        
        return Response({
            'success': False,
            'message': 'An error occurred during verification'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def resend_otp(request):
    """Resend OTP to phone number"""
    
    phone_number = request.data.get('phone_number')
    
    if not phone_number:
        return Response({
            'success': False,
            'message': 'Phone number is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate new OTP
        otp_code = str(random.randint(100000, 999999))
        
        # Get user if exists
        user = None
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            pass
        
        # Invalidate old OTPs
        OTPVerification.objects.filter(
            phone_number=phone_number,
            is_verified=False
        ).delete()
        
        # Create new OTP
        otp_obj = OTPVerification.objects.create(
            user=user,
            phone_number=phone_number,
            otp_code=otp_code,
            expires_at=timezone.now() + timedelta(minutes=10)
        )
        
        # Log OTP for development
        logger.warning(f"[DEV MODE] Resent OTP for {phone_number}: {otp_code}")
        
        return Response({
            'success': True,
            'message': 'OTP resent successfully',
            'phone_number': phone_number,
            # Remove in production:
            'otp_code': otp_code
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Resend OTP error: {str(e)}", exc_info=True)
        return Response({
            'success': False,
            'message': 'Failed to resend OTP'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile management"""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_logout(request):
    """User logout endpoint"""
    
    try:
        # Delete auth token
        request.user.auth_token.delete()
    except Exception as e:
        logger.warning(f"Token deletion error: {str(e)}")
    
    # Logout user
    logout(request)
    
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """User dashboard data"""
    
    user = request.user
    
    # Get user's recent estimates (placeholder - implement in estimates app)
    recent_estimates = []
    
    return Response({
        'success': True,
        'user': UserProfileSerializer(user).data,
        'recent_estimates': recent_estimates,
        'subscription_status': 'active',
        'quota_remaining': 10
    }, status=status.HTTP_200_OK)