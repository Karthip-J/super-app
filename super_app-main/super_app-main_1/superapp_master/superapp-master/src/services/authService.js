import API_CONFIG from '../config/api.config.js';



// Storage keys for authentication
const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER_DATA: 'userData',
  TOKEN_EXPIRATION: 'tokenExpiration'
};

// Helper function to get headers with authentication
const getHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Helper function to set authentication data
const setAuthData = (data) => {
  if (data.data && data.data.token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.data.token);
    localStorage.setItem('isLoggedIn', 'true'); // Added for ProtectedRoute consistency

    // Set token expiration (default to 24 hours if not provided)
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    localStorage.setItem(
      STORAGE_KEYS.TOKEN_EXPIRATION,
      String(Date.now() + expiresIn)
    );

    // Store user data if available
    if (data.data.user) {
      localStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(data.data.user)
      );
    }
  }
  return data;
};

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        // Store authentication data
        setAuthData(data);

        return {
          success: true,
          message: 'Login successful',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.REGISTER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        // Store authentication data
        setAuthData(data);

        return {
          success: true,
          message: 'Registration successful',
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  },

  // Logout user
  logout: () => {
    // Clear all auth-related items
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRATION);
  },

  // Get current user
  getCurrentUser: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;

    const expiration = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRATION);
    if (expiration && Date.now() > parseInt(expiration)) {
      // Token has expired, clear auth data
      authService.logout();
      return false;
    }

    return true;
  },

  // Get user profile
  getProfile: async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PROFILE), {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Get token
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Get user data
  getUserData: () => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  // Helper function to make authenticated API requests
  apiRequest: async (url, options = {}) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token is invalid or expired
      authService.logout();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  }
};

export { getHeaders, STORAGE_KEYS }; 