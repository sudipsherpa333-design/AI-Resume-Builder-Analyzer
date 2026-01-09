// frontend/src/admin/services/adminApi.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/admin';

// Create axios instance
const adminApiInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
adminApiInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
adminApiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// API methods object
export const adminApi = {
    // Auth
    login: (email, password) =>
        adminApiInstance.post('/auth/login', { email, password }),

    logout: () =>
        adminApiInstance.post('/auth/logout'),

    getCurrentAdmin: () =>
        adminApiInstance.get('/auth/me'),

    // Dashboard
    getDashboardStats: () =>
        adminApiInstance.get('/dashboard/stats'),

    getAnalytics: (period = 'week') =>
        adminApiInstance.get(`/dashboard/analytics?period=${period}`),

    // Users
    getAllUsers: (params) =>
        adminApiInstance.get('/users', { params }),

    getUserById: (id) =>
        adminApiInstance.get(`/users/${id}`),

    updateUser: (id, data) =>
        adminApiInstance.put(`/users/${id}`, data),

    deleteUser: (id) =>
        adminApiInstance.delete(`/users/${id}`),

    // Resumes
    getAllResumes: (params) =>
        adminApiInstance.get('/resumes', { params }),

    getResumeById: (id) =>
        adminApiInstance.get(`/resumes/${id}`),

    deleteResume: (id) =>
        adminApiInstance.delete(`/resumes/${id}`)
};

// Also export as default
export default adminApi;