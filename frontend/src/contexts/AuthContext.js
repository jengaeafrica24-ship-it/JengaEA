import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://jengaea.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Create the context
const AuthContext = createContext();

// Create hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults
  // Add interceptor for CSRF token
  useEffect(() => {
    api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        
        // Add CSRF token if available
        const csrfToken = Cookies.get('csrftoken');
        if (csrfToken) {
          config.headers['X-CSRFToken'] = csrfToken;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      // Verify token and get user data
      verifyToken();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Get CSRF token before making auth requests
  const getCSRFToken = async () => {
    try {
      await api.get('/api/auth/csrf/');
    } catch (error) {
      console.error('Error getting CSRF token:', error);
    }
  };

  const verifyToken = async () => {
    try {
      const response = await api.get('/api/auth/verify-token/');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: localStorage.getItem('token'),
        },
      });
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      console.log('🔑 Attempting login...');
      // Get CSRF token first
      await getCSRFToken();
      const response = await api.post('/api/auth/login/', credentials);

      if (response.data.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Token ${token}`;
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
        
        toast.success('Login successful!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
      toast.error(message);
      
      if (error.response?.status === 403 && error.response?.data?.requires_verification) {
        return { 
          success: false, 
          error: message,
          requiresVerification: true,
          phoneNumber: error.response?.data?.phone_number
        };
      }
      
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 Starting registration...');
      // Get CSRF token first
      await getCSRFToken();
      
      // Log the API URL being used
      console.log('🔗 Using API URL:', api.defaults.baseURL);
      console.log('📋 Registration data:', {
        ...userData,
        password: '[REDACTED]',
        password_confirm: '[REDACTED]'
      });
      
      // Ensure all required fields are present and properly formatted
      const registrationData = {
        email: userData.email.toLowerCase().trim(),
        phone_number: userData.phone_number.trim(),
        password: userData.password,
        password_confirm: userData.password_confirm,
        first_name: userData.first_name.trim(),
        last_name: userData.last_name.trim(),
        role: (userData.role || 'contractor').toLowerCase().trim(),
      };

      // Optional fields
      if (userData.company_name) registrationData.company_name = userData.company_name;
      if (userData.location) registrationData.location = userData.location;

      // Validate phone number format before sending
      const phoneRegex = /^\+254\d{9}$/;
      if (!phoneRegex.test(registrationData.phone_number)) {
        throw new Error('Phone number must be in the format +254XXXXXXXXX');
      }

      console.log('📤 Sending registration request...');
      
      // Make the registration request
      const response = await api.post('/api/auth/register/', registrationData);
      
      console.log('✅ Registration response received:', response.data);
      
      // Check if backend returned success flag
      if (response.data.success) {
        toast.success(response.data.message || 'Registration successful! Please verify your phone number.');
        return { 
          success: true, 
          data: response.data.data 
        };
      } else {
        const errorMsg = response.data.message || 'Registration failed';
        toast.error(errorMsg);
        return { 
          success: false, 
          error: errorMsg 
        };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      // Extract error messages from Django response
      let message = 'Registration failed';
      let errorDetails = {};
      
      if (error.response?.data) {
        const responseData = error.response.data;
        console.log('Full error response:', responseData);
        
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (responseData.message) {
          message = responseData.message;
        } else if (responseData.error) {
          message = responseData.error;
        } else if (responseData.detail) {
          message = responseData.detail;
        } else if (responseData.errors) {
          errorDetails = responseData.errors;
          message = Object.entries(responseData.errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        } else if (typeof responseData === 'object') {
          errorDetails = responseData;
          message = Object.entries(responseData)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
        }
      }
      
      toast.error(message);
      return { 
        success: false, 
        error: message,
        errors: errorDetails 
      };
    }
  };

  const sendOTP = async (recipient, method = 'sms') => {
    try {
      console.log(`� Sending OTP via ${method.toUpperCase()} to:`, recipient);
      
      const data = method === 'sms' 
        ? { phone_number: recipient, method: 'sms' }
        : { email: recipient, method: 'email' };
      
      const response = await api.post('/api/auth/send-otp/', data);
      
      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent successfully!');
        return { success: true, data: response.data };
      } else {
        const message = response.data.message || 'Failed to send OTP';
        toast.error(message);
        return { success: false, error: message };
      }
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'Failed to send OTP';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyOTP = async (recipient, otp, method = 'sms') => {
    try {
      console.log('🔐 Verifying OTP...');
      console.log(`Method: ${method}, Recipient: ${recipient}`);
      
      const data = {
        otp_code: otp,
        ...(method === 'sms' 
          ? { phone_number: recipient, method: 'sms' }
          : { email: recipient, method: 'email' }
        )
      };
      
      const response = await api.post('/api/auth/verify-otp/', data);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Phone number verified successfully!');
        return { success: true, data: response.data };
      } else {
        const message = response.data.message || 'OTP verification failed';
        toast.error(message);
        return { success: false, error: message };
      }
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      const message = error.response?.data?.message || error.response?.data?.error || 'OTP verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully!');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch('/api/auth/profile/', profileData);
      dispatch({ type: 'UPDATE_USER', payload: response.data });
      toast.success('Profile updated successfully!');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    sendOTP,
    verifyOTP,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};