import axios from 'axios';
import API_CONFIG from '../../../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const amenityService = {
  getAllAmenities: () => api.get('/api/amenities'),
  getAmenityById: (id) => api.get(`/api/amenities/${id}`),
  createAmenity: (data) => api.post('/api/amenities', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateAmenity: (id, data) => api.put(`/api/amenities/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAmenity: (id) => api.delete(`/api/amenities/${id}`),
  toggleStatus: (id) => api.patch(`/api/amenities/${id}/toggle-status`),
};

export default amenityService; 