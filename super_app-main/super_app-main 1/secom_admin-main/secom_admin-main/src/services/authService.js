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
    // console.log("token================================>",token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
      
      // Only redirect if not already on login page
      if (window.location.pathname !== API_CONFIG.ROUTES.LOGIN) {
        window.location.href = API_CONFIG.ROUTES.LOGIN;
      }
    }
    return Promise.reject(error);
  }
);

const setAuthData = (data) => {
  if (data.data && data.data.token) {
    localStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.data.token);
    
    // Set token expiration (default to 24 hours if not provided)
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    localStorage.setItem(
      API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION, 
      String(Date.now() + expiresIn)
    );

    // Store user data if available
    if (data.data.user) {
      localStorage.setItem(
        API_CONFIG.STORAGE_KEYS.USER_DATA, 
        JSON.stringify(data.data.user)
      );
    }
  }
  return data;
};

export const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post(API_CONFIG.AUTH.REGISTER, userData);
      setAuthData(response.data);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        throw error.response.data;
      }
      throw { 
        success: false,
        message: 'Registration failed. Please try again.',
        error: error.message 
      };
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('authService.login called with:', credentials);
      const response = await api.post(API_CONFIG.AUTH.LOGIN, credentials);
      console.log('API response:', response.data);
      
      if (response.data.success && response.data.data?.token) {
        console.log('Login successful, storing token...');
        // Store token consistently
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
        console.log('Token stored in localStorage');
        
        // Set token expiration (default to 24 hours if not provided)
        const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const expirationTime = Date.now() + expiresIn;
        localStorage.setItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION, String(expirationTime));
        console.log('Token expiration set to:', new Date(expirationTime));

        // Store user data if available
        if (response.data.data.user) {
          localStorage.setItem(
            API_CONFIG.STORAGE_KEYS.USER_DATA, 
            JSON.stringify(response.data.data.user)
          );
          console.log('User data stored');
        }

        // Verify storage
        const storedToken = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        const storedExpiration = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
        console.log('Verification - Stored token:', storedToken ? 'Present' : 'Missing');
        console.log('Verification - Stored expiration:', storedExpiration);

        return {
          success: true,
          message: 'Login successful',
          data: response.data.data
        };
      }
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'Invalid credentials'
        };
      }
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post(API_CONFIG.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth-related items
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userData = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    const expiration = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
    
    console.log('isAuthenticated check:', {
      hasToken: !!token,
      hasExpiration: !!expiration,
      currentTime: Date.now(),
      expirationTime: expiration ? parseInt(expiration) : 'none',
      isExpired: expiration ? (Date.now() > parseInt(expiration)) : 'no expiration'
    });
    
    if (!token) return false;

    if (expiration && Date.now() > parseInt(expiration)) {
      // Token has expired, clear auth data
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
      return false;
    }

    return true;
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get(API_CONFIG.AUTH.PROFILE);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data || {
        success: false,
        message: 'Failed to fetch profile',
        error: error.message
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(API_CONFIG.AUTH.PROFILE, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { 
        success: false,
        message: 'Failed to update profile. Please try again.',
        error: error.message
      };
    }
  },

  getToken: () => {
    return localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  getUserData: () => {
    const userData = localStorage.getItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }
};