// frontend/src/admin/context/AdminContext.jsx - ADMIN DASHBOARD CONTEXT
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
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'react-hot-toast';

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

// Admin Provider
export const AdminProvider = ({ children }) => {
  const auth = useAdminAuth();

  // State
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [adminError, setAdminError] = useState(null);

  // Refs
  const mountedRef = useRef(true);
  const statsIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, []);

  // Initialize on auth change
  useEffect(() => {
    if (auth.loading) {
      setIsAdminLoading(true);
    } else {
      setIsAdminLoading(false);
    }
  }, [auth.loading]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async (options = {}) => {
    try {
      if (!auth.isAuthenticated) {
        return null;
      }

      const response = await auth.adminAxios.get('/dashboard/stats', {
        params: {
          range: options.range || '7d'
        }
      });

      if (response.data.success && mountedRef.current) {
        setDashboardStats(response.data.data);
        setAdminError(null);
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      if (mountedRef.current) {
        setAdminError(error.message);
      }
      return null;
    }
  }, [auth]);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async (options = {}) => {
    try {
      if (!auth.isAuthenticated) {
        return null;
      }

      const response = await auth.adminAxios.get('/dashboard/recent-activity', {
        params: {
          limit: options.limit || 10,
          page: options.page || 1
        }
      });

      if (response.data.success && mountedRef.current) {
        setRecentActivity(response.data.data || []);
        setAdminError(null);
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      if (mountedRef.current) {
        setAdminError(error.message);
      }
      return null;
    }
  }, [auth]);

  // Fetch users
  const fetchUsers = useCallback(async (options = {}) => {
    try {
      if (!auth.isAuthenticated) {
        return null;
      }

      const response = await auth.adminAxios.get('/users', {
        params: {
          limit: options.limit || 10,
          page: options.page || 1,
          search: options.search || undefined
        }
      });

      if (response.data.success && mountedRef.current) {
        setUsers(response.data.data?.users || []);
        setAdminError(null);
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      if (mountedRef.current) {
        setAdminError(error.message);
      }
      return null;
    }
  }, [auth]);

  // Fetch templates
  const fetchTemplates = useCallback(async (options = {}) => {
    try {
      if (!auth.isAuthenticated) {
        return null;
      }

      const response = await auth.adminAxios.get('/templates', {
        params: {
          limit: options.limit || 10,
          page: options.page || 1
        }
      });

      if (response.data.success && mountedRef.current) {
        setTemplates(response.data.data?.templates || []);
        setAdminError(null);
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      if (mountedRef.current) {
        setAdminError(error.message);
      }
      return null;
    }
  }, [auth]);

  // Fetch resumes
  const fetchResumes = useCallback(async (options = {}) => {
    try {
      if (!auth.isAuthenticated) {
        return null;
      }

      const response = await auth.adminAxios.get('/resumes', {
        params: {
          limit: options.limit || 10,
          page: options.page || 1,
          status: options.status || undefined
        }
      });

      if (response.data.success && mountedRef.current) {
        setResumes(response.data.data?.resumes || []);
        setAdminError(null);
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      if (mountedRef.current) {
        setAdminError(error.message);
      }
      return null;
    }
  }, [auth]);

  // Clear error
  const clearError = useCallback(() => {
    setAdminError(null);
  }, []);

  const value = {
    // Auth state from AdminAuthContext
    admin: auth.admin,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    hasPermission: auth.hasPermission,

    // Admin-specific state
    isAdminLoading,
    adminError,
    dashboardStats,
    recentActivity,
    users,
    templates,
    resumes,

    // Admin-specific methods
    fetchDashboardStats,
    fetchRecentActivity,
    fetchUsers,
    fetchTemplates,
    fetchResumes,
    clearError,

    // Helper
    adminAxios: auth.adminAxios
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

