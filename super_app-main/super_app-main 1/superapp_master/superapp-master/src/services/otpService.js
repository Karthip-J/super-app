import API_CONFIG from '../config/api.config.js';

export const otpService = {
  // Generate OTP for user
  generateOTP: async (email, phone) => {
    try {
      console.log('OTP Service: Attempting to generate OTP for:', { email, phone });
      const apiUrl = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.OTP_GENERATE);
      console.log('OTP Service: API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone })
      });

      console.log('OTP Service: Response status:', response.status);
      console.log('OTP Service: Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OTP Service: Response not ok:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('OTP Service: Response data:', data);

      if (data.success) {
        return {
          success: true,
          message: data.message || 'OTP generated successfully',
          otp: data.otp
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to generate OTP'
        };
      }
    } catch (error) {
      console.error('OTP Service: Generate OTP error:', error);
      console.error('OTP Service: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.'
      };
    }
  },

  // Verify OTP
  verifyOTP: async (email, phone, otp) => {
    try {
      console.log('OTP Service: Attempting to verify OTP for:', { email, phone, otp });
      const apiUrl = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.OTP_VERIFY);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, phone, otp })
      });

      console.log('OTP Service: Verify response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OTP Service: Verify response not ok:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('OTP Service: Verify response data:', data);

      if (data.success) {
        return {
          success: true,
          message: data.message || 'OTP verified successfully',
          token: data.token,
          data: data
        };
      } else {
        return {
          success: false,
          message: data.message || 'OTP verification failed'
        };
      }
    } catch (error) {
      console.error('OTP Service: Verify OTP error:', error);
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.'
      };
    }
  },

  // Get latest OTP (for development/testing)
  getLatestOTP: async (email, phone) => {
    try {
      console.log('OTP Service: Getting latest OTP for:', { email, phone });

      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (phone) params.append('phone', phone);

      const apiUrl = `${API_CONFIG.getUrl('/api/auth/otp/latest')}?${params}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('OTP Service: Latest OTP data:', data);

      if (data.success) {
        return {
          success: true,
          otp: data.otp
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to get latest OTP'
        };
      }
    } catch (error) {
      console.error('OTP Service: Get latest OTP error:', error);
      return {
        success: false,
        message: error.message || 'Network error. Please check your connection.'
      };
    }
  }
}; 