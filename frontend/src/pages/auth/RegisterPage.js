import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OTPVerification from '../../components/auth/OTPVerification';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
  const [registrationData, setRegistrationData] = useState(null);
  const { register: registerUser, sendOTP } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setProgress(0);
    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 10) + 5;
      if (percent >= 100) {
        percent = 100;
        clearInterval(interval);
      }
      setProgress(percent);
    }, 120);
    try {
      // Register user
      const result = await registerUser(data);
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
        if (result.success) {
          setRegistrationData({
            user_id: result.data?.user_id,
            phone_number: data.phone_number,
          });
          setStep(2);
        } else {
          // Handle validation errors if any
          console.error('Registration failed:', result.error, result.errors);
        }
      }, 400);
    } catch (error) {
      setIsLoading(false);
      console.error('Registration exception:', error);
    }
  };

  const handleOTPResend = async () => {
    if (registrationData?.phone_number) {
      await sendOTP(registrationData.phone_number);
    }
  };

  const handleOTPVerified = () => {
    navigate('/login', { 
      state: { message: 'Registration successful! Please sign in with your credentials.' }
    });
  };

  if (step === 2) {
    return (
      <OTPVerification
        phoneNumber={registrationData?.phone_number}
        onResend={handleOTPResend}
        onVerified={handleOTPVerified}
        onBack={() => setStep(1)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg px-8 py-10 flex flex-col items-center animate-fadeIn">
            <LoadingSpinner size="lg" className="mb-4 text-primary-600" />
            <div className="text-xl font-semibold text-gray-800 mb-2">Creating your account...</div>
            <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-lg font-mono text-primary-700">{progress}%</div>
          </div>
        </div>
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">JengaEafrica</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8">
          <Card.Body>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Personal Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Input
                    label="First Name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Enter your first name"
                    error={errors.first_name?.message}
                    {...register('first_name', {
                      required: 'First name is required',
                      minLength: {
                        value: 2,
                        message: 'First name must be at least 2 characters',
                      },
                    })}
                  />
                </div>

                <div>
                  <Input
                    label="Last Name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Enter your last name"
                    error={errors.last_name?.message}
                    {...register('last_name', {
                      required: 'Last name is required',
                      minLength: {
                        value: 2,
                        message: 'Last name must be at least 2 characters',
                      },
                    })}
                  />
                </div>
              </div>

              <div>
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+254 700 000 000"
                  error={errors.phone_number?.message}
                  {...register('phone_number', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{9,14}$/,
                      message: 'Invalid phone number format (use +254... format)',
                    },
                  })}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('role', { required: 'Role is required' })}
                >
                  <option value="">Select your role</option>
                  <option value="homeowner">Homeowner</option>
                  <option value="contractor">Contractor</option>
                  <option value="engineer">Engineer</option>
                  <option value="developer">Developer</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <Input
                  label="Location (Optional)"
                  type="text"
                  placeholder="e.g., Nairobi, Kenya"
                  error={errors.location?.message}
                  {...register('location')}
                />
              </div>

              {/* Company Name (for contractors/engineers/developers) */}
              <div>
                <Input
                  label="Company Name (Optional)"
                  type="text"
                  placeholder="Enter your company name"
                  error={errors.company_name?.message}
                  {...register('company_name')}
                />
              </div>

              {/* Password Fields */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number',
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  error={errors.password_confirm?.message}
                  {...register('password_confirm', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...register('terms', {
                      required: 'You must accept the terms and conditions',
                    })}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{' '}
                    <Link
                      to="/terms"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.terms && (
                    <p className="mt-1 text-sm text-red-600">{errors.terms.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;