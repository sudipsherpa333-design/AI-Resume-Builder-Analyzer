// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create the auth context
const AuthContext = createContext({});

// Configure axios defaults - Use Vite environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;
axios.defaults.withCredentials = true;

// Axios interceptor to add token to requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Axios interceptor to handle token expiration
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 error and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post('/auth/refresh', {
                    refreshToken
                });

                const { token, refreshToken: newRefreshToken } = response.data;

                // Store new tokens
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', newRefreshToken);

                // Update authorization header
                originalRequest.headers.Authorization = `Bearer ${token}`;

                // Retry the original request
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout user
                clearAuth();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const navigate = useNavigate();

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, []);

    // Check authentication status
    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                // Set user from localStorage first for immediate UI
                setUser(JSON.parse(storedUser));

                try {
                    // Verify token with server
                    const response = await axios.get('/auth/check');

                    if (response.data.success) {
                        const userData = response.data.data;
                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        // Token invalid, clear everything
                        clearAuth();
                    }
                } catch (error) {
                    // Server error, keep local user but show warning
                    console.warn('Auth check failed, using cached user:', error.message);
                }
            } else {
                clearAuth();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            clearAuth();
        } finally {
            setLoading(false);
            setAuthChecked(true);
        }
    };

    // Register user
    const register = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/auth/register', userData);

            if (response.data.success) {
                const { token, refreshToken, user } = response.data.data;

                // Store tokens and user data
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));

                // Set user in state
                setUser(user);

                return { success: true, user };
            }

            throw new Error(response.data.error || 'Registration failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (email, password, rememberMe = false) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/auth/login', {
                email,
                password,
                rememberMe
            });

            if (response.data.success) {
                const { token, refreshToken, user } = response.data.data;

                // Store tokens and user data
                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));

                // Set longer expiry for remember me
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Set user in state
                setUser(user);

                return { success: true, user };
            }

            throw new Error(response.data.error || 'Login failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Login with Google
    const loginWithGoogle = () => {
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = window.location.origin + '/auth/google/callback';

        if (!googleClientId) {
            setError('Google OAuth is not configured');
            return;
        }

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
        window.location.href = googleAuthUrl;
    };

    // Login with Google OAuth callback
    const handleGoogleCallback = async (code) => {
        try {
            setLoading(true);

            const response = await axios.post('/auth/google/callback', { code });

            if (response.data.success) {
                const { token, refreshToken, user } = response.data.data;

                localStorage.setItem('token', token);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(user));

                setUser(user);
                navigate('/dashboard');

                return { success: true, user };
            }

            throw new Error('Google authentication failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Google authentication failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = async () => {
        try {
            setLoading(true);

            // Call logout endpoint
            await axios.post('/auth/logout');

        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage regardless of server response
            clearAuth();

            // Reset state
            setUser(null);
            setError(null);

            // Navigate to login
            navigate('/login');
            setLoading(false);
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.put('/users/profile', profileData);

            if (response.data.success) {
                const updatedUser = response.data.data;

                // Update user in state and localStorage
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                return { success: true, user: updatedUser };
            }

            throw new Error(response.data.error || 'Profile update failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Profile update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Update password
    const updatePassword = async (currentPassword, newPassword) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.put('/users/password', {
                currentPassword,
                newPassword
            });

            if (response.data.success) {
                return { success: true };
            }

            throw new Error(response.data.error || 'Password update failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Password update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Forgot password
    const forgotPassword = async (email) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/auth/forgot-password', { email });

            if (response.data.success) {
                return { success: true };
            }

            throw new Error(response.data.error || 'Password reset request failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Password reset request failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Reset password
    const resetPassword = async (token, password) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/auth/reset-password', {
                token,
                password
            });

            if (response.data.success) {
                return { success: true };
            }

            throw new Error(response.data.error || 'Password reset failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Password reset failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Verify email
    const verifyEmail = async (token) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/auth/verify-email', { token });

            if (response.data.success) {
                const updatedUser = { ...user, isVerified: true };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                return { success: true, user: updatedUser };
            }

            throw new Error(response.data.error || 'Email verification failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Email verification failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Resend verification email
    const resendVerification = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('/auth/resend-verification');

            if (response.data.success) {
                return { success: true };
            }

            throw new Error(response.data.error || 'Failed to resend verification email');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to resend verification email';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Update preferences
    const updatePreferences = async (preferences) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.put('/users/preferences', preferences);

            if (response.data.success) {
                const updatedUser = response.data.data;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                return { success: true, user: updatedUser };
            }

            throw new Error(response.data.error || 'Preferences update failed');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Preferences update failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Use AI credits (if enabled)
    const useAICredits = async (credits = 1) => {
        // Check if AI is enabled
        if (import.meta.env.VITE_ENABLE_AI !== 'true') {
            return { success: false, error: 'AI features are disabled' };
        }

        try {
            setLoading(true);

            const response = await axios.post('/users/ai/use', { credits });

            if (response.data.success) {
                const updatedUser = {
                    ...user,
                    aiCredits: response.data.data.remainingCredits
                };

                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));

                return {
                    success: true,
                    remainingCredits: response.data.data.remainingCredits
                };
            }

            throw new Error(response.data.error || 'Failed to use AI credits');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to use AI credits';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Get user activity
    const getUserActivity = async (limit = 20) => {
        try {
            setLoading(true);

            const response = await axios.get(`/users/activity?limit=${limit}`);

            if (response.data.success) {
                return { success: true, activities: response.data.data };
            }

            throw new Error(response.data.error || 'Failed to get user activity');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to get user activity';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Get user statistics
    const getUserStats = async () => {
        try {
            setLoading(true);

            const response = await axios.get('/users/stats');

            if (response.data.success) {
                return { success: true, stats: response.data.data };
            }

            throw new Error(response.data.error || 'Failed to get user statistics');

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to get user statistics';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Clear authentication data
    const clearAuth = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');

        // Clear axios default headers
        delete axios.defaults.headers.common['Authorization'];
    };

    // Check if user is admin
    const isAdmin = () => {
        return user && (user.role === 'admin' || user.role === 'super_admin');
    };

    // Check if user can use AI
    const canUseAI = () => {
        // Check feature flag
        if (import.meta.env.VITE_ENABLE_AI !== 'true') {
            return false;
        }

        return user && (user.aiCredits > 0 || user.plan !== 'free');
    };

    // Refresh user data from server
    const refreshUserData = async () => {
        try {
            const response = await axios.get('/users/me');

            if (response.data.success) {
                const userData = response.data.data;
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return { success: true, user: userData };
            }

            throw new Error('Failed to refresh user data');

        } catch (error) {
            console.error('Refresh user data error:', error);
            return { success: false, error: error.message };
        }
    };

    // Context value
    const value = {
        user,
        loading,
        error,
        authChecked,
        setError,
        register,
        login,
        loginWithGoogle,
        handleGoogleCallback,
        logout,
        updateProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        updatePreferences,
        useAICredits,
        getUserActivity,
        getUserStats,
        refreshUserData,
        isAdmin,
        canUseAI,
        checkAuth,
        clearAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

// Higher Order Component for protected routes
export const withAuth = (Component) => {
    return function WithAuthComponent(props) {
        const { user, loading, authChecked } = useAuth();
        const navigate = useNavigate();

        useEffect(() => {
            if (authChecked && !user) {
                navigate('/login', {
                    state: {
                        from: props.location?.pathname || '/'
                    }
                });
            }
        }, [user, authChecked, navigate, props.location]);

        if (loading || !authChecked) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                    </div>
                </div>
            );
        }

        return user ? <Component {...props} /> : null;
    };
};

// Higher Order Component for admin routes
export const withAdmin = (Component) => {
    return function WithAdminComponent(props) {
        const { user, loading, authChecked, isAdmin } = useAuth();
        const navigate = useNavigate();

        useEffect(() => {
            if (authChecked) {
                if (!user) {
                    navigate('/login', {
                        state: {
                            from: props.location?.pathname || '/'
                        }
                    });
                } else if (!isAdmin()) {
                    navigate('/dashboard', {
                        state: {
                            error: 'Admin access required'
                        }
                    });
                }
            }
        }, [user, authChecked, isAdmin, navigate, props.location]);

        if (loading || !authChecked) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                    </div>
                </div>
            );
        }

        return user && isAdmin() ? <Component {...props} /> : null;
    };
};

export default AuthContext;