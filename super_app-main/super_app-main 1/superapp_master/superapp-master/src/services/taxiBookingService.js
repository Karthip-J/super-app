// Service for taxi booking and driver assignment
import API_CONFIG from "../config/api.config.js";
import axios from 'axios';

const DRIVERS_URL = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TAXI_DRIVERS);
const RIDES_URL = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TAXI_RIDES);

export async function getAvailableDrivers() {
  try {
    const token = localStorage.getItem('token') || 'demo-token';
    const res = await axios.get(DRIVERS_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.data || [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Fetch drivers API failed:', err);
    return null;
  }
}

export async function getSmartDriverAssignment() {
  try {
    const token = localStorage.getItem('token') || 'demo-token';
    const res = await axios.get(`${DRIVERS_URL}/available/assign`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('🚕 Smart driver assignment response:', res.data);
    return res.data.data || null;
  } catch (err) {
    console.warn('Smart driver assignment failed:', err);
    return null;
  }
}

export async function createRide(rideData) {
  try {
    const token = localStorage.getItem('token') || 'demo-token';
    const res = await axios.post(RIDES_URL, rideData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Create ride API failed:', err);
    return null;
  }
} 