import axios from 'axios';

const api = axios.create({
  // Use environment variable for production, fallback to localhost for development
  baseURL: process.env.REACT_APP_API_URL || 'https://jengaea.onrender.com',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Changed to false for cross-origin requests
});

// Add response interceptor for error logging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('=== API Error ===');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    console.error('Full error:', error);
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Log full request configuration
    console.log('=== API Request Configuration ===');
    console.log('URL:', config.baseURL + config.url);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', config.headers);
    console.log('Timeout:', config.timeout);
    console.log('WithCredentials:', config.withCredentials);
    
    // Add CSRF token if it exists
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    // Add auth token if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    if (config.data) {
      console.log('Request Data:', config.data);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('=== API Response Success ===');
    console.log('Status:', response.status);
    console.log('URL:', response.config?.url);
    console.log('Method:', response.config?.method?.toUpperCase());
    console.log('Response Data:', response.data);
    
    // Check if the response has the expected structure
    if (!response.data.hasOwnProperty('success')) {
      console.warn('Response missing success flag:', response.data);
    }
    
    return response;
  },
  (error) => {
    console.error('=== API Response Error ===');
    console.error('Error Details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
      baseURL: error.config?.baseURL,
    });

    // Log the full error response if available
    if (error.response?.data) {
      console.error('Error Response Data:', error.response.data);
    }
    
    // Network or DNS issues
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error('Network Error:', {
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        error: error.message
      });
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection and try again.',
        error: error.message
      });
    }

    // Transform Django validation errors
    if (error.response?.status === 400 && error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const message = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join('\n');
      
      return Promise.reject({
        success: false,
        message: 'Validation failed',
        errors: errors,
        detailedMessage: message
      });
    }

    // Handle other error cases
    return Promise.reject({
      success: false,
      message: error.response?.data?.message || error.message,
      error: error.response?.data || error.message
    });
    
    if (error.code === 'ECONNABORTED') {
      console.error('⚠️  Request timeout - server took too long to respond');
    } else if (error.request && !error.response) {
      console.error('⚠️  No response received from server');
      console.error('  Request URL:', error.config?.baseURL + error.config?.url);
      console.error('  Request method:', error.config?.method);
      console.error('  Request was sent:', error.request.readyState === 4 ? 'Yes' : 'No');
      console.error('  Request status:', error.request.status);
    }
    
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.error('⚠️  Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login/', credentials),
  register: (userData) => {
    console.log('=== Registration Request Started ===');
    console.log('Request URL:', api.defaults.baseURL + '/api/auth/register/');
    console.log('Request Data:', {
      ...userData,
      password: '[REDACTED]',
      password_confirm: '[REDACTED]'
    });
    console.log('Request Headers:', api.defaults.headers);
    
    return api.post('/api/auth/register/', userData)
      .then(response => {
        console.log('=== Registration Success ===');
        console.log('Response:', {
          status: response.status,
          data: response.data,
          headers: response.headers
        });
        return response;
      })
      .catch(error => {
        console.error('=== Registration Failed ===');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        
        if (error.response) {
          console.error('Response Status:', error.response.status);
          console.error('Response Data:', error.response.data);
          console.error('Response Headers:', error.response.headers);
        } else if (error.request) {
          console.error('No Response Received');
          console.error('Request Details:', {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            timeout: error.config?.timeout,
            headers: error.config?.headers
          });
        } else {
          console.error('Request Setup Failed:', error.message);
        }
        
        throw error;
      });
  },
  sendOTP: (phoneNumber) => api.post('/api/auth/send-otp/', phoneNumber),
  verifyOTP: (data) => api.post('/api/auth/verify-otp/', data),
  logout: () => api.post('/api/auth/logout/'),
  getProfile: () => api.get('/api/auth/profile/'),
  updateProfile: (data) => api.patch('/api/auth/profile/', data),
  getDashboard: () => api.get('/api/auth/dashboard/'),
};

export const projectsAPI = {
  getProjectTypes: (params) => api.get('/api/projects/types/', { params }),
  getProjectTemplates: (params) => api.get('/api/projects/templates/', { params }),
  getLocations: (params) => api.get('/api/projects/locations/', { params }),
  getMaterials: (params) => api.get('/api/projects/materials/', { params }),
  getMaterialPrices: (params) => api.get('/api/projects/materials/prices/', { params }),
  getLaborPrices: (params) => api.get('/api/projects/labor/prices/', { params }),
  getProjectCostBreakdown: (projectTypeId, params) => 
    api.get(`/api/projects/types/${projectTypeId}/breakdown/`, { params }),
  getFilterOptions: () => api.get('/projects/filter-options/'),
  searchProjects: (params) => api.get('/projects/search/', { params }),
  getLocationDetails: (locationId) => api.get(`/projects/locations/${locationId}/`),
};

export const estimatesAPI = {
  getEstimates: (params) => api.get('/api/estimates/', { params }),
  getEstimate: (id) => api.get(`/api/estimates/${id}/`),
  createEstimate: (data) => api.post('/api/estimates/', data),
  updateEstimate: (id, data) => api.patch(`/api/estimates/${id}/`, data),
  deleteEstimate: (id) => api.delete(`/api/estimates/${id}/`),
  calculateCost: (data) => api.post('/api/estimates/calculate/', data),
  uploadEstimate: (formData) => api.post('/api/estimates/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }),
  generateReport: (id) => api.post(`/api/estimates/${id}/generate-report/`),
  getFilterOptions: () => api.get('/api/estimates/filter-options/'),
  // Use a longer timeout specifically for Gemini-backed estimates (may take >30s)
  createEstimateWithGemini: (data) => api.post('/api/estimates/create-with-gemini/', data, { timeout: 120000 }),
  // Async (Celery) version: enqueues a background job and returns a task id (202)
  createEstimateWithGeminiAsync: (data) => api.post('/api/estimates/create-with-gemini-async/', data, { timeout: 5000 }),
  // Poll task status
  getEstimateTaskStatus: (taskId) => api.get(`/api/estimates/tasks/${taskId}/`),
  duplicateEstimate: (id) => api.post(`/api/estimates/${id}/duplicate/`),
  shareEstimate: (id, data) => api.post(`/api/estimates/${id}/share/`, data),
  getSharedEstimate: (token) => api.get(`/api/estimates/shared/${token}/`),
  getStatistics: () => api.get('/api/estimates/statistics/'),
};

export const subscriptionsAPI = {
  getPlans: () => api.get('/subscriptions/plans/'),
  getCurrentSubscription: () => api.get('/subscriptions/current/'),
  createSubscription: (data) => api.post('/subscriptions/', data),
  upgradeSubscription: (data) => api.post('/subscriptions/upgrade/', data),
  cancelSubscription: () => api.post('/subscriptions/cancel/'),
  getUsage: () => api.get('/subscriptions/usage/'),
  recordUsage: (data) => api.post('/subscriptions/record-usage/', data),
  getPaymentHistory: () => api.get('/subscriptions/payments/'),
};

export const reportsAPI = {
  getReports: (params) => api.get('/reports/', { params }),
  getReport: (id) => api.get(`/reports/${id}/`),
  generateReport: (data) => api.post('/reports/generate/', data),
  downloadReport: (id) => api.get(`/reports/${id}/download/`, { responseType: 'blob' }),
  shareReport: (id, data) => api.post(`/reports/${id}/share/`, data),
  getSharedReport: (token) => api.get(`/reports/shared/${token}/`),
  getTemplates: () => api.get('/reports/templates/'),
};



