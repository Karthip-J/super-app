import axios from 'axios';
import { toast } from 'react-toastify';
import API_CONFIG from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN) || 'demo-token';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if not already on login page and token exists
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      if (token && !window.location.pathname.includes('/auth/sign-in')) {
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
        window.location.href = '/auth/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Generic CRUD operations
  async get(endpoint, config = {}) {
    try {
      const response = await api.get(endpoint, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error fetching data';
      toast.error(message);
      throw error;
    }
  },

  async post(endpoint, data) {
    try {
      const response = await api.post(endpoint, data);
      toast.success(response.data?.message || 'Operation successful');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error creating data';
      toast.error(message);
      throw error;
    }
  },

  async put(endpoint, data) {
    try {
      const response = await api.put(endpoint, data);
      toast.success(response.data?.message || 'Update successful');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error updating data';
      toast.error(message);
      throw error;
    }
  },

  async delete(endpoint) {
    try {
      const response = await api.delete(endpoint);
      toast.success(response.data?.message || 'Delete successful');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error deleting data';
      toast.error(message);
      throw error;
    }
  },

  // File upload
  async uploadFile(endpoint, formData) {
    try {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN) || 'demo-token';
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      toast.success(response.data?.message || 'File upload successful');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Error uploading file';
      toast.error(message);
      throw error;
    }
  }
}; 