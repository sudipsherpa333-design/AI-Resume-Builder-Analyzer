import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('resumeCraftToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      console.error('Unauthorized (401): Token expired or invalid.');
      
      // Clear auth data
      localStorage.removeItem('resumeCraftUser');
      localStorage.removeItem('resumeCraftToken');
      localStorage.removeItem('token');
      
      // Don't redirect if we're on login page already
      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to check if backend is available
export const isBackendAvailable = async () => {
  try {
    const response = await fetch('http://localhost:5001/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 3000
    });
    return response.ok;
  } catch (error) {
    console.log('Backend not available:', error.message);
    return false;
  }
};

export default api;
