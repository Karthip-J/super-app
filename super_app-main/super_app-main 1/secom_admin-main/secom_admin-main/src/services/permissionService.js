import axios from 'axios';
import API_CONFIG from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const permissionService = {
  // Get all permissions
  getAllPermissions: async (params = {}) => {
    try {
      const response = await api.get('/api/permissions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to fetch permissions' 
      };
    }
  },

  // Get permissions by module
  getPermissionsByModule: async (module) => {
    try {
      const response = await api.get(`/api/permissions/module/${module}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to fetch permissions by module' 
      };
    }
  },

  // Get permissions by category
  getPermissionsByCategory: async (category) => {
    try {
      const response = await api.get(`/api/permissions/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to fetch permissions by category' 
      };
    }
  },

  // Create new permission
  createPermission: async (permissionData) => {
    try {
      const response = await api.post('/api/permissions', permissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to create permission' 
      };
    }
  },

  // Update permission
  updatePermission: async (id, permissionData) => {
    try {
      const response = await api.put(`/api/permissions/${id}`, permissionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to update permission' 
      };
    }
  },

  // Delete permission
  deletePermission: async (id) => {
    try {
      const response = await api.delete(`/api/permissions/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to delete permission' 
      };
    }
  },

  // Get permission statistics
  getPermissionStats: async () => {
    try {
      const response = await api.get('/api/permissions/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        success: false, 
        message: 'Failed to fetch permission statistics' 
      };
    }
  }
}; 