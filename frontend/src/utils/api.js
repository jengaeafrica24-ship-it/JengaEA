import axios from 'axios';

// Define API base URL - CRITICAL: Must match your environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('🔧 API Configuration:');
console.log('  Base URL:', API_BASE_URL);
console.log('  Environment:', process.env.NODE_ENV);

// Create axios instance with correct configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds for Gemini API calls
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // CRITICAL: Must be true for Django CSRF/sessions
});

// Request interceptor - adds tokens and logs requests
api.interceptors.request.use(
  (config) => {
    console.log('📤 API Request:');
    console.log('  URL:', config.baseURL + config.url);
    console.log('  Method:', config.method?.toUpperCase());
    
    // Add CSRF token from cookies (Django requirement)
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
      console.log('  CSRF Token:', csrfToken.substring(0, 10) + '...');
    }

    // Add auth token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
      console.log('  Auth Token:', token.substring(0, 10) + '...');
    }

    if (config.data) {
      console.log('  Data:', config.data);
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
      console.error('  Data:', error.response.data);
      console.error('  URL:', error.config?.url);
      
      // Handle specific errors
      switch (error.response.status) {
        case 400:
          console.error('  ⚠️ Bad Request - Check your data format');
          break;
        case 401:
          console.error('  ⚠️ Unauthorized - Clearing token and redirecting');
          localStorage.removeItem('token');
          // Uncomment to auto-redirect: window.location.href = '/login';
          break;
        case 403:
          console.error('  ⚠️ Forbidden - Likely CSRF token issue');
          break;
        case 404:
          console.error('  ⚠️ Not Found - Endpoint does not exist!');
          console.error('  Full URL:', error.config?.baseURL + error.config?.url);
          break;
        case 500:
          console.error('  ⚠️ Server Error - Check Django logs');
          break;
      }
    } else if (error.request) {
      // Request made but no response
      console.error('  No response from server - likely CORS or network issue');
      console.error('  Request URL:', error.config?.baseURL + error.config?.url);
    } else {
      // Request setup failed
      console.error('  Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// ==================== API ENDPOINTS ====================

export const authAPI = {
  login: (credentials) => {
    console.log('🔐 Login attempt');
    return api.post('/api/auth/login/', credentials);
  },
  
  register: (userData) => {
    console.log('📝 Registration attempt');
    return api.post('/api/auth/register/', userData);
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
  getFilterOptions: () => api.get('/api/projects/filter-options/'),
  searchProjects: (params) => api.get('/api/projects/search/', { params }),
  getLocationDetails: (locationId) => api.get(`/api/projects/locations/${locationId}/`),
};

export const estimatesAPI = {
  getEstimates: (params) => api.get('/api/estimates/', { params }),
  getEstimate: (id) => api.get(`/api/estimates/${id}/`),
  createEstimate: (data) => api.post('/api/estimates/', data),
  updateEstimate: (id, data) => api.patch(`/api/estimates/${id}/`, data),
  deleteEstimate: (id) => api.delete(`/api/estimates/${id}/`),
  calculateCost: (data) => api.post('/api/estimates/calculate/', data),
  uploadEstimate: (formData) => api.post('/api/estimates/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  generateReport: (id) => api.post(`/api/estimates/${id}/generate-report/`),
  getFilterOptions: () => api.get('/api/estimates/filter-options/'),
  createEstimateWithGemini: (data) => api.post('/api/estimates/create-with-gemini/', data, { timeout: 120000 }),
  createEstimateWithGeminiAsync: (data) => api.post('/api/estimates/create-with-gemini-async/', data, { timeout: 5000 }),
  getEstimateTaskStatus: (taskId) => api.get(`/api/estimates/tasks/${taskId}/`),
  duplicateEstimate: (id) => api.post(`/api/estimates/${id}/duplicate/`),
  shareEstimate: (id, data) => api.post(`/api/estimates/${id}/share/`, data),
  getSharedEstimate: (token) => api.get(`/api/estimates/shared/${token}/`),
  getStatistics: () => api.get('/api/estimates/statistics/'),
};

export const subscriptionsAPI = {
  getPlans: () => api.get('/api/subscriptions/plans/'),
  getCurrentSubscription: () => api.get('/api/subscriptions/current/'),
  createSubscription: (data) => api.post('/api/subscriptions/', data),
  upgradeSubscription: (data) => api.post('/api/subscriptions/upgrade/', data),
  cancelSubscription: () => api.post('/api/subscriptions/cancel/'),
  getUsage: () => api.get('/api/subscriptions/usage/'),
  recordUsage: (data) => api.post('/api/subscriptions/record-usage/', data),
  getPaymentHistory: () => api.get('/api/subscriptions/payments/'),
};

export const reportsAPI = {
  getReports: (params) => api.get('/api/reports/', { params }),
  getReport: (id) => api.get(`/api/reports/${id}/`),
  generateReport: (data) => api.post('/api/reports/generate/', data),
  downloadReport: (id) => api.get(`/api/reports/${id}/download/`, { responseType: 'blob' }),
  shareReport: (id, data) => api.post(`/api/reports/${id}/share/`, data),
  getSharedReport: (token) => api.get(`/api/reports/shared/${token}/`),
  getTemplates: () => api.get('/api/reports/templates/'),
};