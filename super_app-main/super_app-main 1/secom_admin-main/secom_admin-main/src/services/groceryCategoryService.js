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
    return response;
  },
  (error) => {
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

// Mock data for grocery categories since there's no dedicated API endpoint
const MOCK_GROCERY_CATEGORIES = [
  { id: 1, name: 'Fruits & Vegetables', description: 'Fresh fruits and vegetables', status: true },
  { id: 2, name: 'Bakery, Cakes & Dairy', description: 'Bakery items, cakes and dairy products', status: true },
  { id: 3, name: 'Beverages', description: 'Drinks and beverages', status: true },
  { id: 4, name: 'Snacks & Branded Foods', description: 'Packaged snacks and branded food items', status: true },
  { id: 5, name: 'Beauty & Hygiene', description: 'Personal care and hygiene products', status: true },
  { id: 6, name: 'Cleaning & Household', description: 'Household cleaning supplies', status: true }
];

export const groceryCategoryService = {
  // Get all grocery categories
  getAllCategories: async () => {
    try {
      // Since there's no specific endpoint for grocery categories, we'll return mock data
      // In a real implementation, this would come from a specific API endpoint
      return { 
        success: true, 
        data: MOCK_GROCERY_CATEGORIES,
        message: 'Categories fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching grocery categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getCategoryById: async (id) => {
    try {
      // Find in mock data
      const category = MOCK_GROCERY_CATEGORIES.find(cat => cat.id == id);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      console.error('Error fetching grocery category:', error);
      throw error;
    }
  },

  // Create new grocery category (mock implementation)
  createCategory: async (categoryData) => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate adding to mock data
      const newCategory = {
        id: MOCK_GROCERY_CATEGORIES.length + 1,
        ...categoryData,
        status: categoryData.status !== undefined ? categoryData.status : true
      };
      
      MOCK_GROCERY_CATEGORIES.push(newCategory);
      
      return { 
        success: true, 
        data: newCategory,
        message: 'Category created successfully'
      };
    } catch (error) {
      console.error('Error creating grocery category:', error);
      throw error;
    }
  },

  // Update grocery category (mock implementation)
  updateCategory: async (id, categoryData) => {
    try {
      // Find index in mock data
      const index = MOCK_GROCERY_CATEGORIES.findIndex(cat => cat.id == id);
      if (index === -1) {
        throw new Error('Category not found');
      }
      
      // Update category
      MOCK_GROCERY_CATEGORIES[index] = {
        ...MOCK_GROCERY_CATEGORIES[index],
        ...categoryData
      };
      
      return { 
        success: true, 
        data: MOCK_GROCERY_CATEGORIES[index],
        message: 'Category updated successfully'
      };
    } catch (error) {
      console.error('Error updating grocery category:', error);
      throw error;
    }
  },

  // Delete grocery category (mock implementation)
  deleteCategory: async (id) => {
    try {
      // Find index in mock data
      const index = MOCK_GROCERY_CATEGORIES.findIndex(cat => cat.id == id);
      if (index === -1) {
        throw new Error('Category not found');
      }
      
      // Remove category
      MOCK_GROCERY_CATEGORIES.splice(index, 1);
      
      return { 
        success: true, 
        message: 'Category deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting grocery category:', error);
      
      // If we have a specific error message, use it
      if (error.message) {
        throw new Error(error.message);
      }
      
      // Default error message
      throw new Error('Failed to delete grocery category. Please try again.');
    }
  },

  // Toggle category status (mock implementation)
  toggleStatus: async (id) => {
    try {
      // Find index in mock data
      const index = MOCK_GROCERY_CATEGORIES.findIndex(cat => cat.id == id);
      if (index === -1) {
        throw new Error('Category not found');
      }
      
      // Toggle status
      MOCK_GROCERY_CATEGORIES[index].status = !MOCK_GROCERY_CATEGORIES[index].status;
      
      return { 
        success: true, 
        data: MOCK_GROCERY_CATEGORIES[index],
        message: 'Category status updated successfully'
      };
    } catch (error) {
      console.error('Error toggling grocery category status:', error);
      throw error;
    }
  }
};

export default groceryCategoryService;