import { apiService as api } from './api.service';

const quickLinkService = {
  // Get all quick links (admin)
  getAllQuickLinks: async () => {
    try {
      const response = await api.get('/api/quick-links/admin');
      // The api.get() returns response.data, but we need to return the full response structure
      return response;
    } catch (error) {
      console.error('Error fetching quick links:', error);
      throw error;
    }
  },

  // Get quick links for frontend
  getQuickLinks: async () => {
    try {
      const response = await api.get('/api/quick-links');
      return response;
    } catch (error) {
      console.error('Error fetching quick links:', error);
      throw error;
    }
  },

  // Create quick link
  createQuickLink: async (data) => {
    try {
      const response = await api.post('/api/quick-links', data);
      return response;
    } catch (error) {
      console.error('Error creating quick link:', error);
      throw error;
    }
  },

  // Update quick link
  updateQuickLink: async (id, data) => {
    try {
      const response = await api.put(`/api/quick-links/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating quick link:', error);
      throw error;
    }
  },

  // Delete quick link
  deleteQuickLink: async (id) => {
    try {
      const response = await api.delete(`/api/quick-links/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting quick link:', error);
      throw error;
    }
  },

  // Bulk create quick links
  bulkCreateQuickLinks: async (productIds) => {
    try {
      const response = await api.post('/api/quick-links/bulk', { product_ids: productIds });
      return response;
    } catch (error) {
      console.error('Error bulk creating quick links:', error);
      throw error;
    }
  },

  // Get products by category and subcategory
  getProductsForSelection: async (categoryId, subcategoryId = null) => {
    try {
      const endpoint = subcategoryId 
        ? `/api/quick-links/products/${categoryId}/${subcategoryId}`
        : `/api/quick-links/products/${categoryId}`;
      
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching products for selection:', error);
      throw error;
    }
  }
};

export default quickLinkService;
