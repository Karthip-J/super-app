// Rider API Service - Replace localStorage with real backend calls
class RiderAPIService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api';
    this.token = localStorage.getItem('rider_token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    localStorage.setItem('rider_token', token);
  }

  // Clear auth token
  clearToken() {
    this.token = null;
    localStorage.removeItem('rider_token');
  }

  // Get auth headers
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Authentication
  async login(identifier, password) {
    try {
      const response = await fetch(`${this.baseURL}/riders/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: identifier.includes('@') ? identifier : undefined,
          phone: !identifier.includes('@') ? identifier : undefined,
          password
        })
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.token);
        return {
          success: true,
          user: data.data,
          token: data.token
        };
      } else {
        return {
          success: false,
          error: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${this.baseURL}/riders/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.token);
        return {
          success: true,
          user: data.data,
          token: data.token
        };
      } else {
        return {
          success: false,
          error: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  async logout() {
    this.clearToken();
    return { success: true };
  }

  // Profile management
  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/riders/profile`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          user: data.data
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  async updateProfile(updates) {
    try {
      const response = await fetch(`${this.baseURL}/riders/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          user: data.data
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Location tracking
  async updateLocation(latitude, longitude) {
    try {
      const response = await fetch(`${this.baseURL}/riders/location`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ latitude, longitude })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Update location error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Online status
  async toggleOnlineStatus() {
    try {
      const response = await fetch(`${this.baseURL}/riders/online-status`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Toggle online status error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Order management
  async getAvailableOrders(vehicleType = null) {
    try {
      let url = `${this.baseURL}/riders/orders/available`;
      const params = new URLSearchParams();

      if (vehicleType) params.append('vehicle_type', vehicleType);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Get available orders error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }
  async acceptOrder(orderId) {
    try {
      const response = await fetch(`${this.baseURL}/riders/orders/${orderId}/accept`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Accept order error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }
  async updateOrderStatus(orderId, status, additionalData = {}) {
    try {
      const response = await fetch(`${this.baseURL}/riders/orders/${orderId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          status,
          ...additionalData
        })
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Update order status error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }
  async getRiderOrders(status = null, page = 1, limit = 50) {
    try {
      let url = `${this.baseURL}/riders/orders`;
      const params = new URLSearchParams();

      if (status) params.append('status', status);
      params.append('page', page);
      params.append('limit', limit);

      url += `?${params.toString()}`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data,
          pagination: data.pagination
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Get rider orders error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }
  // Earnings
  async getEarnings(period = 'all') {
    try {
      const response = await fetch(`${this.baseURL}/riders/earnings?period=${period}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          data: data.data
        };
      } else {
        return {
          success: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Get earnings error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Check if user is authenticated
  isLoggedIn() {
    return !!this.token;
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Demo data fallback (for development/testing)
  getDemoCredentials() {
    return {
      email: 'rider@superdelivery.com',
      phone: '+91 98765 43210',
      password: 'password123'
    };
  }
}

// Create singleton instance
const riderAPIService = new RiderAPIService();

export default riderAPIService;
