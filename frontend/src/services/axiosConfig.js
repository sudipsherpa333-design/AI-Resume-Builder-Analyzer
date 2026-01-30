// src/services/axiosConfig.js - UPDATED WITH PROPER EXPORTS
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Get environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const APP_ENV = import.meta.env.MODE || 'development';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Application': 'AI-Resume-Builder',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (APP_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (APP_ENV === 'development') {
      console.log(`[API Response] ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');

      toast.error('Session expired. Please login again.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
    }
    else if (status === 403) {
      toast.error('You do not have permission.');
    }
    else if (!status && !navigator.onLine) {
      toast.error('You are offline. Check your connection.');
    }
    else {
      toast.error(error.response?.data?.message || 'An error occurred');
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const apiHelpers = {
  handleError: (error) => {
    console.error('API Error:', error);

    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        message: 'No response from server.',
        status: 0
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred'
      };
    }
  },

  safeCall: async (apiCall, options = {}) => {
    try {
      return await apiCall();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
};

// Also export as default for backward compatibility
export default api;