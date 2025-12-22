// Authentication Service - Integrated with Super App Backend
import { riderAPI } from '../config/superAppApi';

class AuthService {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.sessionToken = null;
    this.baseURL = process.env.REACT_APP_SUPER_APP_API_URL || 'http://localhost:5000/api';
  }

  // Login with email/phone and password - Integrated with Super App Backend
  async login(identifier, password) {
    try {
      const response = await riderAPI.login({
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        password: password
      });

      if (response.success) {
        this.isAuthenticated = true;
        this.currentUser = response.data;
        this.sessionToken = response.token;
        
        // Store in localStorage for persistence
        localStorage.setItem('rider-token', response.token);
        localStorage.setItem('rider-user', JSON.stringify(response.data));
        localStorage.setItem('rider-session', JSON.stringify({
          token: response.token,
          user: response.data,
          timestamp: Date.now()
        }));

        return {
          success: true,
          user: response.data,
          token: response.token
        };
      } else {
        return {
          success: false,
          error: response.message || 'Login failed'
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

  // Logout
  logout() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.sessionToken = null;
    
    // Clear localStorage
    localStorage.removeItem('rider-token');
    localStorage.removeItem('rider-user');
    localStorage.removeItem('rider-session');
    localStorage.removeItem('superdelivery_session'); // Legacy cleanup
    
    return { success: true };
  }

  // Check if user is authenticated
  isLoggedIn() {
    // Check localStorage for existing session
    const token = localStorage.getItem('rider-token');
    const user = localStorage.getItem('rider-user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.isAuthenticated = true;
        this.currentUser = userData;
        this.sessionToken = token;
        return true;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
        return false;
      }
    }
    
    // Legacy session check
    const session = localStorage.getItem('superdelivery_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = Date.now();
        const sessionAge = now - sessionData.timestamp;
        
        // Session expires after 24 hours
        if (sessionAge < 24 * 60 * 60 * 1000) {
          this.isAuthenticated = true;
          this.currentUser = sessionData.user;
          this.sessionToken = sessionData.token;
          return true;
        } else {
          // Session expired
          localStorage.removeItem('superdelivery_session');
        }
      } catch (error) {
        localStorage.removeItem('superdelivery_session');
      }
    }
    
    return this.isAuthenticated;
  }

  // Get current user
  getCurrentUser() {
    if (!this.currentUser) {
      const user = localStorage.getItem('rider-user');
      if (user) {
        try {
          this.currentUser = JSON.parse(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    return this.currentUser;
  }

  // Get session token
  getToken() {
    if (!this.sessionToken) {
      this.sessionToken = localStorage.getItem('rider-token');
    }
    return this.sessionToken;
  }

  // Update user profile
  updateProfile(updates) {
    if (this.currentUser) {
      this.currentUser = {
        ...this.currentUser,
        ...updates
      };
      
      // Update in localStorage
      const session = localStorage.getItem('superdelivery_session');
      if (session) {
        const sessionData = JSON.parse(session);
        sessionData.user = this.currentUser;
        localStorage.setItem('superdelivery_session', JSON.stringify(sessionData));
      }
      
      return { success: true, user: this.currentUser };
    }
    
    return { success: false, error: 'No user logged in' };
  }

  // Change password
  changePassword(currentPassword, newPassword) {
    if (!this.currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    if (this.currentUser.password !== currentPassword) {
      return { success: false, error: 'Current password is incorrect' };
    }

    this.currentUser.password = newPassword;
    
    // Update in localStorage
    const session = localStorage.getItem('superdelivery_session');
    if (session) {
      const sessionData = JSON.parse(session);
      sessionData.user = this.currentUser;
      localStorage.setItem('superdelivery_session', JSON.stringify(sessionData));
    }
    
    return { success: true };
  }

  // Forgot password (simulate OTP)
  forgotPassword(identifier) {
    const user = this.users.find(u => u.email === identifier || u.phone === identifier);
    
    if (user) {
      // In real app, this would send OTP via SMS/Email
      const otp = Math.floor(100000 + Math.random() * 900000);
      
      // Store OTP temporarily (in real app, this would be in database)
      sessionStorage.setItem('reset_otp', otp.toString());
      sessionStorage.setItem('reset_identifier', identifier);
      
      return {
        success: true,
        message: `OTP sent to ${identifier}`,
        otp: otp // In real app, this wouldn't be returned
      };
    }
    
    return { success: false, error: 'User not found' };
  }

  // Reset password with OTP
  resetPassword(otp, newPassword) {
    const storedOtp = sessionStorage.getItem('reset_otp');
    const identifier = sessionStorage.getItem('reset_identifier');
    
    if (storedOtp && storedOtp === otp.toString()) {
      const user = this.users.find(u => u.email === identifier || u.phone === identifier);
      
      if (user) {
        user.password = newPassword;
        
        // Clear stored OTP
        sessionStorage.removeItem('reset_otp');
        sessionStorage.removeItem('reset_identifier');
        
        return { success: true, message: 'Password reset successfully' };
      }
    }
    
    return { success: false, error: 'Invalid OTP' };
  }

  // Generate session token
  generateToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Validate token
  validateToken(token) {
    return token === this.sessionToken;
  }

  // Get user by ID
  getUserById(userId) {
    return this.users.find(u => u.id === userId);
  }

  // Check if user exists
  userExists(identifier) {
    return this.users.some(u => u.email === identifier || u.phone === identifier);
  }

  // Register new user - Integrated with Super App Backend
  async register(userData) {
    try {
      const response = await riderAPI.register(userData);

      if (response.success) {
        // Auto-login after successful registration
        this.isAuthenticated = true;
        this.currentUser = response.data;
        this.sessionToken = response.token;
        
        // Store in localStorage
        localStorage.setItem('rider-token', response.token);
        localStorage.setItem('rider-user', JSON.stringify(response.data));
        localStorage.setItem('rider-session', JSON.stringify({
          token: response.token,
          user: response.data,
          timestamp: Date.now()
        }));

        return {
          success: true,
          user: response.data,
          token: response.token
        };
      } else {
        return {
          success: false,
          error: response.message || 'Registration failed'
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

  // Get demo credentials
  getDemoCredentials() {
    return {
      email: 'captain@pilot.com',
      password: 'password123'
    };
  }
}

const authService = new AuthService();

export default authService; 