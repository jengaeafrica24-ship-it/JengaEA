import axios from 'axios';

// CRITICAL: Get API URL from environment variable
// Temporary hardcoded fix for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://jengaea.onrender.com' 
    : 'http://localhost:8000');

// Debug logging
console.log('🔧 API Configuration:');
console.log('  REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  Final Base URL:', API_BASE_URL);
console.log('  All REACT_APP_ vars:', Object.keys(process.env).filter(k => k.startsWith('REACT_APP_')));

// Create axios instance with correct configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds for long operations
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Request interceptor - adds auth token
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:');
    console.log('  URL:', config.baseURL + config.url);
    console.log('  Method:', config.method?.toUpperCase());
    
    // Add auth token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log('  Auth Token: [PRESENT]');
    }
    
    if (config.data) {
      console.log('  Request Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:');
    console.log('  Status:', response.status);
    console.log('  Data:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:');
    
    if (error.response) {
      // Server responded with error status
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      console.error('  Data:', error.response.data);
      console.error('  URL:', error.config?.url);
      console.error('  Full URL:', error.config?.baseURL + error.config?.url);
      
      // Log common error explanations
      switch (error.response.status) {
        case 400:
          console.error('  ⚠️ Bad Request - Check data format');
          break;
        case 401:
          console.error('  ⚠️ Unauthorized - Token invalid or missing');
          break;
        case 403:
          console.error('  ⚠️ Forbidden - Permission denied');
          break;
        case 404:
          console.error('  ⚠️ Not Found - Endpoint does not exist');
          console.error('  Check if this endpoint exists in Django urls.py');
          break;
        case 500:
          console.error('  ⚠️ Server Error - Check Django logs on Render');
          break;
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('  ⚠️ No response from server');
      console.error('  This could be a CORS issue or network problem');
      console.error('  Request URL:', error.config?.baseURL + error.config?.url);
      console.error('  Request Method:', error.config?.method);
    } else {
      // Error in request setup
      console.error('  Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;