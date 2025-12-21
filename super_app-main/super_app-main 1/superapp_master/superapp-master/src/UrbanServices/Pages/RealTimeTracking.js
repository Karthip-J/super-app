import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const RealTimeTracking = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [partnerLocation, setPartnerLocation] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(0);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const response = await axios.get(`/api/urban-services/bookings/${bookingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBooking(response.data.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      }
    };

    fetchBookingDetails();
    
    const interval = setInterval(() => {
      fetchBookingDetails();
      updatePartnerLocation();
    }, 5000);

    return () => clearInterval(interval);
  }, [bookingId]);

  const updatePartnerLocation = () => {
    setPartnerLocation({
      lat: 28.6139 + Math.random() * 0.01,
      lng: 77.2090 + Math.random() * 0.01,
      status: ['On the way', 'Arriving', 'Started service', 'Completed'][Math.floor(Math.random() * 4)]
    });
    setEstimatedTime(Math.max(0, estimatedTime - 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Real-time Service Tracking</h1>
          
          {booking && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Service Status</h3>
                <p className="text-blue-700">{partnerLocation?.status || 'Pending'}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Estimated Arrival</h3>
                <p className="text-green-700">{estimatedTime} minutes</p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900">Partner Location</h3>
                <p className="text-yellow-700">Tracking partner in real-time...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeTracking;
