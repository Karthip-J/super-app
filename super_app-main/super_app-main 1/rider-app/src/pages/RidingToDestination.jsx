import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import tripService from '../services/trips.jsx';
import earningsService from '../services/earnings.jsx';
import BottomNav from '../components/BottomNav.jsx';
import TripStepper from '../components/TripStepper.jsx';

const RidingToDestination = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const completed = location.state && location.state.completed;
  const [tripData, setTripData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [tripStartTime, setTripStartTime] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer no-show');
  const [showQuickMsg, setShowQuickMsg] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  const cancelReasons = [
    'Customer no-show',
    'Wrong address',
    'Personal emergency',
    'Other'
  ];
  
  const quickMessages = [
    'I will arrive shortly',
    'Traffic is heavy',
    'Please be ready',
    'Call me if needed'
  ];

  useEffect(() => {
    const activeTrip = tripService.getActiveTrip();
    if (!activeTrip) {
      navigate('/dashboard');
      return;
    }

    setTripData(activeTrip);
    setTripStartTime(new Date(activeTrip.startTime));
  }, [navigate]);

  useEffect(() => {
    if (!tripData || !tripStartTime) return;
    if (completed) {
      // Freeze timer at the moment of trip completion
      const now = new Date();
      const elapsed = Math.floor((now - tripStartTime) / 1000);
      setTimer(elapsed > 0 ? elapsed : 0);
      return;
    }
    const updateTimer = () => {
      const now = new Date();
      const elapsed = Math.floor((now - tripStartTime) / 1000);
      setTimer(elapsed > 0 ? elapsed : 0);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [tripData, tripStartTime, completed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStatusChange = (newStatus) => {
    if (!tripData) return;

    let additionalData = {};
    
    if (newStatus === 'completed') {
      const randomRating = Math.floor(Math.random() * 3) + 3;
      additionalData = {
        endTime: new Date().toISOString(),
        duration: formatTime(timer),
        rating: randomRating
      };
      earningsService.addTripEarnings(tripData.id, tripData.fare);
    }

    const updatedTrip = tripService.updateTripStatus(tripData.id, newStatus, additionalData);
    if (updatedTrip) {
      setTripData(updatedTrip);
      if (newStatus === 'completed') {
        window.dispatchEvent(new Event('dashboardDataChanged'));
        navigate('/trip-completed');
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
        currentPosition: tripData.currentPosition
      }
    });
  };

  const handleCancelTrip = () => {
    if (!tripData) return;
    const updatedTrip = tripService.updateTripStatus(tripData.id, 'cancelled', { cancelReason });
    if (updatedTrip) {
      setTripData(updatedTrip);
      setShowCancelModal(false);
      window.dispatchEvent(new Event('dashboardDataChanged'));
      if (window.showNotification) {
        window.showNotification('Trip Cancelled.', 'error');
      }
      navigate('/dashboard');
    }
  };

  const handleSendQuickMsg = (msg) => {
    setShowQuickMsg(false);
    setToastMsg(`Message sent: ${msg}`);
    setTimeout(() => setToastMsg(""), 2500);
  };

  if (!tripData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔄</div>
          <div className="text-lg text-gray-700 dark:text-gray-200">Loading trip details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header />
      
      <main className="max-w-md mx-auto px-4 mt-6">
        <TripStepper currentStep={completed ? 3 : 2} />
        {/* Trip Header */}
        <div className="bg-indigo-600 dark:bg-gray-900 text-white p-6 rounded-xl shadow-md mb-0">
          <h2 className="text-xl font-semibold mb-2">Riding to Destination</h2>
          <div className="flex justify-center gap-4 flex-wrap items-center text-sm opacity-90">
            <span>Trip #{tripData.id}</span>
            <span>• Started at {tripStartTime ? tripStartTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}</span>
          </div>
        </div>

        {/* Riding Phase Content */}
        <div className="space-y-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-center mb-4">
              {completed ? (
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-1">
                    Trip Completed
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">
                    You have completed the trip for {tripData.customerName}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                     Route to Destination
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">
                    Drop {tripData.customerName} at the destination
                  </p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                  {formatTime(timer)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Trip Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                  ₹{tripData.fare}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-300">Fare</div>
              </div>
            </div>

            {!completed ? (
              <div className="flex gap-4 mb-2">
                <button
                  onClick={handleNavigate}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Navigate
                </button>
                <button
                  onClick={handleCallCustomer}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </button>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-green-800 dark:text-green-200 text-lg">Trip Completed</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Customer dropped successfully</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Trip Details</h4>
              <button
                onClick={() => setShowQuickMsg(true)}
                className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-400 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-900 transition-colors"
                aria-label="Send quick message"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Customer</div>
                <div className="font-medium dark:text-gray-100">{tripData.customerName}</div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Pickup Location</div>
                  <div className="dark:text-gray-100">{tripData.pickup}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Destination</div>
                  <div className="dark:text-gray-100">{tripData.dropoff}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {completed && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors shadow-md"
              >
                Trip Completed
              </button>
            )}
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-lg transition-colors"
            >
              Cancel Trip
            </button>
          </div>
        </div>
      </main>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 w-full max-w-sm">
            <h3 className="text-lg font-medium text-red-600 mb-2">Cancel Trip</h3>
            <div className="mb-2 text-gray-700 dark:text-gray-200">Please select a reason for cancellation:</div>
            
            <div className="space-y-2 mb-4">
              {cancelReasons.map(reason => (
                <label key={reason} className="flex items-center space-x-3 dark:text-gray-200">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelTrip}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-medium"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Message Modal */}
      {showQuickMsg && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-2 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 w-full max-w-sm">
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">Send Quick Message</div>
            
            <div className="space-y-2">
              {quickMessages.map(msg => (
                <button
                  key={msg}
                  onClick={() => handleSendQuickMsg(msg)}
                  className="w-full text-left px-4 py-3 bg-yellow-100 dark:bg-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800 text-gray-800 dark:text-gray-100 rounded-lg transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowQuickMsg(false)}
              className="w-full mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-sm animate-fade-in-out">
          {toastMsg}
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default RidingToDestination;