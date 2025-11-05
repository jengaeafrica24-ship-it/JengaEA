from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, OTPVerification
class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'phone_number', 'role', 'password', 'password_confirm',
                  'first_name', 'last_name', 'location', 'company_name')
        extra_kwargs = {
            'email': {'required': True},
            'phone_number': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
            'role': {'required': True},
        }
    
    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate_phone_number(self, value):
        """Check if phone number already exists"""
        if User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value
    
    def validate(self, attrs):
        """Validate password match"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        return attrs
    
    def create(self, validated_data):
        """Create user"""
        # Remove password_confirm
        validated_data.pop('password_confirm')
        
        # Create user
        user = User.objects.create_user(
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            role=validated_data['role'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            location=validated_data.get('location', ''),
            company_name=validated_data.get('company_name', ''),
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user details"""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'phone_number', 'role', 
                  'first_name', 'last_name', 'location', 'company_name',
                  'is_verified', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at', 'is_verified')


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
            
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'phone_number', 'role', 'first_name', 
                 'last_name', 'location', 'company_name', 'is_verified', 'created_at')
        read_only_fields = ('id', 'email', 'is_verified', 'created_at')


class OTPSendSerializer(serializers.Serializer):
    """Serializer for sending OTP"""
    
    phone_number = serializers.CharField(max_length=17)
    
    def validate_phone_number(self, value):
        # Basic phone number validation
        if not value.startswith('+'):
            raise serializers.ValidationError("Phone number must include country code")
        return value


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    
    phone_number = serializers.CharField(max_length=17)
    otp_code = serializers.CharField(max_length=6)
    
    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        otp_code = attrs.get('otp_code')
        
        try:
            otp_obj = OTPVerification.objects.get(
                phone_number=phone_number,
                otp_code=otp_code,
                is_verified=False
            )
            
            from django.utils import timezone
            if timezone.now() > otp_obj.expires_at:
                raise serializers.ValidationError('OTP has expired')
                
            attrs['otp_obj'] = otp_obj
        except OTPVerification.DoesNotExist:
            raise serializers.ValidationError('Invalid OTP code')
            
        return attrs



