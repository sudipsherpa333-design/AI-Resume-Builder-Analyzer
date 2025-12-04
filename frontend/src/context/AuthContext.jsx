// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// API configuration - use environment variable or fallback
const API_BASE_URL = window.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create context
const AuthContext = createContext(null);

// Auth API service
const authService = {
    // Get token from localStorage
    getToken() {
        return localStorage.getItem('token');
    },

    // Set token
    setToken(token) {
        localStorage.setItem('token', token);
    },

    // Remove token
    removeToken() {
        localStorage.removeItem('token');
    },

    // Get user from localStorage
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Set user
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Remove user
    removeUser() {
        localStorage.removeItem('user');
    },

    // Clear all auth data
    clearAuth() {
        this.removeToken();
        this.removeUser();
    },

    // Login
    async login(credentials) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    },

    // Register
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Register API error:', error);
            throw error;
        }
    },

    // Get user profile
    async getProfile() {
        try {
            const token = this.getToken();
            if (!token) throw new Error('No token found');

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    },

    // Update profile
    async updateProfile(profileData) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update profile');
            }

            return await response.json();
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    },

    // Change password
    async changePassword(passwordData) {
        try {
            const token = this.getToken();
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(passwordData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to change password');
            }

            return await response.json();
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    },

    // Forgot password
    async forgotPassword(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to send reset email');
            }

            return await response.json();
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    },

    // Reset password
    async resetPassword(token, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, password })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to reset password');
            }

            return await response.json();
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    },

    // Demo login (special endpoint)
    async demoLogin() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/demo-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // If demo endpoint doesn't exist, create a demo user locally
                return this.createLocalDemoUser();
            }

            return await response.json();
        } catch (error) {
            console.error('Demo login error, falling back to local demo:', error);
            return this.createLocalDemoUser();
        }
    },

    // Create local demo user
    createLocalDemoUser() {
        const demoUser = {
            _id: `demo_${Date.now()}`,
            name: 'Demo User',
            email: 'demo@example.com',
            role: 'user',
            plan: 'premium',
            isDemo: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const mockToken = `demo_token_${Date.now()}`;

        this.setToken(mockToken);
        this.setUser(demoUser);

        return {
            success: true,
            data: {
                token: mockToken,
                user: demoUser
            }
        };
    },

    // Logout
    async logout() {
        try {
            const token = this.getToken();
            if (token && !this.getUser()?.isDemo) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.warn('Logout API call failed:', error);
        } finally {
            this.clearAuth();
        }
    }
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Main Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = authService.getToken();
                const storedUser = authService.getUser();

                console.log('Auth initialization:', { token: !!token, storedUser: !!storedUser });

                if (token && storedUser) {
                    // Check if it's a demo user
                    if (storedUser.isDemo) {
                        setUser(storedUser);
                        setIsAuthenticated(true);
                        console.log('✅ Demo user restored');
                    } else {
                        try {
                            // Validate token with backend
                            const profileResponse = await authService.getProfile();
                            if (profileResponse.success) {
                                setUser(profileResponse.data);
                                setIsAuthenticated(true);
                                authService.setUser(profileResponse.data);
                                console.log('✅ Authenticated user restored');
                            } else {
                                console.warn('❌ Token validation failed');
                                authService.clearAuth();
                                setIsAuthenticated(false);
                            }
                        } catch (profileError) {
                            console.warn('⚠️ Profile fetch failed, using stored user');
                            setUser(storedUser);
                            setIsAuthenticated(true);
                        }
                    }
                } else {
                    console.log('ℹ️ No stored auth data');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            console.log('Attempting login for:', email);

            let result;
            if (email === 'airesume100') {
                console.log('👮 Detected admin username');
                // Admin login logic
                result = await authService.login({ username: email, password });
            } else {
                result = await authService.login({ email, password });
            }

            if (result.success && result.data) {
                authService.setToken(result.data.token);
                authService.setUser(result.data.user);
                setUser(result.data.user);
                setIsAuthenticated(true);
                toast.success('Welcome back! 🎉');
                return { success: true, user: result.data.user };
            } else {
                toast.error(result.message || 'Login failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error.message || 'Network error during login';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            setIsLoading(true);
            const result = await authService.register(userData);

            if (result.success && result.data) {
                authService.setToken(result.data.token);
                authService.setUser(result.data.user);
                setUser(result.data.user);
                setIsAuthenticated(true);
                toast.success('Account created successfully! 🎉');
                return { success: true, user: result.data.user };
            } else {
                toast.error(result.message || 'Registration failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.message || 'Network error during registration';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Demo login
    const demoLogin = async () => {
        try {
            setIsLoading(true);
            console.log('🎬 Attempting demo login');

            const result = await authService.demoLogin();

            if (result.success && result.data) {
                setUser(result.data.user);
                setIsAuthenticated(true);
                toast.success('Welcome to Demo Mode! 🚀');
                return { success: true, user: result.data.user };
            } else {
                throw new Error(result.message || 'Demo login failed');
            }
        } catch (error) {
            console.error('Demo login error:', error);
            toast.error(error.message || 'Demo login failed');
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            setIsLoading(true);
            await authService.logout();
        } catch (error) {
            console.warn('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            toast.success('Logged out successfully! 👋');
            navigate('/login');
        }
    };

    // Update profile
    const updateProfile = async (profileData) => {
        try {
            setIsLoading(true);
            const result = await authService.updateProfile(profileData);

            if (result.success && result.data) {
                authService.setUser(result.data);
                setUser(result.data);
                toast.success('Profile updated successfully! ✅');
                return { success: true, user: result.data };
            } else {
                toast.error(result.message || 'Profile update failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Update profile error:', error);
            const errorMessage = error.message || 'Profile update failed';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Change password
    const changePassword = async (passwordData) => {
        try {
            setIsLoading(true);
            const result = await authService.changePassword(passwordData);

            if (result.success) {
                toast.success('Password changed successfully! ✅');
                return { success: true };
            } else {
                toast.error(result.message || 'Password change failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Change password error:', error);
            const errorMessage = error.message || 'Password change failed';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Forgot password
    const forgotPassword = async (email) => {
        try {
            setIsLoading(true);
            const result = await authService.forgotPassword(email);

            if (result.success) {
                toast.success('Password reset email sent! 📨');
                return { success: true };
            } else {
                toast.error(result.message || 'Failed to send reset email');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            const errorMessage = error.message || 'Failed to send reset email';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Reset password
    const resetPassword = async (token, password) => {
        try {
            setIsLoading(true);
            const result = await authService.resetPassword(token, password);

            if (result.success) {
                toast.success('Password reset successfully! ✅');
                return { success: true };
            } else {
                toast.error(result.message || 'Password reset failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('Reset password error:', error);
            const errorMessage = error.message || 'Password reset failed';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    // Refresh user data
    const refreshUser = async () => {
        try {
            // Skip refresh for demo users
            if (user?.isDemo) {
                return { success: true, user };
            }

            const result = await authService.getProfile();
            if (result.success && result.data) {
                authService.setUser(result.data);
                setUser(result.data);
                return { success: true, user: result.data };
            }
            return { success: false };
        } catch (error) {
            console.error('Refresh user error:', error);
            return { success: false };
        }
    };

    // Check if user has specific permission
    const hasPermission = (permission) => {
        if (!user) return false;

        // Admin has all permissions
        if (user.role === 'admin') return true;

        // Define permissions based on user plan
        const planPermissions = {
            free: ['create_resume', 'view_dashboard', 'basic_ai_analysis', 'export_pdf'],
            premium: ['create_resume', 'view_dashboard', 'advanced_ai_analysis', 'export_pdf', 'custom_templates', 'multiple_resumes'],
            enterprise: ['create_resume', 'view_dashboard', 'advanced_ai_analysis', 'export_pdf', 'custom_templates', 'multiple_resumes', 'team_collaboration', 'priority_support']
        };

        const userPlan = user.plan || 'free';
        return planPermissions[userPlan]?.includes(permission) || false;
    };

    // Context value
    const value = {
        user,
        isAuthenticated,
        isLoading,
        isAdmin: user?.role === 'admin',
        isDemo: user?.isDemo === true,
        token: authService.getToken(),
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        refreshUser,
        hasPermission,
        canExportPDF: hasPermission('export_pdf'),
        canUseCustomTemplates: hasPermission('custom_templates'),
        canUseAdvancedAI: hasPermission('advanced_ai_analysis'),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;