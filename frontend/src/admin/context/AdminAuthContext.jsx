// frontend/src/admin/context/AdminAuthContext.jsx - SECURE ADMIN AUTHENTICATION CONTEXT
import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef
} from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminAuthContext = createContext(null);

// Custom hook
export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within AdminAuthProvider');
    }
    return context;
};

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const ADMIN_API = `${API_BASE_URL}/admin`;

// Storage keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'admin_access_token',
    REFRESH_TOKEN: 'admin_refresh_token',
    ADMIN_USER: 'admin_user',
    LAST_LOGIN: 'admin_last_login'
};

// Create axios instance
const adminAxios = axios.create({
    baseURL: ADMIN_API,
    timeout: 10000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - add token to headers
adminAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
adminAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
            try {
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                if (refreshToken && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const response = await axios.post(
                        `${ADMIN_API}/auth/refresh`,
                        { refreshToken },
                        { timeout: 5000 }
                    );

                    const { accessToken } = response.data.data;
                    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return adminAxios(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, clear session
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
            }
        }

        return Promise.reject(error);
    }
);

// Provider component
export const AdminAuthProvider = ({ children }) => {
    // Auth state
    const [admin, setAdmin] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastError, setLastError] = useState(null);

    // Refs
    const initializeRef = useRef(false);

    // Initialize auth on mount
    useEffect(() => {
        if (initializeRef.current) return;
        initializeRef.current = true;

        const initializeAuth = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                const userData = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);

                if (!token) {
                    setLoading(false);
                    return;
                }

                // Verify token
                const response = await adminAxios.get('/auth/verify');

                if (response.data.success) {
                    const adminData = {
                        id: response.data.data.id,
                        email: response.data.data.email,
                        role: response.data.data.role,
                        permissions: response.data.data.permissions
                    };

                    setAdmin(adminData);
                    setIsAuthenticated(true);
                    localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminData));
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                // Clear invalid tokens
                localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = useCallback(async (email, password, rememberMe = false) => {
        try {
            setError(null);
            setLoading(true);

            // Validate inputs
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Make login request
            const response = await adminAxios.post('/auth/login', {
                email,
                password,
                rememberMe
            });

            if (!response.data.success) {
                throw new Error(response.data.error || 'Login failed');
            }

            const { admin: adminData, tokens } = response.data.data;

            // Store tokens and user data
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
            localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminData));
            localStorage.setItem(STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());

            // Set state
            setAdmin(adminData);
            setIsAuthenticated(true);

            // Show success message
            toast.success('Login successful!');

            return {
                success: true,
                admin: adminData,
                tokens
            };

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Login failed. Please try again.';
            setError(errorMessage);
            setLastError(errorMessage);
            toast.error(errorMessage);

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout function
    const logout = useCallback(async () => {
        try {
            setLoading(true);

            // Call logout endpoint
            await adminAxios.post('/auth/logout').catch(() => {
                // Ignore logout endpoint errors
            });

            // Clear storage
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
            localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);

            // Clear state
            setAdmin(null);
            setIsAuthenticated(false);
            setError(null);

            toast.success('Logged out successfully');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check permissions
    const hasPermission = useCallback((permission) => {
        if (!admin) return false;
        return admin.permissions?.includes('all') || admin.permissions?.includes(permission);
    }, [admin]);

    // Verify token
    const verifyToken = useCallback(async () => {
        try {
            const response = await adminAxios.get('/auth/verify');
            return response.data.success;
        } catch (err) {
            return false;
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
        setLastError(null);
    }, []);

    const value = {
        // State
        admin,
        isAuthenticated,
        loading,
        error,
        lastError,

        // Methods
        login,
        logout,
        hasPermission,
        verifyToken,
        clearError,

        // Helpers
        adminAxios
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export default AdminAuthProvider;
