import axios from 'axios';
import { toast } from 'react-hot-toast';

// Use import.meta.env for Vite
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// ==================== UTILITY FUNCTIONS ====================
const getUserId = () => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            return user._id || user.id;
        } catch {
            // Continue to fallback
        }
    }

    const userId = localStorage.getItem('user_id') ||
        sessionStorage.getItem('user_id');

    return userId;
};

const getCurrentUser = () => {
    try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch {
        // Ignore parse errors
    }

    return null;
};

// Initialize local storage with sample data if empty
const initializeLocalData = () => {
    try {
        // Check if we have any local data
        const hasResumes = localStorage.getItem('local_resumes');
        const hasUser = localStorage.getItem('user_data');

        if (!hasUser) {
            // Create a demo user for local development
            const demoUser = {
                _id: 'demo-user-123',
                id: 'demo-user-123',
                name: 'Demo User',
                email: 'demo@example.com',
                role: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff'
            };

            localStorage.setItem('user_data', JSON.stringify(demoUser));
            localStorage.setItem('user_id', demoUser.id);
            localStorage.setItem('token', 'demo_token_' + Date.now());
        }

        if (!hasResumes) {
            // Create some demo resumes for local development
            const demoResumes = [
                {
                    _id: 'res-1',
                    id: 'res-1',
                    userId: 'demo-user-123',
                    title: 'Software Engineer Resume',
                    template: 'modern',
                    status: 'completed',
                    isPrimary: true,
                    isStarred: true,
                    isPublic: true,
                    analysis: {
                        atsScore: 92,
                        completeness: 98,
                        suggestions: ['Add more metrics to experience section'],
                        keywords: ['JavaScript', 'React', 'Node.js', 'AWS', 'TypeScript']
                    },
                    personalInfo: {
                        fullName: 'John Developer',
                        email: 'john@example.com',
                        phone: '+1 (555) 123-4567',
                        location: 'San Francisco, CA',
                        website: 'https://johndev.com',
                        linkedin: 'linkedin.com/in/johndev',
                        github: 'github.com/johndev',
                        summary: 'Senior Software Engineer with 8+ years of experience building scalable web applications using modern technologies.'
                    },
                    experience: [
                        {
                            id: 'exp-1',
                            title: 'Senior Software Engineer',
                            company: 'Tech Corp Inc.',
                            location: 'San Francisco, CA',
                            startDate: '2020-01',
                            endDate: 'Present',
                            current: true,
                            description: 'Led development of microservices architecture serving 2M+ users'
                        }
                    ],
                    education: [
                        {
                            id: 'edu-1',
                            degree: 'Bachelor of Science in Computer Science',
                            institution: 'Stanford University',
                            location: 'Stanford, CA',
                            year: '2016'
                        }
                    ],
                    skills: [
                        { name: 'JavaScript', level: 'Expert' },
                        { name: 'React', level: 'Expert' },
                        { name: 'Node.js', level: 'Advanced' }
                    ],
                    settings: {
                        template: 'modern',
                        color: '#3b82f6',
                        font: 'inter',
                        fontSize: 'medium'
                    },
                    tags: ['software', 'engineering', 'web'],
                    views: 156,
                    downloads: 42,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    _id: 'res-2',
                    id: 'res-2',
                    userId: 'demo-user-123',
                    title: 'Marketing Manager Resume',
                    template: 'classic',
                    status: 'in-progress',
                    isPrimary: false,
                    isStarred: false,
                    isPublic: false,
                    analysis: {
                        atsScore: 68,
                        completeness: 75,
                        suggestions: ['Add measurable results to experience'],
                        keywords: ['Digital Marketing', 'SEO', 'Content Strategy']
                    },
                    personalInfo: {
                        fullName: 'Jane Marketer',
                        email: 'jane@example.com',
                        phone: '+1 (555) 987-6543',
                        location: 'Chicago, IL',
                        summary: 'Digital Marketing Manager with 5+ years of experience'
                    },
                    experience: [
                        {
                            id: 'exp-2',
                            title: 'Digital Marketing Manager',
                            company: 'MarketingPro LLC',
                            location: 'Chicago, IL',
                            startDate: '2019-06',
                            endDate: 'Present',
                            current: true,
                            description: 'Managed digital campaigns with $500k annual budget'
                        }
                    ],
                    settings: {
                        template: 'classic',
                        color: '#10b981',
                        font: 'roboto',
                        fontSize: 'medium'
                    },
                    tags: ['marketing', 'digital'],
                    views: 89,
                    downloads: 23,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            localStorage.setItem('local_resumes', JSON.stringify(demoResumes));
            console.log('✅ Initialized local demo data');
        }
    } catch (error) {
        console.error('Failed to initialize local data:', error);
    }
};

// ==================== BACKEND HEALTH & OFFLINE SUPPORT ====================
let backendHealth = {
    lastChecked: 0,
    isHealthy: false,
    checkInterval: 10000,
    retryCount: 0,
    maxRetries: 3
};

// Check backend health
const checkBackendHealth = async () => {
    const now = Date.now();

    // Cache health check for 10 seconds
    if (now - backendHealth.lastChecked < backendHealth.checkInterval) {
        return backendHealth.isHealthy;
    }

    try {
        // Try multiple endpoints
        const endpoints = [
            `${API_BASE_URL}/health`,
            `${API_BASE_URL.replace('/api', '')}/health`,
            `${API_BASE_URL}/`,
            `${API_BASE_URL.replace('/api', '')}/`
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(endpoint, { timeout: 2000 });
                if (response.status === 200) {
                    backendHealth.isHealthy = true;
                    backendHealth.lastChecked = now;
                    backendHealth.retryCount = 0;

                    if (window.location.hostname === 'localhost') {
                        console.log('✅ Backend is healthy at:', endpoint);
                    }
                    return true;
                }
            } catch (e) {
                // Try next endpoint
            }
        }

        throw new Error('All endpoints failed');

    } catch (error) {
        backendHealth.isHealthy = false;
        backendHealth.lastChecked = now;
        backendHealth.retryCount++;

        if (window.location.hostname === 'localhost' && backendHealth.retryCount === 1) {
            console.warn('⚠️ Backend not available, using local data');
            console.log('ℹ️ Start your backend server or work offline with local data');
        }

        return false;
    }
};

// Store data locally when offline
const storeLocally = (key, data, operation = 'create') => {
    try {
        const pendingOps = JSON.parse(localStorage.getItem('pending_operations') || '[]');
        const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        pendingOps.push({
            id: operationId,
            type: operation,
            key: key,
            data: data,
            timestamp: new Date().toISOString(),
            retryCount: 0
        });

        localStorage.setItem('pending_operations', JSON.stringify(pendingOps));

        // Also store the actual data if it's a resume
        if (key.includes('resume_')) {
            localStorage.setItem(key, JSON.stringify(data));
        }

        return operationId;
    } catch (error) {
        console.error('Failed to store data locally:', error);
        return null;
    }
};

// ==================== ENHANCED AXIOS INTERCEPTORS ====================
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const userId = getUserId();
        if (userId) {
            config.headers['X-User-ID'] = userId;
        }

        config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        config.headers['X-Client-Version'] = import.meta.env.VITE_APP_VERSION || '1.0.0';

        return config;
    },
    (error) => {
        return Promise.reject({
            ...error,
            isNetworkError: true,
            message: 'Network request failed'
        });
    }
);

