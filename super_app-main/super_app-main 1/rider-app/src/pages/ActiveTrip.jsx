import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import tripService from '../services/trips.jsx';
import earningsService from '../services/earnings.jsx';
import BottomNav from '../components/BottomNav.jsx';

const ActiveTrip = ({ isOnline, toggleOnline }) => {
  const navigate = useNavigate();
  const [tripData, setTripData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [tripStartTime, setTripStartTime] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer no-show');
  const cancelReasons = [
    'Customer no-show',
    'Wrong address',
    'Personal emergency',
    'Other'
  ];
  const [showQuickMsg, setShowQuickMsg] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const quickMessages = [
    'I am on the way',
    'Please wait for me',
    'Arriving soon',
    'Call me if needed'
  ];

  useEffect(() => {
    // Get active trip from service
    const activeTrip = tripService.getActiveTrip();
    if (!activeTrip) {
      // No active trip, redirect to dashboard
      navigate('/dashboard');
      return;
    }

    setTripData(activeTrip);
    setTripStartTime(new Date(activeTrip.startTime));

    // Show toast for trip started
    if (window.showNotification) {
      window.showNotification('Trip Started!', 'success');
    }

    // Redirect to appropriate page based on trip status
    if (activeTrip.status === 'active') {
      navigate('/head-to-pickup');
    } else if (activeTrip.status === 'riding') {
      navigate('/riding-to-destination');
    }
  }, [navigate]);

  useEffect(() => {
    if (!tripData) return;

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [tripData]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStatusChange = (newStatus) => {
    if (!tripData) return;

    let additionalData = {};
    
    if (newStatus === 'riding') {
      additionalData = {
        pickupTime: new Date().toISOString()
      };
    } else if (newStatus === 'completed') {
      // Assign a random rating (3, 4, or 5)
      const randomRating = Math.floor(Math.random() * 3) + 3;
      additionalData = {
        endTime: new Date().toISOString(),
        duration: formatTime(timer),
        rating: randomRating
      };
      // Add earnings to wallet
      earningsService.addTripEarnings(tripData.id, tripData.fare);
    }

    const updatedTrip = tripService.updateTripStatus(tripData.id, newStatus, additionalData);
    if (updatedTrip) {
      setTripData(updatedTrip);
      if (newStatus === 'completed') {
        window.dispatchEvent(new Event('dashboardDataChanged'));
      }
    }
  };

  const handleCallCustomer = () => {
    if (!tripData) return;
    window.open(`tel:${tripData.customerPhone}`);
  };

  const handleNavigate = () => {
    if (!tripData) return;
    navigate('/navigation-map', {
      state: {
        pickup: tripData.pickup,
        dropoff: tripData.dropoff,
        currentPosition: tripData.currentPosition // if available
      }
    });
  };

  const handleBackToMap = () => {
    navigate('/dashboard');
  };

  const handleCancelTrip = () => {
    if (!tripData) return;
    const updatedTrip = tripService.updateTripStatus(tripData.id, 'cancelled', { cancelReason });
    if (updatedTrip) {
      setTripData(updatedTrip);
      setShowCancelModal(false);
      window.dispatchEvent(new Event('dashboardDataChanged'));
      navigate('/dashboard');
      // Show toast for trip cancelled
      if (window.showNotification) {
        window.showNotification('Trip Cancelled.', 'error');
      }
    }
  };

  const handleSendQuickMsg = (msg) => {
    setShowQuickMsg(false);
    setToastMsg(`Message sent: ${msg}`);
    setTimeout(() => setToastMsg(""), 2500);
  };

  if (!tripData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔄</div>
          <div className="text-lg text-gray-700 dark:text-gray-200">Loading trip...</div>
        </div>
      </div>
    );
  }

  const renderPickupPhase = () => (
    <div className="p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-4 shadow-md">
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🚶</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Head to Pickup</h3>
          <p className="text-gray-500 text-sm mb-0">Pick up {tripData.customerName} from the pickup location</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">{formatTime(timer)}</div>
            <div className="text-xs text-gray-500">Time Elapsed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{tripData.estimatedTime || '8 mins'}</div>
            <div className="text-xs text-gray-500">ETA</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    navigate('/navigate-to-pickup', {
                      state: {
                        pickup: tripData.pickup,
                        tripId: tripData.id,
                        currentPosition: [pos.coords.latitude, pos.coords.longitude]
                      }
                    });
                  },
                  () => {
                    navigate('/navigate-to-pickup', {
                      state: {
                        pickup: tripData.pickup,
                        tripId: tripData.id
                      }
                    });
                  }
                );
              } else {
                navigate('/navigate-to-pickup', {
                  state: {
                    pickup: tripData.pickup,
                    tripId: tripData.id
                  }
                });
              }
            }}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-bold text-base hover:bg-green-700 transition-colors"
          >
            🗺️ Navigate
          </button>
          <button
            onClick={handleCallCustomer}
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-bold text-base hover:bg-blue-700 transition-colors"
          >
            📞 Call
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-gray-800 mb-0">Pickup Details</h4>
          <button
            onClick={() => setShowQuickMsg(true)}
            className="bg-none border-none rounded-full p-2 ml-2 cursor-pointer font-bold text-2xl line-height-1 flex items-center justify-center transition-colors"
            aria-label="Send quick message"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(1px 1px 3px #222)' }}>
              <path d="M4 20V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-4 4z" fill="#2196F3" stroke="#2196F3" strokeWidth="2.5" strokeLinejoin="round"/>
              <circle cx="10" cy="13" r="1.5" fill="#fff"/>
              <circle cx="14" cy="13" r="1.5" fill="#fff"/>
              <circle cx="18" cy="13" r="1.5" fill="#fff"/>
            </svg>
          </button>
        </div>
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Customer</div>
          <div className="text-base font-bold text-gray-800">{tripData.customerName}</div>
        </div>
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Pickup Location</div>
          <div className="text-base text-gray-800">{tripData.pickup}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Drop Location</div>
          <div className="text-base text-gray-800">{tripData.dropoff}</div>
        </div>
      </div>

      <button
        onClick={() => handleStatusChange('riding')}
        className="w-full bg-green-600 text-white rounded-lg py-4 font-bold text-base hover:bg-green-700 transition-colors"
      >
        ✅ Customer Picked Up
      </button>
      <button
        onClick={() => setShowCancelModal(true)}
        className="w-full bg-red-600 text-white rounded-lg py-3 font-bold text-base hover:bg-red-700 transition-colors"
      >
        ❌ Cancel Ride
      </button>
    </div>
  );

  const renderRidingPhase = () => (
    <div className="p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-4 shadow-md">
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">🏍️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Riding to Destination</h3>
          <p className="text-gray-500 text-sm mb-0">Drop {tripData.customerName} at the destination</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatTime(timer)}</div>
            <div className="text-xs text-gray-500">Trip Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">₹{tripData.fare}</div>
            <div className="text-xs text-gray-500">Fare</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleNavigate}
            className="flex-1 bg-green-600 text-white rounded-lg py-3 font-bold text-base hover:bg-green-700 transition-colors"
          >
            🗺️ Navigate
          </button>
          <button
            onClick={handleCallCustomer}
            className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-bold text-base hover:bg-blue-700 transition-colors"
          >
            📞 Call
          </button>
        </div>
      </div>

      <button
        onClick={() => handleStatusChange('completed')}
        className="w-full bg-green-600 text-white rounded-lg py-4 font-bold text-base hover:bg-green-700 transition-colors"
      >
        ✅ Trip Completed
      </button>
      <button
        onClick={() => setShowCancelModal(true)}
        className="w-full bg-red-600 text-white rounded-lg py-3 font-bold text-base hover:bg-red-700 transition-colors"
      >
        ❌ Cancel Ride
      </button>
    </div>
  );

  const renderCompletedPhase = () => (
    <div className="p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 mb-4 shadow-md text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ✅
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-1">Trip Completed!</h3>
        <p className="text-gray-500 text-sm mb-4">You've earned ₹{tripData.fare} for this trip</p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <div className="text-2xl font-bold text-green-600">₹{tripData.fare}</div>
            <div className="text-xs text-gray-500">Earnings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(timer)}
            </div>
            <div className="text-xs text-gray-500">Trip Time</div>
          </div>
        </div>

        <button
          onClick={handleBackToMap}
          className="w-full bg-indigo-600 text-white rounded-lg py-4 font-bold text-base hover:bg-indigo-700 transition-colors"
        >
          Back to Map
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-20">
      <Header />
      
      <main>
        {/* Trip Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-800 dark:from-gray-900 dark:to-purple-900 text-white py-5 px-4 text-center">
          <h2 className="text-lg font-semibold mb-1">Active Trip</h2>
          <p className="text-xs opacity-90">
            Trip #{tripData.id} • Started at {tripStartTime ? tripStartTime.toLocaleTimeString() : '--:--'}
          </p>
        </div>

        {/* Trip Content */}
        {tripData.status === 'active' && renderPickupPhase()}
        {tripData.status === 'riding' && renderRidingPhase()}
        {tripData.status === 'completed' && renderCompletedPhase()}
      </main>

      {showCancelModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-35 z-50 flex items-center justify-center p-4 box-border overflow-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 min-w-[260px] max-w-md w-full box-border shadow-xl flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Cancel Ride</h3>
            <div className="text-base text-gray-800 dark:text-gray-100 mb-4">Select a reason for cancellation:</div>
            {cancelReasons.map(reason => (
              <label key={reason} className="block text-base mb-1">
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={cancelReason === reason}
                  onChange={() => setCancelReason(reason)}
                  className="mr-2"
                />
                {reason}
              </label>
            ))}
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCancelTrip}
                className="bg-red-600 text-white rounded-lg p-3 font-bold text-base cursor-pointer"
              >
                Confirm Cancel
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3 font-bold text-base cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuickMsg && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-35 z-51 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 min-w-[260px] box-shadow-xl flex flex-col gap-3">
            <div className="font-bold text-lg mb-2">Send a quick message</div>
            {quickMessages.map(msg => (
              <button
                key={msg}
                onClick={() => handleSendQuickMsg(msg)}
                className="bg-yellow-400 text-gray-800 rounded-lg p-3 font-bold text-base cursor-pointer"
              >
                {msg}
              </button>
            ))}
            <button
              onClick={() => setShowQuickMsg(false)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3 font-bold text-base cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white rounded-lg p-4 text-base z-50 shadow-xl">
          {toastMsg}
        </div>
      )}
      <BottomNav />
    </div>
  );
};

export default ActiveTrip; 