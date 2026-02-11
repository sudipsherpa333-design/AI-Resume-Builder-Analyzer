// frontend/src/admin/services/authService.js
import adminApi from './adminApi.js';

const authService = {
  login: async (email, password) => {
    try {
      const response = await adminApi.post('/auth/login', { email, password });

      if (response.data.success) {
        const { token, admin } = response.data.data;

        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(admin));

        return { success: true, data: response.data.data };
      }

      return { success: false, error: response.data.error };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  logout: async () => {
    try {
      await adminApi.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
  },

  getProfile: async () => {
    try {
      const response = await adminApi.get('/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },

  getCurrentAdmin: () => {
    const adminStr = localStorage.getItem('adminUser');
    return adminStr ? JSON.parse(adminStr) : null;
  }
};

export default authService;