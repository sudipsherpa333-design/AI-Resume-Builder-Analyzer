// src/services/api.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // You can transform response data here if needed
        return response;
    },
    (error) => {
        const originalRequest = error.config;

        // Handle network errors
        if (!error.response) {
            toast.error('Network error. Please check your connection.');
            return Promise.reject(new Error('Network error. Please check your connection.'));
        }

        const { status, data } = error.response;

        // Handle specific error statuses
        switch (status) {
            case 401:
                // Clear token and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                toast.error('Session expired. Please login again.');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
                break;

            case 403:
                toast.error('Access denied. You do not have permission.');
                break;

            case 404:
                console.warn('Resource not found:', originalRequest.url);
                break;

            case 422:
                // Validation errors
                if (data.errors) {
                    const errorMsg = Object.values(data.errors).flat().join(', ');
                    toast.error(errorMsg);
                }
                break;

            case 500:
                toast.error('Server error. Please try again later.');
                break;

            default:
                if (data.message) {
                    toast.error(data.message);
                }
        }

        return Promise.reject(error);
    }
);

// Helper function to get auth config
const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

// Resume Service
export const resumeService = {
    // ✅ CORRECTED: Create new resume
    async createResume(resumeData) {
        try {
            const response = await api.post('/resumes', resumeData, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Create resume error:', error);
            throw error;
        }
    },

    // ✅ CORRECTED: Get all resumes for current user
    async getUserResumes() {
        try {
            const response = await api.get('/resumes', getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Get resumes error:', error);
            throw error;
        }
    },

    // ✅ CORRECTED: Get single resume by ID
    async getResume(resumeId) {
        try {
            const response = await api.get(`/resumes/${resumeId}`, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Get resume error:', error);
            throw error;
        }
    },

    // ✅ CORRECTED: Update resume
    async updateResume(resumeId, resumeData) {
        try {
            const response = await api.put(`/resumes/${resumeId}`, resumeData, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Update resume error:', error);
            throw error;
        }
    },

    // ✅ CORRECTED: Save resume (create or update)
    async saveResume(resumeData) {
        try {
            if (resumeData._id) {
                // Update existing resume
                const response = await api.put(`/resumes/${resumeData._id}`, resumeData, getAuthConfig());
                return response.data;
            } else {
                // Create new resume
                const response = await api.post('/resumes', resumeData, getAuthConfig());
                return response.data;
            }
        } catch (error) {
            console.error('Save resume error:', error);
            throw error;
        }
    },

    // ✅ CORRECTED: Delete resume
    async deleteResume(resumeId) {
        try {
            const response = await api.delete(`/resumes/${resumeId}`, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Delete resume error:', error);
            throw error;
        }
    },

    // ✅ NEW: Duplicate resume
    async duplicateResume(resumeId) {
        try {
            const response = await api.post(`/resumes/${resumeId}/duplicate`, {}, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Duplicate resume error:', error);
            throw error;
        }
    },

    // ✅ UPDATED: Export resume in different formats
    async exportResume(resumeId, format = 'pdf') {
        try {
            const response = await api.get(`/resumes/${resumeId}/export/${format}`, {
                ...getAuthConfig(),
                responseType: format === 'pdf' ? 'blob' : 'json'
            });

            // Create download link for file
            if (format === 'pdf') {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `resume-${resumeId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            }

            return response.data;
        } catch (error) {
            console.error('Export error:', error);
            throw error;
        }
    },

    // ✅ UPDATED: AI enhancement service
    async enhanceWithAI(section, content, options = {}) {
        try {
            const response = await api.post('/ai/enhance', {
                section,
                content,
                options,
            }, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('AI enhancement error:', error);
            throw error;
        }
    },

    // ✅ UPDATED: Generate QR code
    async generateQRCode(resumeId) {
        try {
            const response = await api.get(`/resumes/${resumeId}/qr-code`, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('QR generation error:', error);
            throw error;
        }
    },

    // ✅ NEW: Analyze resume
    async analyzeResume(resumeId) {
        try {
            const response = await api.post(`/resumes/${resumeId}/analyze`, {}, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Analyze resume error:', error);
            throw error;
        }
    },

    // ✅ NEW: Sync with cloud
    async syncResumes() {
        try {
            const response = await api.post('/resumes/sync', {}, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    },

    // ✅ NEW: Get resume statistics
    async getResumeStats() {
        try {
            const response = await api.get('/resumes/stats', getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    }
};

// Auth Service
export const authService = {
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    async logout() {
        try {
            const response = await api.post('/auth/logout', {}, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    async forgotPassword(email) {
        try {
            const response = await api.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    async resetPassword(token, password) {
        try {
            const response = await api.post('/auth/reset-password', { token, password });
            return response.data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    async getCurrentUser() {
        try {
            const response = await api.get('/auth/me', getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    },

    async updateProfile(userData) {
        try {
            const response = await api.put('/auth/profile', userData, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }
};

// User Service
export const userService = {
    async getDashboardStats() {
        try {
            const response = await api.get('/users/dashboard/stats', getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            throw error;
        }
    },

    async updateAICredits(credits) {
        try {
            const response = await api.put('/users/ai-credits', { credits }, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Update AI credits error:', error);
            throw error;
        }
    },

    async getAICredits() {
        try {
            const response = await api.get('/users/ai-credits', getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Get AI credits error:', error);
            throw error;
        }
    }
};

// Template Service
export const templateService = {
    async getTemplates() {
        try {
            const response = await api.get('/templates', getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Get templates error:', error);
            throw error;
        }
    },

    async getTemplate(templateId) {
        try {
            const response = await api.get(`/templates/${templateId}`, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Get template error:', error);
            throw error;
        }
    },

    async applyTemplate(resumeId, templateId) {
        try {
            const response = await api.post(`/resumes/${resumeId}/apply-template`, { templateId }, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Apply template error:', error);
            throw error;
        }
    }
};

// Analyzer Service
export const analyzerService = {
    async analyzeJobDescription(jobDescription) {
        try {
            const response = await api.post('/analyzer/job', { jobDescription }, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Analyze job description error:', error);
            throw error;
        }
    },

    async compareResumeWithJob(resumeId, jobDescription) {
        try {
            const response = await api.post(`/analyzer/compare/${resumeId}`, { jobDescription }, getAuthConfig());
            return response.data;
        } catch (error) {
            console.error('Compare resume with job error:', error);
            throw error;
        }
    },

    async uploadResumeForAnalysis(file) {
        try {
            const formData = new FormData();
            formData.append('resume', file);

            const config = {
                ...getAuthConfig(),
                headers: {
                    ...getAuthConfig().headers,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const response = await api.post('/analyzer/upload', formData, config);
            return response.data;
        } catch (error) {
            console.error('Upload resume for analysis error:', error);
            throw error;
        }
    }
};

// Utility function for offline mode fallback
export const withOfflineFallback = async (apiCall, fallbackData) => {
    if (!navigator.onLine) {
        console.warn('Offline mode: Using fallback data');
        return fallbackData;
    }

    try {
        return await apiCall();
    } catch (error) {
        if (!navigator.onLine) {
            console.warn('Network error: Using fallback data');
            return fallbackData;
        }
        throw error;
    }
};

// Helper to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Helper to clear auth data
export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentResumeId');
};

// Default export for convenience
export default {
    api,
    resumeService,
    authService,
    userService,
    templateService,
    analyzerService,
    isAuthenticated,
    clearAuthData,
    withOfflineFallback
};