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
    let token = localStorage.getItem('token');
    
    // Fallback to demo token for development if no token found
    if (!token) {
      console.warn('UserService - No token found, using demo-token for development');
      token = 'demo-token';
    }
    
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
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('tokenExpiration');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/auth/sign-in') {
        window.location.href = '/auth/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export const userService = {
  // Get all users
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('/api/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      };
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch user',
        error: error.message
      };
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/api/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to create user',
        error: error.message
      };
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update user',
        error: error.message
      };
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to delete user',
        error: error.message
      };
    }
  },

  // Update user password
  updatePassword: async (id, passwordData) => {
    try {
      const response = await api.put(`/api/users/${id}/password`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update password',
        error: error.message
      };
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/me/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch profile',
        error: error.message
      };
    }
  },

  // Update user profile
  updateUserProfile: async (id, profileData) => {
    try {
      const response = await api.put(`/api/users/${id}/profile`, profileData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update user profile',
        error: error.message
      };
    }
  }
}; 