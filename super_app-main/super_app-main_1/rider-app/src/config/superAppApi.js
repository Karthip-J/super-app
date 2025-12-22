// Super App Backend API Configuration
export const SUPER_APP_API_CONFIG = {
  // Super App Backend Base URL
  BASE_URL: (() => {
    const envUrl = process.env.REACT_APP_SUPER_APP_API_URL;
    const defaultUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5000/api' 
      : 'https://super-app-0ofo.onrender.com/api';
    
    let finalUrl = envUrl || defaultUrl;
    
    // Clean up the URL to prevent double /api
    finalUrl = finalUrl.replace(/\/api\/api/g, '/api'); // Remove double /api
    finalUrl = finalUrl.replace(/\/api\/\/api/g, '/api'); // Remove /api//api
    
    // Ensure exactly one /api prefix is included
    if (!finalUrl.includes('/api')) {
      finalUrl = finalUrl.endsWith('/') ? `${finalUrl}api` : `${finalUrl}/api`;
    }
    
    // Ensure it ends with /api (not /api/)
    finalUrl = finalUrl.replace(/\/api\/$/, '/api');
    
    return finalUrl;
  })(),
  
  // Rider-specific endpoints
  RIDER: {
    REGISTER: '/riders/register',
    LOGIN: '/riders/login',
    PROFILE: '/riders/profile',
    UPDATE_PROFILE: '/riders/profile',
    LOCATION: '/riders/location',
    ONLINE_STATUS: '/riders/online-status',
    ORDERS: {
      AVAILABLE: '/riders/orders/available',
      ALL: '/riders/orders',
      ACCEPT: (orderId) => `/riders/orders/${orderId}/accept`,
      UPDATE_STATUS: (orderId) => `/riders/orders/${orderId}/status`
    },
    EARNINGS: '/riders/earnings'
  },
  
  // Payment endpoints
  PAYMENT: {
    RAZORPAY_KEY: '/payments/razorpay-key',
    CREATE_ORDER: '/payments/create-order',
    VERIFY: '/payments/verify'
  },
  
  // Order endpoints (for different modules)
  ORDERS: {
    ECOMMERCE: '/orders',
    FOOD: '/food-orders',
    GROCERY: '/grocery-orders',
    HOTEL: '/bookings',
    TAXI: '/taxi-rides',
    PORTER: '/porter-bookings'
  },
  
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp'
  }
};

// API Helper Functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${SUPER_APP_API_CONFIG.BASE_URL}${endpoint}`;
  
  // Debug logging for production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔍 API Request Debug:', {
      baseUrl: SUPER_APP_API_CONFIG.BASE_URL,
      endpoint: endpoint,
      fullUrl: url,
      env: process.env.REACT_APP_SUPER_APP_API_URL
    });
  }
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add authentication token if available
  const token = localStorage.getItem('rider-token') || localStorage.getItem('demo-token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      // Extract error message from response
      const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    // If error is already an Error object with message, re-throw it
    if (error.message) {
      throw error;
    }
    // Otherwise, wrap it in an Error
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

// Rider-specific API functions
export const riderAPI = {
  // Authentication
  register: (riderData) => apiRequest(SUPER_APP_API_CONFIG.RIDER.REGISTER, {
    method: 'POST',
    body: JSON.stringify(riderData)
  }),
  
  login: (credentials) => apiRequest(SUPER_APP_API_CONFIG.RIDER.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  // Profile management
  getProfile: () => apiRequest(SUPER_APP_API_CONFIG.RIDER.PROFILE),
  
  updateProfile: (profileData) => apiRequest(SUPER_APP_API_CONFIG.RIDER.UPDATE_PROFILE, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  
  // Location and status
  updateLocation: (locationData) => apiRequest(SUPER_APP_API_CONFIG.RIDER.LOCATION, {
    method: 'POST',
    body: JSON.stringify(locationData)
  }),
  
  toggleOnlineStatus: (isOnline) => apiRequest(SUPER_APP_API_CONFIG.RIDER.ONLINE_STATUS, {
    method: 'PUT',
    body: JSON.stringify({ is_online: isOnline })
  }),
  
  // Orders
  getAvailableOrders: () => apiRequest(SUPER_APP_API_CONFIG.RIDER.ORDERS.AVAILABLE),
  
  getAllOrders: () => apiRequest(SUPER_APP_API_CONFIG.RIDER.ORDERS.ALL),
  
  acceptOrder: (orderId, orderType) => {
    console.log('API: Accepting order', { orderId, orderType });
    return apiRequest(SUPER_APP_API_CONFIG.RIDER.ORDERS.ACCEPT(orderId), {
      method: 'POST',
      body: JSON.stringify({ order_type: orderType })
    });
  },
  
  updateOrderStatus: (orderId, status) => apiRequest(SUPER_APP_API_CONFIG.RIDER.ORDERS.UPDATE_STATUS(orderId), {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  
  // Earnings
  getEarnings: () => apiRequest(SUPER_APP_API_CONFIG.RIDER.EARNINGS)
};

// Payment API functions
export const paymentAPI = {
  getRazorpayKey: () => apiRequest(SUPER_APP_API_CONFIG.PAYMENT.RAZORPAY_KEY),
  
  createPaymentOrder: (paymentData) => apiRequest(SUPER_APP_API_CONFIG.PAYMENT.CREATE_ORDER, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }),
  
  verifyPayment: (verificationData) => apiRequest(SUPER_APP_API_CONFIG.PAYMENT.VERIFY, {
    method: 'POST',
    body: JSON.stringify(verificationData)
  })
};

export default SUPER_APP_API_CONFIG;
