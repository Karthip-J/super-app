import { apiService } from './api.service';

const LocationService = {
  // Get all locations with pagination and search
  getAllLocations: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    
    return apiService.get(`/api/locations?${queryParams.toString()}`);
  },

  // Get location by ID
  getLocationById: (id) => apiService.get(`/api/locations/${id}`),

  // Create new location
  createLocation: (data) => apiService.post('/api/locations', data),

  // Update location
  updateLocation: (id, data) => apiService.put(`/api/locations/${id}`, data),

  // Toggle location status
  toggleLocationStatus: (id) => apiService.patch(`/api/locations/${id}/toggle-status`),

  // Delete location
  deleteLocation: (id) => apiService.delete(`/api/locations/${id}`),

  // Get active locations for dropdown/multi-select
  getActiveLocations: () => apiService.get('/api/locations?status=true&limit=100')
};

export default LocationService; 