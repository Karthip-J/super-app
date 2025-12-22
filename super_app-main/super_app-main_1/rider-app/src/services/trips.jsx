// Trip Management Service - Integrated with Super App Backend
import { riderAPI } from '../config/superAppApi';

class TripService {
  constructor() {
    this.activeTrip = null;
    this.rideRequests = [];
    this.isLoading = false;
  }

  // Get all trips with filtering from backend
  async getTrips(status = 'all') {
    try {
      this.isLoading = true;
      const response = await riderAPI.getAllOrders();
      
      if (response.success) {
        let trips = response.data || [];
        
        // Filter by status if specified
        if (status !== 'all') {
          trips = trips.filter(trip => trip.status === status);
        }
        
        // Transform backend data to frontend format
        return trips.map(trip => this._transformTripData(trip));
      }
      return [];
    } catch (error) {
      console.error('Error fetching trips:', error);
      return [];
    } finally {
      this.isLoading = false;
    }
  }
  // Get trip by ID from backend
  async getTripById(id) {
    try {
      const trips = await this.getTrips();
      return trips.find(trip => trip.id === id);
    } catch (error) {
      console.error('Error fetching trip by ID:', error);
      return null;
    }
  }

  // Get available orders from backend
  async getAvailableOrders() {
    try {
      this.isLoading = true;
      const response = await riderAPI.getAvailableOrders();
      
      if (response.success) {
        let orders = response.data || [];
        
        // Transform to ride request format
        return orders.map(order => this._transformToRideRequest(order));
      }
      return [];
    } catch (error) {
      console.error('Error fetching available orders:', error);
      return [];
    } finally {
      this.isLoading = false;
    }
  }

  // Accept an order
  async acceptOrder(orderId, orderType = null) {
    try {
      // If orderType is not provided, try to get it from available orders
      let finalOrderType = orderType;
      if (!finalOrderType) {
        const orders = await this.getAvailableOrders();
        const order = orders.find(o => (o.id === orderId || o.order_id === orderId));
        if (order) {
          finalOrderType = order.order_type || order.type || 'grocery';
        }
      }
      
      if (!finalOrderType) {
        console.error('Order type is required to accept order');
        throw new Error('Order type is required to accept order');
      }
      
      console.log('Accepting order with:', { orderId, orderType: finalOrderType });
      
      const response = await riderAPI.acceptOrder(orderId, finalOrderType);
      
      console.log('Accept order response:', response);
      
      if (response.success) {
        // Create active trip from accepted order
        const activeTrip = {
          id: orderId,
          status: 'accepted',
          startTime: new Date().toISOString(),
          ...response.data
        };
        
        this.activeTrip = activeTrip;
        return activeTrip;
      } else {
        throw new Error(response.message || response.error || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error; // Re-throw to let caller handle it
    }
  }
  // Update trip status
  async updateTripStatus(tripId, status, additionalData = {}) {
    try {
      const response = await riderAPI.updateOrderStatus(tripId, {
        status,
        ...additionalData
      });      
      if (response.success) {
        // Update active trip if it matches
        if (this.activeTrip && this.activeTrip.id === tripId) {
          this.activeTrip = {
            ...this.activeTrip,
            status,
            ...additionalData
          };
          
          if (status === 'completed' || status === 'cancelled') {
            this.activeTrip = null;
          }
        }
        
        return this.activeTrip;
      }
      return null;
    } catch (error) {
      console.error('Error updating trip status:', error);
      return null;
    }
  }

  // Get active trip
  getActiveTrip() {
    return this.activeTrip;
  }

  // Add ride request (for local tracking)
  addRideRequest(request) {
    const newRequest = {
      id: `RIDE${Date.now()}`,
      ...request,
      timestamp: new Date().toISOString()
    };
    this.rideRequests.push(newRequest);
    return newRequest;
  }

  // Get pending ride requests
  getRideRequests() {
    return this.rideRequests;
  }

  // Accept ride request
  async acceptRideRequest(requestId) {
    try {
      const request = this.rideRequests.find(req => req.id === requestId);
      if (!request) return null;

      // Accept the order in backend
      const result = await this.acceptOrder(request.order_id);      
      if (result) {
        // Remove from local requests
        this.rideRequests = this.rideRequests.filter(req => req.id !== requestId);
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error accepting ride request:', error);
      return null;
    }
  }

  // Reject ride request
  rejectRideRequest(requestId) {
    this.rideRequests = this.rideRequests.filter(req => req.id !== requestId);
  }

  // Get trip statistics from backend
  async getTripStats() {
    try {
      const trips = await this.getTrips();
      
      const stats = {
        total: trips.length,
        completed: trips.filter(trip => trip.status === 'completed').length,
        active: trips.filter(trip => trip.status === 'active' || trip.status === 'accepted').length,
        cancelled: trips.filter(trip => trip.status === 'cancelled').length,
        totalEarnings: trips
          .filter(trip => trip.status === 'completed')
          .reduce((sum, trip) => sum + (trip.earnings || 0), 0),
        averageRating: this.getAverageRating(trips)
      };
      
      return stats;
    } catch (error) {
      console.error('Error getting trip stats:', error);
      return {
        total: 0,
        completed: 0,
        active: 0,
        cancelled: 0,
        totalEarnings: 0,
        averageRating: 0
      };
    }
  }

  // Calculate average rating
  getAverageRating(trips = null) {
    try {
      const tripList = trips || this.trips || [];
      const ratedTrips = tripList.filter(trip => trip.rating && trip.rating > 0);
      
      if (ratedTrips.length === 0) return 0;
      
      const totalRating = ratedTrips.reduce((sum, trip) => sum + trip.rating, 0);
      return Math.round((totalRating / ratedTrips.length) * 10) / 10;
    } catch (error) {
      console.error('Error calculating average rating:', error);
      return 0;
    }
  }

  // Clear ride requests
  clearRideRequests() {
    this.rideRequests = [];
  }

  // Clear active trip
  clearActiveTrip() {
    this.activeTrip = null;
  }

  // Transform backend trip data to frontend format
  _transformTripData(trip) {
    return {
      id: trip.order_id || trip._id,
      order_type: trip.order_type,
      status: trip.status,
      pickup: trip.pickup || 'Pickup Location',
      dropoff: trip.dropoff || 'Dropoff Location',
      fare: trip.earnings || trip.fare || 0,
      distance: trip.distance || 0,
      startTime: trip.accepted_at || trip.createdAt,
      endTime: trip.completed_at || trip.delivered_at,
      rating: trip.rating || null,
      customerName: trip.customer || 'Customer',
      customer_phone: trip.customer_phone || '',
      vehicle_type: trip.vehicle_type || 'Bike',
      item_description: trip.item_description || '',
      special_instructions: trip.special_instructions || ''
    };  }

  // Transform available order to ride request format
  _transformToRideRequest(order) {
    return {
      id: `RIDE${Date.now()}`,
      order_id: order.id,
      order_type: order.type,
      pickup: order.pickup,
      dropoff: order.dropoff,
      fare: order.fare,
      distance: order.distance,
      customerName: order.customer,
            customer_phone: order.customer_phone,
      vehicle_type: order.vehicle_type,
      item_description: order.item_description,
      special_instructions: order.special_instructions,
      timestamp: order.created_at || new Date().toISOString()
    };
  }

  // Get loading state
  getLoadingState() {
    return this.isLoading;
  }
}

// Create singleton instance
const tripService = new TripService();
export default tripService; 