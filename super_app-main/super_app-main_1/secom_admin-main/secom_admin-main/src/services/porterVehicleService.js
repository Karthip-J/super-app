import axios from 'axios';
import API_CONFIG from '../config/api.config';

const API_BASE = API_CONFIG.BASE_URL;

class PorterVehicleService {
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
      
      // Fallback to demo token for development if no token found
      if (!token) {
        console.warn('PorterVehicleService - No token found, using demo-token for development');
        token = 'demo-token';
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getAllVehicles() {
    try {
      const response = await this.api.get('/api/porter-vehicles');
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  async getVehicleById(id) {
    try {
      const response = await this.api.get(`/api/porter-vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  }

  async createVehicle(vehicleData) {
    try {
      const response = await this.api.post('/api/porter-vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  async updateVehicle(id, vehicleData) {
    try {
      const response = await this.api.put(`/api/porter-vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  async updateVehicleStatus(id, statusData) {
    try {
      const response = await this.api.patch(`/api/porter-vehicles/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  }

  async deleteVehicle(id) {
    try {
      const response = await this.api.delete(`/api/porter-vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }

  async getVehiclesByDriver(driverId) {
    try {
      const response = await this.api.get(`/api/porter-vehicles/driver/${driverId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching driver vehicles:', error);
      throw error;
    }
  }

  async getVehiclesByType(vehicleType) {
    try {
      const response = await this.api.get(`/api/porter-vehicles/type/${vehicleType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles by type:', error);
      throw error;
    }
  }
}

export default new PorterVehicleService(); 