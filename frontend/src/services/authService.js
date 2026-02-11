import api from './axiosConfig';

// Enable mock for immediate testing - DISABLED FOR REAL LOGIN
// Set to false to use real API calls with backend
const useMock = false;

// Enhanced debugging utility
const debug = {
  log: (endpoint, data, type = 'request') => {
    console.group(`🔍 API ${type.toUpperCase()}`);
    console.log(`📍 Endpoint: ${endpoint}`);
    console.log('📦 Data:', type === 'request' ? { ...data, password: data.password ? '[HIDDEN]' : undefined } : data);
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    console.groupEnd();
  },
  error: (endpoint, error, context) => {
    console.group(`❌ API ERROR: ${context}`);
    console.log(`📍 Endpoint: ${endpoint}`);
    console.log('💥 Error:', error);
    console.log('📊 Response:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    console.log(`⏰ Time: ${new Date().toISOString()}`);
    console.groupEnd();
  }
};

// Mock API responses for immediate testing
const mockResponses = {
  register: (userData) => ({
    success: true,
    data: {
      message: 'User registered successfully!',
      user: {
        id: 'mock-user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: 'user',
        isVerified: false,
        createdAt: new Date().toISOString()
      },
      token: 'mock-jwt-token-' + Date.now()
    },
    message: 'Account created successfully! Welcome! 🎉'
  }),

  login: (credentials) => ({
    success: true,
    data: {
      message: 'Login successful!',
      user: {
        id: 'mock-user-123',
        name: 'Demo User',
        email: credentials.email,
        role: 'user',
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      token: 'mock-jwt-token-' + Date.now()
    },
    message: 'Login successful! Welcome back! 🎉'
  }),

  demoLogin: () => ({
    success: true,
    data: {
      message: 'Demo login successful!',
      user: {
        id: 'demo-user-123',
        name: 'Demo User',
        email: 'demo@resumebuilder.com',
        role: 'user',
        isVerified: true,
        createdAt: new Date().toISOString()
      },
      token: 'demo-jwt-token-' + Date.now()
    },
    message: 'Welcome to Demo Mode! 🚀'
  }),

  googleLogin: (socialData) => ({
    success: true,
    data: {
      message: 'Google authentication successful!',
      user: {
        id: 'google-user-' + Date.now(),
        name: 'Google User',
        email: 'google-user@example.com',
        role: 'user',
        isVerified: true,
        provider: 'google',
        createdAt: new Date().toISOString()
      },
      token: 'google-jwt-token-' + Date.now()
    },
    message: 'Google authentication successful! 🎉'
  }),

  facebookLogin: (socialData) => ({
    success: true,
    data: {
      message: 'Facebook authentication successful!',
      user: {
        id: 'facebook-user-' + Date.now(),
        name: 'Facebook User',
        email: 'facebook-user@example.com',
        role: 'user',
        isVerified: true,
        provider: 'facebook',
        createdAt: new Date().toISOString()
      },
      token: 'facebook-jwt-token-' + Date.now()
    },
    message: 'Facebook authentication successful! 🎉'
  }),

  getProfile: () => ({
    success: true,
    data: {
      user: {
        id: 'mock-user-123',
        name: 'Demo User',
        email: 'demo@resumebuilder.com',
        role: 'user',
        isVerified: true,
        createdAt: new Date().toISOString(),
        profileCompleted: true
      }
    },
    message: 'Profile loaded successfully'
  }),

  updateProfile: (profileData) => ({
    success: true,
    data: {
      user: {
        id: 'mock-user-123',
        name: profileData.name || 'Demo User',
        email: 'demo@resumebuilder.com',
        role: 'user',
        isVerified: true,
        ...profileData
      }
    },
    message: 'Profile updated successfully'
  })
};

// This service handles all authentication-related API calls and local storage management
const authService = {
  // --- Token and Local Storage Management ---

  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isDemoMode: () => {
    return useMock;
  },

  // --- API Calls with Enhanced Error Handling ---

  // User Registration
  register: async (userData) => {
    const endpoint = '/auth/register';

    try {
      debug.log(endpoint, userData, 'request');

      if (useMock) {
        console.log('🔄 Using mock registration');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResult = mockResponses.register(userData);
        authService.setToken(mockResult.data.token);
        authService.setUser(mockResult.data.user);
        return mockResult;
      }

      const response = await api.post(endpoint, userData);
      debug.log(endpoint, response.data, 'response');

      if (response.data && (response.data.token || response.data.data?.token)) {
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;

        if (token) {
          authService.setToken(token);
        }
        if (user) {
          authService.setUser(user);
        }

        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Registration successful!'
        };
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      debug.error(endpoint, error, 'REGISTRATION');

      if ((error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') && !useMock) {
        return {
          success: false,
          message: 'Server is busy or cannot be reached. Please try again in a moment.',
          error: error.message,
          code: error.code
        };
      }

      let userMessage = 'Registration failed';

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        if ([429, 502, 503, 504].includes(status)) {
          userMessage = serverMessage || 'Server is temporarily unavailable. Please try again shortly.';
        } else {
          switch (status) {
          case 400:
            userMessage = serverMessage || 'Invalid registration data. Please check your information.';
            break;
          case 409:
            userMessage = serverMessage || 'An account with this email already exists.';
            break;
          case 422:
            userMessage = serverMessage || 'Validation failed. Please check your input.';
            break;
          case 500:
            userMessage = 'Server error. Please try again later.';
            break;
          default:
            userMessage = serverMessage || `Registration failed (${status})`;
          }
        }
      } else if (error.request && !useMock) {
        userMessage = 'Server is busy or cannot be reached. Please try again in a moment.';
      } else {
        userMessage = error.message || 'An unexpected error occurred.';
      }

      return {
        success: false,
        message: userMessage,
        error: error.response?.data,
        status: error.response?.status,
        code: error.code
      };
    }
  },

  // User Login
  login: async (credentials) => {
    const endpoint = '/auth/login';

    try {
      debug.log(endpoint, credentials, 'request');

      if (useMock) {
        console.log('🔄 Using mock login');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResult = mockResponses.login(credentials);
        authService.setToken(mockResult.data.token);
        authService.setUser(mockResult.data.user);
        return mockResult;
      }

      const response = await api.post(endpoint, credentials);
      debug.log(endpoint, response.data, 'response');

      if (response.data && (response.data.token || response.data.data?.token)) {
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;

        if (token) {
          authService.setToken(token);
        }
        if (user) {
          authService.setUser(user);
        }

        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Login successful!'
        };
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      debug.error(endpoint, error, 'LOGIN');

      if (error.code === 'ERR_NETWORK' && !useMock) {
        return {
          success: false,
          message: 'Network error: Cannot connect to server. Please check your connection.',
          error: error.message,
          code: error.code
        };
      }

      let userMessage = 'Login failed';

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        switch (status) {
        case 400:
          userMessage = serverMessage || 'Invalid email or password format.';
          break;
        case 401:
          userMessage = serverMessage || 'Invalid email or password.';
          break;
        case 404:
          userMessage = serverMessage || 'Account not found. Please check your email.';
          break;
        case 422:
          userMessage = serverMessage || 'Validation failed. Please check your input.';
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          break;
        default:
          userMessage = serverMessage || `Login failed (${status})`;
        }
      } else if (error.request && !useMock) {
        userMessage = 'Network error: Cannot connect to server. Please check your connection.';
      } else {
        userMessage = error.message || 'An unexpected error occurred.';
      }

      return {
        success: false,
        message: userMessage,
        error: error.response?.data,
        status: error.response?.status,
        code: error.code
      };
    }
  },

  // Demo Login
  demoLogin: async () => {
    const endpoint = '/auth/demo';

    try {
      debug.log(endpoint, {}, 'request');

      if (useMock) {
        console.log('🔄 Using mock demo login');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResult = mockResponses.demoLogin();
        authService.setToken(mockResult.data.token);
        authService.setUser(mockResult.data.user);
        return mockResult;
      }

      const response = await api.post(endpoint);
      debug.log(endpoint, response.data, 'response');

      if (response.data && (response.data.token || response.data.data?.token)) {
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;

        if (token) {
          authService.setToken(token);
        }
        if (user) {
          authService.setUser(user);
        }

        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Demo login successful!'
        };
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      debug.error(endpoint, error, 'DEMO_LOGIN');

      return {
        success: false,
        message: 'Demo login failed. Please try again.',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Admin Login
  adminLogin: async (credentials) => {
    const endpoint = '/admin/login';

    try {
      debug.log(endpoint, credentials, 'request');

      if (useMock) {
        console.log('🔄 Using mock admin login');
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
          success: true,
          message: 'Admin login successful (MOCK)',
          data: {
            token: 'mock-admin-token',
            user: {
              id: 'admin-123',
              name: 'Administrator',
              email: 'admin@example.com',
              role: 'admin'
            }
          }
        };
      }

      const response = await api.post(endpoint, credentials);
      debug.log(endpoint, response.data, 'response');

      if (response.data && (response.data.token || response.data.data?.token)) {
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;

        if (token) {
          authService.setToken(token);
        }
        if (user) {
          authService.setUser(user);
        }

        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Admin login successful!'
        };
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      debug.error(endpoint, error, 'ADMIN_LOGIN');
      
      let userMessage = 'Admin login failed';
      if (error.response) {
        userMessage = error.response.data?.message || `Admin login failed (${error.response.status})`;
      } else if (error.request) {
        userMessage = 'Network error: Cannot connect to server.';
      }

      return {
        success: false,
        message: userMessage,
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Google OAuth Login
  googleLogin: async (socialData) => {
    const endpoint = '/auth/google';

    try {
      debug.log(endpoint, socialData, 'request');

      if (useMock) {
        console.log('🔄 Using mock Google login');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResult = mockResponses.googleLogin(socialData);
        authService.setToken(mockResult.data.token);
        authService.setUser(mockResult.data.user);
        return mockResult;
      }

      const response = await api.post(endpoint, socialData);
      debug.log(endpoint, response.data, 'response');

      if (response.data && (response.data.token || response.data.data?.token)) {
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;

        if (token) {
          authService.setToken(token);
        }
        if (user) {
          authService.setUser(user);
        }

        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Google authentication successful!'
        };
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      debug.error(endpoint, error, 'GOOGLE_LOGIN');

      return {
        success: false,
        message: 'Google authentication failed. Please try again.',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Facebook OAuth Login
  facebookLogin: async (socialData) => {
    const endpoint = '/auth/facebook';

    try {
      debug.log(endpoint, socialData, 'request');

      if (useMock) {
        console.log('🔄 Using mock Facebook login');
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockResult = mockResponses.facebookLogin(socialData);
        authService.setToken(mockResult.data.token);
        authService.setUser(mockResult.data.user);
        return mockResult;
      }

      const response = await api.post(endpoint, socialData);
      debug.log(endpoint, response.data, 'response');

      if (response.data && (response.data.token || response.data.data?.token)) {
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;

        if (token) {
          authService.setToken(token);
        }
        if (user) {
          authService.setUser(user);
        }

        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Facebook authentication successful!'
        };
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      debug.error(endpoint, error, 'FACEBOOK_LOGIN');

      return {
        success: false,
        message: 'Facebook authentication failed. Please try again.',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Get User Profile
  getProfile: async () => {
    const endpoint = '/auth/profile';

    try {
      debug.log(endpoint, {}, 'request');

      if (useMock) {
        console.log('🔄 Using mock profile');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return mockResponses.getProfile();
      }

      const response = await api.get(endpoint);
      debug.log(endpoint, response.data, 'response');

      return {
        success: true,
        data: response.data,
        message: 'Profile loaded successfully'
      };

    } catch (error) {
      debug.error(endpoint, error, 'GET_PROFILE');

      if (error.response?.status === 401) {
        authService.clearAuth();
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load profile',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Update User Profile
  updateProfile: async (profileData) => {
    const endpoint = '/auth/profile';

    try {
      debug.log(endpoint, profileData, 'request');

      if (useMock) {
        console.log('🔄 Using mock profile update');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockResult = mockResponses.updateProfile(profileData);
        authService.setUser(mockResult.data.user);
        return mockResult;
      }

      const response = await api.put(endpoint, profileData);
      debug.log(endpoint, response.data, 'response');

      if (response.data && response.data.data?.user) {
        authService.setUser(response.data.data.user);
        return {
          success: true,
          data: response.data,
          message: response.data.message || 'Profile updated successfully'
        };
      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      debug.error(endpoint, error, 'UPDATE_PROFILE');

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Change Password
  changePassword: async (passwordData) => {
    const endpoint = '/auth/change-password';

    try {
      debug.log(endpoint, { ...passwordData, currentPassword: '[HIDDEN]', newPassword: '[HIDDEN]' }, 'request');

      if (useMock) {
        console.log('🔄 Using mock password change');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          message: 'Password changed successfully'
        };
      }

      const response = await api.put(endpoint, passwordData);
      debug.log(endpoint, response.data, 'response');

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Password changed successfully'
      };

    } catch (error) {
      debug.error(endpoint, error, 'CHANGE_PASSWORD');

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    const endpoint = '/auth/forgot-password';

    try {
      debug.log(endpoint, { email }, 'request');

      if (useMock) {
        console.log('🔄 Using mock forgot password');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          message: 'Password reset email sent successfully'
        };
      }

      const response = await api.post(endpoint, { email });
      debug.log(endpoint, response.data, 'response');

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Password reset email sent successfully'
      };

    } catch (error) {
      debug.error(endpoint, error, 'FORGOT_PASSWORD');

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Reset Password
  resetPassword: async (token, password) => {
    const endpoint = '/auth/reset-password';

    try {
      debug.log(endpoint, { token, password: '[HIDDEN]' }, 'request');

      if (useMock) {
        console.log('🔄 Using mock password reset');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          message: 'Password reset successfully'
        };
      }

      const response = await api.post(endpoint, { token, password });
      debug.log(endpoint, response.data, 'response');

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Password reset successfully'
      };

    } catch (error) {
      debug.error(endpoint, error, 'RESET_PASSWORD');

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  },

  // Logout
  logout: async () => {
    const endpoint = '/auth/logout';

    try {
      debug.log(endpoint, {}, 'request');

      if (!useMock) {
        await api.post(endpoint);
      }

      debug.log(endpoint, { message: 'Logged out successfully' }, 'response');
    } catch (error) {
      debug.error(endpoint, error, 'LOGOUT');
      console.warn('Backend logout failed, but local data will be cleared.');
    } finally {
      authService.clearAuth();
    }
  },

  // Test backend connection
  testConnection: async () => {
    const endpoint = '/health';

    try {
      debug.log(endpoint, {}, 'request');

      if (useMock) {
        return {
          success: true,
          data: { message: 'Mock backend is working!' },
          message: 'Backend connection successful (MOCK)'
        };
      }

      const response = await api.get(endpoint);
      debug.log(endpoint, response.data, 'response');

      return {
        success: true,
        data: response.data,
        message: 'Backend connection successful'
      };
    } catch (error) {
      debug.error(endpoint, error, 'TEST_CONNECTION');

      return {
        success: false,
        message: 'Cannot connect to backend server',
        error: error.response?.data,
        status: error.response?.status
      };
    }
  }
};

export default authService;