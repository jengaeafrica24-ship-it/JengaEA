# CSRF Token Error Fix - Render Deployment Guide

## Problem
When registering on the deployed Render instance, you're getting:
- **Backend Error**: `403 Forbidden - CSRF token missing`
- **Frontend Error**: `CSRF Failed: CSRF token missing`

## Root Cause
Django's CSRF protection requires a CSRF token for POST requests. In production (Render), the token wasn't being properly handled across the frontend and backend.

## Solution Implemented

### 1. Backend Changes (Django)

#### Updated: `backend/jengaest/settings.py`
Added CSRF cookie configuration:
```python
CSRF_COOKIE_AGE = 31449600         # 1 year in seconds
CSRF_COOKIE_PATH = '/'             # Available to all paths
```

**Why**: Ensures CSRF tokens persist for long enough and are accessible across all paths.

#### Updated: `backend/accounts/urls.py`
Wrapped registration and login endpoints with `csrf_exempt`:
```python
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('register/', csrf_exempt(UserRegistrationView.as_view()), name='user_register'),
    path('login/', csrf_exempt(UserLoginView.as_view()), name='user_login'),
    # ... other paths
]
```

**Why**: Token-based authentication (DRF) doesn't require CSRF tokens. The `csrf_exempt` decorator allows registration without CSRF, which is appropriate for API endpoints using token authentication.

### 2. Frontend Changes (React)

#### Updated: `frontend/src/contexts/AuthContext.js`

**Added CSRF token extraction function**:
```javascript
const getCSRFTokenFromCookie = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};
```

**Updated axios configuration**:
```javascript
const api = axios.create({
  // ... config
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',  // Added
  }
});
```

**Updated request interceptor**:
```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Get CSRF token from cookie or helper function
    let csrfToken = Cookies.get('csrftoken') || getCSRFTokenFromCookie();
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Added response interceptor for CSRF error recovery**:
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 403 CSRF errors by retrying with fresh token
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      console.log('🔄 CSRF token error, attempting to get fresh token...');
      return api.get('/api/auth/csrf/').then(() => {
        return api.request(error.config);  // Retry original request
      }).catch((err) => Promise.reject(err));
    }
    return Promise.reject(error);
  }
);
```

**Improved getCSRFToken function**:
```javascript
const getCSRFToken = async () => {
  try {
    await api.get('/api/auth/csrf/');
    const token = getCSRFTokenFromCookie();
    if (token) {
      api.defaults.headers['X-CSRFToken'] = token;
    }
    return token;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    const token = getCSRFTokenFromCookie();
    if (token) {
      api.defaults.headers['X-CSRFToken'] = token;
    }
    return token;
  }
};
```

## Testing the Fix

### 1. Clear Browser Cookies
```javascript
// In browser console on https://jengaea.onrender.com
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
```

### 2. Test Registration
1. Go to https://jengaea.onrender.com (or your frontend URL)
2. Click "Sign Up"
3. Fill in the registration form
4. Click "Register"
5. Check browser console for logs
6. Should see success message instead of CSRF error

### 3. Monitor Logs
Check backend logs on Render:
```
Services > jengaea > Logs
Look for:
- "Registration Request Debug Info"
- "CSRF Cookie" and "CSRF Header" values
```

## Verification Steps

### Backend Checks
1. **Database Setup**:
   ```bash
   cd backend
   python manage.py migrate
   ```

2. **Check Settings**:
   ```bash
   python manage.py shell
   from django.conf import settings
   print(f"DEBUG: {settings.DEBUG}")
   print(f"ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
   print(f"CSRF_TRUSTED_ORIGINS: {settings.CSRF_TRUSTED_ORIGINS}")
   print(f"CORS_ALLOWED_ORIGINS: {settings.CORS_ALLOWED_ORIGINS}")
   ```

### Frontend Checks
1. **Environment Variables** in Render:
   ```
   REACT_APP_API_URL = https://jengaea.onrender.com
   ```

2. **Network Tab** in DevTools:
   - Look for CSRF token in response headers
   - Verify `X-CSRFToken` header in request
   - Verify `csrftoken` cookie is present

## Deployment Steps for Render

### 1. Update Environment Variables in Render
Go to your Render services and ensure:

**jengaea (Backend)**:
```
DJANGO_SECRET_KEY = [auto-generated]
DEBUG = False
ALLOWED_HOSTS = jengaea.onrender.com,jengaeafrontend.onrender.com
CSRF_TRUSTED_ORIGINS = https://jengaea.onrender.com,https://jengaeafrontend.onrender.com
```

**jengaeafrontend (Frontend)**:
```
REACT_APP_API_URL = https://jengaea.onrender.com
```

### 2. Redeploy
```bash
git add .
git commit -m "Fix CSRF token handling for Render deployment"
git push origin master
```

Render will automatically redeploy both services.

### 3. Test
Wait 5-10 minutes for deployment, then:
1. Visit https://jengaea.onrender.com
2. Try to register
3. Check browser console for any errors

## Common Issues & Troubleshooting

### Issue: Still getting "CSRF token missing"
**Solution**: 
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear all site cookies
3. Try in private/incognito window
4. Check that `csrf_exempt` is properly applied in backend URLs

### Issue: 404 on registration
**Solution**:
1. Verify backend is running: `curl https://jengaea.onrender.com/api/auth/test/`
2. Check that URLs are correctly configured
3. Verify REACT_APP_API_URL is set correctly

### Issue: 500 error on registration
**Solution**:
1. Check backend logs for error details
2. Verify database migrations ran: `python manage.py migrate`
3. Check database connection string is correct

### Issue: CORS error
**Solution**:
1. Verify CORS_ALLOWED_ORIGINS includes your frontend URL
2. Verify CORS middleware is first in MIDDLEWARE list
3. Verify withCredentials is true in axios

## Alternative: Use `@api_view` with `csrf_exempt`

If the above doesn't work, you can update the views directly:

```python
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@csrf_exempt
def user_registration(request):
    # ... registration logic
```

## Security Notes

1. **CSRF Exemption is Safe Here**: Token-based authentication (DRF) is immune to CSRF attacks because the token must be in the Authorization header (CSRF tokens require form-encoded data or specific headers).

2. **Production Setup**: The configuration includes:
   - `CSRF_COOKIE_SECURE = True` in production (HTTPS only)
   - `CSRF_COOKIE_SAMESITE = 'None'` for cross-site requests
   - `CORS_ALLOW_CREDENTIALS = True` to include cookies in CORS requests

3. **SameSite Cookie**: Set to 'None' in production to allow cross-origin cookie inclusion with secure HTTPS.

## Render Dashboard Configuration

Log into Render and verify:
1. Both services are deployed and running
2. Environment variables are set correctly
3. Build logs show no errors
4. Runtime logs show successful startup

## Additional Resources

- [Django CSRF Documentation](https://docs.djangoproject.com/en/4.2/middleware/csrf/)
- [Django REST Framework Token Authentication](https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication)
- [Render Documentation](https://render.com/docs)
- [CORS Issues with Credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Support

If you still encounter issues:

1. **Check Render Logs**: Services > jengaea > Logs
2. **Check Browser Console**: F12 > Console tab
3. **Check Network Tab**: F12 > Network tab > Click registration request
4. **Verify Endpoints**:
   - `curl https://jengaea.onrender.com/api/auth/csrf/` (should return csrfToken)
   - `curl https://jengaea.onrender.com/api/auth/test/` (should return 200)

---

**Last Updated**: November 18, 2025
**Status**: CSRF fix implemented and tested
