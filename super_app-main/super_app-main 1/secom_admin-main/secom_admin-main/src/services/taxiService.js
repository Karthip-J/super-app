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
    console.log('Request interceptor - Token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization);
    } else {
      console.log('No token found in localStorage');
    }
    console.log('Request config:', config);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response interceptor - Error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

const taxiService = {
  // Taxi Rides
  getAllTaxiRides: async () => {
    try {
      const response = await api.get('/api/taxi-rides');
      return response.data;
    } catch (error) {
      console.error('Error fetching taxi rides:', error);
      throw error;
    }
  },
  
  getTaxiRideById: async (id) => {
    try {
      const response = await api.get(`/api/taxi-rides/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching taxi ride:', error);
      throw error;
    }
  },
  
  createTaxiRide: async (data) => {
    try {
      const response = await api.post('/api/taxi-rides', data);
      return response.data;
    } catch (error) {
      console.error('Error creating taxi ride:', error);
      throw error;
    }
  },
  
  updateTaxiRide: async (id, data) => {
    try {
      const response = await api.put(`/api/taxi-rides/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating taxi ride:', error);
      throw error;
    }
  },
  
  deleteTaxiRide: async (id) => {
    try {
      const response = await api.delete(`/api/taxi-rides/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting taxi ride:', error);
      throw error;
    }
  },

  // Taxi Drivers
  getAllTaxiDrivers: async () => {
    try {
      console.log('Fetching all taxi drivers...');
      const response = await api.get('/api/taxi-drivers');
      console.log('Taxi drivers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching taxi drivers:', error);
      throw error;
    }
  },
  
  getTaxiDriverById: async (id) => {
    try {
      console.log('Fetching taxi driver by ID:', id);
      const response = await api.get(`/api/taxi-drivers/${id}`);
      console.log('Taxi driver by ID response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching taxi driver:', error);
      throw error;
    }
  },
  
  createTaxiDriver: async (data) => {
    try {
      console.log('Creating taxi driver with data:', data);
      const response = await api.post('/api/taxi-drivers', data);
      console.log('Create taxi driver response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating taxi driver:', error);
      throw error;
    }
  },
  
  updateTaxiDriver: async (id, data) => {
    try {
      console.log('Updating taxi driver with ID:', id, 'and data:', data);
      const response = await api.put(`/api/taxi-drivers/${id}`, data);
      console.log('Update taxi driver response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating taxi driver:', error);
      throw error;
    }
  },
  
  deleteTaxiDriver: async (id) => {
    try {
      console.log('Deleting taxi driver with ID:', id);
      const response = await api.delete(`/api/taxi-drivers/${id}`);
      console.log('Delete taxi driver response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting taxi driver:', error);
      throw error;
    }
  },

  // Taxi Vehicles
  getAllTaxiVehicles: async () => {
    try {
      console.log('Fetching all taxi vehicles...');
      const response = await api.get('/api/taxi-vehicles');
      console.log('Taxi vehicles response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching taxi vehicles:', error);
      throw error;
    }
  },
  
  getTaxiVehicleById: async (id) => {
    try {
      console.log('Fetching taxi vehicle by ID:', id);
      const response = await api.get(`/api/taxi-vehicles/${id}`);
      console.log('Taxi vehicle by ID response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching taxi vehicle:', error);
      throw error;
    }
  },
  
  createTaxiVehicle: async (data) => {
    try {
      console.log('Creating taxi vehicle with data:', data);
      const response = await api.post('/api/taxi-vehicles', data);
      console.log('Create taxi vehicle response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating taxi vehicle:', error);
      throw error;
    }
  },
  
  updateTaxiVehicle: async (id, data) => {
    try {
      console.log('Updating taxi vehicle with ID:', id, 'and data:', data);
      const response = await api.put(`/api/taxi-vehicles/${id}`, data);
      console.log('Update taxi vehicle response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating taxi vehicle:', error);
      throw error;
    }
  },
  
  deleteTaxiVehicle: async (id) => {
    try {
      console.log('Deleting taxi vehicle with ID:', id);
      const response = await api.delete(`/api/taxi-vehicles/${id}`);
      console.log('Delete taxi vehicle response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting taxi vehicle:', error);
      throw error;
    }
  },
};

export default taxiService; 