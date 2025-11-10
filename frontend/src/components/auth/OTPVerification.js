import React, { useState, useEffect } from 'react';
import { ArrowLeft, RotateCcw, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';
import toast from 'react-hot-toast';

const OTPVerification = ({ phoneNumber, email, onResend, onVerified, onBack }) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState('sms'); // 'sms' or 'email'
  const { verifyOTP } = useAuth();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Submitting OTP:', { 
        recipient: deliveryMethod === 'sms' ? phoneNumber : email,
        method: deliveryMethod,
        otp 
      });
      
      const result = await verifyOTP(
        deliveryMethod === 'sms' ? phoneNumber : email,
        otp,
        deliveryMethod
      );
      console.log('OTP verification result:', result);
      
      if (result?.success) {
        toast.success('Phone number verified successfully!');
        onVerified();
      } else {
        toast.error(result?.message || 'Verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    const result = await onResend();
    setIsLoading(false);
    
    if (result?.success) {
      setCountdown(60);
      toast.success('OTP sent successfully');
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleDeliveryMethodChange = async (method) => {
    if (isLoading || countdown > 0) return;
    
    setDeliveryMethod(method);
    setOtp(''); // Clear OTP when changing method
    
    // Automatically trigger new OTP send when changing method
    const recipient = method === 'sms' ? phoneNumber : email;
    await onResend(recipient, method);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8">
          <Card.Body>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {deliveryMethod === 'sms' ? '📱' : '✉️'}
                </span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verify Your {deliveryMethod === 'sms' ? 'Phone Number' : 'Email'}
            </h2>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to{' '}
              <span className="font-medium text-gray-900">
                {deliveryMethod === 'sms' ? phoneNumber : email}
              </span>
            </p>
          </div>

          {/* Delivery Method Selection */}
          <div className="flex space-x-4 mb-6">
            <button
              type="button"
              onClick={() => handleDeliveryMethodChange('sms')}
              className={`flex-1 py-3 px-4 rounded-lg border ${
                deliveryMethod === 'sms'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              } transition-colors duration-200`}
              disabled={isLoading || countdown > 0}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>SMS</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleDeliveryMethodChange('email')}
              className={`flex-1 py-3 px-4 rounded-lg border ${
                deliveryMethod === 'email'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 hover:border-gray-400'
              } transition-colors duration-200`}
              disabled={isLoading || countdown > 0}
            >
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </div>
            </button>
          </div>            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Verification Code
                </label>
                <Input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
                loading={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Didn't receive the code?
              </p>
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={countdown > 0 || isLoading}
                className="text-primary-600 hover:text-primary-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Registration
              </Button>
            </div>
          </Card.Body>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <a
              href="mailto:support@jengaest.com"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;



