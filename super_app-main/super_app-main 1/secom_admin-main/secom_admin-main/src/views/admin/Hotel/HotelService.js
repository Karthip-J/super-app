import axios from 'axios';
import API_CONFIG from '../../../config/api.config';

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

const HotelService = {
  getAllHotels: async () => {
    console.log('HotelService: Making API call to /api/hotels');
    const response = await api.get('/api/hotels');
    console.log('HotelService: Raw response:', response);
    console.log('HotelService: Response data:', response.data);
    const result = response.data.data || response.data || [];
    console.log('HotelService: Returning:', result);
    return result;
  },
  getHotelById: async (id) => {
    const response = await api.get(`/api/hotels/${id}`);
    return response.data.data || response.data;
  },
  createHotel: async (data) => {
    const response = await api.post('/api/hotels', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data || response.data;
  },
  updateHotel: async (id, data) => {
    const response = await api.put(`/api/hotels/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data || response.data;
  },
  deleteHotel: async (id) => {
    const response = await api.delete(`/api/hotels/${id}`);
    return response.data;
  },
  getPolicies: () => api.get('/api/policies'),
  getFAQs: () => api.get('/api/faqs'),
  getLocations: () => api.get('/api/locations'),
  getRoomsWithBookingStatus: async (hotelId) => {
    const response = await api.get(`/api/hotels/${hotelId}/rooms-with-booking-status`);
    return response.data.data || response.data;
  },
  getRoomsForHotel: async (hotelId) => {
    const response = await api.get(`/api/hotels/${hotelId}/rooms-with-booking-status`);
    return response.data.data || response.data || [];
  },
  // New methods for amenities and policies
  getAllAmenities: async () => {
    const response = await api.get('/api/amenities');
    return response.data.data || response.data || [];
  },
  getAllPolicies: async () => {
    const response = await api.get('/api/policies');
    return response.data.data || response.data || [];
  },
};

export default HotelService; 