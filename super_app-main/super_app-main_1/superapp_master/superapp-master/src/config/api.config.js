// Centralized API Configuration
// This file manages all API URLs and endpoints dynamically

const API_CONFIG = {
  // Config keys
  GOOGLE_MAPS_API_KEY: "AIzaSyB_IWKJcJhkGzpCDB-ml6vlZmQzd-4F-gg",

  // Base URL - will be set from environment variable
  BASE_URL: (() => {
    // Check if we're in production (Vercel)
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

    console.log('🔧 API Config Debug:', {
      hostname: window.location.hostname,
      isProduction,
      envVar: process.env.REACT_APP_API_URL,
      NODE_ENV: process.env.NODE_ENV
    });

    if (isProduction) {
      console.log('🔧 Using production URL: https://super-app-1-do45.onrender.com');
      return 'https://super-app-1-do45.onrender.com';
    }

    // Development fallback
    const devUrl = (process.env.REACT_APP_API_URL || 'http://localhost:3000').replace(/\/$/, '');
    console.log('🔧 Using development URL:', devUrl);
    return devUrl;
  })().replace(/\/$/, ''), // Ensure no trailing slash

  // Debug logging
  DEBUG: {
    ENV_VAR: process.env.REACT_APP_API_URL,
    FINAL_URL: (process.env.REACT_APP_API_URL || 'http://localhost:3000').replace(/\/$/, ''),
    NODE_ENV: process.env.NODE_ENV
  },

  // API Endpoints
  ENDPOINTS: {
    // Auth
    AUTH: '/api/auth',
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    OTP_GENERATE: '/api/auth/otp/generate',
    OTP_VERIFY: '/api/auth/otp/verify',

    // User Profile
    USER_PROFILE: '/api/userProfile',
    PROFILE: '/api/userProfile',

    // Categories
    CATEGORIES: '/api/categories',
    PARENT_CATEGORIES: '/api/categories/parents',
    CHILDREN_CATEGORIES: '/api/categories/parent',

    // Products
    PRODUCTS: '/api/products',

    // Cart & Wishlist
    CART: '/api/cart',
    CART_ITEMS: '/api/cart/items',
    WISHLIST: '/api/wishlist',
    GROCERY_CART: '/api/gcart',
    GROCERY_WISHLIST: '/api/gwishlist',

    // Orders
    ORDERS: '/api/orders',
    GROCERY_ORDERS: '/api/gorders',

    // Hotels
    HOTELS: '/api/hotels',
    BOOKINGS: '/api/bookings',
    MY_BOOKINGS: '/api/bookings/my-bookings',

    // Restaurants
    RESTAURANTS: '/api/restaurants',
    RESTAURANT_CATEGORIES: '/api/restaurants/categories',
    DISHES: '/api/dishes',

    // Taxi
    TAXI_VEHICLES: '/api/taxi-vehicles',
    TAXI_RIDES: '/api/taxi-rides',
    TAXI_DRIVERS: '/api/taxi-drivers',
    TAXI_RECENT_LOCATIONS: '/api/taxi/recent-locations',
    MY_RIDES: '/api/taxi-rides/my-rides',

    // Porter
    PORTER_BOOKINGS: '/api/porter-bookings',

    // Groceries
    GROCERIES: '/api/groceries',

    // Urban Services
    URBAN_SERVICES: '/api/urban-services',
    URBAN_CATEGORIES: '/api/urban-services/categories',
    URBAN_BOOKINGS: '/api/urban-services/bookings',
    SAVED_ADDRESSES: '/api/saved-addresses',
  },

  // Helper functions
  getUrl: (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const finalUrl = `${baseUrl}${cleanEndpoint}`;
    return finalUrl;
  },

  // Image URL helpers
  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return API_CONFIG.getUrl(imagePath);
    return API_CONFIG.getUploadUrl(imagePath);
  },

  // Auth headers helper
  getAuthHeaders: () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  // Upload URL helper
  getUploadUrl: (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;

    // If the path already starts with /uploads/, don't add it again
    if (imagePath.startsWith('/uploads/')) {
      const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
      return `${baseUrl}${imagePath}`;
    }

    // Otherwise, add /uploads/ prefix
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    return `${baseUrl}/uploads/${imagePath}`;
  }
};

export default API_CONFIG; 