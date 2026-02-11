// src/services/api.js - PRODUCTION READY WITH ALL FIXES
import axios from 'axios';
import { toast } from 'react-hot-toast';

// ==================== CONFIGURATION ====================
const API_BASE_URL = (() => {
  let url = import.meta.env?.VITE_API_URL || 'http://localhost:5001';
  // Ensure base URL doesn't end with /api (we'll add it per request)
  url = url.replace(/\/api\/?$/, '');
  url = url.endsWith('/') ? url.slice(0, -1) : url;
  console.log('🚀 API Base URL configured:', url);
  return url;
})();

const ENV = import.meta.env.MODE || 'development';
console.log(`🌐 Running in ${ENV.toUpperCase()} mode`);

// OAuth Configuration
const OAUTH_CONFIG = {
  google: {
    clientId: import.meta.env?.VITE_GOOGLE_CLIENT_ID || '',
    enabled: !!(import.meta.env?.VITE_GOOGLE_CLIENT_ID),
    authUrl: `${API_BASE_URL}/auth/google`,
    apiAuthUrl: `${API_BASE_URL}/api/auth/google`,
    callbackUrl: `${API_BASE_URL}/api/auth/google/callback`,
    scopes: ['profile', 'email'],
    redirectParam: 'redirect_uri'
  }
};

// ==================== LOGGER SERVICE ====================
const logger = {
  info: (message, data = null) => {
    if (ENV === 'development') {
      console.log(`📘 [API] ${message}`, data || '');
    }
  },
  warn: (message, data = null) => {
    console.warn(`⚠️ [API] ${message}`, data || '');
  },
  error: (message, error = null) => {
    console.error(`❌ [API] ${message}`, error || '');
  },
  debug: (message, data = null) => {
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.debug(`🔍 [API] ${message}`, data || '');
    }
  }
};

// ==================== UTILITY FUNCTIONS ====================
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  logger.debug('Auth token check', { hasToken: !!token });
  return token;
};

const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      logger.warn('No user data found in localStorage');
      return null;
    }

    const user = JSON.parse(userData);
    logger.info('Current user loaded', { id: user._id, email: user.email });
    return {
      _id: user._id || user.id,
      id: user._id || user.id,
      email: user.email || '',
      name: user.name || user.username || '',
      role: user.role || 'user',
      avatar: user.avatar || '',
      authProvider: user.authProvider || 'local'
    };
  } catch (error) {
    logger.error('Error parsing user data', error);
    return null;
  }
};

// CENTRALIZED USER ID LOGIC WITH DEMO FALLBACK
const getUserId = () => {
  const user = getCurrentUser();
  if (user?._id) {
    logger.debug('User ID from current user', { userId: user._id });
    return user._id;
  }

  // Try localStorage directly
  try {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData._id) {
      logger.debug('User ID from localStorage', { userId: userData._id });
      return userData._id;
    }
  } catch (error) {
    // Ignore parse errors
  }

  // Development fallback to demo user
  if (ENV === 'development') {
    const demoId = localStorage.getItem('demo_user_id') || `demo-${Date.now().toString().slice(-8)}`;
    localStorage.setItem('demo_user_id', demoId);
    logger.warn('Using demo user ID for development', { demoId });
    return demoId;
  }

  logger.warn('No user ID found');
  return null;
};

