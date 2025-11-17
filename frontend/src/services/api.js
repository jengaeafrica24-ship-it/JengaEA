import axios from 'axios';
import Cookies from 'js-cookie';

// Function to get CSRF token from cookie
const getCSRFTokenFromCookie = () => {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// Create single axios instance to be used throughout the app
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000'
    : 'https://jengaea.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
});

// Request interceptor - adds auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Add CSRF token from cookie
    const csrfToken = Cookies.get('csrftoken') || getCSRFTokenFromCookie();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors and CSRF token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle CSRF token errors
    if (error.response?.status === 403 && 
        error.response?.data?.detail?.includes('CSRF') &&
        !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Get fresh CSRF token
        await api.get('/api/auth/csrf/');
        
        // Retry original request with new token
        const csrfToken = Cookies.get('csrftoken') || getCSRFTokenFromCookie();
        if (csrfToken) {
          originalRequest.headers['X-CSRFToken'] = csrfToken;
        }
        
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    
    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // CSRF handled above, other 403s handled here
          if (!error.response?.data?.detail?.includes('CSRF')) {
            console.error('Forbidden:', error.response.data);
          }
          break;
        case 404:
          console.error('Not found:', error.response.data);
          break;
        case 500:
          console.error('Server error:', error.response.data);
          break;
        default:
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to get CSRF token before making requests
export const getCSRFToken = async () => {
  try {
    await api.get('/api/auth/csrf/');
    return Cookies.get('csrftoken') || getCSRFTokenFromCookie();
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return null;
  }
};

export default api;