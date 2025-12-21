// Service for recent taxi locations API
import API_CONFIG from "../config/api.config.js";
import axios from 'axios';

const API_URL = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TAXI_RECENT_LOCATIONS);

export async function getRecentLocations() {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(API_URL, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data.data || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Recent locations API failed:', err);
    return null;
  }
}

export async function addRecentLocation(location) {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(API_URL, location, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return res.data.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Add recent location API failed:', err);
    return null;
  }
}

export async function deleteRecentLocation(id) {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Delete recent location API failed:', err);
    return false;
  }
} 