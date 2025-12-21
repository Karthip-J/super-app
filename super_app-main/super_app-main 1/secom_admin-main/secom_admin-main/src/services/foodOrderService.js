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

// Food Order Service for Admin Panel
export const foodOrderService = {
  // Get all food orders for admin dashboard
  getAllFoodOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/food-orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch food orders',
        error: error.message
      };
    }
  },

  // Get food orders by restaurant
  getRestaurantOrders: async (restaurantId, params = {}) => {
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

  // Get specific food order by ID
  getFoodOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/food-orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch food order details',
        error: error.message
      };
    }
  },

  // Update food order status (for restaurant/admin)
  updateOrderStatus: async (orderId, statusData) => {
    try {
      const response = await api.put(`/api/food-orders/restaurant/orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update order status',
        error: error.message
      };
    }
  },

  // Get order tracking info
  getOrderTracking: async (orderId) => {
    try {
      const response = await api.get(`/api/food-orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch order tracking',
        error: error.message
      };
    }
  },

  // Cancel food order (admin action)
  cancelOrder: async (orderId, reason) => {
    try {
      const response = await api.put(`/api/food-orders/${orderId}/cancel`, {
        cancellation_reason: reason,
        cancelled_by: 'admin'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to cancel order',
        error: error.message
      };
    }
  },

  // Get food order statistics for dashboard
  getOrderStatistics: async (params = {}) => {
    try {
      // This would require a new backend endpoint for analytics
      const response = await api.get('/api/food-orders/analytics', { params });
      return response.data;
    } catch (error) {
      // Return mock data for now
      return {
        success: true,
        data: {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          cancelledOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        }
      };
    }
  },

  // Export food orders (CSV/Excel)
  exportOrders: async (params = {}) => {
    try {
      const response = await api.get('/api/food-orders/export', { 
        params,
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to export orders',
        error: error.message
      };
    }
  },

  // Bulk update order statuses
  bulkUpdateStatus: async (orderIds, status) => {
    try {
      const response = await api.put('/api/food-orders/bulk/status', {
        order_ids: orderIds,
        status
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to bulk update orders',
        error: error.message
      };
    }
  }
};

// Food Cart Service for Admin (to view customer carts)
export const foodCartService = {
  // Get all active carts (admin view)
  getActiveCarts: async (params = {}) => {
    try {
      const response = await api.get('/api/food-cart/admin/active', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch active carts',
        error: error.message
      };
    }
  },

  // Get abandoned carts
  getAbandonedCarts: async (params = {}) => {
    try {
      const response = await api.get('/api/food-cart/admin/abandoned', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch abandoned carts',
        error: error.message
      };
    }
  }
};

// Enhanced Restaurant Service for Food Delivery
export const enhancedRestaurantService = {
  // Get all restaurants with food delivery data
  getAllRestaurants: async (params = {}) => {
    try {
      const response = await api.get('/api/restaurants', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch restaurants',
        error: error.message
      };
    }
  },

  // Create restaurant with food delivery features
  createRestaurant: async (restaurantData) => {
    try {
      const response = await api.post('/api/restaurants', restaurantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to create restaurant',
        error: error.message
      };
    }
  },

  // Update restaurant
  updateRestaurant: async (id, restaurantData) => {
    try {
      const response = await api.put(`/api/restaurants/${id}`, restaurantData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update restaurant',
        error: error.message
      };
    }
  },

  // Delete restaurant
  deleteRestaurant: async (id) => {
    try {
      const response = await api.delete(`/api/restaurants/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to delete restaurant',
        error: error.message
      };
    }
  }
};

// Enhanced Dish Service
export const dishService = {
  // Get all dishes
  getAllDishes: async (params = {}) => {
    try {
      const response = await api.get('/api/dishes', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch dishes',
        error: error.message
      };
    }
  },

  // Get dishes by restaurant
  getDishesByRestaurant: async (restaurantId, params = {}) => {
    try {
      const response = await api.get(`/api/dishes/restaurant/${restaurantId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch restaurant dishes',
        error: error.message
      };
    }
  },

  // Create dish
  createDish: async (dishData) => {
    try {
      const response = await api.post('/api/dishes', dishData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to create dish',
        error: error.message
      };
    }
  },

  // Update dish
  updateDish: async (id, dishData) => {
    try {
      const response = await api.put(`/api/dishes/${id}`, dishData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to update dish',
        error: error.message
      };
    }
  },

  // Delete dish
  deleteDish: async (id) => {
    try {
      const response = await api.delete(`/api/dishes/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to delete dish',
        error: error.message
      };
    }
  },

  // Bulk operations
  bulkUpdateDishes: async (dishIds, updateData) => {
    try {
      const response = await api.put('/api/dishes/bulk', {
        dish_ids: dishIds,
        ...updateData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: 'Failed to bulk update dishes',
        error: error.message
      };
    }
  }
};

export default {
  foodOrderService,
  foodCartService,
  enhancedRestaurantService,
  dishService
}; 