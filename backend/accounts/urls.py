from django.urls import path
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from .views import (
    UserRegistrationView, UserLoginView, UserProfileView,
    send_otp, verify_otp, user_logout, user_dashboard, 
    simple_register, csrf_token
)

from django.middleware.csrf import get_token
from django.http import JsonResponse

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

urlpatterns = [
    path('test/', lambda request: HttpResponse("Test endpoint working"), name='test'),
    path('csrf/', get_csrf_token, name='get_csrf_token'),
    path('simple-register/', simple_register, name='simple_register'),
    path('register/', csrf_exempt(UserRegistrationView.as_view()), name='user_register'),
    path('login/', csrf_exempt(UserLoginView.as_view()), name='user_login'),
    path('logout/', user_logout, name='user_logout'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('dashboard/', user_dashboard, name='user_dashboard'),
    path('send-otp/', send_otp, name='send_otp'),
    path('verify-otp/', verify_otp, name='verify_otp'),
]



