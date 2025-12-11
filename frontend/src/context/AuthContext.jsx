// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState(null);
    const [apiStatus, setApiStatus] = useState('local');

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (storedToken && storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    console.log('✅ User restored from localStorage');
                } else {
                    // Auto login as demo user
                    console.log('ℹ️ No stored auth, creating user');
                    const newUser = {
                        _id: `user_${Date.now()}`,
                        name: 'User',
                        email: 'user@example.com',
                        role: 'user',
                        isVerified: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };

                    const newToken = `token_${Date.now()}`;

                    localStorage.setItem('token', newToken);
                    localStorage.setItem('user', JSON.stringify(newUser));

                    setUser(newUser);
                    setToken(newToken);
                    setIsAuthenticated(true);

                    console.log('✅ New user created');
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

    // Helper function to clear auth
    const clearAuth = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
    };

    // Login function
    const login = async (email, password) => {
        try {
            setIsLoading(true);
            console.log('🔐 Attempting login for:', email);

            // Simple validation
            if (!email || !password) {
                toast.error('Please enter email and password');
                return { success: false, message: 'Missing credentials' };
            }

            const newUser = {
                _id: `user_${Date.now()}`,
                name: email.split('@')[0],
                email: email,
                role: 'user',
                isVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const newToken = `token_${Date.now()}`;

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            setUser(newUser);
            setToken(newToken);
            setIsAuthenticated(true);

            toast.success(`Welcome back! 🎉`);
            return { success: true, user: newUser };

        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed');
            return { success: false, message: 'Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            setIsLoading(true);

            // Simple validation
            if (!userData.email || !userData.password) {
                toast.error('Please enter email and password');
                return { success: false, message: 'Missing credentials' };
            }

            const newUser = {
                _id: `user_${Date.now()}`,
                name: userData.name || userData.email.split('@')[0],
                email: userData.email,
                role: 'user',
                isVerified: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const newToken = `token_${Date.now()}`;

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            setUser(newUser);
            setToken(newToken);
            setIsAuthenticated(true);

            toast.success('Account created successfully! 🎉');
            return { success: true, user: newUser };

        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Registration failed');
            return { success: false, message: 'Registration failed' };
        } finally {
            setIsLoading(false);
        }
    };

    // Logout function - REMOVED useNavigate dependency
    const logout = async () => {
        try {
            setIsLoading(true);
            clearAuth();
            toast.success('Logged out successfully! 👋');
            return { success: true };
        } catch (error) {
            console.warn('Logout error:', error);
            clearAuth();
            toast.success('Logged out successfully! 👋');
            return { success: true };
        } finally {
            setIsLoading(false);
        }
    };

    // Update profile
    const updateProfile = async (profileData) => {
        try {
            setIsLoading(true);

            const updatedUser = { ...user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            toast.success('Profile updated successfully! ✅');
            return { success: true, user: updatedUser };

        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Profile update failed');
            return { success: false, message: 'Profile update failed' };
        } finally {
            setIsLoading(false);
        }
    };

    // Context value
    const value = {
        // State
        user,
        token,
        isAuthenticated,
        isLoading,
        apiStatus,

        // User info
        isAdmin: user?.role === 'admin',
        userName: user?.name || user?.email?.split('@')[0] || 'User',

        // Auth methods
        login,
        register,
        logout,
        updateProfile,

        // Helper methods
        getToken: () => token || localStorage.getItem('token'),
        isLoggedIn: () => isAuthenticated && !!user,
        refreshUser: () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;