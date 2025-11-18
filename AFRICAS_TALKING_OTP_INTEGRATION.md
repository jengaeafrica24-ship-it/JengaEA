# Africa's Talking OTP Integration - JengaEA

## Overview
This document describes the Africa's Talking SMS OTP (One-Time Password) implementation for user registration and phone number verification in the JengaEA construction cost estimation platform.

## Configuration

### Environment Variables
Add the following to your `.env` file:

```bash
# Africa's Talking SMS Configuration
AFRICAS_TALKING_USERNAME=your_username_here
AFRICAS_TALKING_API_KEY=your_api_key_here
AFRICAS_TALKING_SENDER_ID=20880
```

### Sender ID
- **Configured Sender ID**: `20880`
- This sender ID will be used for all OTP SMS messages

## Features Implemented

### 1. Automatic OTP on Registration
When a user registers, the system automatically:
1. Creates a user account (unverified state)
2. Generates a 6-digit OTP code
3. Sends the OTP via SMS using Africa's Talking API with sender ID `20880`
4. Returns registration success with `requires_verification: true`

### 2. Manual OTP Request
Users can request a new OTP at any time using the `/api/accounts/send-otp/` endpoint.

### 3. OTP Verification
Users verify their phone number by submitting the OTP code via the `/api/accounts/verify-otp/` endpoint.

## API Endpoints

### 1. User Registration (with Auto OTP)
```http
POST /api/accounts/register/
Content-Type: application/json

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

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. OTP sent to your phone.",
  "data": {
    "token": "auth_token_here",
    "user_id": 1,
    "email": "user@example.com",
    "phone_number": "+254712345678",
    "role": "contractor",
    "requires_verification": true,
    "otp_sent": true
  }
}
```

### 2. Send OTP
```http
POST /api/accounts/send-otp/
Content-Type: application/json

{
  "phone_number": "+254712345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "phone_number": "+254712345678",
  "sms_sent": true
}
```

### 3. Verify OTP
```http
POST /api/accounts/verify-otp/
Content-Type: application/json

{
  "phone_number": "+254712345678",
  "otp_code": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "phone_number": "+254712345678"
}
```

**Response (Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid OTP code"
}
```

**Response (Expired):**
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}
```

## OTP Security Features

### 1. Expiration
- **Validity**: 10 minutes
- Expired OTPs cannot be used and require a new request

### 2. Single Use
- Each OTP can only be verified once
- After successful verification, the OTP is marked as used

### 3. Attempt Limiting
- **Maximum attempts**: 5 failed verification attempts
- After 5 failed attempts, a new OTP must be requested

### 4. Auto-Invalidation
- When a new OTP is requested, all previous unverified OTPs for that phone number are deleted
- Only the most recent OTP is valid

### 5. User Association
- OTPs are linked to user accounts when available
- Supports OTP verification before user creation (phone verification flow)

## SMS Message Format

```
Your JengaEA verification code is: 123456. Valid for 10 minutes.
```

- **Sender**: `20880`
- **Character count**: ~65 characters
- **Encoding**: GSM 7-bit (single SMS)

## Phone Number Format

### Accepted Formats
The system automatically normalizes phone numbers:

```python
# Input formats (all converted to E.164)
"0712345678"      → "+254712345678"
"254712345678"    → "+254712345678"
"+254712345678"   → "+254712345678"
```

### Validation
- Must be 9-15 digits (excluding country code symbol)
- Accepts international format with `+` prefix
- Country code is required (auto-added if missing for Kenya: +254)

## Database Schema

### OTPVerification Model
```python
class OTPVerification(models.Model):
    user = models.ForeignKey(User, null=True, blank=True)
    phone_number = models.CharField(max_length=17)
    otp_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)
```

**Indexes:**
- `(phone_number, otp_code)` - Fast OTP lookup
- `(phone_number, is_verified)` - Fast unverified OTP queries

## Error Handling

### SMS Sending Failures
If the SMS fails to send:
1. The OTP is still created in the database
2. The response indicates `sms_sent: false`
3. **Development Mode**: The OTP code is logged and returned in the response
4. **Production Mode**: The OTP code is only logged (not returned)

### Common Error Scenarios

| Error | HTTP Status | Response |
|-------|-------------|----------|
| Missing phone number | 400 | `{"success": false, "message": "Phone number is required"}` |
| Invalid OTP | 400 | `{"success": false, "message": "Invalid OTP code"}` |
| Expired OTP | 400 | `{"success": false, "message": "OTP has expired..."}` |
| Too many attempts | 400 | `{"success": false, "message": "Too many failed attempts..."}` |
| SMS API error | 500 | `{"success": false, "message": "Failed to send OTP"}` |

## Frontend Integration Example

### Registration Flow with OTP

