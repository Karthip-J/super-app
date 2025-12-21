import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FooterNav from '../Porter/Footer';
import { getBookingById } from '../services/porterService';

// Helper function to get vehicle icon based on vehicle type
const getVehicleIcon = (vehicleType) => {
  switch (vehicleType) {
    case 'Bike':
      return '🏍️';
    case 'Auto':
      return '🛺';
    case 'Mini-Truck':
      return '🚚';
    default:
      return '🚚'; // Default to truck if unknown
  }
};

const Tracking = () => {
  const location = useLocation();
  const [booking, setBooking] = useState(location.state || null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch booking data if driver info or distance is missing
  useEffect(() => {
    // If booking exists but driver info or distance is missing, fetch from backend
    if (booking && booking._id && (!booking.driver_id?.name || !booking.distance)) {
      setLoading(true);
      getBookingById(booking._id)
        .then(res => {
          if (res.success && res.data) {
            setBooking(res.data);
          }
        })
        .catch(err => {
          console.error('Error fetching booking details:', err);
        })
        .finally(() => setLoading(false));
    }
    // If booking is not in state, try to fetch from backend using ID
    else if (!booking && location.state && location.state._id) {
      setLoading(true);
      getBookingById(location.state._id)
        .then(res => {
          if (res.success && res.data) setBooking(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [booking?._id, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-gray-500 text-lg">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500 text-lg">No booking details found.</div>
      </div>
    );
  }

  function handleSubmit() {
    const id = booking._id;
    if (id) {
      navigate(`/porter/live-tracking/${id}`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 mt-6">
        <h1 className="text-2xl font-bold text-green-600 text-center mb-2">
          🎉 Booking Confirmed!
        </h1>
        <p className="text-center text-sm text-gray-500 mb-4">
          Your booking has been successfully placed.
        </p>

        <div className="space-y-3 text-gray-700 text-sm">
          <div>
            <span className="font-semibold">📍 Pickup:</span>{" "}
            {booking.pickup_location?.address || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">📍 Drop:</span> {booking.dropoff_location?.address || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">{getVehicleIcon(booking.vehicle_type)} Vehicle Type:</span>{" "}
            {booking.vehicle_type || booking.vehicle_id?.vehicle_type || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">💁 Assigned Driver:</span>{" "}
            {typeof booking.driver_id === 'object' && booking.driver_id?.name 
              ? booking.driver_id.name 
              : typeof booking.driver_id === 'string' 
              ? 'Loading...' 
              : 'TBD'}
          </div>
          <div>
            <span className="font-semibold">📏 Distance:</span>{" "}
            {booking.distance !== undefined && booking.distance !== null 
              ? `${booking.distance} km` 
              : 'Calculating...'}
          </div>
          <div>
            <span className="font-semibold">💰 Fare:</span> ₹{booking.fare || 0}
          </div>
          <div>
            <span className="font-semibold">⏱️ Status:</span>{" "}
            <span
              className={`font-semibold ${
                booking.status === "pending"
                  ? "text-yellow-500"
                  : booking.status === "completed"
                  ? "text-green-600"
                  : "text-blue-500"
              }`}
            >
              {booking.status || 'pending'}
            </span>
          </div>
          <div>
            <span className="font-semibold">📅 Booked At:</span>{" "}
            {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : booking.created_at ? new Date(booking.created_at).toLocaleString() : 'N/A'}
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={handleSubmit}
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition"
            disabled={!booking._id}
          >
            🔄 Live Tracking
          </button>
        </div>
      </div>
      <FooterNav/>
    </div>
  );
};

export default Tracking;
