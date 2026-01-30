// src/context/AuthContext.jsx - FIXED VERSION (no useNavigate in mount)
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create context
const AuthContext = createContext(null);

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Development mode detection
const IS_DEVELOPMENT = import.meta.env.DEV || window.location.hostname === 'localhost';
const USE_MOCK_API = IS_DEVELOPMENT || import.meta.env.VITE_USE_MOCK_API === 'true';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Storage keys
const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'auth_user',
    REDIRECT: 'auth_redirect'
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    // State
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initializing, setInitializing] = useState(true);

    // Load user from storage on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                console.log('🔍 Initializing authentication...', {
                    useMock: USE_MOCK_API,
                    apiUrl: API_BASE_URL
                });

                const userData = localStorage.getItem(STORAGE_KEYS.USER);
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

                // For development mode, always create a user if none exists
                if (USE_MOCK_API && !userData && !token) {
                    console.log('🏗️ DEVELOPMENT: Creating demo user');
                    const demoUser = {
                        id: `dev-user-${Date.now()}`,
                        _id: `dev-user-${Date.now()}`, // Add _id for compatibility
                        email: 'demo@example.com',
                        name: 'Demo User',
                        role: 'user',
                        isVerified: true,
                        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=10b981&color=ffffff',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        preferences: {
                            theme: 'light',
                            language: 'en',
                            emailNotifications: true
                        },
                        isDemo: true
                    };

                    const demoToken = 'dev-token-' + Date.now();

                    localStorage.setItem(STORAGE_KEYS.TOKEN, demoToken);
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
                    setUser(demoUser);

                    console.log('✅ Demo user created:', demoUser.email);
                }
                // Load existing user
                else if (userData && token) {
                    const parsedUser = JSON.parse(userData);
                    console.log('👤 Loaded user:', parsedUser.email);

                    // Ensure user has both id and _id for compatibility
                    if (!parsedUser._id && parsedUser.id) {
                        parsedUser._id = parsedUser.id;
                    }

                    setUser(parsedUser);
                }

                setError(null);
            } catch (error) {
                console.error('❌ Auth initialization error:', error);
                setError('Failed to initialize authentication');

                // Clear potentially corrupted data
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
            } finally {
                setInitializing(false);
                setLoading(false);
                console.log('✅ Auth initialization complete');
            }
        };

        initAuth();
    }, [USE_MOCK_API]);

    // Get user ID (compatibility helper)
    const getUserId = useCallback(() => {
        if (!user) return null;
        return user._id || user.id || null;
    }, [user]);

    // Get navigation function (returns function that can be called later)
    const getNavigate = useCallback(() => {
        // This will be set by the component that uses navigate
        return null;
    }, []);

    // User login
    const login = useCallback(async (email, password, rememberMe = false, navigate) => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔐 Login attempt:', { email, useMock: USE_MOCK_API });

            // Basic validation
            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address');
            }
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            let userData, token;

            // For development/mock mode
            if (USE_MOCK_API) {
                console.log('🏗️ Using mock login');

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Create mock user
                userData = {
                    id: `user-${Date.now()}`,
                    _id: `user-${Date.now()}`, // Add _id
                    email: email,
                    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                    role: 'user',
                    isVerified: true,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=6366f1&color=ffffff`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    preferences: {
                        theme: 'light',
                        language: 'en',
                        emailNotifications: true
                    },
                    isDemo: email === 'demo@example.com'
                };

                token = 'mock-jwt-token-' + Date.now();
            }
            // PRODUCTION: Real API call
            else {
                const axiosInstance = axios.create({
                    baseURL: API_BASE_URL,
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const loginData = {
                    email: email.trim().toLowerCase(),
                    password: password
                };

                console.log('📤 Sending login request to:', `${API_BASE_URL}/auth/login`);
                const response = await axiosInstance.post('/auth/login', loginData);
                console.log('📥 Login response received:', response.data);

                if (!response.data?.success) {
                    throw new Error(response.data?.message || 'Login failed');
                }

                const responseData = response.data.user || response.data.data;
                token = response.data.token || responseData?.token;
                userData = {
                    ...responseData,
                    id: responseData.id || responseData._id || `user_${Date.now()}`,
                    _id: responseData._id || responseData.id || `user_${Date.now()}`, // Ensure _id exists
                    email: responseData.email || email,
                    name: responseData.name || 'User',
                    role: responseData.role || 'user',
                    createdAt: responseData.createdAt || new Date().toISOString()
                };

                // Remove sensitive data
                delete userData.password;
                delete userData.__v;
            }

            // Store auth data
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

            // Update state
            setUser(userData);
            setError(null);

            // Remember me
            if (rememberMe) {
                localStorage.setItem('remember_me', 'true');
            }

            toast.success('Login successful!');

            // Call navigate if provided
            if (navigate && typeof navigate === 'function') {
                const redirectPath = sessionStorage.getItem(STORAGE_KEYS.REDIRECT) || '/dashboard';
                sessionStorage.removeItem(STORAGE_KEYS.REDIRECT);

                setTimeout(() => {
                    navigate(redirectPath, { replace: true });
                }, 500);
            }

            return {
                success: true,
                user: userData,
                token: token
            };

        } catch (error) {
            console.error('❌ Login error:', error);

            let errorMessage = 'Login failed';
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = error.response.status === 401
                        ? 'Invalid email or password'
                        : error.response.data?.message || `Error ${error.response.status}`;
                } else if (error.request) {
                    errorMessage = 'Cannot connect to server. Please check your connection.';
                } else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);
            toast.error(errorMessage, { duration: 5000 });

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [USE_MOCK_API]);

    // User register
    const register = useCallback(async (name, email, password, confirmPassword, navigate) => {
        try {
            setLoading(true);
            setError(null);

            console.log('📝 Register attempt:', { name, email, useMock: USE_MOCK_API });

            // Validation
            if (!name?.trim()) {
                throw new Error('Name is required');
            }
            if (!email || !email.includes('@')) {
                throw new Error('Valid email is required');
            }
            if (!password || password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            let userData, token;

            // For development/mock mode
            if (USE_MOCK_API) {
                console.log('🏗️ Using mock registration');
                await new Promise(resolve => setTimeout(resolve, 600));

                userData = {
                    id: `user-${Date.now()}`,
                    _id: `user-${Date.now()}`, // Add _id
                    email: email,
                    name: name,
                    role: 'user',
                    isVerified: false,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=ffffff`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    preferences: {
                        theme: 'light',
                        language: 'en',
                        emailNotifications: true
                    },
                    isDemo: false
                };

                token = 'mock-register-token-' + Date.now();
            }
            // PRODUCTION: Real API call
            else {
                const axiosInstance = axios.create({
                    baseURL: API_BASE_URL,
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const registerData = {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password: password,
                    confirmPassword: confirmPassword
                };

                const response = await axiosInstance.post('/auth/register', registerData);
                console.log('📥 Register response received:', response.data);

                if (!response.data?.success) {
                    throw new Error(response.data?.message || 'Registration failed');
                }

                const responseData = response.data.user || response.data.data;
                token = response.data.token || responseData?.token;
                userData = {
                    ...responseData,
                    id: responseData.id || responseData._id || `user_${Date.now()}`,
                    _id: responseData._id || responseData.id || `user_${Date.now()}`,
                    email: responseData.email || email,
                    name: responseData.name || name,
                    role: responseData.role || 'user',
                    createdAt: responseData.createdAt || new Date().toISOString()
                };

                delete userData.password;
                delete userData.__v;
            }

            // Store auth data
            localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

            setUser(userData);
            setError(null);
            toast.success('🎉 Registration successful!');

            // Call navigate if provided
            if (navigate && typeof navigate === 'function') {
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1500);
            }

            return {
                success: true,
                user: userData,
                token: token
            };

        } catch (error) {
            console.error('❌ Registration error:', error);

            let errorMessage = 'Registration failed. Please try again.';
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    errorMessage = error.response.status === 409
                        ? 'Email already registered'
                        : error.response.data?.message || error.message;
                } else if (error.request) {
                    errorMessage = 'Cannot connect to server. Please check your connection.';
                } else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);
            toast.error(errorMessage, { duration: 5000 });

            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [USE_MOCK_API]);

    // Demo login for testing
    const demoLogin = useCallback(async (navigate) => {
        try {
            setLoading(true);
            setError(null);
            console.log('🚀 Starting demo login...');

            const demoUser = {
                id: 'demo_user_' + Date.now(),
                _id: 'demo_user_' + Date.now(), // Add _id
                email: 'demo@example.com',
                name: 'Demo User',
                role: 'user',
                isVerified: true,
                createdAt: new Date().toISOString(),
                isDemo: true
            };

            const demoToken = 'demo_token_' + Date.now();

            localStorage.setItem(STORAGE_KEYS.TOKEN, demoToken);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));

            setUser(demoUser);
            toast.success('🚀 Demo account activated!');

            // Call navigate if provided
            if (navigate && typeof navigate === 'function') {
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1000);
            }

            return {
                success: true,
                user: demoUser,
                isDemo: true
            };

        } catch (error) {
            console.error('❌ Demo login error:', error);
            toast.error('Demo login failed. Please try regular login.');
            return { success: false, error: 'Demo login failed' };
        } finally {
            setLoading(false);
        }
    }, []);

    // User logout
    const logout = useCallback((navigate) => {
        console.log('👋 Logging out...');

        // Clear everything
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem(STORAGE_KEYS.REDIRECT);
        localStorage.removeItem('remember_me');

        // Update state
        setUser(null);
        setError(null);

        toast.success('Logged out successfully');

        // Call navigate if provided
        if (navigate && typeof navigate === 'function') {
            navigate('/', { replace: true });
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Get token
    const getToken = useCallback(() => {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }, []);

    // Update user data
    const updateUser = useCallback((updatedData) => {
        setUser(prev => {
            if (!prev) return prev;

            const newUser = {
                ...prev,
                ...updatedData,
                // Ensure _id always exists
                _id: updatedData._id || prev._id || prev.id
            };

            // Remove sensitive data
            delete newUser.token;
            delete newUser.password;
            delete newUser.__v;

            // Store updated user
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
            return newUser;
        });
    }, []);

    // Check if user is authenticated
    const isAuthenticated = useMemo(() => {
        return !!user;
    }, [user]);

    // Check if user is admin
    const isAdmin = useMemo(() => {
        return user?.role === 'admin' || user?.role === 'super_admin';
    }, [user]);

    // Context value
    const value = useMemo(() => ({
        // State
        user,
        loading,
        error,
        initializing,

        // Status
        isAuthenticated,
        isAdmin,
        isDemo: user?.isDemo || false,

        // Data
        token: getToken(),
        userId: getUserId(), // Add userId getter for compatibility

        // Actions (these now accept navigate as parameter)
        login,
        register,
        logout,
        clearError,
        updateUser,
        demoLogin,

        // Helpers
        isDevelopment: USE_MOCK_API
    }), [
        user, loading, error, initializing,
        isAuthenticated, isAdmin,
        getToken, getUserId,
        login, register, logout, clearError,
        updateUser, demoLogin, USE_MOCK_API
    ]);

    // Show loading while initializing
    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">
                        {USE_MOCK_API ? 'Initializing development mode...' : 'Initializing authentication...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;