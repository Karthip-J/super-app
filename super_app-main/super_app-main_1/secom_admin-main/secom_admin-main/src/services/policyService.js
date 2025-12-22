import { apiService } from './api.service';

const PolicyService = {
  // Get all policies with pagination and search
  getAllPolicies: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    
    const response = await apiService.get(`/api/policies?${queryParams.toString()}`);
    return response.data;
  },

  // Get policy by ID
  getPolicyById: async (id) => {
    const response = await apiService.get(`/api/policies/${id}`);
    return response.data;
  },

  // Create new policy
  createPolicy: async (data) => {
    const response = await apiService.post('/api/policies', data);
    return response.data;
  },

  // Update policy
  updatePolicy: async (id, data) => {
    const response = await apiService.put(`/api/policies/${id}`, data);
    return response.data;
  },

  // Toggle policy status
  togglePolicyStatus: async (id) => {
    const response = await apiService.patch(`/api/policies/${id}/toggle-status`);
    return response.data;
  },

  // Delete policy
  deletePolicy: async (id) => {
    const response = await apiService.delete(`/api/policies/${id}`);
    return response.data;
  },

  // Get active policies for dropdown/multi-select
  getActivePolicies: async () => {
    const response = await apiService.get('/api/policies?status=true&limit=100');
    return response.data;
  }
};

export default PolicyService; 