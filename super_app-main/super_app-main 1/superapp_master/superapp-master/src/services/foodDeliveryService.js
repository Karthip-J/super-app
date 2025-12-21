import API_CONFIG from '../config/api.config.js';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  
  // If no token, return headers without authorization
  if (!token) {
    return {
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Utility Functions - Return empty string to prevent infinite loops
export const formatImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, construct the full URL
  if (imagePath.startsWith('/')) {
    return API_CONFIG.getUrl(imagePath);
  }
  
  // If it's just a filename, construct the full URL
  return API_CONFIG.getUploadUrl(imagePath);
};

export const formatTime = (timeString) => {
  if (!timeString) return '';
  
  try {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    return timeString;
  }
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numAmount);
};

export const restaurantService = {
  getAllRestaurants: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = API_CONFIG.getUrl(`/api/restaurants${queryParams ? `?${queryParams}` : ''}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Restaurants API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch restaurants'
      };
    }
  },

  getRestaurantCategories: async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.RESTAURANT_CATEGORIES), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Restaurant categories API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching restaurant categories:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch categories'
      };
    }
  },

  getRestaurantById: async (restaurantId) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`/api/restaurants/${restaurantId}`), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch restaurant'
      };
    }
  }
};

export const dishService = {
  // ✅ ADD: Get all dishes (for category pages)
  getAllDishes: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? API_CONFIG.getUrl(`/api/dishes?${queryString}`) : API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.DISHES);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('All dishes API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching all dishes:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch dishes'
      };
    }
  },

  getDishesByRestaurant: async (restaurantId) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`/api/dishes?restaurant_id=${restaurantId}`), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Restaurant dishes API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching restaurant dishes:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch restaurant dishes'
      };
    }
  },

  getBestsellerDishes: async () => {
    try {
      // ✅ FIX: Use correct endpoint with query parameter
      const response = await fetch(API_CONFIG.getUrl('/api/dishes?is_bestseller=true'), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Bestseller dishes API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching bestseller dishes:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch bestseller dishes'
      };
    }
  }
};

export const foodCartService = {
  getFoodCart: async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl('/api/food-cart'), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Food cart API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching food cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch cart'
      };
    }
  },

  addToFoodCart: async (cartItemData) => {
    try {
      console.log('Adding to food cart:', cartItemData);
      
      const response = await fetch(API_CONFIG.getUrl('/api/food-cart/add'), {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(cartItemData)
      });

      const data = await response.json();
      console.log('Food cart add response:', data);
      return data;
    } catch (error) {
      console.error('Error adding to food cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to add to cart'
      };
    }
  },

  updateFoodCartItem: async (itemId, quantity) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`/api/food-cart/items/${itemId}`), {
        method: 'PUT',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating food cart item:', error);
      return {
        success: false,
        message: error.message || 'Failed to update cart item'
      };
    }
  },

  removeFoodCartItem: async (itemId) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`/api/food-cart/items/${itemId}`), {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing food cart item:', error);
      return {
        success: false,
        message: error.message || 'Failed to remove cart item'
      };
    }
  },

  clearFoodCart: async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl('/api/food-cart/clear'), {
        method: 'DELETE',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Food cart clear response:', data);
      return data;
    } catch (error) {
      console.error('Error clearing food cart:', error);
      return {
        success: false,
        message: error.message || 'Failed to clear cart'
      };
    }
  }
};

export const foodOrderService = {
  createFoodOrder: async (orderData) => {
    try {
      console.log('Creating food order:', orderData);
      
      const response = await fetch(API_CONFIG.getUrl('/api/food-orders'), {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Food order response:', data);
      
      return data;
    } catch (error) {
      console.error('Error creating food order:', error);
      return {
        success: false,
        message: error.message || 'Failed to create order'
      };
    }
  },

  getUserFoodOrders: async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          message: 'Not logged in. Please log in to view your orders.'
        };
      }
      
      const response = await fetch(API_CONFIG.getUrl('/api/food-orders'), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching food orders:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch orders'
      };
    }
  },

  getFoodOrderById: async (orderId) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`/api/food-orders/${orderId}`), {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching food order:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch order'
      };
    }
  }
}; 