import axios from 'axios';
import API_CONFIG from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AmenityService = {
  getAllAmenities: async () => {
    const response = await api.get('/api/amenities');
    return response;
  },
  
  getActiveAmenities: async () => {
    const response = await api.get('/api/amenities?status=active');
    return response.data;
  },
  
  getAmenityById: async (id) => {
    const response = await api.get(`/api/amenities/${id}`);
    return response.data;
  },
  
  createAmenity: async (data) => {
    const response = await api.post('/api/amenities', data, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
    return response.data;
  },
  
  updateAmenity: async (id, data) => {
    const response = await api.put(`/api/amenities/${id}`, data, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
    return response.data;
  },
  
  deleteAmenity: async (id) => {
    const response = await api.delete(`/api/amenities/${id}`);
    return response.data;
  },
  
  toggleStatus: async (id) => {
    const response = await api.patch(`/api/amenities/${id}/toggle-status`);
    return response.data;
  }
};

export default AmenityService; 