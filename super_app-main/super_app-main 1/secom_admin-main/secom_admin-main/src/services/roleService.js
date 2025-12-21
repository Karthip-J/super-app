import { apiService as api } from './api.service';

export const roleService = {
  // Get all roles
  getAllRoles: async (params = {}) => {
    try {
      const response = await api.get('/api/roles', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch roles',
        error: error.message
      };
    }
  },

  // Get role by ID
  getRoleById: async (id) => {
    try {
      const response = await api.get(`/api/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch role',
        error: error.message
      };
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const response = await api.post('/api/roles', roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to create role',
        error: error.message
      };
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/api/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update role',
        error: error.message
      };
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/api/roles/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to delete role',
        error: error.message
      };
    }
  }
}; 