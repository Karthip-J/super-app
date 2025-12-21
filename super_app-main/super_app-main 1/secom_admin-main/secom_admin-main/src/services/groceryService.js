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

const groceryService = {
  getAllGroceries: async () => {
    try {
      const response = await api.get('/api/groceries');
      return response.data;
    } catch (error) {
      console.error('Error fetching groceries:', error);
      throw error;
    }
  },
  
  getGroceryById: async (id) => {
    try {
      const response = await api.get(`/api/groceries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grocery:', error);
      throw error;
    }
  },
  
  createGrocery: async (data) => {
    try {
      const response = await api.post('/api/groceries', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating grocery:', error);
      throw error;
    }
  },
  
  updateGrocery: async (id, data) => {
    try {
      const response = await api.put(`/api/groceries/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating grocery:', error);
      throw error;
    }
  },
  
  deleteGrocery: async (id) => {
    try {
      const response = await api.delete(`/api/groceries/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting grocery:', error);
      throw error;
    }
  },
};

export default groceryService; 