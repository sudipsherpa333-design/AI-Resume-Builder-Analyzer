// context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../api/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Check auth status on mount
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                setIsLoading(true);
                const token = authService.getToken();
                const storedUser = authService.getUser();

                console.log('🔍 Checking auth status...', {
                    hasToken: !!token,
                    hasStoredUser: !!storedUser
                });

                if (token && storedUser) {
                    // Verify token is still valid by making a profile request
                    try {
                        const profileResponse = await authService.getProfile();
                        if (profileResponse.success) {
                            setUser(profileResponse.data.user);
                            setIsAuthenticated(true);
                            console.log('✅ Auth restored from localStorage:', storedUser.email);
                        } else {
                            // Token is invalid, clear auth
                            console.warn('❌ Token invalid, clearing auth');
                            authService.clearAuth();
                            setIsAuthenticated(false);
                        }
                    } catch (profileError) {
                        console.warn('❌ Profile fetch failed, clearing auth:', profileError);
                        authService.clearAuth();
                        setIsAuthenticated(false);
                    }
                } else {
                    console.log('ℹ️ No auth state — user is unauthenticated');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('⚠️ Auth status check error:', error);
                authService.clearAuth();
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (email, password) => {
        try {
            setIsLoading(true);
            console.log('🔐 Attempting login for:', email);

            let result;
            
            // Check for specific admin username
            if (email === 'airesume100') {
                console.log('👮 Detected admin username, attempting admin login...');
                result = await authService.adminLogin({ username: email, password });
            } else {
                result = await authService.login({ email, password });
            }
            
            console.log('📨 Login response:', result);

            if (result.success) {
                const currentUser = authService.getUser();
                setUser(currentUser);
                setIsAuthenticated(true);
                toast.success('Welcome back! 🎉');
                return { success: true, user: currentUser };
            } else {
                toast.error(result.message || 'Login failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            const errorMessage = error.response?.data?.message || 'Network error during login';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setIsLoading(true);
            console.log('📝 Attempting registration for:', userData.email);

            const result = await authService.register(userData);
            console.log('📨 Registration response:', result);

            if (result.success) {
                // If the backend returned a token/user, restore auth state
                const currentUser = authService.getUser();
                if (currentUser) {
                    setUser(currentUser);
                    setIsAuthenticated(true);
                }

                toast.success('Account created successfully! 🎉');
                return { success: true, message: result.message };
            } else {
                toast.error(result.message || 'Registration failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            const errorMessage = error.response?.data?.message || 'Network error during registration';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const socialLogin = async (provider, socialData) => {
        try {
            setIsLoading(true);
            console.log(`🔐 Attempting ${provider} login`);

            let result;

            if (provider === 'google') {
                result = await authService.googleLogin(socialData);
            } else if (provider === 'facebook') {
                result = await authService.facebookLogin(socialData);
            } else {
                throw new Error(`Unsupported provider: ${provider}`);
            }

            console.log(`📨 ${provider} login response:`, result);

            if (result.success) {
                const currentUser = authService.getUser();
                setUser(currentUser);
                setIsAuthenticated(true);
                toast.success(`Welcome with ${provider}! 🎉`);
                return { success: true, user: currentUser };
            } else {
                toast.error(result.message || `${provider} login failed`);
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error(`❌ ${provider} login error:`, error);
            const errorMessage = error.response?.data?.message || `Network error during ${provider} login`;
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const demoLogin = async () => {
        try {
            setIsLoading(true);
            console.log('🎬 Attempting demo login');

            const result = await authService.demoLogin();
            console.log('📨 Demo login response:', result);

            if (result.success) {
                const currentUser = authService.getUser();
                setUser(currentUser);
                setIsAuthenticated(true);
                toast.success('Welcome to Demo Mode! 🚀');
                return { success: true, user: currentUser };
            } else {
                toast.error(result.message || 'Demo login failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('❌ Demo login error:', error);
            const errorMessage = error.response?.data?.message || 'Network error during demo login';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            console.log('🚪 Attempting logout');

            // Call backend logout if authenticated
            if (isAuthenticated) {
                await authService.logout();
            }
        } catch (error) {
            console.warn('⚠️ Logout backend call failed; clearing local state.');
        } finally {
            // Always clear local state
            authService.clearAuth();
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);

            toast.success('Logged out successfully. See you soon! 👋');

            // Redirect to home
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 500);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setIsLoading(true);
            console.log('📋 Attempting profile update');

            const result = await authService.updateProfile(profileData);
            console.log('📨 Profile update response:', result);

            if (result.success && result.data?.user) {
                authService.setUser(result.data.user);
                setUser(result.data.user);
                toast.success('Profile updated successfully! ✅');
                return { success: true, user: result.data.user };
            } else {
                toast.error(result.message || 'Profile update failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('❌ Update profile error:', error);
            const errorMessage = error.response?.data?.message || 'Network error during profile update';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const changePassword = async (passwordData) => {
        try {
            setIsLoading(true);
            console.log('🔑 Attempting password change');

            const result = await authService.changePassword(passwordData);
            console.log('📨 Password change response:', result);

            if (result.success) {
                toast.success('Password changed successfully! ✅');
                return { success: true };
            } else {
                toast.error(result.message || 'Password change failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('❌ Change password error:', error);
            const errorMessage = error.response?.data?.message || 'Network error during password change';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const forgotPassword = async (email) => {
        try {
            setIsLoading(true);
            console.log('📧 Attempting password reset for:', email);

            const result = await authService.forgotPassword(email);
            console.log('📨 Forgot password response:', result);

            if (result.success) {
                toast.success('Password reset email sent! 📨');
                return { success: true };
            } else {
                toast.error(result.message || 'Failed to send reset email');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('❌ Forgot password error:', error);
            const errorMessage = error.response?.data?.message || 'Network error during password reset';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (token, password) => {
        try {
            setIsLoading(true);
            console.log('🔄 Attempting password reset');

            const result = await authService.resetPassword(token, password);
            console.log('📨 Reset password response:', result);

            if (result.success) {
                toast.success('Password reset successfully! ✅');
                return { success: true };
            } else {
                toast.error(result.message || 'Password reset failed');
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error('❌ Reset password error:', error);
            const errorMessage = error.response?.data?.message || 'Network error during password reset';
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            console.log('🔄 Refreshing user data');
            const profileResponse = await authService.getProfile();
            if (profileResponse.success) {
                authService.setUser(profileResponse.data.user);
                setUser(profileResponse.data.user);
                return { success: true, user: profileResponse.data.user };
            }
            return { success: false };
        } catch (error) {
            console.error('❌ Refresh user error:', error);
            return { success: false };
        }
    };

    const value = {
        user,
        isAdmin: user?.role === 'admin',
        isAuthenticated,
        isLoading,
        login,
        register,
        socialLogin,
        demoLogin,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};