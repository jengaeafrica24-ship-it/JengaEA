import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000'
  : 'https://jengaea.onrender.com';

// Create base API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

const createFormData = (data, file = null) => {
  const formData = new FormData();
  
  // Add all data fields to FormData
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  
  // Add file if provided
  if (file) {
    formData.append('building_plan', file);
  }
  
  return formData;
};

const projects = {
  getProjectTypes: () => api.get('/api/projects/types/'),
  getLocations: () => api.get('/api/locations/')
};

const estimates = {
  getEstimates: (params) => api.get('/api/estimates/', { params }),
  getEstimate: (id) => api.get(`/api/estimates/${id}/`),
  createEstimate: (data, file = null) => {
    const formData = createFormData(data, file);
    return api.post('/api/estimates/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateEstimate: (id, data) => api.patch(`/api/estimates/${id}/`, data),
  deleteEstimate: (id) => api.delete(`/api/estimates/${id}/`),
  checkEstimateStatus: (id) => api.get(`/api/estimates/tasks/${id}/`)
};

// AI-powered estimation endpoints
const estimatesAPI = {
  // Project Summary
  getProjectSummary: (timeframe) => api.get(`/api/estimates/summary?timeframe=${timeframe}`),
  generateMaterialEstimate: (data) => {
    // If data is FormData, use multipart/form-data content type
    const headers = data instanceof FormData 
      ? { 'Content-Type': 'multipart/form-data' }
      : { 'Content-Type': 'application/json' };
    
    return api.post('/api/estimates/materials/generate/', data, { headers });
  },
  generateLaborEstimate: (data) => api.post('/api/estimates/labor', data),
  shareEstimate: (data) => api.post('/api/estimates/share', data),
  
  // AI Integration endpoints
  generateAIEstimate: (data) => api.post('/api/ai/generate-estimate', data),
  getAIRecommendations: (projectId) => api.get(`/api/ai/recommendations/${projectId}`),
  getMarketAnalysis: (params) => api.get('/api/ai/market-analysis', { params }),
  
  // Project specific endpoints
  saveEstimate: (projectId, data) => api.post(`/api/estimates/${projectId}`, data),
  updateEstimate: (estimateId, data) => api.put(`/api/estimates/${estimateId}`, data),
  // History
  getEstimateHistory: (projectId) => api.get(`/api/estimates/history/${projectId}`),
};

// Export all APIs
export {
  api as default,
  createFormData,
  estimates,
  estimatesAPI,
  projects
};