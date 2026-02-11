// frontend/src/admin/services/userService.js
import adminApi from './adminApi.js';

const userService = {
  getUsers: async (params = {}) => {
    try {
      const response = await adminApi.get('/users', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await adminApi.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await adminApi.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await adminApi.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  bulkAction: async (action, userIds) => {
    try {
      const response = await adminApi.post('/users/bulk-action', { action, userIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;