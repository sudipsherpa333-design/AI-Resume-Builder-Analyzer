// src/context/AuthContext.jsx - UPDATED WITH GOOGLE OAUTH
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Import our unified API service
import apiService from '../services/api';

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

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user_data',
  REMEMBER_ME: 'remember_me',
  GOOGLE_STATE: 'google_auth_state',
  REDIRECT_PATH: 'auth_redirect'
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load user from storage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔍 [AuthContext] Initializing authentication...');

        // Check if we have stored auth data
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

        console.log('📦 [AuthContext] Storage check:', {
          hasUser: !!storedUser,
          hasToken: !!storedToken
        });

        if (storedUser && storedToken) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('👤 [AuthContext] Found stored user:', {
              id: parsedUser._id,
              email: parsedUser.email,
              name: parsedUser.name
            });

            // ✅ Set apiService token
            apiService.setAuthToken(storedToken);

            // Set user immediately for better UX
            setUser(parsedUser);

            // Verify token with backend (silently)
            try {
              await apiService.get('/api/auth/verify');
              console.log('✅ [AuthContext] Token is valid');
            } catch (verifyError) {
              console.warn('⚠️ [AuthContext] Token verification failed:', verifyError.message);
              // Token is invalid, clear storage
              localStorage.removeItem(STORAGE_KEYS.TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER);
              apiService.setAuthToken(null);
              setUser(null);
            }
          } catch (parseError) {
            console.error('❌ [AuthContext] Failed to parse stored user:', parseError);
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            apiService.setAuthToken(null);
          }
        } else {
          console.log('👤 [AuthContext] No stored auth data found');
        }

        setError(null);
      } catch (error) {
        console.error('❌ [AuthContext] Initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setIsInitializing(false);
        setIsLoading(false);
        console.log('✅ [AuthContext] Initialization complete');
      }
    };

    initAuth();
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userData = urlParams.get('user');
      const error = urlParams.get('error');
      const state = urlParams.get('state');
      const storedState = localStorage.getItem(STORAGE_KEYS.GOOGLE_STATE);
      const redirectPath = localStorage.getItem(STORAGE_KEYS.REDIRECT_PATH) || '/dashboard';

      console.log('🔄 [AuthContext] Handling OAuth callback:', { hasToken: !!token, error, state });

      // Clean up
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_STATE);
      localStorage.removeItem(STORAGE_KEYS.REDIRECT_PATH);

      if (error) {
        throw new Error(`OAuth error: ${decodeURIComponent(error)}`);
      }

      if (state && storedState && state !== storedState) {
        throw new Error('Invalid state parameter. Possible security issue.');
      }

      if (token && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));

          // Store auth data
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          apiService.setAuthToken(token);

          setUser(user);

          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);

          // Navigate to original path or dashboard
          navigate(redirectPath);
          toast.success('Successfully logged in with Google!');

          return { success: true, user, token };

        } catch (parseError) {
          console.error('❌ [AuthContext] Failed to parse user data:', parseError);
          throw new Error('Failed to complete authentication');
        }
      } else {
        throw new Error('No authentication data received');
      }
    } catch (error) {
      console.error('❌ [AuthContext] OAuth callback error:', error);
      toast.error(`Authentication failed: ${error.message}`);
      navigate('/login');
      return { success: false, error: error.message };
    }
  }, [navigate]);

  // Google OAuth login
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔑 [AuthContext] Starting Google OAuth...');

      // Generate state for security
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(STORAGE_KEYS.GOOGLE_STATE, state);

      // Store current path for redirect after login
      localStorage.setItem(STORAGE_KEYS.REDIRECT_PATH, window.location.pathname);

      // Get backend URL from apiService
      const backendUrl = apiService.baseURL;

      // Redirect to Google OAuth
      const authUrl = `${backendUrl}/auth/google?state=${state}&redirect_uri=${encodeURIComponent(window.location.origin)}`;

      console.log('📍 [AuthContext] Redirecting to:', authUrl);

      // Open in new window for popup flow
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        authUrl,
        'Google Login',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        // If popup blocked, use redirect flow
        console.log('⚠️ [AuthContext] Popup blocked, using redirect...');
        window.location.href = authUrl;
        return;
      }

      // Listen for popup completion
      return new Promise((resolve, reject) => {
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkPopup);

            // Check if we have auth data from redirect flow
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            const user = localStorage.getItem(STORAGE_KEYS.USER);

            if (token && user) {
              // Already logged in via redirect
              resolve({ success: true, token, user: JSON.parse(user) });
            } else {
              reject(new Error('Login cancelled or popup closed'));
            }
          }
        }, 500);

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkPopup);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Login timeout'));
        }, 120000);
      });

    } catch (error) {
      console.error('❌ [AuthContext] Google OAuth error:', error);

      // Handle specific error types
      if (error.message.includes('popup_closed_by_user')) {
        toast.error('Login cancelled');
      } else if (error.message.includes('access_denied')) {
        toast.error('Access denied by Google');
      } else if (error.message.includes('idpiframe_initialization_failed')) {
        toast.error('Please enable third-party cookies');
      } else {
        toast.error('Google login failed. Please try again.');
      }

      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Regular login
  const login = useCallback(async (email, password, rememberMe = false, navigateCallback) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 [AuthContext] Login attempt:', { email });

      // Validation
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Use apiService for login
      const result = await apiService.auth.login(email, password);

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      console.log('✅ [AuthContext] Login successful:', {
        userId: result.user._id,
        email: result.user.email
      });

      // Store token + user
      localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));
      apiService.setAuthToken(result.token);

      // Update state
      setUser(result.user);
      setError(null);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
      }

      toast.success('Login successful!');

      // Determine where to navigate
      const nav = navigateCallback || navigate;
      if (nav && typeof nav === 'function') {
        const redirectPath = localStorage.getItem(STORAGE_KEYS.REDIRECT_PATH) || '/dashboard';
        localStorage.removeItem(STORAGE_KEYS.REDIRECT_PATH);

        console.log('📍 [AuthContext] Navigating to:', redirectPath);

        setTimeout(() => {
          nav(redirectPath, { replace: true });
        }, 500);
      }

      return {
        success: true,
        user: result.user,
        token: result.token
      };

    } catch (error) {
      console.error('❌ [AuthContext] Login error:', error);

      let errorMessage = 'Login failed';
      if (error.response?.data) {
        const apiError = error.response.data;
        errorMessage = apiError.error || apiError.message || error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      if (!errorMessage.includes('Please enter')) {
        toast.error(errorMessage, { duration: 5000 });
      }

      return {
        success: false,
        error: errorMessage,
        details: error.response?.data
      };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  // Registration - FIXED
  const register = useCallback(async (name, email, password, confirmPassword, navigateCallback) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📝 [AuthContext] Registration attempt:', { name, email });

      // Validation
      const errors = [];

      if (!name?.trim()) {
        errors.push('Name is required');
      }

      if (!email || !email.includes('@')) {
        errors.push('Valid email is required');
      }

      if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }

      if (password !== confirmPassword) {
        errors.push('Passwords do not match');
      }

      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // ✅ FIXED: Use auth.register instead of direct post
      const result = await apiService.auth.register({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password,
        confirmPassword
      });

      if (!result?.success) {
        throw new Error(result?.error || result?.message || 'Registration failed');
      }

      console.log('✅ [AuthContext] Registration successful:', result.user?.email);

      // Store token + user
      localStorage.setItem(STORAGE_KEYS.TOKEN, result.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user || result));
      apiService.setAuthToken(result.token);

      // Update state
      setUser(result.user || result);
      setError(null);

      toast.success('🎉 Account created successfully!');

      // Navigate to dashboard
      const nav = navigateCallback || navigate;
      if (nav && typeof nav === 'function') {
        setTimeout(() => {
          nav('/dashboard', { replace: true });
        }, 1500);
      }

      return {
        success: true,
        user: result.user || result,
        token: result.token
      };

    } catch (error) {
      console.error('❌ [AuthContext] Registration error:', error);

      // Extract error message safely
      let errorMessage = 'Registration failed. Please try again.';

      if (error.response?.data) {
        const apiError = error.response.data;
        errorMessage = apiError.error || apiError.message || error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      // Show toast only for specific errors
      if (!errorMessage.includes('required') && !errorMessage.includes('match')) {
        toast.error(errorMessage, { duration: 5000 });
      }

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  // Logout
  const logout = useCallback((navigateCallback) => {
    console.log('👋 [AuthContext] Logging out...');

    // Call API logout
    apiService.auth.logout();
    apiService.setAuthToken(null);

    // Complete storage cleanup
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    localStorage.removeItem(STORAGE_KEYS.GOOGLE_STATE);
    localStorage.removeItem(STORAGE_KEYS.REDIRECT_PATH);

    // Update state
    setUser(null);
    setError(null);

    console.log('✅ [AuthContext] Logout complete');

    // Navigate to home
    const nav = navigateCallback || navigate;
    if (nav && typeof nav === 'function') {
      nav('/', { replace: true });
    }
  }, [navigate]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get user ID
  const getUserId = useCallback(() => {
    return user?._id || user?.id || null;
  }, [user]);

  // Get token from localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }, []);

  // Update user profile
  const updateUser = useCallback(async (updatedData) => {
    try {
      console.log('📝 [AuthContext] Updating user profile...');

      const result = await apiService.auth.updateProfile(updatedData);

      if (result?.success) {
        const updatedUser = {
          ...user,
          ...updatedData,
          ...(result.user || result.data || {})
        };

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        setUser(updatedUser);

        console.log('✅ [AuthContext] User profile updated');
        return updatedUser;
      }

      throw new Error('Failed to update profile');
    } catch (error) {
      console.error('❌ [AuthContext] Update user error:', error);
      throw error;
    }
  }, [user]);

  // Verify token with backend
  const verifyToken = useCallback(async () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (!token) return false;

      // ✅ FIXED: Use correct endpoint
      await apiService.get('/api/auth/verify');
      return true;
    } catch (error) {
      console.warn('⚠️ [AuthContext] Token verification failed:', error.message);
      return false;
    }
  }, []);


  // Set redirect path
  const setRedirectPath = useCallback((path) => {
    localStorage.setItem(STORAGE_KEYS.REDIRECT_PATH, path);
  }, []);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => {
    const hasToken = !!localStorage.getItem(STORAGE_KEYS.TOKEN);
    const hasUser = !!localStorage.getItem(STORAGE_KEYS.USER);
    return !!(user && hasToken && hasUser);
  }, [user]);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return user?.role === 'admin' || user?.role === 'super_admin';
  }, [user]);

  // Check if user is verified
  const isVerified = useMemo(() => {
    return user?.isVerified || user?.emailVerified || false;
  }, [user]);

  // Context value
  const value = useMemo(() => ({
    // State
    user,
    isLoading,
    error,
    isInitializing,

    // Status
    isAuthenticated,
    isAdmin,
    isVerified,

    // Data
    token: getToken(),
    userId: getUserId(),

    // Actions
    login,
    register,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    clearError,
    updateUser,
    verifyToken,
    setRedirectPath,

    // Utility
    getToken,
    getUserId
  }), [
    user, isLoading, error, isInitializing,
    isAuthenticated, isAdmin, isVerified,
    getToken, getUserId,
    login, register, loginWithGoogle, handleOAuthCallback, logout, clearError,
    updateUser, verifyToken, setRedirectPath
  ]);

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">
            Initializing authentication...
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Checking your session...
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