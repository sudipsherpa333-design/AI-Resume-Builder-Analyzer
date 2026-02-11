import axios from 'axios';

// ======================
// CONFIGURATION
// ======================
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/';
const REQUEST_TIMEOUT = parseInt(process.env.REACT_APP_REQUEST_TIMEOUT) || 15000;
const CACHE_DURATION = parseInt(process.env.REACT_APP_CACHE_DURATION) || 30000; // 30s
const MAX_RETRIES = parseInt(process.env.REACT_APP_MAX_RETRIES) || 3;

// ======================
// AXIOS INSTANCE
// ======================
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Store client info for reuse
const CLIENT_INFO = {
  version: process.env.REACT_APP_VERSION || '1.0.0',
  platform: navigator.platform,
  userAgent: navigator.userAgent.substring(0, 100), // Limit length
  screenSize: `${window.innerWidth}x${window.innerHeight}`,
  clientName: 'ai-resume-builder-admin',
  sessionId: localStorage.getItem('admin_session_id') ||
        `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
};

// Store session ID if not exists
if (!localStorage.getItem('admin_session_id')) {
  localStorage.setItem('admin_session_id', CLIENT_INFO.sessionId);
}

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add request ID
    config.headers['x-request-id'] = `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    // Add client headers for all requests
    config.headers['x-client-version'] = CLIENT_INFO.version;
    config.headers['x-client-platform'] = CLIENT_INFO.platform;
    config.headers['x-client-name'] = CLIENT_INFO.clientName;
    config.headers['x-session-id'] = CLIENT_INFO.sessionId;

    // Add auth token if exists (check multiple sources)
    const token = localStorage.getItem('adminToken') ||
            localStorage.getItem('admin_token') ||
            localStorage.getItem('admin_remember_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional: Add login attempt info for login requests
    if (config.url.includes('/login')) {
      config.headers['x-login-attempt'] = new Date().toISOString();
      const failedAttempts = localStorage.getItem('failed_login_attempts');
      if (failedAttempts) {
        config.headers['x-failed-attempts'] = failedAttempts;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.debug(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
        id: config.headers['x-request-id'],
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`📥 ${response.status} ${response.config.url}`, {
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      // Clear all auth tokens
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_remember_token');
      localStorage.removeItem('adminSession');

      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/admin/login');
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message
      });
    }

    return Promise.reject(error);
  }
);

// ======================
// HELPERS
// ======================
const tryAdminOrApi = async (path, config = {}) => {
  try {
    return await instance.get(path, config);
  } catch (err) {
    // If 404 on /admin path, try /api/admin
    if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
      const altPath = path.startsWith('/admin') ?
        path.replace('/admin', '/api/admin') :
        `/api${path.startsWith('/') ? path : '/' + path}`;

      console.log(`🔄 Falling back to: ${altPath}`);
      return await instance.get(altPath, config);
    }
    throw err;
  }
};

const cachedCall = (keyPrefix) => async (path, params = {}, ttl = CACHE_DURATION) => {
  const key = `${keyPrefix}:${path}:${JSON.stringify(params)}`;
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const { data, ts } = JSON.parse(cached);
      if (Date.now() - ts < ttl) {
        console.log(`💾 Using cache for: ${path}`);
        return data;
      }
    } catch (e) {
      console.warn('Cache parse error:', e);
    }
  }

  const res = await tryAdminOrApi(path, { params });
  const result = res.data;

  try {
    localStorage.setItem(key, JSON.stringify({
      data: result,
      ts: Date.now()
    }));
  } catch (e) {
    console.warn('Cache storage error:', e);
  }

  return result;
};

// ======================
// CORE FUNCTIONS
// ======================
export const healthCheck = async () => {
  try {
    const res = await instance.get('/health');
    return { success: true, data: res.data };
  } catch {
    try {
      const res = await instance.get('/api/health');
      return { success: true, data: res.data };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        offline: true
      };
    }
  }
};

export const testConnection = async () => {
  const start = Date.now();
  try {
    const health = await healthCheck();
    return {
      success: true,
      data: health.data,
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
      version: CLIENT_INFO.version
    };
  } catch (err) {
    throw err;
  }
};

// ======================
// AUTH (Matching AdminContext requirements)
// ======================
export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('adminToken') ||
            localStorage.getItem('admin_token') ||
            localStorage.getItem('admin_remember_token');

    if (!token) {
      return {
        authenticated: false,
        user: null,
        message: 'No token found'
      };
    }

    // Try to verify token by making a simple authenticated request
    const res = await instance.get('/admin/auth/status', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data?.authenticated) {
      return {
        authenticated: true,
        user: res.data.user,
        message: 'Authenticated'
      };
    }

    throw new Error('Invalid session');

  } catch (error) {
    console.warn('Auth check failed:', error.message);

    // Fallback: check if we have session data
    const sessionData = localStorage.getItem('adminSession');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.token && session.expiresIn) {
          const loginTime = new Date(session.loginTime);
          const expiresAt = new Date(loginTime.getTime() + (session.expiresIn * 1000));

          if (expiresAt > new Date()) {
            return {
              authenticated: true,
              user: session,
              message: 'Session restored from cache'
            };
          }
        }
      } catch (e) {
        // Invalid session data
      }
    }

    return {
      authenticated: false,
      user: null,
      message: error.message || 'Not authenticated'
    };
  }
};

