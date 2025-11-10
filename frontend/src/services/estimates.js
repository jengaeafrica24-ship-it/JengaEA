import api from './api';

export const getEstimates = (params) => api.get('/api/estimates/', { params });
export const getEstimate = (id) => api.get(`/api/estimates/${id}/`);
export const createEstimate = (data) => api.post('/api/estimates/', data);
export const updateEstimate = (id, data) => api.patch(`/api/estimates/${id}/`, data);
export const deleteEstimate = (id) => api.delete(`/api/estimates/${id}/`);
export const uploadEstimate = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/estimates/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};