import React, { useEffect, useState } from "react";
import FooterNav from '../Porter/Footer';
import { getUserBookings } from '../services/porterService';

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

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserBookings()
      .then(res => {
        if (res.success && res.data) {
          // Ensure bookings have proper data structure
          const processedBookings = res.data.map(booking => ({
            ...booking,
            // Ensure driver_id is properly accessed
            driver_name: booking.driver_id?.name || booking.driver_id || 'TBD',
            // Ensure distance is properly displayed
            distance_display: booking.distance !== undefined && booking.distance !== null
              ? `${booking.distance} km`
              : 'N/A'
          }));
          setBookings(processedBookings);
        }
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 mt-6">
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-4">
          📦 City Move Booking History
        </h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-500">No bookings found.</div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, idx) => (
              <div key={booking._id || idx} className="border-b pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
                <div className="font-semibold text-sm text-gray-700 mb-1">
                  {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : ''}
                </div>
                <div className="text-sm text-gray-700">
                  <div><span className="font-semibold">Pickup:</span> {booking.pickup_location?.address || 'N/A'}</div>
                  <div><span className="font-semibold">Drop:</span> {booking.dropoff_location?.address || 'N/A'}</div>
                  <div><span className="font-semibold">Vehicle:</span> {booking.vehicle_type || booking.vehicle_id?.vehicle_type || 'N/A'}</div>
                  <div><span className="font-semibold">Driver:</span> {
                    typeof booking.driver_id === 'object' && booking.driver_id?.name
                      ? booking.driver_id.name
                      : typeof booking.driver_id === 'string'
                        ? 'Loading...'
                        : 'TBD'
                  }</div>
                  <div><span className="font-semibold">Distance:</span> {
                    booking.distance !== undefined && booking.distance !== null
                      ? `${booking.distance} km`
                      : 'N/A'
                  }</div>
                  <div><span className="font-semibold">Fare:</span> ₹{booking.fare || 0}</div>
                  <div><span className="font-semibold">Status:</span> <span className={`capitalize ${booking.status === 'completed' ? 'text-green-600' :
                      booking.status === 'pending' ? 'text-yellow-500' :
                        booking.status === 'cancelled' ? 'text-red-500' :
                          'text-blue-500'
                    }`}>{booking.status || 'pending'}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FooterNav />
    </div>
  );
};

export default Booking;
