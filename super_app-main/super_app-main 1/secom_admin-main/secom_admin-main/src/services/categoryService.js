import axios from 'axios';
import API_CONFIG from '../config/api.config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: false,
  headers: {
    ...API_CONFIG.HEADERS,
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

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    // Log the response for debugging
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error);
    console.error('Error Response:', error.response);
    
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }

    switch (error.response.status) {
      case 401:
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
        window.location.href = API_CONFIG.ROUTES.LOGIN;
        break;
      case 404:
        throw new Error(`Resource not found: ${error.response.config.url}`);
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw error;
    }
  }
);

// Retry logic for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const retryRequest = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (!error.response || error.response.status >= 500)) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

export const categoryService = {
  // Get all categories
  getAllCategories: async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.CATEGORY.LIST);
      // Accept both array and { data: [...] } response
      const categoriesData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.data)
          ? response.data.data
          : [];
      console.log('Categories Response:', categoriesData);
      return { data: categoriesData }; // Always wrap in data property
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.CATEGORY.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Get subcategories for a parent category
  getSubcategories: async (parentId) => {
    try {
      const response = await api.get(`/api/categories/parent/${parentId}/children`);
      return {
        success: true,
        data: Array.isArray(response.data) ? response.data : response.data.data || []
      };
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to fetch subcategories'
      };
    }
  },

  // Create new category
  createCategory: async (formData) => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.CATEGORY.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, formData) => {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.CATEGORY.UPDATE(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      console.log('Attempting to delete category:', id);
      const response = await api.delete(API_CONFIG.ENDPOINTS.CATEGORY.DELETE(id));
      console.log('Delete response:', response);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      console.error('Error response:', error.response?.data);
      
      // If we have a specific error message from the backend, use it
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // If we have details about the error, include them
      if (error.response?.data?.error?.details) {
        throw new Error(`Failed to delete category: ${error.response.data.error.details}`);
      }
      
      // Default error message
      throw new Error('Failed to delete category. Please try again.');
    }
  },

  // Toggle category status
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(API_CONFIG.ENDPOINTS.CATEGORY.TOGGLE_STATUS(id));
      return response.data;
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }
  },

  // Get all brands
  getAllBrands: async () => {
    return retryRequest(async () => {
      try {
        const response = await api.get('/api/admin/get_all_brand');
        return {
          data: Array.isArray(response.data) ? response.data : response.data.data || []
        };
      } catch (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }
    });
  },

  // Bulk delete categories
  bulkDeleteCategories: async (ids) => {
    try {
      const response = await api.post('/api/admin/categories/bulk-delete', { ids });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting categories:', error);
      throw error;
    }
  }
}; 