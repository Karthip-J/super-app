import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        const response = await axios.get(`/api/urban-services/bookings/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setBooking(response.data.data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <button
            onClick={() => navigate('/urban-services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to City Bell
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Booking Number: {booking.bookingNumber}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Service Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Service:</span> {booking.title}</p>
                <p><span className="font-medium">Date:</span> {new Date(booking.scheduledDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {booking.scheduledTime}</p>
                <p><span className="font-medium">Status:</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {booking.status}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Pricing</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Base Price:</span> ₹{booking.pricing?.basePrice || 0}</p>
                <p><span className="font-medium">Total Amount:</span> ₹{booking.pricing?.totalAmount || 0}</p>
              </div>
            </div>
          </div>

          {booking.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-600">{booking.description}</p>
            </div>
          )}

          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => navigate('/urban-services')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
            >
              Back to Services
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingTracking;
