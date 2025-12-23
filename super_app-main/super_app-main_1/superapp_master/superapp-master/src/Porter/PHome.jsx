import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { createPorterBooking } from '../services/porterService';
import paymentService from '../services/paymentService';

const vehicleOptions = [
  { type: "Bike", rate: 15 },
  { type: "Auto", rate: 25 },
  { type: "Mini-Truck", rate: 40 },
];

const ORS_API_KEY = "5b3ce3597851110001cf624868c9d5de5db640d48ffb6975cb64e142";

function LocationAutocomplete({ label, value, onChange, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (text) => {
    if (!text) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
    } catch (e) {
      setSuggestions([]);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <label className="block font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={e => {
          onChange(e.target.value);
          fetchSuggestions(e.target.value);
          setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        className="w-full p-2 border border-gray-300 rounded"
        placeholder={label}
        autoComplete="off"
        required
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-20 bg-white border border-gray-200 w-full mt-1 rounded shadow max-h-48 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm"
              onMouseDown={() => {
                onChange(s.properties.label);
                onSelect && onSelect(s);
                setShowDropdown(false);
              }}
            >
              {s.properties.label}
            </li>
          ))}
        </ul>
      )}
      {loading && <div className="absolute right-2 top-2 text-xs text-gray-400">Loading...</div>}
    </div>
  );
}

