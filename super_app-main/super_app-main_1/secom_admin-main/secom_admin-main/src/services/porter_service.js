import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Helper function to get auth token with fallback
const getAuthToken = () => {
  // Try admin panel token first, then fallback to regular token
  const adminToken = localStorage.getItem('OnlineShop-accessToken');
  const regularToken = localStorage.getItem('token');
  const token = adminToken || regularToken || 'demo-token';
  
  return token;
};

// Porter Driver APIs
export const getAvailableDrivers = async (vehicleType = null) => {
  try {
    const token = getAuthToken();
    const url = vehicleType 
      ? `${API_BASE_URL}/api/porter-drivers/available?vehicle_type=${vehicleType}`
      : `${API_BASE_URL}/api/porter-drivers/available`;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    throw error;
  }
};

export const getAllDrivers = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/api/porter-drivers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all drivers:', error);
    throw error;
  }
};

// Porter Booking APIs
export const createPorterBooking = async (bookingData) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${API_BASE_URL}/api/porter-bookings`, bookingData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating porter booking:', error);
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/api/porter-bookings/my-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/api/porter-bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const token = getAuthToken();
    const response = await axios.patch(`${API_BASE_URL}/api/porter-bookings/${bookingId}/status`, 
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const addBookingRating = async (bookingId, rating, review) => {
  try {
    const token = getAuthToken();
    const response = await axios.patch(`${API_BASE_URL}/api/porter-bookings/${bookingId}/rating`, 
      { rating, review },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error adding rating:', error);
    throw error;
  }
};

// Admin APIs (for admin panel)
export const getAllBookings = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/api/porter-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

export const updateDriverStatus = async (driverId, status) => {
  try {
    const token = getAuthToken();
    const response = await axios.patch(`${API_BASE_URL}/api/porter-drivers/${driverId}/status`, 
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating driver status:', error);
    throw error;
  }
};

export const updateDriverLocation = async (driverId, latitude, longitude, address) => {
  try {
    const token = getAuthToken();
    const response = await axios.patch(`${API_BASE_URL}/api/porter-drivers/${driverId}/location`, 
      { latitude, longitude, address },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
}; 