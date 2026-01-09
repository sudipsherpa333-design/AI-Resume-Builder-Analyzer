// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export const useAuth = (options = {}) => {
  const {
    persistSession = true,
    sessionKey = 'resumecraft_auth',
    redirectOnLogin = '/dashboard',
    redirectOnLogout = '/login',
    showNotifications = true
  } = options;

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // Initialize auth from storage
  useEffect(() => {
    console.log('🔐 [useAuth] Initializing authentication');

    if (persistSession) {
      const storedAuth = localStorage.getItem(sessionKey);
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          if (authData.user && authData.token) {
            setUser(authData.user);
            setToken(authData.token);
            setIsAuthenticated(true);
            setPermissions(authData.permissions || []);

            console.log('✅ [useAuth] Restored session for:', authData.user.email);
          }
        } catch (error) {
          console.error('❌ [useAuth] Failed to parse stored auth:', error);
          clearStoredAuth();
        }
      }
    }

    setIsLoading(false);
  }, [persistSession, sessionKey]);

  // Login function
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    console.log('🔐 [useAuth] Attempting login:', credentials.email);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock response - in real app, this would be from your API
      const mockUser = {
        id: 'user_' + Date.now(),
        email: credentials.email,
        name: credentials.email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
        credits: 150,
        plan: 'free'
      };

      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockPermissions = ['create_resume', 'edit_resume', 'export_pdf'];

      setUser(mockUser);
      setToken(mockToken);
      setIsAuthenticated(true);
      setPermissions(mockPermissions);

      // Store in localStorage if persistence is enabled
      if (persistSession) {
        const authData = {
          user: mockUser,
          token: mockToken,
          permissions: mockPermissions,
          timestamp: Date.now()
        };
        localStorage.setItem(sessionKey, JSON.stringify(authData));
      }

      if (showNotifications) {
        toast.success('Login successful!');
      }

      console.log('✅ [useAuth] Login successful:', mockUser.email);

      // Redirect
      if (redirectOnLogin) {
        navigate(redirectOnLogin);
      }

      return { success: true, user: mockUser };

    } catch (error) {
      console.error('❌ [useAuth] Login failed:', error);

      if (showNotifications) {
        toast.error('Login failed. Please check your credentials.');
      }

      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [persistSession, sessionKey, redirectOnLogin, navigate, showNotifications]);

  // Logout function
  const logout = useCallback(() => {
    console.log('🔐 [useAuth] Logging out');

    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setPermissions([]);

    // Clear storage
    clearStoredAuth();

    if (showNotifications) {
      toast.success('Logged out successfully');
    }

    console.log('✅ [useAuth] Logout successful');

    // Redirect
    if (redirectOnLogout) {
      navigate(redirectOnLogout);
    }

    return { success: true };
  }, [redirectOnLogout, navigate, showNotifications, sessionKey]);

  // Register function
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    console.log('🔐 [useAuth] Attempting registration:', userData.email);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock response
      const mockUser = {
        id: 'user_' + Date.now(),
        email: userData.email,
        name: userData.name || userData.email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString(),
        credits: 100, // Bonus credits for registration
        plan: 'free'
      };

      const mockToken = 'mock_jwt_token_' + Date.now();
      const mockPermissions = ['create_resume', 'edit_resume'];

      setUser(mockUser);
      setToken(mockToken);
      setIsAuthenticated(true);
      setPermissions(mockPermissions);

      if (persistSession) {
        const authData = {
          user: mockUser,
          token: mockToken,
          permissions: mockPermissions,
          timestamp: Date.now()
        };
        localStorage.setItem(sessionKey, JSON.stringify(authData));
      }

      if (showNotifications) {
        toast.success('Registration successful! Welcome!');
      }

      console.log('✅ [useAuth] Registration successful:', mockUser.email);

      if (redirectOnLogin) {
        navigate(redirectOnLogin);
      }

      return { success: true, user: mockUser };

    } catch (error) {
      console.error('❌ [useAuth] Registration failed:', error);

      if (showNotifications) {
        toast.error('Registration failed. Please try again.');
      }

      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [persistSession, sessionKey, redirectOnLogin, navigate, showNotifications]);

  // Check if user has permission
  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  // Check if user has any of the given permissions
  const hasAnyPermission = useCallback((permissionList) => {
    return permissionList.some(permission => permissions.includes(permission));
  }, [permissions]);

  // Check if user has all given permissions
  const hasAllPermissions = useCallback((permissionList) => {
    return permissionList.every(permission => permissions.includes(permission));
  }, [permissions]);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    if (!user) {
      console.warn('⚠️ [useAuth] Cannot update profile: No user logged in');
      return { success: false, error: 'No user logged in' };
    }

    console.log('🔐 [useAuth] Updating profile');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
      setUser(updatedUser);

      // Update storage if persistence is enabled
      if (persistSession) {
        const storedAuth = localStorage.getItem(sessionKey);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          authData.user = updatedUser;
          localStorage.setItem(sessionKey, JSON.stringify(authData));
        }
      }

      if (showNotifications) {
        toast.success('Profile updated successfully');
      }

      console.log('✅ [useAuth] Profile updated');
      return { success: true, user: updatedUser };

    } catch (error) {
      console.error('❌ [useAuth] Profile update failed:', error);

      if (showNotifications) {
        toast.error('Failed to update profile');
      }

      return { success: false, error: error.message };
    }
  }, [user, persistSession, sessionKey, showNotifications]);

  // Clear stored authentication
  const clearStoredAuth = useCallback(() => {
    localStorage.removeItem(sessionKey);
    console.log('🧹 [useAuth] Cleared stored authentication');
  }, [sessionKey]);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    if (!token || !user) {
      return false;
    }

    // In a real app, you would validate the token with your backend
    console.log('🔐 [useAuth] Checking authentication status');
    return isAuthenticated;
  }, [token, user, isAuthenticated]);

  // Refresh token (simulated)
  const refreshToken = useCallback(async () => {
    if (!token) {
      console.warn('⚠️ [useAuth] Cannot refresh: No token');
      return false;
    }

    console.log('🔐 [useAuth] Refreshing token');

    try {
      // Simulate token refresh
      await new Promise(resolve => setTimeout(resolve, 500));

      const newToken = 'refreshed_token_' + Date.now();
      setToken(newToken);

      if (persistSession) {
        const storedAuth = localStorage.getItem(sessionKey);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          authData.token = newToken;
          localStorage.setItem(sessionKey, JSON.stringify(authData));
        }
      }

      console.log('✅ [useAuth] Token refreshed');
      return true;

    } catch (error) {
      console.error('❌ [useAuth] Token refresh failed:', error);
      return false;
    }
  }, [token, persistSession, sessionKey]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    token,
    permissions,

    // Actions
    login,
    logout,
    register,
    updateProfile,
    checkAuth,
    refreshToken,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Utility
    isAdmin: user?.role === 'admin',
    isPremium: user?.plan === 'premium',
    isGuest: !isAuthenticated,

    // Helper
    clearStoredAuth
  };
};

export default useAuth;