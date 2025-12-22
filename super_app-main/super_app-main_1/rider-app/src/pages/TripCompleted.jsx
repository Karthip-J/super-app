import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import tripService from '../services/trips.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useNotification } from '../TransactionContext.jsx';

const TripCompleted = () => {
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    const trips = tripService.getTrips('completed');
    if (trips && trips.length > 0) {
      setTrip(trips[0]);
      addNotification({
        type: 'payment',
        title: 'Payment Received',
        message: `₹${trips[0].fare} added to your wallet for trip to ${trips[0].dropoff}!`
      });
    }
  }, [addNotification]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔄</div>
          <div className="text-lg text-gray-700 dark:text-gray-200">Loading trip summary...</div>
        </div>
      </div>
    );
  }

  const startTime = trip.startTime ? new Date(trip.startTime) : null;
  const endTime = trip.endTime ? new Date(trip.endTime) : null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Scrollable content area */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-md mx-auto">
          {/* Success Header */}
          <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm px-6 py-8 text-center">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="currentColor"/>
                <path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Trip Completed</h1>
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
              {endTime ? endTime.toLocaleDateString() : ''} • {endTime ? endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
            </p>
            
            {/* Stats Card */}
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Earnings</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-gray-100">₹{trip.fare}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Trip Time</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{trip.duration || '--:--'}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Distance</div>
                  <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{trip.distance || '--'} km</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trip Details */}
          <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm px-6 py-6 mt-1 mb-4">
            <div className="space-y-5">
              {/* Customer */}
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Customer</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {trip.customerName || 'Customer'}
                  {trip.customerPhone && (
                    <span className="text-blue-600 dark:text-blue-300 font-normal ml-2 break-all">
                      {trip.customerPhone}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Locations */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Pickup Location</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                        {trip.pickup}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Dropoff Location</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-words">
                        {trip.dropoff}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Start Time</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {startTime ? startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">End Time</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {endTime ? endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                  </div>
                </div>
              </div>
              
              {/* Payment Method */}
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Payment Method</div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {trip.paymentMethod || 'Cash'}
                </div>
              </div>
              
              {/* Rating */}
              {trip.rating && (
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">Rating</div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 ml-1">
                      {trip.rating} / 5
                    </span>
                  </div>
                </div>
              )}
              
              {/* Back to Dashboard Button */}
              <div className="pt-4 pb-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default TripCompleted;