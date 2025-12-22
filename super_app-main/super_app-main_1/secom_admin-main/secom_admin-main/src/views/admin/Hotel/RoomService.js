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

const RoomService = {
  getRoomsForHotel: async (hotelId) => {
    const response = await api.get(`/api/hotels/${hotelId}/rooms-with-booking-status`);
    return response.data.data || response.data || [];
  },
  getRoomById: async (roomId) => {
    const response = await api.get(`/api/rooms/${roomId}`);
    return response.data.data || response.data;
  },
  createRoom: async (hotelId, data) => {
    const response = await api.post(`/api/hotels/${hotelId}/rooms`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data || response.data;
  },
  updateRoom: async (roomId, data) => {
    const response = await api.put(`/api/rooms/${roomId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.data || response.data;
  },
  deleteRoom: async (roomId) => {
    const response = await api.delete(`/api/rooms/${roomId}`);
    return response.data;
  },
};

export default RoomService; 