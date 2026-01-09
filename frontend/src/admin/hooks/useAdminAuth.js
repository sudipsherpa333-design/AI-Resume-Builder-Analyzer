// frontend/src/admin/hooks/useAdminAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import adminApi from '../services/adminApi.js';

// Create context
const AdminAuthContext = createContext(null);

// This hook doesn't need JSX, so we'll just export the hooks
// and let the component handle the Provider

export const useAdminAuth = () => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const navigate = useNavigate();
    const location = useLocation();

    // Check if admin is authenticated
    const checkAuth = async () => {
        const storedToken = localStorage.getItem('adminToken');

        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            // Verify token with backend
            const response = await adminApi.get('/admin/verify');
            setAdmin(response.data.admin);
            setToken(storedToken);
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            const response = await adminApi.post('/admin/login', { email, password });
            const { token, admin } = response.data;

            localStorage.setItem('adminToken', token);
            setToken(token);
            setAdmin(admin);

            return { success: true, admin };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setAdmin(null);
        navigate('/admin/login');
    };

    // Update admin profile
    const updateProfile = async (data) => {
        try {
            const response = await adminApi.put('/admin/profile', data);
            setAdmin(response.data.admin);
            return { success: true, admin: response.data.admin };
        } catch (error) {
            console.error('Update failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Update failed'
            };
        }
    };

    // Change password
    const changePassword = async (currentPassword, newPassword) => {
        try {
            await adminApi.put('/admin/change-password', {
                currentPassword,
                newPassword
            });
            return { success: true };
        } catch (error) {
            console.error('Password change failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Password change failed'
            };
        }
    };

    // Initialize auth check
    useEffect(() => {
        checkAuth();
    }, []);

    // Protected route check
    useEffect(() => {
        if (!loading && !admin && location.pathname.startsWith('/admin') && location.pathname !== '/admin/login') {
            navigate('/admin/login');
        }
    }, [admin, loading, location, navigate]);

    return {
        admin,
        token,
        loading,
        login,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!admin
    };
};

// For backward compatibility
export const useAdmin = useAdminAuth;