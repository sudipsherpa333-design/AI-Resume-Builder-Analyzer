// FIXED AdminContext.jsx - with proper infinite loop prevention
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo
} from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Check if we're in development mode
const IS_DEVELOPMENT = import.meta.env.DEV || window.location.hostname === 'localhost';
const USE_MOCK_API = IS_DEVELOPMENT || import.meta.env.VITE_USE_MOCK_API === 'true';

// Create context
const AdminContext = createContext(null);

// Custom hook
export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
};

// Mock data for development
const MOCK_ADMIN_DATA = {
    admin: {
        id: 'admin-dev-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'super_admin',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=3b82f6&color=ffffff',
        permissions: ['all'],
        createdAt: new Date().toISOString()
    },

    dashboardStats: {
        totalUsers: 42,
        totalResumes: 156,
        totalTemplates: 8,
        activeUsers: 24,
        newUsersToday: 3,
        resumesCreatedToday: 12,
        systemHealth: 95,
        storageUsage: 2.5,
        bandwidthUsage: 15.2,
        uptime: 99.9,
        responseTime: 120
    },

    recentActivity: [
        {
            id: 'act-1',
            type: 'user_signup',
            user: { name: 'John Doe', email: 'john@example.com' },
            timestamp: new Date().toISOString(),
            description: 'New user registered'
        }
    ],

    users: [
        {
            id: 'user-1',
            email: 'john@example.com',
            name: 'John Doe',
            role: 'user',
            isVerified: true,
            resumeCount: 3,
            lastActive: new Date().toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
        }
    ],

    templates: [
        {
            id: 'template-1',
            name: 'Modern',
            description: 'Clean and professional template',
            category: 'Professional',
            isActive: true,
            usageCount: 45,
            createdAt: new Date().toISOString()
        }
    ],

    resumes: [
        {
            id: 'resume-1',
            title: 'Software Engineer Resume',
            user: { name: 'John Doe', email: 'john@example.com' },
            template: 'Modern',
            status: 'completed',
            views: 15,
            downloads: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ]
};

// Storage keys
const STORAGE_KEYS = {
    ADMIN_TOKEN: 'admin_token',
    ADMIN_USER: 'admin_user',
    ADMIN_REFRESH_TOKEN: 'admin_refresh_token'
};

// Admin Provider
export const AdminProvider = ({ children }) => {
    // State
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [connectionInfo, setConnectionInfo] = useState(null);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [users, setUsers] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [resumes, setResumes] = useState([]);

    // Refs
    const mountedRef = useRef(true);
    const initializedRef = useRef(false);
    const healthCheckIntervalRef = useRef(null);

    // Clear admin session
    const clearAdminSession = useCallback(() => {
        console.log('[Admin] Clearing admin session...');

        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });

        setAdmin(null);
        setError(null);
        setDashboardStats(null);
        setRecentActivity([]);
        setUsers([]);
        setTemplates([]);
        setResumes([]);

        if (healthCheckIntervalRef.current) {
            clearInterval(healthCheckIntervalRef.current);
            healthCheckIntervalRef.current = null;
        }

        initializedRef.current = false;
    }, []);

    // Test backend connection
    const testBackendConnection = useCallback(async () => {
        if (!mountedRef.current) return false;

        setBackendStatus('checking');

        // DEVELOPMENT: Always succeed
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 100));

            setBackendStatus('online');
            setConnectionInfo({
                success: true,
                responseTime: 120,
                timestamp: new Date().toISOString(),
                status: 200,
                data: { status: 'healthy', mode: 'mock' }
            });

            return true;
        }

        // Production code
        try {
            const startTime = Date.now();
            const response = await axios.get(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/health`, {
                timeout: 5000,
                validateStatus: (status) => status < 500
            });

            const responseTime = Date.now() - startTime;

            setBackendStatus('online');
            setConnectionInfo({
                success: true,
                responseTime,
                timestamp: new Date().toISOString(),
                status: response.status,
                data: response.data
            });

            return true;
        } catch (error) {
            console.error('[Admin] Backend connection failed:', error.message);

            setBackendStatus('offline');
            setConnectionInfo({
                success: false,
                responseTime: null,
                timestamp: new Date().toISOString(),
                error: error.message,
                status: error.response?.status
            });

            return false;
        }
    }, [USE_MOCK_API]);

    // Check admin authentication status
    const checkAdminAuth = useCallback(async () => {
        // DEVELOPMENT: Always return true for mock
        if (USE_MOCK_API) {
            const storedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
            if (storedAdmin) {
                const adminData = JSON.parse(storedAdmin);
                setAdmin(adminData);
                return true;
            }
            return false;
        }

        // Production code
        try {
            const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
            const storedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);

            if (!token || !storedAdmin) {
                console.log('[Admin] No admin credentials found');
                return false;
            }

            // Verify admin token
            const response = await axios.get(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/auth/verify`, {
                timeout: 5000,
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data?.success) {
                const adminData = JSON.parse(storedAdmin);

                if (!adminData.role || !['admin', 'super_admin'].includes(adminData.role)) {
                    console.warn('[Admin] User is not an admin');
                    clearAdminSession();
                    return false;
                }

                setAdmin(adminData);
                console.log('[Admin] Admin verified:', adminData.email);
                return true;
            } else {
                clearAdminSession();
                return false;
            }
        } catch (error) {
            console.error('[Admin] Auth check failed:', error.message);

            if (error.response?.status === 401) {
                clearAdminSession();
            }

            return false;
        }
    }, [clearAdminSession, USE_MOCK_API]);

    // Fetch dashboard stats
    const fetchDashboardStats = useCallback(async (range = '7d') => {
        // DEVELOPMENT: Return mock stats
        if (USE_MOCK_API) {
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                setDashboardStats(MOCK_ADMIN_DATA.dashboardStats);
                return MOCK_ADMIN_DATA.dashboardStats;
            } catch (error) {
                console.error('[Admin] Failed to fetch mock dashboard stats:', error);
                setError('Unable to load dashboard statistics');
                throw error;
            }
        }

        // Production code
        try {
            const response = await axios.get(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/dashboard/stats`, {
                params: { range },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)}`
                }
            });

            if (response.data?.success) {
                setDashboardStats(response.data.stats);
                return response.data.stats;
            }

            throw new Error('Failed to fetch dashboard stats');
        } catch (error) {
            console.error('[Admin] Failed to fetch dashboard stats:', error);
            setError('Unable to load dashboard statistics');
            throw error;
        }
    }, [USE_MOCK_API]);

    // Fetch recent activity
    const fetchRecentActivity = useCallback(async (limit = 10) => {
        // DEVELOPMENT: Return mock activity
        if (USE_MOCK_API) {
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                const activity = MOCK_ADMIN_DATA.recentActivity.slice(0, limit);
                setRecentActivity(activity);
                return activity;
            } catch (error) {
                console.error('[Admin] Failed to fetch mock recent activity:', error);
                setRecentActivity([]);
                throw error;
            }
        }

        // Production code
        try {
            const response = await axios.get(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/dashboard/recent-activity`, {
                params: { limit },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)}`
                }
            });

            if (response.data?.success) {
                const activity = response.data.activity || [];
                setRecentActivity(activity);
                return activity;
            }

            throw new Error('Failed to fetch recent activity');
        } catch (error) {
            console.error('[Admin] Failed to fetch recent activity:', error);
            setRecentActivity([]);
            throw error;
        }
    }, [USE_MOCK_API]);

    // Fetch users
    const fetchUsers = useCallback(async (params = {}) => {
        // DEVELOPMENT: Return mock users
        if (USE_MOCK_API) {
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                const usersData = MOCK_ADMIN_DATA.users;
                setUsers(usersData);
                return usersData;
            } catch (error) {
                console.error('[Admin] Failed to fetch mock users:', error);
                setUsers([]);
                setError('Unable to load users');
                throw error;
            }
        }

        // Production code
        try {
            const response = await axios.get(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/users`, {
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)}`
                }
            });

            if (response.data?.success) {
                const usersData = response.data.users || [];
                setUsers(usersData);
                return usersData;
            }

            throw new Error('Failed to fetch users');
        } catch (error) {
            console.error('[Admin] Failed to fetch users:', error);
            setUsers([]);
            setError('Unable to load users');
            throw error;
        }
    }, [USE_MOCK_API]);

    // Fetch templates
    const fetchTemplates = useCallback(async (params = {}) => {
        // DEVELOPMENT: Return mock templates
        if (USE_MOCK_API) {
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                const templatesData = MOCK_ADMIN_DATA.templates;
                setTemplates(templatesData);
                return templatesData;
            } catch (error) {
                console.error('[Admin] Failed to fetch mock templates:', error);
                setTemplates([]);
                setError('Unable to load templates');
                throw error;
            }
        }

        // Production code
        try {
            const response = await axios.get(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/templates`, {
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)}`
                }
            });

            if (response.data?.success) {
                const templatesData = response.data.templates || [];
                setTemplates(templatesData);
                return templatesData;
            }

            throw new Error('Failed to fetch templates');
        } catch (error) {
            console.error('[Admin] Failed to fetch templates:', error);
            setTemplates([]);
            setError('Unable to load templates');
            throw error;
        }
    }, [USE_MOCK_API]);

    // Fetch resumes
    const fetchResumes = useCallback(async (params = {}) => {
        // DEVELOPMENT: Return mock resumes
        if (USE_MOCK_API) {
            try {
                await new Promise(resolve => setTimeout(resolve, 200));
                const resumesData = MOCK_ADMIN_DATA.resumes;
                setResumes(resumesData);
                return resumesData;
            } catch (error) {
                console.error('[Admin] Failed to fetch mock resumes:', error);
                setResumes([]);
                setError('Unable to load resumes');
                throw error;
            }
        }

        // Production code
        try {
            const response = await axios.get(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/resumes`, {
                params,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)}`
                }
            });

            if (response.data?.success) {
                const resumesData = response.data.resumes || [];
                setResumes(resumesData);
                return resumesData;
            }

            throw new Error('Failed to fetch resumes');
        } catch (error) {
            console.error('[Admin] Failed to fetch resumes:', error);
            setResumes([]);
            setError('Unable to load resumes');
            throw error;
        }
    }, [USE_MOCK_API]);

    // Admin login
    const login = useCallback(async (email, password, rememberMe = false) => {
        // DEVELOPMENT: Mock login
        if (USE_MOCK_API) {
            try {
                setLoading(true);
                setError(null);

                console.log('[Admin] Mock login attempt:', email);

                // For mock, accept admin credentials or create new
                const isValid = (email === 'admin@example.com' && password === 'admin123') ||
                    (email && password.length >= 6);

                if (isValid) {
                    const mockAdmin = {
                        ...MOCK_ADMIN_DATA.admin,
                        email: email,
                        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
                    };

                    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(mockAdmin));
                    localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, 'mock-admin-token-' + Date.now());

                    setAdmin(mockAdmin);

                    // Load mock data
                    setDashboardStats(MOCK_ADMIN_DATA.dashboardStats);
                    setRecentActivity(MOCK_ADMIN_DATA.recentActivity);
                    setUsers(MOCK_ADMIN_DATA.users);

                    console.log('[Admin] Mock login successful');

                    return {
                        success: true,
                        user: mockAdmin,
                        token: 'mock-admin-token',
                        isAdmin: true
                    };
                } else {
                    throw new Error('Invalid credentials');
                }
            } catch (error) {
                console.error('[Admin] Mock login error:', error);
                setError('Invalid admin credentials');
                return { success: false, error: 'Invalid admin credentials' };
            } finally {
                setLoading(false);
            }
        }

        // Production code
        try {
            setLoading(true);
            setError(null);

            console.log('[Admin] Admin login attempt:', email);

            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }

            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const response = await axios.post(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/auth/login`, {
                email: email.trim().toLowerCase(),
                password: password
            });

            if (response.data?.success) {
                const { user: adminData, token, refreshToken } = response.data;

                if (!adminData.role || !['admin', 'super_admin'].includes(adminData.role)) {
                    throw new Error('User does not have admin privileges');
                }

                localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
                localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminData));

                if (refreshToken) {
                    localStorage.setItem(STORAGE_KEYS.ADMIN_REFRESH_TOKEN, refreshToken);
                }

                setAdmin(adminData);

                await Promise.allSettled([
                    fetchDashboardStats(),
                    fetchRecentActivity()
                ]);

                return {
                    success: true,
                    user: adminData,
                    token: token,
                    isAdmin: true
                };
            } else {
                throw new Error(response.data?.message || 'Admin login failed');
            }
        } catch (error) {
            console.error('[Admin] Login error:', error);

            let errorMessage = 'Admin login failed';

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    errorMessage = 'Invalid admin credentials';
                } else if (error.response?.status === 403) {
                    errorMessage = 'Access denied: Admin privileges required';
                } else if (error.response?.status === 404) {
                    errorMessage = 'Admin endpoint not found';
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage = 'Request timeout. Please check your connection.';
                }
            }

            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [USE_MOCK_API, fetchDashboardStats, fetchRecentActivity]);

    // Admin logout
    const logout = useCallback(async () => {
        // DEVELOPMENT: Clear mock session
        if (USE_MOCK_API) {
            console.log('[Admin] Mock logout');
        } else {
            // Production logout
            try {
                const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

                if (token) {
                    await axios.post(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/auth/logout`, {}, {
                        timeout: 5000,
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            } catch (error) {
                console.warn('[Admin] Logout API error:', error.message);
            }
        }

        clearAdminSession();
        window.location.href = '/admin/login';
    }, [clearAdminSession, USE_MOCK_API]);

    // Create user
    const createUser = useCallback(async (userData) => {
        // DEVELOPMENT: Mock create
        if (USE_MOCK_API) {
            try {
                await new Promise(resolve => setTimeout(resolve, 300));

                const newUser = {
                    ...userData,
                    id: 'user-' + Date.now(),
                    createdAt: new Date().toISOString(),
                    isVerified: false,
                    resumeCount: 0,
                    lastActive: new Date().toISOString()
                };

                // Update local state
                const updatedUsers = [...users, newUser];
                setUsers(updatedUsers);

                return newUser;
            } catch (error) {
                console.error('[Admin] Failed to create mock user:', error);
                setError('Failed to create user');
                throw error;
            }
        }

        // Production code
        try {
            const response = await axios.post(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/users`, userData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)}`
                }
            });

            if (response.data?.success) {
                await fetchUsers();
                return response.data.user;
            }

            throw new Error('Failed to create user');
        } catch (error) {
            console.error('[Admin] Failed to create user:', error);
            setError(error.response?.data?.message || 'Failed to create user');
            throw error;
        }
    }, [fetchUsers, users, USE_MOCK_API]);

    // Update user
    const updateUser = useCallback(async (userId, updates) => {
        // DEVELOPMENT: Mock update
        if (USE_MOCK_API) {
            try {
                await new Promise(resolve => setTimeout(resolve, 300));

                const updatedUsers = users.map(user =>
                    user.id === userId ? { ...user, ...updates, updatedAt: new Date().toISOString() } : user
                );

                setUsers(updatedUsers);

                return updatedUsers.find(user => user.id === userId);
            } catch (error) {
                console.error('[Admin] Failed to update mock user:', error);
                setError('Failed to update user');
                throw error;
            }
        }

        // Production code
        try {
            const response = await axios.put(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/users/${userId}`, updates, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)}`
                }
            });

            if (response.data?.success) {
                await fetchUsers();
                return response.data.user;
            }

            throw new Error('Failed to update user');
        } catch (error) {
            console.error('[Admin] Failed to update user:', error);
            setError(error.response?.data?.message || 'Failed to update user');
            throw error;
        }
    }, [fetchUsers, users, USE_MOCK_API]);

    // Delete user
    const deleteUser = useCallback(async (userId) => {
        // DEVELOPMENT: Mock delete
        if (USE_MOCK_API) {
            try {
                await new Promise(resolve => setTimeout(resolve, 200));

                const updatedUsers = users.filter(user => user.id !== userId);
                setUsers(updatedUsers);

                return true;
            } catch (error) {
                console.error('[Admin] Failed to delete mock user:', error);
                setError('Failed to delete user');
                throw error;
            }
        }

        // Production code
        try {
            const response = await axios.delete(`${import.meta.env.VITE_ADMIN_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN)}`
                }
            });

            if (response.data?.success) {
                await fetchUsers();
                return true;
            }

            throw new Error('Failed to delete user');
        } catch (error) {
            console.error('[Admin] Failed to delete user:', error);
            setError(error.response?.data?.message || 'Failed to delete user');
            throw error;
        }
    }, [fetchUsers, users, USE_MOCK_API]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Initialize on mount - FIXED with minimal dependencies
    useEffect(() => {
        if (initializedRef.current) return;

        const init = async () => {
            console.log('[Admin] Initializing admin provider...');

            try {
                // Check if we should use mock data
                if (USE_MOCK_API) {
                    console.log('[Admin] Using mock data for development');

                    // Check for stored admin data
                    const storedAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
                    const storedToken = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);

                    if (storedAdmin && storedToken) {
                        const adminData = JSON.parse(storedAdmin);
                        setAdmin(adminData);
                    }

                    // Set mock data
                    setDashboardStats(MOCK_ADMIN_DATA.dashboardStats);
                    setRecentActivity(MOCK_ADMIN_DATA.recentActivity);
                    setUsers(MOCK_ADMIN_DATA.users);
                    setTemplates(MOCK_ADMIN_DATA.templates);
                    setResumes(MOCK_ADMIN_DATA.resumes);
                    setBackendStatus('online');

                } else {
                    // Test backend connection
                    await testBackendConnection();

                    // Check admin auth if backend is online
                    if (backendStatus === 'online') {
                        await checkAdminAuth();
                    }
                }
            } catch (error) {
                console.error('[Admin] Initialization error:', error);
                setError('Failed to initialize admin panel');
            } finally {
                setLoading(false);
                initializedRef.current = true;
            }
        };

        init();

        // Set up periodic health check
        healthCheckIntervalRef.current = setInterval(() => {
            if (mountedRef.current && admin) {
                testBackendConnection();
            }
        }, 5 * 60 * 1000);

        return () => {
            mountedRef.current = false;

            if (healthCheckIntervalRef.current) {
                clearInterval(healthCheckIntervalRef.current);
            }
        };
    }, []); // Empty dependency array - runs once on mount

    // Context value
    const value = useMemo(() => ({
        // State
        admin,
        loading,
        error,
        backendStatus,
        connectionInfo,
        dashboardStats,
        recentActivity,
        users,
        templates,
        resumes,

        // Status
        isAuthenticated: !!admin,
        isAdmin: !!admin,
        isSuperAdmin: admin?.role === 'super_admin',

        // Actions
        login,
        logout,
        clearError,
        testBackendConnection,
        fetchDashboardStats,
        fetchRecentActivity,
        fetchUsers,
        fetchTemplates,
        fetchResumes,
        createUser,
        updateUser,
        deleteUser,

        // Admin info
        adminInfo: admin ? {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            avatar: admin.avatar,
            permissions: admin.permissions || []
        } : null,

        // Permissions
        hasPermission: (permission) => {
            if (!admin) return false;
            if (admin.role === 'super_admin') return true;
            if (admin.permissions?.includes('all')) return true;
            return admin.permissions?.includes(permission) || false;
        },

        // Stats
        getStatsSummary: () => {
            if (!dashboardStats) return null;
            return {
                totalUsers: dashboardStats.totalUsers || 0,
                totalResumes: dashboardStats.totalResumes || 0,
                totalTemplates: dashboardStats.totalTemplates || 0,
                activeUsers: dashboardStats.activeUsers || 0,
                systemHealth: dashboardStats.systemHealth || 0
            };
        },

        // Connection status
        isBackendOnline: backendStatus === 'online',
        isBackendOffline: backendStatus === 'offline',
        isBackendChecking: backendStatus === 'checking',

        // Development mode
        isDevelopment: USE_MOCK_API
    }), [
        admin, loading, error, backendStatus, connectionInfo,
        dashboardStats, recentActivity, users, templates, resumes,
        login, logout, clearError, testBackendConnection,
        fetchDashboardStats, fetchRecentActivity, fetchUsers,
        fetchTemplates, fetchResumes, createUser, updateUser, deleteUser,
        USE_MOCK_API
    ]);

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export default AdminContext;