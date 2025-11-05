import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 120000, // Increased timeout for long-running Gemini API calls (120s)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Important for CORS with credentials
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    // Log request for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) {
      console.log('[API Request Data]', config.data);
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
    console.log(`[API Response] ${response.status} ${response.config?.method?.toUpperCase()} ${response.config?.url}`);
    return response;
  },
  (error) => {
    // Log error details for debugging
    console.error('[API Error]', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      hasResponse: !!error.response,
      hasRequest: !!error.request,
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
  register: (userData) => api.post('/api/auth/register/', userData),
  sendOTP: (phoneNumber) => api.post('/api/auth/send-otp/', phoneNumber),
  verifyOTP: (data) => api.post('/api/auth/verify-otp/', data),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  getDashboard: () => api.get('/auth/dashboard/'),
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



