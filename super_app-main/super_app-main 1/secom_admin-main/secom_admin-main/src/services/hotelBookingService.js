import API_CONFIG from '../config/api.config';

const API_BASE = API_CONFIG.BASE_URL;

class HotelBookingService {
  async getAllBookings() {
    try {
      const token = localStorage.getItem('token') || 'demo-token';
      const response = await fetch(`${API_BASE}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotel bookings');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching hotel bookings:', error);
      throw error;
    }
  }

  async getBookingById(bookingId) {
    try {
      const token = localStorage.getItem('token') || 'demo-token';
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw error;
    }
  }

  async updateBookingStatus(bookingId, status) {
    try {
      const token = localStorage.getItem('token') || 'demo-token';
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ booking_status: status })
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  async deleteBooking(bookingId) {
    try {
      const token = localStorage.getItem('token') || 'demo-token';
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete booking');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }
}

export default new HotelBookingService(); 