const PHome = () => {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [distance, setDistance] = useState(null);
  const [fare, setFare] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [loadingDistance, setLoadingDistance] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [bookingData, setBookingData] = useState(null);

  // Custom toast notification (same as e-commerce)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Calculate distance when coordinates change
  React.useEffect(() => {
    const fetchDistance = async () => {
      if (!pickupCoords || !dropCoords) {
        setDistance(null);
        setFare(null);
        return;
      }

      console.log('Calculating distance between:', pickupCoords, 'and', dropCoords);
      setLoadingDistance(true);
      try {
        const res = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${pickupCoords[0]},${pickupCoords[1]}&end=${dropCoords[0]},${dropCoords[1]}`
        );
        if (!res.ok) {
          throw new Error(`API responded with status: ${res.status}`);
        }
        const data = await res.json();
        const meters = data?.features?.[0]?.properties?.segments?.[0]?.distance || 0;
        const km = meters / 1000;
        // Limit distance to reasonable range (max 50 km for testing)
        const limitedDistance = Math.min(km, 50);
        setDistance(limitedDistance);
      } catch (e) {
        console.warn('Distance API failed, using fallback calculation:', e.message);
        // Fallback: Simple distance calculation using coordinates
        const lat1 = pickupCoords[1];
        const lon1 = pickupCoords[0];
        const lat2 = dropCoords[1];
        const lon2 = dropCoords[0];

        // Haversine formula for distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const fallbackDistance = Math.round(R * c * 100) / 100;
        // Limit fallback distance to reasonable range (max 50 km for testing)
        const limitedFallbackDistance = Math.min(fallbackDistance, 50);
        setDistance(limitedFallbackDistance);
      }
      setLoadingDistance(false);
    };
    fetchDistance();
  }, [pickupCoords, dropCoords]);

  // Calculate fare when distance or vehicle changes
  React.useEffect(() => {
    if (distance && selectedVehicle) {
      // Base fare + per km rate
      const baseFares = {
        "Bike": 50,
        "Auto": 80,
        "Mini-Truck": 150
      };
      const baseFare = baseFares[selectedVehicle.type] || 100;
      const perKmFare = Math.ceil(distance) * selectedVehicle.rate;
      const totalFare = baseFare + perKmFare;
      // Limit fare to reasonable amount (max ₹2000 for testing)
      const limitedFare = Math.min(totalFare, 2000);
      setFare(limitedFare);
    } else {
      setFare(null);
    }
  }, [distance, selectedVehicle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingBooking(true);
    try {
      // If coordinates aren't set, use default coordinates for testing
      let finalPickupCoords = pickupCoords;
      let finalDropCoords = dropCoords;

      // Calculate distance if not already calculated
      if (!distance && selectedVehicle) {
        if (!pickupCoords && pickupLocation) {
          // Default coordinates for Hosur (approximate)
          finalPickupCoords = [77.8256, 12.7396];
          console.log('Using default coordinates for pickup:', finalPickupCoords);
        }

        if (!dropCoords && dropLocation) {
          // Default coordinates for Chennai (approximate)
          finalDropCoords = [80.2707, 13.0827];
          console.log('Using default coordinates for drop:', finalDropCoords);
        }

        // Calculate distance manually
        if (finalPickupCoords && finalDropCoords) {
          const lat1 = finalPickupCoords[1];
          const lon1 = finalPickupCoords[0];
          const lat2 = finalDropCoords[1];
          const lon2 = finalDropCoords[0];

          // Haversine formula for distance calculation
          const R = 6371; // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const calculatedDistance = Math.round(R * c * 100) / 100;
          const limitedDistance = Math.min(calculatedDistance, 50);

          console.log('Manual distance calculation:', limitedDistance, 'km');
          setDistance(limitedDistance);

          // Calculate fare immediately
          const baseFares = {
            "Bike": 50,
            "Auto": 80,
            "Mini-Truck": 150
          };
          const baseFare = baseFares[selectedVehicle.type] || 100;
          const perKmFare = Math.ceil(limitedDistance) * selectedVehicle.rate;
          const totalFare = baseFare + perKmFare;
          const limitedFare = Math.min(totalFare, 2000);

          console.log('Manual fare calculation:', limitedFare, 'rupees');
          setFare(limitedFare);
        }
      }

      if (!pickupCoords && pickupLocation) {
        // Default coordinates for Hosur (approximate)
        finalPickupCoords = [77.8256, 12.7396];
        console.log('Using default coordinates for pickup:', finalPickupCoords);
      }

      if (!dropCoords && dropLocation) {
        // Default coordinates for Chennai (approximate)
        finalDropCoords = [80.2707, 13.0827];
        console.log('Using default coordinates for drop:', finalDropCoords);
      }

      const bookingPayload = {
        pickup_location: {
          address: pickupLocation,
          latitude: finalPickupCoords ? finalPickupCoords[1] : undefined,
          longitude: finalPickupCoords ? finalPickupCoords[0] : undefined,
        },
        dropoff_location: {
          address: dropLocation,
          latitude: finalDropCoords ? finalDropCoords[1] : undefined,
          longitude: finalDropCoords ? finalDropCoords[0] : undefined,
        },
        vehicle_type: selectedVehicle?.type,
        distance: distance ? Number(distance.toFixed(2)) : null,
        fare: fare || null,
        // Optionally: item_description, item_weight, special_instructions
      };
      console.log('Submitting booking with payload:', bookingPayload);

      // Store booking data and show payment modal
      setBookingData(bookingPayload);
      setShowPaymentModal(true);
      setLoadingBooking(false);
    } catch (err) {
      console.error('Booking error:', err);
      showToast('Booking failed. Please try again.', 'error');
      setLoadingBooking(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      showToast('Please select a payment method.', 'error');
      return;
    }

    if (selectedPaymentMethod === 'razorpay') {
      try {
        console.log('📦 Starting Razorpay payment for city move booking...');
        const paymentData = {
          amount: fare || 100,
          currency: 'INR',
          order_model: 'CityMoveBooking',
          order_data: {
            user_id: '507f1f77bcf86cd799439011', // Default user ID
            driver_id: '507f1f77bcf86cd799439011',
            vehicle_id: '507f1f77bcf86cd799439012',
            pickup_location: bookingData.pickup_location,
            dropoff_location: bookingData.dropoff_location,
            vehicle_type: bookingData.vehicle_type,
            distance: bookingData.distance || 0,
            fare: bookingData.fare || 100
          },
          email: 'user@example.com',
          contact: '9999999999'
        };

        await paymentService.processPayment(paymentData, {
          onSuccess: (successData) => {
            console.log('✅ City Move payment successful:', successData);
            showToast('Payment successful! Booking confirmed.', 'success');
            navigate('/porter/tracking', {
              state: {
                ...bookingData,
                payment_method: 'Razorpay',
                payment_id: successData.payment_id,
                status: 'assigned'
              }
            });
          },
          onError: (error) => {
            console.error('❌ Porter payment failed:', error);
            showToast('Payment failed: ' + error.message, 'error');
          },
          onCancel: () => {
            console.log('🚫 Porter payment cancelled');
            showToast('Payment was cancelled', 'error');
          }
        });
      } catch (error) {
        console.error('❌ City Move payment error:', error);
        showToast('Payment error: ' + error.message, 'error');
      }
    } else {
      // For other payment methods, create booking directly
      try {
        const res = await createPorterBooking(bookingData);
        if (res.success && res.data) {
          showToast('Booking confirmed!', 'success');
          navigate('/porter/tracking', { state: res.data });
        } else {
          showToast(res.message || 'Booking failed. Please try again.', 'error');
        }
      } catch (err) {
        console.error('Booking error:', err);
        showToast('Booking failed. Please try again.', 'error');
      }
    }
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${toast.type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
          }`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <img
        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
        alt="City Move Banner"
        className="w-full object-cover h-64"
      />

      <div className="max-w-md mx-auto p-4 bg-white mt-[-40px] rounded-2xl shadow-lg relative z-10">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Book Your Delivery
        </h2>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pickup Location */}
          <LocationAutocomplete
            label="Pickup Location"
            value={pickupLocation}
            onChange={setPickupLocation}
            onSelect={feature => setPickupCoords(feature.geometry.coordinates)}
          />

          {/* Drop Location */}
          <LocationAutocomplete
            label="Drop Location"
            value={dropLocation}
            onChange={setDropLocation}
            onSelect={feature => setDropCoords(feature.geometry.coordinates)}
          />

          {/* Vehicle Selection */}
          <div>
            <label className="block font-medium mb-1">Select Vehicle</label>
            <div className="flex gap-2">
              {vehicleOptions.map((v, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelectedVehicle(v)}
                  className={`px-4 py-2 border rounded transition-colors duration-150 ${selectedVehicle?.type === v.type
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 border-gray-300 text-gray-700"
                    }`}
                >
                  {v.type}
                </button>
              ))}
            </div>
          </div>

          {/* Distance & Fare Estimate */}
          <div>
            <label className="block font-medium mb-1">Distance & Estimated Fare</label>
            <div className="text-lg font-semibold">
              {loadingDistance && "Calculating..."}
              {!loadingDistance && distance && selectedVehicle && (
                <>
                  {distance.toFixed(2)} km &nbsp;|&nbsp; ₹{fare}
                </>
              )}
              {!loadingDistance && (!distance || !selectedVehicle) && "-"}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            disabled={!pickupCoords || !dropCoords || !selectedVehicle || loadingDistance || loadingBooking}
          >
            {loadingBooking ? 'Booking...' : 'Continue Booking'}
          </button>
        </form>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-sm mx-auto animate-bounceIn">
            <h2 className="text-lg font-bold mb-4 text-center">Select Payment Method</h2>
            <div className="flex flex-col gap-3 mb-4">
              <button
                className={`w-full px-4 py-3 rounded-lg border text-base font-semibold transition-colors ${selectedPaymentMethod === 'cash' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-blue-50'}`}
                onClick={() => setSelectedPaymentMethod('cash')}
              >
                Cash
              </button>
              <button
                className={`w-full px-4 py-3 rounded-lg border text-base font-semibold transition-colors ${selectedPaymentMethod === 'card' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-blue-50'}`}
                onClick={() => setSelectedPaymentMethod('card')}
              >
                Card
              </button>
              <button
                className={`w-full px-4 py-3 rounded-lg border text-base font-semibold transition-colors ${selectedPaymentMethod === 'upi' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-blue-50'}`}
                onClick={() => setSelectedPaymentMethod('upi')}
              >
                UPI
              </button>
              <button
                className={`w-full px-4 py-3 rounded-lg border text-base font-semibold transition-colors ${selectedPaymentMethod === 'razorpay' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-blue-50'}`}
                onClick={() => setSelectedPaymentMethod('razorpay')}
              >
                Razorpay
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                onClick={handlePayment}
                disabled={!selectedPaymentMethod}
              >
                Confirm & Pay ₹{fare || 0}
              </button>
              <button
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PHome;