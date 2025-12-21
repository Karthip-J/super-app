import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { getBookingById } from '../services/porterService';

// Try to import map components with fallback
let MapContainer, TileLayer, Marker, Popup;
let L;
let mapDependenciesAvailable = false;

try {
  const leaflet = require('leaflet');
  const reactLeaflet = require('react-leaflet');
  
  MapContainer = reactLeaflet.MapContainer;
  TileLayer = reactLeaflet.TileLayer;
  Marker = reactLeaflet.Marker;
  Popup = reactLeaflet.Popup;
  L = leaflet;
  
  // Setup marker icons
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });
  
  mapDependenciesAvailable = true;
} catch (error) {
  console.warn('Map dependencies not available, using fallback UI:', error);
  mapDependenciesAvailable = false;
}

const DEFAULT_POSITION = [12.9716, 77.5946]; // Bangalore

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

function LiveTracking() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      getBookingById(id)
        .then(res => {
          if (res.success && res.data) {
            setBooking(res.data);
          } else {
            setError('Booking not found');
          }
        })
        .catch(err => {
          console.error('Error fetching booking:', err);
          setError('Failed to load booking details');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Tracking Unavailable</h2>
          <p className="text-gray-600 mb-4">{error || 'Booking not found'}</p>
          <button 
            onClick={() => window.history.back()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Fallback UI when map dependencies are not available
  if (!mapDependenciesAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">{getVehicleIcon(booking.vehicle_type)}</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Live Tracking</h1>
              <p className="text-gray-600">Booking #{booking._id?.slice(-6) || 'N/A'}</p>
            </div>

            {/* Status Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800">Current Status</h3>
                  <p className="text-blue-600 capitalize">{booking.status}</p>
                </div>
                <div className="text-2xl">
                  {booking.status === 'pending' ? '⏳' :
                   booking.status === 'assigned' ? '👨‍💼' :
                   booking.status === 'picked_up' ? '📦' :
                   booking.status === 'delivered' ? '✅' :
                   booking.status === 'completed' ? '🎉' :
                   booking.status === 'cancelled' ? '❌' : '📋'}
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Driver Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {booking.driver_id?.name || 'TBD'}</p>
                <p><span className="font-medium">Vehicle:</span> {booking.driver_id?.vehicle_type || ''} {booking.driver_id?.vehicle_number || ''}</p>
                <p><span className="font-medium">Phone:</span> {booking.driver_id?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">📍 Pickup Location</h3>
                <p className="text-yellow-700">{booking.pickup_location?.address || 'Address not available'}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">🎯 Dropoff Location</h3>
                <p className="text-red-700">{booking.dropoff_location?.address || 'Address not available'}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-medium">Vehicle Type:</span> {booking.vehicle_type}</p>
                  <p><span className="font-medium">Distance:</span> {booking.distance || 'N/A'} km</p>
                </div>
                <div>
                  <p><span className="font-medium">Fare:</span> ₹{booking.fare}</p>
                  <p><span className="font-medium">Item:</span> {booking.item_description || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button 
                onClick={() => window.history.back()} 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map UI when dependencies are available
  const driverPos = booking.driver_id?.current_location?.latitude && booking.driver_id?.current_location?.longitude
    ? [booking.driver_id.current_location.latitude, booking.driver_id.current_location.longitude]
    : booking.pickup_location?.latitude && booking.pickup_location?.longitude
    ? [booking.pickup_location.latitude, booking.pickup_location.longitude]
    : DEFAULT_POSITION;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-gray-800">Live Tracking</h1>
            <p className="text-gray-600">Booking #{booking._id?.slice(-6) || 'N/A'}</p>
          </div>
          
          <MapContainer center={driverPos} zoom={13} style={{ height: "400px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={driverPos}>
              <Popup>
                {booking.driver_id?.name || 'Driver'}
                <br />
                {booking.driver_id?.vehicle_type || ''} - {booking.driver_id?.vehicle_number || ''}
              </Popup>
            </Marker>
            {booking.pickup_location?.latitude && booking.pickup_location?.longitude && (
              <Marker position={[booking.pickup_location.latitude, booking.pickup_location.longitude]}>
                <Popup>Pickup Location</Popup>
              </Marker>
            )}
            {booking.dropoff_location?.latitude && booking.dropoff_location?.longitude && (
              <Marker position={[booking.dropoff_location.latitude, booking.dropoff_location.longitude]}>
                <Popup>Dropoff Location</Popup>
              </Marker>
            )}
          </MapContainer>
          
          <div className="p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold text-gray-800">Status</div>
                <div className="text-blue-600 capitalize">{booking.status}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Driver</div>
                <div className="text-green-600">{booking.driver_id?.name || 'TBD'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Vehicle</div>
                <div className="text-purple-600">{booking.driver_id?.vehicle_type || ''} {booking.driver_id?.vehicle_number || ''}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveTracking; 