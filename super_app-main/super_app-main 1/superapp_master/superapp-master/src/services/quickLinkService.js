import axios from 'axios';
import API_CONFIG from '../config/api.config';

const quickLinkService = {
  // Get all active quick links for frontend display
  getQuickLinks: async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quick-links`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quick links:', error);
      throw error;
    }
  },

  // Get quick links with fallback to demo data
  getQuickLinksWithFallback: async () => {
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/quick-links`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quick links, using fallback:', error);
      // Return empty array as fallback
      return {
        success: true,
        data: [],
        message: 'Using fallback data'
      };
    }
  }
};

export default quickLinkService;
