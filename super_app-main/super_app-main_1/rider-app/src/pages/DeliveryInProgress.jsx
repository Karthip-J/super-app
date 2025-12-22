import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ReactDOM from 'react-dom';
import DeliveryHeader from '../components/DeliveryHeader.jsx';
import DeliveryBottomNav from '../components/DeliveryBottomNav.jsx';
import deliveryService from '../services/deliveries.jsx';
import axios from 'axios';
import { API_CONFIG, buildLocationIQUrl } from '../config/api.js';

const iconPickup = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const iconDelivery = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  className: 'delivery-marker'
});

const dummyCoords = {
  // Chennai locations only
  'T Nagar': [13.0478, 80.2429],
  'Anna Nagar': [13.0827, 80.2707],
  'Velachery': [12.9716, 80.2207],
  'Adyar': [13.0067, 80.2546],
  'Mylapore': [13.0339, 80.2704],
  'Besant Nagar': [13.0067, 80.2546],
  'Nungambakkam': [13.0588, 80.2429],
  'Teynampet': [13.0339, 80.2429],
  'Phoenix MarketCity': [12.9716, 80.2207],
  'OMR': [12.9716, 80.2207],
  'Marina Beach': [13.0594, 80.2835],
  'Triplicane': [13.0594, 80.2835],
  'Express Avenue': [13.0594, 80.2835],
  'Royapettah': [13.0594, 80.2835],
  'Guindy': [13.0067, 80.2207],
  'Saidapet': [13.0067, 80.2207],
  'Chromepet': [12.9516, 80.1395],
  'Tambaram': [12.9242, 80.1274],
  'Kilpauk': [13.0827, 80.2429],
  'Perambur': [13.0827, 80.2429],
  'Vadapalani': [13.0478, 80.2429],
  'Ashok Nagar': [13.0478, 80.2429],
  'Alandur': [12.9716, 80.2207],
  'St. Thomas Mount': [12.9716, 80.2207],
  // Restaurant and merchant locations - all in Chennai
  'Pizza Hut, T Nagar': [13.0478, 80.2429],
  'Big Bazaar, Velachery': [12.9716, 80.2207],
  'DTDC, Nungambakkam': [13.0588, 80.2429],
  'KFC, T Nagar': [13.0478, 80.2429],
  'Reliance Fresh, Velachery': [12.9716, 80.2207],
  'Apollo Pharmacy, Mylapore': [13.0339, 80.2704],
  'Domino\'s, Nungambakkam': [13.0588, 80.2429],
  'Croma, Phoenix MarketCity': [12.9716, 80.2207],
  'Subway, Marina Beach': [13.0594, 80.2835],
  'Spencer\'s, Express Avenue': [13.0594, 80.2835],
  'Blue Dart, Guindy': [13.0067, 80.2207],
  'McDonald\'s, Chromepet': [12.9516, 80.1395],
  'MedPlus, Kilpauk': [13.0827, 80.2429],
  'Burger King, Vadapalani': [13.0478, 80.2429],
  'Nilgiris, Alandur': [12.9716, 80.2207],
};

function FitMarkersBounds({ pickupCoords, dropoffCoords }) {
  const map = useMap();
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      map.fitBounds([pickupCoords, dropoffCoords], { padding: [40, 40] });
    }
  }, [pickupCoords, dropoffCoords, map]);
  return null;
}

const DeliveryInProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, dropoff, package: pkg, payment, customer, customerPhone, pickupType, dropoffType, groceryItems } = location.state || {};
  const pickupCoords = dummyCoords[pickup] || [13.0827, 80.2707]; // Chennai center as fallback
  const dropoffCoords = dummyCoords[dropoff] || [13.0478, 80.2429]; // T Nagar as fallback
  const [delivered, setDelivered] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeFetched, setRouteFetched] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  
  // Cancel delivery states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer unavailable');
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Use ref to prevent multiple API calls
  const hasFetchedRoute = useRef(false);

  // Cancel reasons
  const cancelReasons = [
    'Customer unavailable',
    'Wrong dropoff address',
    'Package damaged',
    'Customer rejected delivery',
    'Personal emergency',
    'Vehicle breakdown',
    'Other'
  ];

  // Handle delivery cancellation
  const handleCancelDelivery = async () => {
    setIsCancelling(true);
    
    console.log('Cancelling delivery with pickup:', pickup, 'dropoff:', dropoff);
    
    // Find the delivery by ID first, then by pickup/dropoff
    const allDeliveries = deliveryService.getDeliveries();
    console.log('All deliveries:', allDeliveries);
    
    const deliveryId = location.state?.id;
    let deliveryToCancel = null;
    
    if (deliveryId) {
      // Find delivery by ID first (most reliable)
      deliveryToCancel = allDeliveries.find(d => d.id === deliveryId);
      console.log('Found delivery by ID:', deliveryToCancel);
    }
    
    if (!deliveryToCancel) {
      // Fallback: find by pickup/dropoff but only active/pending deliveries
      // Get ALL matching deliveries and pick the most recent active one
      const matchingDeliveries = allDeliveries.filter(d => 
        d.pickup === pickup && d.dropoff === dropoff && (d.status === 'active' || d.status === 'pending')
      );
      console.log('Matching active/pending deliveries:', matchingDeliveries);
      
      if (matchingDeliveries.length > 0) {
        // Sort by startTime descending to get the most recent one
        matchingDeliveries.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        deliveryToCancel = matchingDeliveries[0];
        console.log('Selected most recent active delivery:', deliveryToCancel);
      }
    }
    
    if (deliveryToCancel) {
      console.log('About to cancel delivery:', deliveryToCancel.id, 'with status:', deliveryToCancel.status);
      // Use the enhanced cancelDelivery method
      const result = deliveryService.cancelDelivery(deliveryToCancel.id, cancelReason);
      console.log('Cancel delivery result:', result);
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('deliveriesDataChanged'));
    } else {
      console.log('No delivery found to cancel, creating new cancelled delivery');
      // If no delivery found, create and immediately cancel
      const newDelivery = {
        id: `DEL${Date.now()}`,
        status: 'cancelled',
        pickup: pickup,
        dropoff: dropoff,
        customer: customer || 'Customer',
        package: pkg || 'Package',
        payment: payment || 0,
        priority: 'medium',
        distance: '2.5 km',
        estimatedTime: '15 mins',
        startTime: new Date().toISOString(),
        pickupType: pickupType || 'merchant',
        dropoffType: dropoffType || 'customer',
        cancelReason: cancelReason
      };
      deliveryService.createDelivery(newDelivery);
      const result = deliveryService.cancelDelivery(newDelivery.id, cancelReason);
      console.log('Created and cancelled new delivery:', newDelivery, 'result:', result);
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('deliveriesDataChanged'));
    }
    
    // Simulate API call delay
    setTimeout(() => {
      setIsCancelling(false);
      setShowCancelModal(false);
      // Navigate back to deliveries page
      navigate('/deliveries');
    }, 1000);
  };

  // Fetch route polyline - only once
  useEffect(() => {
    if (hasFetchedRoute.current) return;
    
    async function fetchRoute() {
      setRouteLoading(true);
      hasFetchedRoute.current = true;
      
      const [pickupLat, pickupLng] = pickupCoords;
      const [dropoffLat, dropoffLng] = dropoffCoords;
      const url = buildLocationIQUrl(`/directions/driving/${pickupLng},${pickupLat};${dropoffLng},${dropoffLat}`, {
        overview: 'full',
        geometries: 'geojson',
      });
      
      try {
        const res = await axios.get(url, { timeout: API_CONFIG.TIMEOUTS?.ROUTE_REQUEST || 8000 });
        const coords = res.data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRouteCoords(coords);
        setRouteFetched(true);
        // Get route information
        const route = res.data.routes[0];
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // Convert to km
          duration: Math.round(route.duration / 60) // Convert to minutes
        });
      } catch (e) {
        console.error('Route fetch error:', e);
        setRouteCoords([]);
      } finally {
        setRouteLoading(false);
      }
    }
    
    fetchRoute();
  }, [pickupCoords, dropoffCoords]);

  return (
    <div className="min-h-screen bg-yellow-50 dark:bg-gray-900">
      <DeliveryHeader />
      <div
        className="w-full max-w-md mx-auto"
        style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}
      >
        {/* Map stays at the top, fixed height */}
        <div className="w-full" style={{ height: 260, flex: '0 0 260px' }}>
          <MapContainer center={dropoffCoords} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <FitMarkersBounds pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} />
            <Marker position={pickupCoords} icon={iconPickup} />
            <Marker position={dropoffCoords} icon={iconDelivery} />
            {routeFetched && routeCoords.length > 1 && (
              <Polyline positions={routeCoords} color="#2563eb" weight={4} opacity={0.9} />
            )}
          </MapContainer>
        </div>
        {/* Scrollable content below the map */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow p-4 w-full text-center mb-20" style={{ maxWidth: 340, margin: '0 auto 0 auto' }}>
            <h2 className="text-lg font-bold text-yellow-700 dark:text-yellow-300 mb-2">Deliver to {dropoffType === 'customer' ? 'Customer' : 'Dropoff'}</h2>
            
            {/* Location Information */}
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-left">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup Location</div>
                <div className="text-sm text-gray-700 dark:text-gray-200 font-medium">{pickup}</div>
              </div>
              <div className="mt-2 text-left">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dropoff Location</div>
                <div className="text-sm text-gray-700 dark:text-gray-200 font-medium">{dropoff}</div>
              </div>
              {routeInfo && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Route Information</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    📍 {routeInfo.distance} km • ⏱️ {routeInfo.duration} min
                  </div>
                </div>
              )}
            </div>

            <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm">{pickupType === 'restaurant' ? 'Restaurant' : pickupType === 'merchant' ? 'Merchant' : 'Pickup'}: <span className="font-medium">{pickup}</span></div>
            <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm">Customer: <span className="font-medium">{customer}</span></div>
            <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm">Phone: <span className="font-medium">{customerPhone || 'N/A'}</span></div>
            <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm">Dropoff: <span className="font-medium">{dropoff}</span></div>
            <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm">Package: <span className="font-medium">{pkg}</span></div>
            <div className="mb-3 text-green-700 dark:text-green-300 font-semibold text-sm">Payment: ₹{payment}</div>
            
            {/* Grocery Items Display */}
            {groceryItems && Array.isArray(groceryItems) && groceryItems.length > 0 && (
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Items</h3>
                <div className="space-y-1">
                  {groceryItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {item.name} {item.quantity && `(${item.quantity})`}
                      </span>
                      {item.total && (
                        <span className="font-medium text-gray-900 dark:text-white">
                          ₹{item.total}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!delivered ? (
              <div className="flex space-x-3">
                <button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                  onClick={() => {
                    // Navigate to DeliveryNavigationMap with pickup and dropoff coordinates for automatic navigation
                    navigate('/delivery-navigation-map', { 
                      state: { 
                        pickup, 
                        dropoff, 
                        currentPosition: pickupCoords,
                        package: pkg,
                        payment,
                        customer,
                        customerPhone,
                        pickupType,
                        dropoffType,
                        groceryItems
                      } 
                    });
                  }}
                >
                  Start a ride
                </button>
                
                {/* Cancel Button */}
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                  onClick={() => navigate('/delivery-completed', { state: { pickup, dropoff, pkg, payment, customer, customerPhone, pickupType, dropoffType, groceryItems } })}
                >
                  Confirm Delivery & Complete
                </button>
                
                {/* Cancel Button */}
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Cancel Delivery Modal - Using Portal to render at body level */}
      {showCancelModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4" style={{ zIndex: 99999 }}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cancel Delivery</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Are you sure you want to cancel this delivery? This action cannot be undone.
            </p>
            
            {!showReasonDropdown ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Keep Delivery
                </button>
                <button
                  onClick={() => setShowReasonDropdown(true)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                >
                  Cancel Delivery
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for cancellation
                  </label>
                  <div className="relative">
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm appearance-none bg-white dark:bg-gray-700"
                      style={{ 
                        maxHeight: '120px',
                        overflowY: 'auto'
                      }}
                      size="7"
                    >
                      {cancelReasons.map((reason) => (
                        <option key={reason} value={reason} className="py-1">{reason}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => {
                      setShowReasonDropdown(false);
                      setShowCancelModal(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Keep Delivery
                  </button>
                  <button
                    onClick={handleCancelDelivery}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
      
      <DeliveryBottomNav />
    </div>
  );
};

export default DeliveryInProgress;