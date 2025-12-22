import axios from 'axios';
import API_CONFIG from '../config/api.config';

const API_BASE = API_CONFIG.BASE_URL;

class PorterDriverService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      let token = localStorage.getItem('token');
      console.log('PorterDriverService - Token being sent:', token);
      
      // Fallback to demo token for development if no token found
      if (!token) {
        console.warn('PorterDriverService - No token found, using demo-token for development');
        token = 'demo-token';
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('PorterDriverService - API Error:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          console.error('PorterDriverService - Authentication failed');
        }
        return Promise.reject(error);
      }
    );
  }

  async getAllDrivers() {
    try {
      const response = await this.api.get('/api/porter-drivers');
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  }

  async getDriverById(id) {
    try {
      const response = await this.api.get(`/api/porter-drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver:', error);
      throw error;
    }
  }

  async createDriver(driverData) {
    try {
      const response = await this.api.post('/api/porter-drivers', driverData);
      return response.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  async updateDriver(id, driverData) {
    try {
      const response = await this.api.put(`/api/porter-drivers/${id}`, driverData);
      return response.data;
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  }

  async updateDriverStatus(id, statusData) {
    try {
      const response = await this.api.patch(`/api/porter-drivers/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  async deleteDriver(id) {
    try {
      const response = await this.api.delete(`/api/porter-drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  }

  async getDriverVehicles(id) {
    try {
      const response = await this.api.get(`/api/porter-drivers/${id}/vehicles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver vehicles:', error);
      throw error;
    }
  }
}

export default new PorterDriverService(); 