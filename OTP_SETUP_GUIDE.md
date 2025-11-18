# Africa's Talking OTP Setup Guide - Quick Start

## ✅ Implementation Complete

The Africa's Talking OTP verification system has been successfully integrated into JengaEA.

## 🔧 Configuration Steps

### 1. Set Environment Variables

Add these to your `.env` file (both local and Render):

```bash
AFRICAS_TALKING_USERNAME=your_username_here
AFRICAS_TALKING_API_KEY=your_api_key_here
AFRICAS_TALKING_SENDER_ID=20880
```

### 2. Get Africa's Talking Credentials

1. **Login** to Africa's Talking: https://account.africastalking.com/
2. **Go to Settings** → API Key
3. **Copy your credentials**:
   - Username (e.g., "sandbox" or your production username)
   - API Key
4. **Sender ID**: Already configured as `20880`

### 3. Deploy to Render

#### Option 1: Via Render Dashboard
1. Go to your backend service on Render
2. Click **Environment**
3. Add the three environment variables above
4. Click **Save Changes**
5. Render will auto-deploy

#### Option 2: Via Git Push (Already Done!)
The code has been pushed to GitHub. Render will automatically:
- Detect the new commit
- Deploy the updated backend
- Apply environment variables you set in dashboard

## 📱 How It Works

### User Registration Flow

1. **User submits registration form**
   ```
   POST /api/accounts/register/
   {
     "email": "user@example.com",
     "phone_number": "+254712345678",
     "password": "SecurePass123",
     "password_confirm": "SecurePass123",
     "first_name": "John",
     "last_name": "Doe",
     "role": "contractor"
   }
   ```

2. **Backend automatically:**
   - Creates user account (unverified)
   - Generates 6-digit OTP
   - **Sends SMS via Africa's Talking with sender ID 20880**
   - Returns registration success

3. **User receives SMS:**
   ```
   From: 20880
   Message: Your JengaEA verification code is: 123456. Valid for 10 minutes.
   ```

4. **User verifies OTP:**
   ```
   POST /api/accounts/verify-otp/
   {
     "phone_number": "+254712345678",
     "otp_code": "123456"
   }
   ```

5. **Account is verified** and user can login

## 🎯 Key Features Implemented

✅ **Automatic OTP on Registration** - No separate API call needed  
✅ **Sender ID 20880** - All SMS show from 20880  
✅ **10-minute Expiry** - OTPs valid for 10 minutes  
✅ **5 Attempt Limit** - Prevents brute force  
✅ **Auto-invalidation** - Old OTPs deleted when new one requested  
✅ **Development Fallback** - OTP logged/returned if SMS fails  

## 📊 Testing

### Development Testing (Without SMS)
If SMS sending fails (e.g., no credits, wrong credentials), the system:
- Still creates the OTP in database
- Logs the OTP in backend console
- Returns OTP in API response for testing

### Production Testing
1. Register a test account with your phone number
2. Check if you receive SMS from `20880`
3. Use the OTP code to verify
4. Confirm account is marked as verified

## 🚨 Important Notes

### Sandbox vs Production

**Sandbox Mode** (for testing):
- Username: `sandbox`
- Only works with registered test numbers
- Free for testing
- Limited to Africa's Talking test numbers

**Production Mode**:
- Your actual username
- Works with any valid phone number
- Costs ~KES 1.00 per SMS
- Use sender ID `20880`

### Phone Number Format
The system auto-formats numbers:
- `0712345678` → `+254712345678`
- `254712345678` → `+254712345678`
- `+254712345678` → `+254712345678` ✅

## 💰 SMS Costs

- **Per OTP SMS**: ~KES 0.80 - 1.00
- **Character count**: 65 characters (1 SMS)
- **Estimated cost per registration**: KES 1.00

### Cost Monitoring
- Check Africa's Talking dashboard for SMS usage
- Set up billing alerts
- Monitor failed deliveries

## 🔍 Troubleshooting

### SMS Not Received?
1. **Check logs** for error messages
2. **Verify credentials** in .env file
3. **Check SMS credits** in Africa's Talking dashboard
4. **Confirm phone format** starts with +254
5. **Wait 1-2 minutes** for network delays
6. **Check spam** (unlikely with sender ID)

### Check Logs on Render
```bash
# View logs
render logs --tail

# Look for:
# ✅ SMS SENT SUCCESSFULLY
# ❌ SMS SENDING FAILED
# [DEV MODE] OTP for +254... : 123456
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Africa's Talking not initialized" | Add credentials to .env |
| "Invalid API key" | Check API key in dashboard |
| "Insufficient credits" | Top up account |
| OTP expired | 10-minute limit, request new one |
| Too many attempts | Request new OTP |

## 📚 Files Modified

✅ `backend/.env.example` - Added AT configuration  
✅ `backend/accounts/utils.py` - Updated with sender ID  
✅ `backend/accounts/views.py` - Auto-send OTP on registration  
✅ `AFRICAS_TALKING_OTP_INTEGRATION.md` - Full documentation  

## 🔗 API Endpoints

### Register (Auto-sends OTP)
```http
POST https://api.jengaeafrica.com/api/accounts/register/
```

### Manual OTP Request
```http
POST https://api.jengaeafrica.com/api/accounts/send-otp/
```

### Verify OTP
```http
POST https://api.jengaeafrica.com/api/accounts/verify-otp/
```

## ✨ Next Steps

1. **Set environment variables on Render**
2. **Test with your phone number**
3. **Monitor SMS delivery in AT dashboard**
4. **Update frontend to handle OTP verification flow**
5. **Consider adding rate limiting for security**

## 📞 Support

- **Africa's Talking**: support@africastalking.com
- **Documentation**: https://developers.africastalking.com/
- **Dashboard**: https://account.africastalking.com/

---

**Status**: ✅ Deployed to GitHub (commit d402b80)  
**Sender ID**: 20880  
**Auto-deploy**: Render will detect changes  
**Ready for**: Environment variable configuration
