import africastalking
from django.conf import settings
import json
from .logger import sms_logger as logger

# Initialize Africa's Talking
username = getattr(settings, 'AFRICAS_TALKING_USERNAME', 'sandbox')
api_key = getattr(settings, 'AFRICAS_TALKING_API_KEY', None)
is_sandbox = username == 'sandbox'

# Print banner to make SMS logs more visible
logger.info("=" * 50)
logger.info("SMS Service Initialization")
logger.info("=" * 50)

if not api_key:
    logger.error("Africa's Talking API key not configured!")

try:
    africastalking.initialize(username, api_key)
    sms = africastalking.SMS
    logger.info(f"Africa's Talking initialized in {'sandbox' if is_sandbox else 'production'} mode")
except Exception as e:
    logger.error(f"Failed to initialize Africa's Talking: {str(e)}")
    sms = None

def send_sms(phone_number, message):
    """
    Send SMS using Africa's Talking API
    
    Args:
        phone_number (str): The recipient's phone number (should start with country code)
        message (str): The message to send
        
    Returns:
        dict: Response containing success status and message
    """
    # Initialize variables
    response = None
    try:
        logger.info("-" * 50)
        logger.info("Starting SMS Send Process")
        logger.info("-" * 50)

        if not sms:
            logger.error("❌ Africa's Talking SMS not initialized!")
            raise Exception("Africa's Talking SMS not initialized")

        # Format phone number
        if not phone_number.startswith('+'):
            original_number = phone_number
            phone_number = '+' + phone_number.lstrip('0')
            logger.info(f"📱 Formatted phone number: {original_number} -> {phone_number}")
            
        # Log attempt details
        logger.info(f"📤 Preparing to send SMS")
        logger.info(f"   └── To: {phone_number}")
        logger.info(f"   └── Message Length: {len(message)} characters")
        logger.debug(f"   └── Content: {message}")
        
        # Sandbox mode warning
        if is_sandbox:
            logger.warning("⚠️  SANDBOX MODE ACTIVE")
            logger.warning("   └── Only registered test numbers will work")
            logger.warning(f"   └── Using number: {phone_number}")
        
        # Send the message
        logger.info("🚀 Sending SMS...")
        response = sms.send(message, [phone_number])  # Simple send without sender_id
        
        # Log full response
        logger.debug("📬 API Response:")
        logger.debug(json.dumps(response, indent=2))
        
        if response and isinstance(response, dict) and response.get('SMSMessageData'):
            message_data = response['SMSMessageData']
            recipients = message_data.get('Recipients', [])
            
            if recipients and recipients[0].get('status') == 'Success':
                cost = recipients[0].get('cost', 'N/A')
                message_id = recipients[0].get('messageId', 'N/A')
                
                logger.info("✅ SMS SENT SUCCESSFULLY")
                logger.info(f"   └── Message ID: {message_id}")
                logger.info(f"   └── Cost: {cost}")
                
                return {
                    'success': True,
                    'message': 'SMS sent successfully',
                    'message_id': message_id,
                    'cost': cost
                }
            
            # If we got a response but status wasn't Success
            if recipients:
                status = recipients[0].get('status')
                status_code = recipients[0].get('statusCode')
                
                logger.error("❌ SMS SENDING FAILED")
                logger.error(f"   └── Status: {status}")
                logger.error(f"   └── Status Code: {status_code}")
                
                return {
                    'success': False,
                    'message': f'SMS sending failed with status: {status}',
                    'status_code': status_code,
                    'response': response
                }
        
        logger.error("❌ SMS SENDING FAILED")
        logger.error("   └── Invalid response format from API")
        logger.error(f"   └── Response: {json.dumps(response, indent=2)}")
        
        return {
            'success': False,
            'message': 'Failed to send SMS - invalid response format',
            'response': response
        }
        
    except africastalking.APIError as e:
        logger.error("❌ AFRICA'S TALKING API ERROR")
        logger.error(f"   └── Error: {str(e)}")
        logger.error("   └── Stack trace:", exc_info=True)
        
        return {
            'success': False,
            'message': f'API Error: {str(e)}',
            'error_type': 'api_error'
        }
    except Exception as e:
        logger.error("❌ UNEXPECTED ERROR")
        logger.error(f"   └── Error Type: {type(e).__name__}")
        logger.error(f"   └── Message: {str(e)}")
        logger.error("   └── Stack trace:", exc_info=True)
        
        return {
            'success': False,
            'message': f'Error sending SMS: {str(e)}',
            'error_type': 'system_error'
        }
    finally:
        logger.info("-" * 50)
        logger.info("SMS Send Process Completed")
        logger.info("-" * 50)