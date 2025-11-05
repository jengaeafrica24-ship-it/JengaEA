# Frontend Deployment Checklist

## 1. Render Dashboard Setup
1. Go to your Render dashboard: https://dashboard.render.com
2. Select the frontend service (jengaeafrontend)
3. Click "Environment" in the left sidebar
4. Add/Update environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://jengaea.onrender.com`
   - Click "Save Changes"

## 2. Build Settings
Verify these settings in the "Settings" tab:
- Build Command: `cd frontend && npm install && npm run build`
- Publish Directory: `frontend/build`
- Auto-Deploy: Enabled

## 3. Deploy
1. Click "Manual Deploy" > "Deploy latest commit"
2. Wait for build to complete (watch the logs)

## 4. Testing Steps
1. Open Chrome in Incognito mode (Ctrl+Shift+N)
2. Visit: https://jengaeafrontend.onrender.com/register
3. Open Developer Tools (F12)
4. Go to Network tab
5. Fill out the registration form with test data:
   ```json
   {
     "email": "testuser@example.com",
     "phone_number": "+254700000123",
     "password": "TestPass123!",
     "password_confirm": "TestPass123!",
     "first_name": "Test",
     "last_name": "User",
     "role": "contractor"
   }
   ```
6. Submit the form
7. In Network tab, look for POST to /api/auth/register/
8. Check:
   - Request URL should be https://jengaea.onrender.com/api/auth/register/
   - Status should be 201
   - Response should have success:true

## 5. Troubleshooting
If you see issues:
1. Check Network tab for the actual request URL
2. Look for CORS errors in Console tab
3. Verify REACT_APP_API_URL is set correctly
4. Check response status and body for error details

Post the Network tab details here if you need help debugging!