export const adminLogin = async (email, password, rememberMe = false) => {
  if (!email || !password) {
    throw new Error('Email and password required');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email');
  }
  if (password.length < 6) {
    throw new Error('Password too short');
  }

  const loginHeaders = {
    'x-login-attempt': new Date().toISOString(),
    'x-remember-me': rememberMe.toString()
  };

  try {
    const res = await instance.post('/admin/auth/login', {
      email,
      password
    }, {
      headers: loginHeaders
    });

    const { token, user, expiresIn } = res.data;

    // Store token
    localStorage.setItem('adminToken', token);
    if (rememberMe && token) {
      localStorage.setItem('admin_remember_token', token);
    }

    // Store session
    const session = {
      ...user,
      token,
      expiresIn,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem('adminSession', JSON.stringify(session));

    // Clear failed attempts on successful login
    localStorage.removeItem('failed_login_attempts');
    localStorage.removeItem('last_failed_login');

    return {
      success: true,
      user: {
        id: user.id || user._id,
        email: user.email,
        name: user.name,
        role: user.role || 'admin',
        avatar: user.avatar,
        permissions: user.permissions || ['all']
      },
      token
    };
  } catch (error) {
    // Track failed login attempt
    const failedAttempts = parseInt(localStorage.getItem('failed_login_attempts') || '0') + 1;
    localStorage.setItem('failed_login_attempts', failedAttempts.toString());
    localStorage.setItem('last_failed_login', new Date().toISOString());

    throw error;
  }
};

export const adminLogout = async () => {
  try {
    await instance.post('/admin/auth/logout');
  } catch (error) {
    console.warn('Logout API call failed:', error);
  } finally {
    // Clear all auth storage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_remember_token');
    localStorage.removeItem('adminSession');
    localStorage.removeItem('admin_session_id');
    delete instance.defaults.headers.common['Authorization'];
  }

  return { success: true };
};

// ======================
// DASHBOARD (Matching AdminContext requirements)
// ======================
const cached = cachedCall('cache');

export const getDashboardStats = (range = '7d') =>
  cached('/admin/dashboard/stats', { range });

export const getRecentActivity = (limit = 10) =>
  cached('/admin/dashboard/recent-activity', { limit });

// ======================
// DATA FETCHERS (Matching AdminContext requirements)
// ======================
export const getUsers = async (params = {}) => {
  const { page = 1, limit = 10, search = '', role = 'all', status = 'all' } = params;
  return cached('/admin/users', { page, limit, search, role, status }, 10000);
};

export const getTemplates = async (params = {}) => {
  const { page = 1, limit = 12, search = '', category = 'all', status = 'all' } = params;
  return cached('/admin/templates', { page, limit, search, category, status });
};

export const getResumes = async (params = {}) => {
  const { page = 1, limit = 10 } = params;
  return cached('/admin/resumes', { page, limit });
};

export const createUser = async (userData) => {
  const res = await instance.post('/admin/users', userData);
  clearApiCache(); // Clear cache when modifying data
  return res.data;
};

export const updateUser = async (userId, updates) => {
  const res = await instance.put(`/admin/users/${userId}`, updates);
  clearApiCache();
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await instance.delete(`/admin/users/${userId}`);
  clearApiCache();
  return res.data;
};

// ======================
// SYSTEM & HEALTH
// ======================
export const healthCheckDetailed = async () => {
  return instance.get('/admin/health');
};

// ======================
// UTILITIES
// ======================
export const clearApiCache = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cache:')) {
      localStorage.removeItem(key);
    }
  });
};

export const getClientInfo = () => ({ ...CLIENT_INFO });

// ======================
// EXPORT DEFAULT (Matching AdminContext import)
// ======================
const adminApi = {
  // Core
  instance,

  // Auth (AdminContext required)
  checkAuthStatus,
  adminLogin,
  adminLogout,

  // Connection
  healthCheck,
  testConnection,
  healthCheckDetailed,

  // Dashboard (AdminContext required)
  getDashboardStats,
  getRecentActivity,

  // Data (AdminContext required)
  getUsers,
  getTemplates,
  getResumes,
  createUser,
  updateUser,
  deleteUser,

  // Legacy functions (keep for compatibility)
  getDashboardGlobalStats: () => cached('/admin/dashboard/global-stats'),
  getDashboardCharts: (range = '7d') => cached('/admin/dashboard/charts', { range }),
  getTopUsers: (limit = 5) => cached('/admin/dashboard/top-users', { limit }),
  getRecentResumes: (limit = 5) => cached('/admin/dashboard/recent-resumes', { limit }),
  getSystemPerformance: () => cached('/admin/dashboard/performance'),

  // Utilities
  clearApiCache,
  getClientInfo
};

export default adminApi;