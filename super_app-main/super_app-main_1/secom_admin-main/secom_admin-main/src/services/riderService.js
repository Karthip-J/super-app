import { apiService as api } from './api.service';

const riderService = {
  // Get all riders (admin only)
  getAllRiders: async () => {
    try {
      const response = await api.get('/api/riders');
      return response.data;
    } catch (error) {
      console.error('Error fetching riders:', error);
      throw error;
    }
  },

  // Get rider by ID
  getRiderById: async (id) => {
    try {
      const response = await api.get(`/api/riders/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rider:', error);
      throw error;
    }
  },

  // Update rider status
  updateRiderStatus: async (id, status) => {
    try {
      const response = await api.put(`/api/riders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating rider status:', error);
      throw error;
    }
  },

  // Get rider orders
  getRiderOrders: async (riderId) => {
    try {
      const response = await api.get(`/api/riders/${riderId}/orders`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rider orders:', error);
      throw error;
    }
  },

  // Get rider earnings
  getRiderEarnings: async (riderId) => {
    try {
      const response = await api.get(`/api/riders/${riderId}/earnings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rider earnings:', error);
      throw error;
    }
  },

  // Get all order assignments
  getAllOrderAssignments: async () => {
    try {
      const response = await api.get('/api/order-assignments');
      return response.data;
    } catch (error) {
      console.error('Error fetching order assignments:', error);
      throw error;
    }
  },

  // Update order assignment status
  updateOrderAssignmentStatus: async (assignmentId, status) => {
    try {
      const response = await api.put(`/api/order-assignments/${assignmentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order assignment status:', error);
      throw error;
    }
  }
};

export default riderService;