api.interceptors.response.use(
    (response) => {
        backendHealth.isHealthy = true;
        backendHealth.lastChecked = Date.now();
        backendHealth.retryCount = 0;

        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Network error or backend down
        if (!error.response) {
            backendHealth.isHealthy = false;
            backendHealth.lastChecked = Date.now();

            if (error.code === 'ECONNABORTED') {
                // Don't show toast for timeout, it's expected when backend is down
            } else if (!navigator.onLine) {
                toast.error('You are offline. Changes will be saved locally.', {
                    duration: 4000,
                    icon: '📶'
                });
            }

            // Return offline response for POST/PUT/DELETE operations
            if (originalRequest.method === 'post' && originalRequest.url.includes('/resumes')) {
                return Promise.resolve({
                    data: {
                        success: true,
                        message: 'Saved locally (offline mode)',
                        data: { ...JSON.parse(originalRequest.data), _id: `local_${Date.now()}` },
                        offline: true
                    },
                    status: 200,
                    statusText: 'OK',
                    config: originalRequest
                });
            }

            throw error;
        }

        const { status, data } = error.response;

        if (status === 401) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_data');

            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }

        return Promise.reject(error);
    }
);

// ==================== CORE API METHODS WITH OFFLINE SUPPORT ====================
const apiMethods = {
    async get(url, config = {}) {
        // Always check backend health first
        const isHealthy = await checkBackendHealth();

        if (!isHealthy) {
            // Try to get data from local storage
            if (url.includes('/resumes') || url.includes('/dashboard')) {
                const userId = getUserId();
                const localData = this.getLocalData(url, userId);

                if (localData) {
                    console.log('📁 Using local data for:', url);
                    return localData;
                }
            }

            // For development, return empty data instead of throwing
            if (window.location.hostname === 'localhost') {
                console.log('🔄 Development: No backend, returning empty data');
                return this.getEmptyResponse(url);
            }

            throw new Error('Backend unavailable and no local data found');
        }

        try {
            const response = await api.get(url, {
                ...config,
                timeout: config.timeout || 5000
            });
            return response.data;
        } catch (error) {
            // If backend was healthy but request failed, try local data
            if (url.includes('/resumes') || url.includes('/dashboard')) {
                const userId = getUserId();
                const localData = this.getLocalData(url, userId);

                if (localData) {
                    console.log('📁 Using local data after API failure:', url);
                    return localData;
                }
            }

            // For development, return empty data
            if (window.location.hostname === 'localhost') {
                console.log('🔄 Development: API failed, returning empty data');
                return this.getEmptyResponse(url);
            }

            throw error;
        }
    },

    async post(url, data = {}, config = {}) {
        const isHealthy = await checkBackendHealth();

        if (!isHealthy) {
            // Store locally for later sync
            const operationId = storeLocally(`resume_${Date.now()}`, data, 'create');

            return {
                success: true,
                data: { ...data, _id: `local_${operationId}` },
                offline: true,
                operationId: operationId,
                message: 'Saved locally - will sync when online'
            };
        }

        try {
            const response = await api.post(url, data, config);
            return response.data;
        } catch (error) {
            if (!error.response) {
                // Network error - save locally
                const operationId = storeLocally(`resume_${Date.now()}`, data, 'create');

                return {
                    success: true,
                    data: { ...data, _id: `local_${operationId}` },
                    offline: true,
                    operationId: operationId,
                    message: 'Saved locally - will sync when online'
                };
            }
            throw error;
        }
    },

    async put(url, data = {}, config = {}) {
        const isHealthy = await checkBackendHealth();

        if (!isHealthy) {
            // Extract resume ID from URL
            const resumeId = url.split('/resumes/')[1];
            const operationId = storeLocally(`resume_${resumeId}`, data, 'update');

            return {
                success: true,
                data: { ...data, _id: resumeId },
                offline: true,
                operationId: operationId,
                message: 'Updated locally - will sync when online'
            };
        }

        try {
            const response = await api.put(url, data, config);
            return response.data;
        } catch (error) {
            if (!error.response) {
                const resumeId = url.split('/resumes/')[1];
                const operationId = storeLocally(`resume_${resumeId}`, data, 'update');

                return {
                    success: true,
                    data: { ...data, _id: resumeId },
                    offline: true,
                    operationId: operationId,
                    message: 'Updated locally - will sync when online'
                };
            }
            throw error;
        }
    },

    async delete(url, config = {}) {
        const isHealthy = await checkBackendHealth();

        if (!isHealthy) {
            const resumeId = url.split('/resumes/')[1];
            const operationId = storeLocally(`delete_${resumeId}`, { id: resumeId }, 'delete');

            return {
                success: true,
                offline: true,
                operationId: operationId,
                message: 'Delete queued - will sync when online'
            };
        }

        try {
            const response = await api.delete(url, config);
            return response.data;
        } catch (error) {
            if (!error.response) {
                const resumeId = url.split('/resumes/')[1];
                const operationId = storeLocally(`delete_${resumeId}`, { id: resumeId }, 'delete');

                return {
                    success: true,
                    offline: true,
                    operationId: operationId,
                    message: 'Delete queued - will sync when online'
                };
            }
            throw error;
        }
    },

    getLocalData(url, userId) {
        try {
            if (url.includes('/resumes')) {
                // Get resumes from local storage
                const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                const userResumes = localResumes.filter(r => r.userId === userId);

                if (userResumes.length > 0) {
                    return {
                        success: true,
                        data: userResumes,
                        offline: true,
                        message: 'Using locally saved resumes'
                    };
                }

                // Also check pending operations
                const pendingOps = JSON.parse(localStorage.getItem('pending_operations') || '[]');
                const resumeOps = pendingOps.filter(op => op.type === 'create' || op.type === 'update');
                const resumesFromOps = resumeOps.map(op => op.data).filter(r => r.userId === userId);

                if (resumesFromOps.length > 0) {
                    return {
                        success: true,
                        data: resumesFromOps,
                        offline: true,
                        message: 'Using pending resume operations'
                    };
                }
            }

            if (url.includes('/dashboard/stats') || url.includes('/resumes/stats')) {
                // Calculate stats from local resumes
                const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                const userResumes = localResumes.filter(r => r.userId === userId);

                if (userResumes.length > 0) {
                    return {
                        success: true,
                        data: this.calculateStats(userResumes),
                        offline: true
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting local data:', error);
            return null;
        }
    },

    calculateStats(resumes) {
        const completed = resumes.filter(r => r.status === 'completed').length;
        const inProgress = resumes.filter(r => r.status === 'in-progress').length;
        const drafts = resumes.filter(r => r.status === 'draft').length;
        const avgScore = resumes.length > 0
            ? Math.round(resumes.reduce((sum, r) => sum + (r.analysis?.atsScore || 0), 0) / resumes.length)
            : 0;
        const highScore = resumes.filter(r => (r.analysis?.atsScore || 0) >= 80).length;
        const needsImprovement = resumes.filter(r => (r.analysis?.atsScore || 0) < 60).length;
        const totalViews = resumes.reduce((sum, r) => sum + (r.views || 0), 0);
        const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

        return {
            totalResumes: resumes.length,
            completedResumes: completed,
            inProgressResumes: inProgress,
            draftResumes: drafts,
            averageAtsScore: avgScore,
            totalViews: totalViews,
            totalDownloads: totalDownloads,
            highScoreResumes: highScore,
            needsImprovementResumes: needsImprovement,
            completionRate: resumes.length > 0
                ? Math.round((completed / resumes.length) * 100)
                : 0,
            onlineUsers: 1,
            activeSessions: 1,
            storageUsed: '0 MB',
            storageLimit: '500 MB',
            lastSynced: new Date().toISOString(),
            recentActivity: []
        };
    },

    getEmptyResponse(url) {
        if (url.includes('/resumes')) {
            return {
                success: true,
                data: [],
                offline: true,
                message: 'No local data available'
            };
        }

        if (url.includes('/stats')) {
            return {
                success: true,
                data: {
                    totalResumes: 0,
                    completedResumes: 0,
                    inProgressResumes: 0,
                    draftResumes: 0,
                    averageAtsScore: 0,
                    onlineUsers: 1,
                    activeSessions: 1,
                    storageUsed: '0 MB',
                    storageLimit: '500 MB',
                    lastSynced: new Date().toISOString(),
                    recentActivity: [],
                    totalViews: 0,
                    totalDownloads: 0,
                    highScoreResumes: 0,
                    needsImprovementResumes: 0,
                    completionRate: 0
                },
                offline: true,
                message: 'No stats data available'
            };
        }

        return {
            success: true,
            data: {},
            offline: true,
            message: 'No data available'
        };
    }
};

// ==================== RESUME SERVICE ====================
const resumeService = {
    async getUserResumes() {
        const userId = getUserId();

        if (!userId) {
            console.warn('No user ID found');
            return [];
        }

        try {
            const response = await apiMethods.get('/resumes', {
                params: { userId },
                timeout: 5000
            });

            let resumes = response.data || response || [];

            if (!Array.isArray(resumes)) {
                resumes = [resumes];
            }

            console.log(`✅ Loaded ${resumes.length} resumes`);
            return resumes;
        } catch (error) {
            console.warn('Failed to fetch resumes from API:', error.message);

            // Get local resumes as fallback
            const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
            const userResumes = localResumes.filter(r => r.userId === userId);

            if (userResumes.length > 0) {
                console.log(`📁 Using ${userResumes.length} local resumes`);
                return userResumes;
            }

            console.log('📭 No resumes available');
            return [];
        }
    },

    async getResumeStats(userId = null) {
        const targetUserId = userId || getUserId();

        if (!targetUserId) {
            return this.getDefaultStats();
        }

        try {
            const response = await apiMethods.get(`/resumes/stats/${targetUserId}`);
            return response.data || response || this.getDefaultStats();
        } catch (error) {
            console.warn('Failed to fetch resume stats:', error.message);

            // Calculate stats from local resumes
            const resumes = await this.getUserResumes();
            return this.calculateStatsFromResumes(resumes);
        }
    },

    async getUserStats(userId = null) {
        return this.getResumeStats(userId);
    },

    calculateStatsFromResumes(resumes) {
        if (!Array.isArray(resumes) || resumes.length === 0) {
            return this.getDefaultStats();
        }

        const completed = resumes.filter(r => r.status === 'completed').length;
        const inProgress = resumes.filter(r => r.status === 'in-progress').length;
        const drafts = resumes.filter(r => r.status === 'draft').length;
        const avgScore = resumes.length > 0
            ? Math.round(resumes.reduce((sum, r) => sum + (r.analysis?.atsScore || 0), 0) / resumes.length)
            : 0;
        const highScore = resumes.filter(r => (r.analysis?.atsScore || 0) >= 80).length;
        const needsImprovement = resumes.filter(r => (r.analysis?.atsScore || 0) < 60).length;
        const totalViews = resumes.reduce((sum, r) => sum + (r.views || 0), 0);
        const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

        return {
            totalResumes: resumes.length,
            completedResumes: completed,
            inProgressResumes: inProgress,
            draftResumes: drafts,
            averageAtsScore: avgScore,
            totalViews: totalViews,
            totalDownloads: totalDownloads,
            highScoreResumes: highScore,
            needsImprovementResumes: needsImprovement,
            completionRate: resumes.length > 0
                ? Math.round((completed / resumes.length) * 100)
                : 0
        };
    },

    getDefaultStats() {
        return {
            totalResumes: 0,
            completedResumes: 0,
            inProgressResumes: 0,
            draftResumes: 0,
            averageAtsScore: 0,
            totalViews: 0,
            totalDownloads: 0,
            highScoreResumes: 0,
            needsImprovementResumes: 0,
            completionRate: 0
        };
    },

    async createResume(resumeData) {
        const userId = getUserId();

        if (!userId) {
            throw new Error('User not authenticated');
        }

        const resumeWithUser = {
            ...resumeData,
            userId,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            const response = await apiMethods.post('/resumes', resumeWithUser);
            const newResume = response.data || response;

            if (response.offline) {
                toast.success('Resume saved locally. Will sync when online.', {
                    duration: 4000,
                    icon: '💾'
                });

                // Store locally for immediate access
                const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                localResumes.push(newResume);
                localStorage.setItem('local_resumes', JSON.stringify(localResumes));
            } else {
                toast.success('Resume created successfully');
            }

            return newResume;
        } catch (error) {
            if (error.message.includes('offline') || !error.response) {
                const tempId = `local_${Date.now()}`;
                const localResume = {
                    ...resumeWithUser,
                    _id: tempId,
                    offline: true
                };

                // Store locally
                const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                localResumes.push(localResume);
                localStorage.setItem('local_resumes', JSON.stringify(localResumes));

                toast.success('Resume saved locally. Will sync when online.', {
                    duration: 4000,
                    icon: '💾'
                });

                return localResume;
            }

            toast.error('Failed to create resume: ' + (error.message || 'Unknown error'));
            throw error;
        }
    },

    async updateResume(id, resumeData) {
        try {
            const response = await apiMethods.put(`/resumes/${id}`, {
                ...resumeData,
                updatedAt: new Date().toISOString()
            });
            const updatedResume = response.data || response;

            if (response.offline) {
                toast.success('Changes saved locally. Will sync when online.', {
                    duration: 3000,
                    icon: '💾'
                });

                // Update local storage
                const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                const index = localResumes.findIndex(r => r._id === id || r.id === id);
                if (index !== -1) {
                    localResumes[index] = updatedResume;
                } else {
                    localResumes.push(updatedResume);
                }
                localStorage.setItem('local_resumes', JSON.stringify(localResumes));
            } else {
                toast.success('Resume updated successfully');
            }

            return updatedResume;
        } catch (error) {
            if (error.message.includes('offline') || !error.response) {
                const localResume = {
                    ...resumeData,
                    _id: id,
                    updatedAt: new Date().toISOString(),
                    offline: true
                };

                // Update local storage
                const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                const index = localResumes.findIndex(r => r._id === id || r.id === id);
                if (index !== -1) {
                    localResumes[index] = localResume;
                } else {
                    localResumes.push(localResume);
                }
                localStorage.setItem('local_resumes', JSON.stringify(localResumes));

                toast.success('Changes saved locally. Will sync when online.', {
                    duration: 3000,
                    icon: '💾'
                });

                return localResume;
            }

            toast.error('Failed to update resume: ' + (error.message || 'Unknown error'));
            throw error;
        }
    },

    async deleteResume(id) {
        try {
            const response = await apiMethods.delete(`/resumes/${id}`);

            if (response.offline) {
                toast.success('Delete queued. Will sync when online.', {
                    duration: 3000,
                    icon: '💾'
                });

                // Remove from local storage
                const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                const filteredResumes = localResumes.filter(r => r._id !== id && r.id !== id);
                localStorage.setItem('local_resumes', JSON.stringify(filteredResumes));
            } else {
                toast.success('Resume deleted successfully');
            }

            return { success: true, offline: response.offline };
        } catch (error) {
            if (error.message.includes('offline') || !error.response) {
                // Remove from local storage
                const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
                const filteredResumes = localResumes.filter(r => r._id !== id && r.id !== id);
                localStorage.setItem('local_resumes', JSON.stringify(filteredResumes));

                toast.success('Delete queued. Will sync when online.', {
                    duration: 3000,
                    icon: '💾'
                });

                return { success: true, offline: true };
            }

            toast.error('Failed to delete resume: ' + (error.message || 'Unknown error'));
            throw error;
        }
    },

    async getResume(id) {
        if (!id || id === 'new') {
            return this.getEmptyResume();
        }

        try {
            const response = await apiMethods.get(`/resumes/${id}`);
            return response.data || response;
        } catch (error) {
            // Check local storage if API fails
            const localResumes = JSON.parse(localStorage.getItem('local_resumes') || '[]');
            const resume = localResumes.find(r => r._id === id || r.id === id);

            if (resume) {
                console.log('📁 Loaded resume from local storage:', id);
                return resume;
            }

            return this.getEmptyResume();
        }
    },

    getEmptyResume() {
        const userId = getUserId();

        return {
            _id: 'new',
            userId: userId || '',
            title: 'Untitled Resume',
            template: 'modern',
            status: 'draft',
            personalInfo: {
                fullName: '',
                email: '',
                phone: '',
                location: '',
                website: '',
                linkedin: '',
                github: '',
                summary: ''
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            languages: [],
            references: [],
            analysis: {
                atsScore: 0,
                completeness: 0,
                suggestions: []
            },
            settings: {
                template: 'modern',
                color: '#3b82f6',
                font: 'inter',
                fontSize: 'medium'
            },
            tags: [],
            views: 0,
            downloads: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
};

// ==================== DASHBOARD SERVICE ====================
const dashboardService = {
    async getDashboardStats(userId) {
        try {
            const response = await apiMethods.get(`/dashboard/stats/${userId}`, {
                timeout: 5000
            });

            const stats = response.data || response || {};

            return {
                totalResumes: stats.totalResumes || 0,
                completedResumes: stats.completedResumes || 0,
                inProgressResumes: stats.inProgressResumes || 0,
                draftResumes: stats.draftResumes || 0,
                averageAtsScore: stats.averageAtsScore || 0,
                onlineUsers: stats.onlineUsers || 1,
                activeSessions: stats.activeSessions || 1,
                storageUsed: stats.storageUsed || '0 MB',
                storageLimit: stats.storageLimit || '500 MB',
                lastSynced: new Date().toISOString(),
                recentActivity: stats.recentActivity || [],
                totalViews: stats.totalViews || 0,
                totalDownloads: stats.totalDownloads || 0,
                highScoreResumes: stats.highScoreResumes || 0,
                needsImprovementResumes: stats.needsImprovementResumes || 0,
                completionRate: stats.completionRate || 0
            };
        } catch (error) {
            console.warn('Failed to fetch dashboard stats:', error.message);

            // Calculate from local data
            const resumes = await resumeService.getUserResumes();
            const stats = resumeService.calculateStatsFromResumes(resumes);

            return {
                ...stats,
                onlineUsers: 1,
                activeSessions: 1,
                storageUsed: '0 MB',
                storageLimit: '500 MB',
                lastSynced: new Date().toISOString(),
                recentActivity: []
            };
        }
    }
};

// ==================== AUTH SERVICE ====================
const authService = {
    async login(email, password, rememberMe = false) {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            if (rememberMe) {
                localStorage.setItem('token', token);
            } else {
                sessionStorage.setItem('token', token);
            }

            localStorage.setItem('user_id', user.id);
            localStorage.setItem('user_data', JSON.stringify(user));

            toast.success(`Welcome back, ${user.name || user.email}!`);
            return { success: true, user };
        } catch (error) {
            // For development, create a demo user
            if (window.location.hostname === 'localhost' && !error.response) {
                console.log('🔧 Development: Creating demo user');

                const demoUser = {
                    _id: 'demo-user-123',
                    id: 'demo-user-123',
                    name: email.split('@')[0] || 'Demo User',
                    email: email,
                    role: 'user',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0] || 'User')}&background=3b82f6&color=fff`
                };

                const demoToken = 'demo_token_' + Date.now();

                if (rememberMe) {
                    localStorage.setItem('token', demoToken);
                } else {
                    sessionStorage.setItem('token', demoToken);
                }

                localStorage.setItem('user_id', demoUser.id);
                localStorage.setItem('user_data', JSON.stringify(demoUser));

                // Initialize local data
                initializeLocalData();

                toast.success(`Welcome ${demoUser.name}! (Development Mode)`);
                return { success: true, user: demoUser };
            }

            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('user_data', JSON.stringify(user));

            toast.success('Registration successful! Welcome aboard!');
            return { success: true, user };
        } catch (error) {
            // For development, create a demo user
            if (window.location.hostname === 'localhost' && !error.response) {
                console.log('🔧 Development: Creating demo user for registration');

                const demoUser = {
                    ...userData,
                    _id: 'demo-user-' + Date.now(),
                    id: 'demo-user-' + Date.now(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                const demoToken = 'demo_token_' + Date.now();

                localStorage.setItem('token', demoToken);
                localStorage.setItem('user_id', demoUser.id);
                localStorage.setItem('user_data', JSON.stringify(demoUser));

                // Initialize local data
                initializeLocalData();

                toast.success('Registration successful! (Development Mode)');
                return { success: true, user: demoUser };
            }

            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_data');

        toast.success('Logged out successfully');
        window.location.href = '/login';
    },

    getCurrentUser() {
        return getCurrentUser();
    },

    isAuthenticated() {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return !!token;
    }
};

// ==================== MAIN API OBJECT ====================
const apiService = {
    // Core methods
    get: apiMethods.get,
    post: apiMethods.post,
    put: apiMethods.put,
    delete: apiMethods.delete,

    // Services
    resume: resumeService,
    auth: authService,
    dashboard: dashboardService,

    // Initialize
    init() {
        console.log('🚀 API Service initialized');
        console.log('📡 API Base URL:', API_BASE_URL);
        console.log('👤 Current User ID:', getUserId());

        // Initialize local data for development
        if (window.location.hostname === 'localhost') {
            initializeLocalData();
        }

        // Set auth header if token exists
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }
};

// Export everything
export default apiService;
export { apiMethods, resumeService, authService, dashboardService };