// REQUEST RETRY WITH EXPONENTIAL BACKOFF
const withRetry = async (fn, retries = 2, baseDelay = 300) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      const isNetworkError = !error.response;
      const isServerError = error.response?.status >= 500;

      // Only retry on network or server errors, not auth or client errors
      if (isLastAttempt || (!isNetworkError && !isServerError)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// ==================== AXIOS INSTANCE ====================
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  // REQUEST INTERCEPTOR
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        logger.debug('Auth token added to request', {
          endpoint: config.url,
          method: config.method
        });
      }

      // Ensure API prefix for all endpoints except health check
      if (config.url && !config.url.startsWith('http')) {
        // Add /api prefix for all backend routes
        if (!config.url.startsWith('/api')) {
          config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
        }
      }

      // Log request in development
      if (ENV === 'development') {
        const logData = {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          headers: { ...config.headers, Authorization: '***' }
        };

        if (config.data && Object.keys(config.data).length > 0) {
          logData.data = config.data;
        }

        logger.info('Outgoing Request', logData);
      }

      return config;
    },
    (error) => {
      logger.error('Request interceptor error', error);
      return Promise.reject(error);
    }
  );

  // RESPONSE INTERCEPTOR WITH ENHANCED ERROR HANDLING
  instance.interceptors.response.use(
    (response) => {
      if (ENV === 'development') {
        logger.info(`Response ${response.status}`, {
          url: response.config.url,
          method: response.config.method,
          data: response.data
        });
      }
      return response;
    },
    (error) => {
      const { response, config } = error;
      const url = config?.url || 'unknown';

      // Network error (no response)
      if (!response) {
        logger.error('Network error - Cannot reach server', {
          url,
          error: error.message
        });

        // Only show toast for critical endpoints or first occurrence
        if (!url.includes('/health')) {
          toast.error('Cannot connect to server. Please check your internet connection.');
        }

        return Promise.reject(error);
      }

      const { status, data } = response;

      // ENHANCED 404 HANDLING WITH SPECIFIC MESSAGES
      if (status === 404) {
        logger.warn(`404 Not Found: ${url}`);

        // Specific handling for different endpoints
        if (url.includes('/resumes/user/')) {
          logger.info('User resumes endpoint returned 404 - likely no resumes yet');
          // Silent - we'll handle this with fallback logic
        } else if (url.includes('/dashboard/stats')) {
          logger.info('Dashboard stats endpoint missing - using fallback calculation');
          // Silent - we have fallback logic
        } else if (url.includes('/api/')) {
          // Generic API 404 - FIXED: Use console.warn instead of toast.warn
          console.warn('⚠️ API endpoint not found:', url);
          // Don't show toast for 404 during development to reduce noise
          if (ENV !== 'development') {
            toast('Some features may be temporarily unavailable.', {
              icon: '⚠️',
              duration: 4000
            });
          }
        }
      }

      // Auth errors
      else if (status === 401) {
        logger.warn('Authentication failed - clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');

        // Only redirect if not on auth pages
        const isAuthPage = window.location.pathname.includes('/login') ||
          window.location.pathname.includes('/register') ||
          window.location.pathname.includes('/auth/callback');

        if (!isAuthPage) {
          toast.error('Session expired. Please login again.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1500);
        }
      }

      // Server errors
      else if (status >= 500) {
        logger.error(`Server error ${status}: ${url}`, data);
        toast.error('Server error. Please try again later.');
      }

      // Client errors (400-499, excluding 401 & 404)
      else if (status >= 400) {
        logger.warn(`Client error ${status}: ${url}`, data);

        // Show user-friendly error message
        const errorMessage = data?.error ||
          data?.message ||
          data?.errors?.[0]?.msg ||
          `Error: ${status}`;

        if (errorMessage && !url.includes('/auth/login')) {
          toast.error(errorMessage);
        }
      }

      logger.debug('Error details', {
        url,
        status,
        method: config?.method,
        data: response.data,
        headers: response.headers
      });

      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

// ==================== CORE API METHODS WITH RETRY ====================
const coreApi = {
  async get(url, config = {}) {
    return withRetry(async () => {
      logger.info(`GET ${url}`);
      const response = await api.get(url, config);
      return response.data;
    });
  },

  async post(url, data = {}, config = {}) {
    return withRetry(async () => {
      logger.info(`POST ${url}`, data);
      const response = await api.post(url, data, config);
      return response.data;
    });
  },

  async put(url, data = {}, config = {}) {
    return withRetry(async () => {
      logger.info(`PUT ${url}`, data);
      const response = await api.put(url, data, config);
      return response.data;
    });
  },

  async delete(url, config = {}) {
    return withRetry(async () => {
      logger.info(`DELETE ${url}`);
      const response = await api.delete(url, config);
      return response.data;
    });
  }
};

// ==================== AUTH SERVICE WITH COMPREHENSIVE ERROR HANDLING ====================
const authService = {
  isAuthenticated() {
    const token = getAuthToken();
    const user = getCurrentUser();
    const isAuth = !!(token && user);
    logger.debug('Authentication check', { isAuthenticated: isAuth });
    return isAuth;
  },

  getCurrentUser() {
    return getCurrentUser();
  },

  getUserId() {
    return getUserId();
  },

  // OAuth Methods
  async getOAuthConfig() {
    try {
      logger.info('Fetching OAuth configuration');
      const response = await coreApi.get('/api/auth/config');
      return response;
    } catch (error) {
      logger.warn('Failed to fetch OAuth config, using defaults', error);
      return {
        googleOAuth: {
          enabled: OAUTH_CONFIG.google.enabled,
          clientIdConfigured: !!OAUTH_CONFIG.google.clientId,
          callbackUrl: OAUTH_CONFIG.google.callbackUrl
        },
        providers: OAUTH_CONFIG.google.enabled ? ['google'] : []
      };
    }
  },

  // Login with comprehensive error handling
  async login(email, password) {
    try {
      logger.info('Login attempt', { email });

      // Try multiple endpoints if needed
      const endpoints = [
        '/api/auth/login',
        '/auth/login'
      ];

      let lastError;

      for (const endpoint of endpoints) {
        try {
          const response = await api.post(endpoint, {
            email: email.trim().toLowerCase(),
            password
          });

          // ✅ FIXED: Get the response data directly
          const result = response.data;

          if (result?.token && result?.user) {
            const { token, user } = result;

            // Store auth data
            localStorage.setItem('token', token);
            localStorage.setItem('user_data', JSON.stringify(user));

            // Set token in API headers
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            logger.info('Login successful', { userId: user._id, email: user.email });
            toast.success(`Welcome back, ${user.name || user.email}!`);

            return {
              success: true,
              token,
              user
            };
          }
        } catch (error) {
          lastError = error;
          if (error.response?.status !== 404) {
            break; // Don't try other endpoints if it's not a 404
          }
        }
      }

      // If we get here, all endpoints failed
      if (lastError?.response?.status === 404) {
        throw new Error('Login service is currently unavailable. Please try again later.');
      }
      throw lastError || new Error('Login failed');

    } catch (error) {
      logger.error('Login failed', error);

      // User-friendly error messages
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Login service is currently unavailable.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },
  // Registration with comprehensive error handling
  async register(userData) {
    try {
      logger.info('Registration attempt', { email: userData.email });

      // Validate required fields
      const required = ['name', 'email', 'password'];
      const missing = required.filter(field => !userData[field]);

      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }

      // Sanitize data
      const sanitizedData = {
        name: String(userData.name).trim(),
        email: String(userData.email).trim().toLowerCase(),
        password: userData.password
      };

      // Add optional fields
      if (userData.phone) sanitizedData.phone = String(userData.phone).trim();
      if (userData.company) sanitizedData.company = String(userData.company).trim();
      if (userData.confirmPassword) sanitizedData.confirmPassword = userData.confirmPassword;

      // Try multiple endpoints if needed
      const endpoints = [
        '/api/auth/register',
        '/auth/register'
      ];

      let lastError;
      let response;

      for (const endpoint of endpoints) {
        try {
          response = await api.post(endpoint, sanitizedData);
          break; // Success, exit loop
        } catch (error) {
          lastError = error;
          if (error.response?.status !== 404) {
            break; // Don't try other endpoints if it's not a 404
          }
        }
      }

      if (!response) {
        if (lastError?.response?.status === 404) {
          throw new Error('Registration service is currently unavailable. Please try again later.');
        }
        throw lastError || new Error('Registration failed');
      }

      // ✅ FIXED: Get the response data directly
      const result = response.data;

      if (result?.token && result?.user) {
        const { token, user } = result;

        localStorage.setItem('token', token);
        localStorage.setItem('user_data', JSON.stringify(user));

        // Set token in API headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        logger.info('Registration successful', { userId: user._id });
        toast.success('Account created successfully!');

        return {
          success: true,
          token,
          user,
          message: 'Account created successfully!'
        };
      } else if (result?.success) {
        // Handle alternative response format
        return {
          success: true,
          token: result.token,
          user: result.user || result.data,
          message: result.message || 'Account created successfully!'
        };
      }

      throw new Error(result?.message || 'Registration failed');

    } catch (error) {
      logger.error('Registration failed', error);

      // User-friendly error messages
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid registration data.';
      } else if (error.response?.status === 409) {
        errorMessage = 'An account with this email already exists.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Registration service is currently unavailable.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  async logout() {
    try {
      const user = getCurrentUser();
      logger.info('Logout', { email: user?.email });

      // Try to call logout endpoint if authenticated
      if (this.isAuthenticated()) {
        try {
          await coreApi.post('/api/auth/logout');
        } catch (error) {
          logger.warn('Logout API call failed, proceeding with client-side cleanup', error);
        }
      }

      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_redirect');
      delete api.defaults.headers.common['Authorization'];

      toast.success('Logged out successfully!');
      return { success: true };
    } catch (error) {
      logger.error('Logout failed', error);
      throw error;
    }
  },

  // Verify user session
  async verify() {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'No token found' };
      }

      const response = await coreApi.get('/api/auth/verify');
      return { success: true, user: response.user || response.data };
    } catch (error) {
      logger.warn('Token verification failed', error);
      return { success: false, message: error.message };
    }
  }
};

// ==================== RESUME SERVICE WITH COMPREHENSIVE ERROR HANDLING ====================
const resumeService = {
  async getUserResumes() {
    try {
      // Try multiple endpoints
      const endpoints = ['/api/resumes', '/resumes'];

      for (const endpoint of endpoints) {
        try {
          const response = await coreApi.get(endpoint);

          // Handle different response formats
          let resumes = [];

          if (Array.isArray(response)) {
            resumes = response;
          } else if (response?.data && Array.isArray(response.data)) {
            resumes = response.data;
          } else if (response?.resumes && Array.isArray(response.resumes)) {
            resumes = response.resumes;
          } else if (response?.success && Array.isArray(response.data)) {
            resumes = response.data;
          }

          logger.info(`Fetched ${resumes.length} resumes from ${endpoint}`);

          // Normalize resume data
          return resumes.map(resume => ({
            _id: resume._id || resume.id,
            id: resume._id || resume.id,
            title: resume.title || 'Untitled Resume',
            template: resume.template || 'modern',
            status: resume.status || 'draft',
            isPrimary: resume.isPrimary || false,
            isStarred: resume.isStarred || false,
            isPinned: resume.isPinned || false,
            analysis: {
              atsScore: resume.analysis?.atsScore || resume.atsScore || 0,
              completeness: resume.analysis?.completeness || resume.completeness || 0,
              suggestions: resume.analysis?.suggestions || resume.suggestions || [],
              lastAnalyzed: resume.analysis?.lastAnalyzed || resume.lastAnalyzed
            },
            personalInfo: {
              fullName: resume.personalInfo?.fullName || '',
              email: resume.personalInfo?.email || '',
              phone: resume.personalInfo?.phone || '',
              location: resume.personalInfo?.location || ''
            },
            updatedAt: resume.updatedAt || new Date().toISOString(),
            createdAt: resume.createdAt || new Date().toISOString(),
            tags: Array.isArray(resume.tags) ? resume.tags : [],
            views: resume.views || 0,
            downloads: resume.downloads || 0,
            userId: resume.userId || getUserId(),
            version: resume.version || 1,
            color: resume.color || '#3b82f6',
            font: resume.font || 'inter'
          }));
        } catch (error) {
          if (error.response?.status === 404 && endpoint === '/resumes') {
            continue; // Try next endpoint
          }
          throw error;
        }
      }

      // If all endpoints fail, return empty array
      logger.info('No resumes endpoint found, returning empty array');
      return [];

    } catch (error) {
      // Specific handling for 404 - user has no resumes yet
      if (error.response?.status === 404) {
        logger.info('No resumes found for user (404) - returning empty array');
        return [];
      }

      logger.error('Failed to fetch resumes', error);

      // Only show toast for non-404 errors
      if (error.response?.status !== 404) {
        toast.error('Failed to load resumes');
      }

      return [];
    }
  },

  async createResume(resumeData) {
    try {
      logger.info('Creating new resume', { title: resumeData.title });

      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Ensure user ID is included
      const dataToSend = {
        ...resumeData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try multiple endpoints
      const endpoints = ['/api/resumes', '/resumes'];
      let response;

      for (const endpoint of endpoints) {
        try {
          response = await coreApi.post(endpoint, dataToSend);
          break;
        } catch (error) {
          if (error.response?.status === 404 && endpoint === '/resumes') {
            continue;
          }
          throw error;
        }
      }

      if (!response) {
        throw new Error('No valid endpoint found for creating resume');
      }

      logger.info('Resume created successfully');
      toast.success('Resume created!');

      return response?.data || response;
    } catch (error) {
      logger.error('Failed to create resume', error);
      toast.error('Failed to create resume');
      throw error;
    }
  },

  // ... other resume methods with similar error handling ...
  async getResume(resumeId) {
    try {
      logger.info(`Fetching resume ${resumeId}`);

      if (!authService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const response = await coreApi.get(`/api/resumes/${resumeId}`);
      return response?.data || response;
    } catch (error) {
      logger.error(`Failed to fetch resume ${resumeId}`, error);
      toast.error('Failed to load resume');
      throw error;
    }
  },

  async updateResume(resumeId, updateData) {
    try {
      logger.info(`Updating resume ${resumeId}`, updateData);

      if (!authService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const response = await coreApi.put(`/api/resumes/${resumeId}`, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      logger.info('Resume updated successfully');
      toast.success('Resume updated!');

      return response?.data || response;
    } catch (error) {
      logger.error(`Failed to update resume ${resumeId}`, error);
      toast.error('Failed to update resume');
      throw error;
    }
  },

  async deleteResume(resumeId) {
    try {
      logger.info(`Deleting resume ${resumeId}`);

      if (!authService.isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const response = await coreApi.delete(`/api/resumes/${resumeId}`);

      logger.info('Resume deleted successfully');
      toast.success('Resume deleted!');

      return response;
    } catch (error) {
      logger.error(`Failed to delete resume ${resumeId}`, error);
      toast.error('Failed to delete resume');
      throw error;
    }
  },

  getEmptyResume() {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    return {
      title: 'New Resume',
      status: 'draft',
      personalInfo: {
        fullName: user.name || '',
        email: user.email || '',
        phone: '',
        address: '',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      template: 'modern',
      userId: user._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analysis: {
        atsScore: 0,
        completeness: 0,
        suggestions: ['Add more details to improve your resume'],
        lastAnalyzed: null
      }
    };
  }
};

// ==================== DASHBOARD SERVICE WITH FALLBACK ====================
const dashboardService = {
  async getDashboardStats() {
    try {
      logger.info('Fetching dashboard stats');

      // Try to get resumes
      try {
        const resumes = await resumeService.getUserResumes();
        const stats = await this.calculateStatsFromResumes(resumes);
        logger.info('Calculated stats from resumes', stats);
        return stats;
      } catch (error) {
        logger.error('Failed to calculate stats from resumes', error);
        return this.getFallbackStats();
      }
    } catch (error) {
      logger.error('Failed to fetch dashboard stats', error);
      return this.getFallbackStats();
    }
  },

  async calculateStatsFromResumes(resumes) {
    try {
      if (!resumes) {
        resumes = await resumeService.getUserResumes();
      }

      const totalResumes = resumes.length;
      const completedResumes = resumes.filter(r => r.status === 'completed').length;
      const draftResumes = resumes.filter(r => r.status === 'draft').length;
      const inProgressResumes = resumes.filter(r => r.status === 'in-progress').length;

      // Calculate ATS scores
      const atsScores = resumes
        .filter(r => r.analysis?.atsScore)
        .map(r => r.analysis.atsScore);

      const averageAtsScore = atsScores.length > 0 ?
        Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length) : 0;

      const highScoreResumes = resumes.filter(r => r.analysis?.atsScore >= 80).length;
      const mediumScoreResumes = resumes.filter(r =>
        r.analysis?.atsScore >= 60 && r.analysis?.atsScore < 80
      ).length;
      const lowScoreResumes = resumes.filter(r => r.analysis?.atsScore < 60).length;

      // Calculate views and downloads
      const totalViews = resumes.reduce((sum, r) => sum + (r.views || 0), 0);
      const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

      // Calculate completion rate
      const completionRate = totalResumes > 0 ?
        Math.round((completedResumes / totalResumes) * 100) : 0;

      // Get template distribution
      const templatesUsed = resumes.reduce((acc, resume) => {
        const template = resume.template || 'unknown';
        acc[template] = (acc[template] || 0) + 1;
        return acc;
      }, {});

      // Generate recent activity
      const recentActivity = resumes
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(resume => ({
          type: 'update',
          description: `${resume.title} was updated`,
          timestamp: resume.updatedAt,
          resumeId: resume._id
        }));

      // Calculate storage usage
      const storageUsedMB = Math.round(totalResumes * 0.5);
      const storageLimitMB = 500;
      const storageUsedPercentage = Math.round((storageUsedMB / storageLimitMB) * 100);

      return {
        totalResumes,
        completedResumes,
        draftResumes,
        inProgressResumes,
        averageAtsScore,
        highScoreResumes,
        mediumScoreResumes,
        lowScoreResumes,
        totalViews,
        totalDownloads,
        completionRate,
        templatesUsed,
        recentActivity,
        storageUsed: `${storageUsedMB} MB`,
        storageLimit: `${storageLimitMB} MB`,
        storageUsedPercentage,
        lastSynced: new Date().toISOString(),
        onlineUsers: 1,
        activeSessions: 1,
        needsImprovementResumes: lowScoreResumes,
        performanceTrend: totalResumes > 0 ? 'improving' : 'stable'
      };
    } catch (error) {
      logger.error('Failed to calculate stats from resumes', error);
      return this.getFallbackStats();
    }
  },

  getFallbackStats() {
    logger.info('Using fallback dashboard stats');
    return {
      totalResumes: 0,
      completedResumes: 0,
      draftResumes: 0,
      inProgressResumes: 0,
      averageAtsScore: 0,
      highScoreResumes: 0,
      mediumScoreResumes: 0,
      lowScoreResumes: 0,
      totalViews: 0,
      totalDownloads: 0,
      completionRate: 0,
      templatesUsed: {},
      recentActivity: [],
      storageUsed: '0 MB',
      storageLimit: '500 MB',
      storageUsedPercentage: 0,
      lastSynced: new Date().toISOString(),
      onlineUsers: 1,
      activeSessions: 0,
      needsImprovementResumes: 0,
      performanceTrend: 'stable'
    };
  }
};

// ==================== HEALTH SERVICE ====================
const healthService = {
  async checkBackendHealth() {
    try {
      logger.info('Checking backend health');

      // Try multiple health endpoints
      const endpoints = [
        '/api/health',
        '/health',
        '/'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
            timeout: 5000,
            headers: {
              'Accept': 'application/json'
            }
          });

          logger.info(`Backend health check passed: ${endpoint}`);
          return {
            healthy: true,
            endpoint,
            data: response.data
          };
        } catch (error) {
          logger.warn(`Health check failed for ${endpoint}: ${error.message}`);
        }
      }

      logger.error('All health checks failed');
      return {
        healthy: false,
        message: 'Backend is not responding'
      };
    } catch (error) {
      logger.error('Health check error', error);
      return {
        healthy: false,
        message: error.message
      };
    }
  },

  async testApiEndpoints() {
    const endpoints = [
      { name: 'Health', url: '/api/health', method: 'GET' },
      { name: 'Resumes', url: '/api/resumes/', method: 'GET' },
      { name: 'Auth Config', url: '/api/auth/config', method: 'GET' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        if (endpoint.method === 'GET') {
          await api.get(endpoint.url);
          results.push({ ...endpoint, status: '✅ OK' });
        }
      } catch (error) {
        results.push({
          ...endpoint,
          status: '❌ Failed',
          error: error.response?.status || error.message
        });
      }
    }

    logger.info('API endpoint test results', results);
    return results;
  }
};

// ==================== MAIN API SERVICE ====================
const apiService = {
  // HTTP methods with retry
  get: coreApi.get,
  post: coreApi.post,
  put: coreApi.put,
  delete: coreApi.delete,

  // Services
  auth: authService,
  resume: resumeService,
  dashboard: dashboardService,
  health: healthService,

  // Configuration
  baseURL: API_BASE_URL,
  env: ENV,
  config: OAUTH_CONFIG,

  // Utility functions
  getUserId,
  getCurrentUser,
  getAuthToken,

  // Set Authorization Token
  setAuthToken: (token) => {
    if (token) {
      // Set default Authorization header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      logger.info('Auth token set in API headers');
    } else {
      // Remove Authorization header
      delete api.defaults.headers.common['Authorization'];
      logger.info('Auth token cleared from API headers');
    }
  },

  // Logger
  logger,

  // Initialize
  async init() {
    logger.info(`Initializing API Service (${ENV.toUpperCase()})`);
    logger.info(`Backend URL: ${API_BASE_URL}`);

    try {
      // Check backend health
      const health = await this.health.checkBackendHealth();

      if (health.healthy) {
        logger.info('✅ Backend is connected and healthy');
      } else {
        logger.warn('⚠️ Backend may not be running or is unreachable');

        if (ENV === 'development') {
          toast('Backend server may not be running. Some features may not work.', {
            duration: 5000,
            icon: '⚠️'
          });
        }
      }

      // Check authentication status
      if (this.auth.isAuthenticated()) {
        logger.info('✅ User is authenticated');

        // Test API access
        try {
          await this.get('/health');
          logger.info('✅ Backend API is responding');
        } catch (error) {
          logger.warn('⚠️ Backend API access issue:', error.message);
        }
      }

      logger.info('✅ API Service initialized successfully');
      return true;
    } catch (error) {
      logger.error('❌ API Service initialization failed', error);
      return false;
    }
  }
};

// Auto-initialize
if (ENV === 'development') {
  setTimeout(() => {
    apiService.init();
  }, 1000);
}

export default apiService;