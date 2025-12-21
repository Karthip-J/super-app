import axios from 'axios';
import API_CONFIG from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User Order Service
export const orderService = {
  // Create order from cart
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to create order',
        error: error.message
      };
    }
  },

  // Get user orders with pagination and filtering
  getUserOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      };
    }
  },

  // Get single order by ID
  getOrder: async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch order',
        error: error.message
      };
    }
  },

  // Get order by order number
  getOrderByNumber: async (orderNumber) => {
    try {
      const response = await api.get(`/api/orders/number/${orderNumber}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch order',
        error: error.message
      };
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.post(`/api/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to cancel order',
        error: error.message
      };
    }
  }
};

// Admin Order Service
export const adminOrderService = {
  // Get all orders with advanced filtering
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      };
    }
  },

  // Get order statistics for dashboard
  getOrderStats: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/orders/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch order statistics',
        error: error.message
      };
    }
  },

  // Get single order by ID (admin)
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch order',
        error: error.message
      };
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, statusData) => {
    try {
      const response = await api.put(`/api/admin/orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update order status',
        error: error.message
      };
    }
  },

  // Bulk update orders
  bulkUpdateOrders: async (updateData) => {
    try {
      const response = await api.put('/api/admin/orders/bulk-update', updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update orders',
        error: error.message
      };
    }
  },

  // Export orders
  exportOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/admin/orders/export/data', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to export orders',
        error: error.message
      };
    }
  }
}; 

// Admin Restaurant Order Service
export const adminRestaurantOrderService = {
  // Get all restaurant orders with advanced filtering
  getAllRestaurantOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/food-orders/admin/all', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch restaurant orders',
        error: error.message
      };
    }
  },

  // Get restaurant order statistics for dashboard
  getRestaurantOrderStats: async (params = {}) => {
    try {
      const response = await api.get('/api/food-orders/admin/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch restaurant order statistics',
        error: error.message
      };
    }
  },

  // Get single restaurant order by ID (admin)
  getRestaurantOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/food-orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch restaurant order',
        error: error.message
      };
    }
  },

  // Update restaurant order status
  updateRestaurantOrderStatus: async (orderId, statusData) => {
    try {
      const response = await api.put(`/api/food-orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update restaurant order status',
        error: error.message
      };
    }
  },

  // Get restaurant orders by restaurant ID
  getRestaurantOrdersByRestaurant: async (restaurantId, params = {}) => {
    try {
      const response = await api.get(`/api/food-orders/restaurant/${restaurantId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch restaurant orders',
        error: error.message
      };
    }
  },

  // Export restaurant orders
  exportRestaurantOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/food-orders/export', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to export restaurant orders',
        error: error.message
      };
    }
  }
}; 

// Admin Grocery Order Service
export const adminGroceryOrderService = {
  // Get all grocery orders with advanced filtering
  getAllGroceryOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/grocery-orders/admin/all', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch grocery orders',
        error: error.message
      };
    }
  },

  // Get single grocery order by ID (admin)
  getGroceryOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/grocery-orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch grocery order',
        error: error.message
      };
    }
  },

  // Update grocery order status
  updateGroceryOrderStatus: async (orderId, statusData) => {
    try {
      const response = await api.put(`/api/grocery-orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update grocery order status',
        error: error.message
      };
    }
  },

  // Export grocery orders
  exportGroceryOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/grocery-orders/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to export grocery orders',
        error: error.message
      };
    }
  }
}; 