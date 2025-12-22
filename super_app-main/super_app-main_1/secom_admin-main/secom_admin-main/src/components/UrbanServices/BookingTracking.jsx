import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';

const BookingTracking = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingSteps, setTrackingSteps] = useState([]);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
      const interval = setInterval(fetchBooking, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/urban-services/bookings/${bookingId}`);
      setBooking(response.data);
      updateTrackingSteps(response.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTrackingSteps = (bookingData) => {
    const steps = [
      { id: 'pending', name: 'Booking Confirmed', completed: true, time: bookingData.createdAt },
      { id: 'accepted', name: 'Partner Assigned', completed: ['accepted', 'on_the_way', 'in_progress', 'completed'].includes(bookingData.status), time: bookingData.acceptedAt },
      { id: 'on_the_way', name: 'Partner On The Way', completed: ['accepted', 'on_the_way', 'in_progress', 'completed'].includes(bookingData.status), time: bookingData.onTheWayAt },
      { id: 'in_progress', name: 'Service In Progress', completed: ['in_progress', 'completed'].includes(bookingData.status), time: bookingData.startedAt },
      { id: 'completed', name: 'Service Completed', completed: bookingData.status === 'completed', time: bookingData.completedAt }
    ];
    setTrackingSteps(steps);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Live Tracking</h3>

      {/* Partner Info */}
      {booking.partner && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{booking.partner.businessName}</div>
              <div className="text-sm text-gray-600">{booking.partner.user?.name}</div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                <i className="fas fa-phone mr-1"></i> Call
              </button>
              <button className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                <i className="fas fa-comment mr-1"></i> Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="relative">
        {trackingSteps.map((step, index) => (
          <div key={step.id} className="flex items-start mb-6">
            <div className="flex flex-col items-center mr-4">
              <div className={`w-4 h-4 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              {index < trackingSteps.length - 1 && (
                <div className={`w-0.5 h-16 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              )}
            </div>
            <div className="flex-1">
              <div className={`font-medium ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                {step.name}
              </div>
              {step.time && (
                <div className="text-sm text-gray-500">
                  {new Date(step.time).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Current Status</div>
            <div className="font-medium capitalize">{booking.status.replace('_', ' ')}</div>
          </div>
          {booking.status === 'on_the_way' && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Estimated Arrival</div>
              <div className="font-medium">15-20 mins</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingTracking;