```javascript
// Step 1: Register user
const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/accounts/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // User registered, OTP sent automatically
      if (data.data.requires_verification) {
        // Redirect to OTP verification page
        localStorage.setItem('phone_to_verify', data.data.phone_number);
        localStorage.setItem('temp_token', data.data.token);
        window.location.href = '/verify-otp';
      }
    }
  } catch (error) {
    console.error('Registration error:', error);
  }
};

// Step 2: Verify OTP
const verifyOTP = async (phoneNumber, otpCode) => {
  try {
    const response = await fetch('/api/accounts/verify-otp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        otp_code: otpCode
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Verification successful, redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      alert(data.message); // Show error
    }
  } catch (error) {
    console.error('Verification error:', error);
  }
};

// Step 3: Resend OTP
const resendOTP = async (phoneNumber) => {
  try {
    const response = await fetch('/api/accounts/send-otp/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('New OTP sent successfully');
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
  }
};
```

## Testing

### Development Mode Testing
In development, if SMS sending fails, the OTP code is logged and returned:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "phone_number": "+254712345678",
  "sms_sent": false,
  "otp_code": "123456"  // Only present if sms_sent is false
}
```

### Production Testing Checklist
1. ✅ Configure correct Africa's Talking credentials
2. ✅ Test with valid Kenyan phone numbers (+254...)
3. ✅ Verify sender ID appears as `20880`
4. ✅ Confirm SMS delivery within 30 seconds
5. ✅ Test OTP expiration (10 minutes)
6. ✅ Test maximum attempts limit (5 attempts)
7. ✅ Test OTP invalidation on new request
8. ✅ Verify user account is marked as verified

## Monitoring & Logging

### Log Levels
The system logs detailed SMS sending information:

```
INFO - SMS Service Initialization
INFO - Sender ID: 20880
INFO - Starting SMS Send Process
INFO - 📱 Formatted phone number: 0712345678 -> +254712345678
INFO - 📤 Preparing to send SMS
INFO - 🚀 Sending SMS...
INFO - ✅ SMS SENT SUCCESSFULLY
INFO - ✅ OTP sent successfully to +254712345678
```

### Error Logs
```
ERROR - ❌ Africa's Talking SMS not initialized!
ERROR - ❌ SMS SENDING FAILED
ERROR - Failed to send SMS: [error message]
WARNING - [DEV MODE] OTP for +254712345678: 123456
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` file to version control
- Use different credentials for development and production
- Rotate API keys regularly

### 2. Rate Limiting
Consider implementing rate limiting to prevent:
- SMS bombing (multiple OTP requests)
- Brute force OTP guessing
- API abuse

### 3. Production Hardening
Before production deployment:
- Remove or secure OTP logging
- Implement IP-based rate limiting
- Add CAPTCHA for OTP requests
- Monitor SMS costs and set alerts
- Implement phone number verification (check if valid)

## Cost Optimization

### SMS Pricing (Africa's Talking Kenya)
- **Per SMS**: ~KES 0.80 - 1.00
- **OTP SMS**: Single message (65 characters)
- **Cost per user registration**: ~KES 1.00

### Optimization Strategies
1. **Longer expiry times** (10 minutes is good balance)
2. **Clear messaging** to reduce support requests
3. **Resend cooldown** (30-60 seconds between resends)
4. **Phone validation** before sending SMS

## Troubleshooting

### Issue: SMS not received
**Possible causes:**
1. Incorrect phone number format
2. Invalid Africa's Talking credentials
3. Insufficient SMS credits
4. Phone number not registered (sandbox mode)
5. Network delays (wait 1-2 minutes)

**Solution:**
- Check logs for error messages
- Verify phone number format (+254...)
- Check Africa's Talking dashboard for delivery status
- Ensure sufficient SMS credits

### Issue: OTP always shows as invalid
**Possible causes:**
1. OTP expired (>10 minutes)
2. Too many failed attempts (>5)
3. Case sensitivity in OTP input
4. Old OTP being used after new request

**Solution:**
- Request a new OTP
- Check OTP expiry in database
- Ensure frontend sends correct OTP format

### Issue: Multiple OTPs received
**Possible causes:**
1. Multiple registration attempts
2. Resend button clicked multiple times
3. API called multiple times (double-submit)

**Solution:**
- Implement frontend debouncing
- Add cooldown period between OTP requests
- Show loading state during API calls

## Future Enhancements

### Potential Improvements
1. **SMS Templates**: Store message templates in database
2. **Multi-language Support**: Send OTP in user's language
3. **Fallback Methods**: Email OTP if SMS fails
4. **Two-Factor Authentication**: Use OTP for login security
5. **Analytics Dashboard**: Track OTP success rates
6. **WhatsApp Integration**: Alternative to SMS
7. **Voice OTP**: Call user with OTP for accessibility

## Support & Contact

For Africa's Talking support:
- **Dashboard**: https://account.africastalking.com/
- **Documentation**: https://developers.africastalking.com/
- **Support Email**: support@africastalking.com

---

**Last Updated**: November 18, 2025  
**Version**: 1.0  
**Author**: JengaEA Development Team  
**Integration**: Africa's Talking SMS API  
**Sender ID**: 20880
