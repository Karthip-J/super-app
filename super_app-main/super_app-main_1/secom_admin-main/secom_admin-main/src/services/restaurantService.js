import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Create axios instance for restaurant API calls
const restaurantAPI = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/restaurants`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
restaurantAPI.interceptors.request.use(
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

// Restaurant Categories
export const restaurantCategoryService = {
  // Get all categories
  getAll: async () => {
    try {
      console.log('Making API call to:', `${restaurantAPI.defaults.baseURL}/categories`);
      const response = await restaurantAPI.get('/categories');
      console.log('API response:', response.data);
      // Return only the data array, not the wrapped object
      return response.data.data || [];
    } catch (error) {
      console.error('API call failed:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || error.message;
    }
  },

  // Get category by ID
  getById: async (id) => {
    try {
      const response = await restaurantAPI.get(`/categories/${id}`);
      // Return only the data object, not the wrapped object
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create category
  create: async (formData) => {
    try {
      const response = await restaurantAPI.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Return only the data object, not the wrapped object
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update category
  update: async (id, formData) => {
    try {
      const response = await restaurantAPI.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Return only the data object, not the wrapped object
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete category
  delete: async (id) => {
    try {
      const response = await restaurantAPI.delete(`/categories/${id}`);
      // Return only the data object, not the wrapped object
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Restaurants
export const restaurantService = {
  // Get all restaurants
  getAll: async (params = {}) => {
    try {
      const response = await restaurantAPI.get('/', { params });
      // Return only the data array, not the wrapped object
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get restaurant by ID
  getById: async (id) => {
    try {
      const response = await restaurantAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create restaurant
  create: async (formData) => {
    try {
      const response = await restaurantAPI.post('/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update restaurant
  update: async (id, formData) => {
    try {
      const response = await restaurantAPI.put(`/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete restaurant
  delete: async (id) => {
    try {
      const response = await restaurantAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Create axios instance for dish API calls
const dishAPI = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/dishes`,
  headers: {
    'Content-Type': 'application/json',
  },
});

dishAPI.interceptors.request.use(
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

// Dishes
export const dishService = {
  // Get all dishes
  getAll: async (params = {}) => {
    try {
      const response = await dishAPI.get('/', { params });
      // Return only the data array, not the wrapped object
      return response.data.data || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get dish by ID
  getById: async (id) => {
    try {
      const response = await dishAPI.get(`/${id}`);
      // Return only the data object, not the wrapped object
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create dish
  create: async (formData) => {
    try {
      const response = await dishAPI.post('/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Return only the data object, not the wrapped object
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update dish
  update: async (id, formData) => {
    try {
      const response = await dishAPI.put(`/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Return only the data object, not the wrapped object
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete dish
  delete: async (id) => {
    try {
      const response = await dishAPI.delete(`/${id}`);
      // Return only the data object, not the wrapped object
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
}; 