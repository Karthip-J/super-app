import axios from 'axios';
import API_CONFIG from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
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

// Add response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
      
      // Only redirect if not already on login page
      if (window.location.pathname !== API_CONFIG.ROUTES.LOGIN) {
        window.location.href = API_CONFIG.ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

export const staffService = {
  // Get all staff
  getAllStaff: async (query = '') => {
    try {
      const response = await api.get(`/api/staff${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch staff',
        error: error.message
      };
    }
  },

  // Get staff by ID
  getStaffById: async (id) => {
    try {
      const response = await api.get(`/api/staff/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch staff',
        error: error.message
      };
    }
  },

  // Create new staff
  createStaff: async (staffData) => {
    try {
      const response = await api.post('/api/staff', staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to create staff',
        error: error.message
      };
    }
  },

  // Update staff
  updateStaff: async (id, staffData) => {
    try {
      const response = await api.put(`/api/staff/${id}`, staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update staff',
        error: error.message
      };
    }
  },

  // Delete staff
  deleteStaff: async (id) => {
    try {
      const response = await api.delete(`/api/staff/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to delete staff',
        error: error.message
      };
    }
  }
}; 