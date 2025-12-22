import React from 'react';
import { FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { FaStar, FaCar } from 'react-icons/fa';
import PropTypes from 'prop-types';

const TripCard = ({ 
  trip, 
  onClick, 
  onDelete, 
  onComplete, 
  onCancel,
  onAccept, 
  onReject, 
  className = '',
  isLoading = false
}) => {
  if (!trip) {
    return (
      <div className={`bg-white rounded-lg p-4 text-red-500 text-center ${className}`}>
        Trip data unavailable
      </div>
    );
  }

  const status = trip.status?.toLowerCase() || 'unknown';
  
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      case 'ongoing': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'completed': return 'border-l-green-500';
      case 'ongoing': return 'border-l-blue-500';
      case 'cancelled': return 'border-l-red-500';
      case 'pending': return 'border-l-yellow-500';
      default: return 'border-l-gray-500 dark:border-l-gray-700';
    }
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    if (!isLoading && action) {
      action(trip.id);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md ${getBorderColor()} border-l-4 cursor-pointer relative transition-all hover:shadow-lg ${className}`}
      onClick={!isLoading ? onClick : undefined}
      aria-disabled={isLoading}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-70 flex items-center justify-center rounded-xl z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Trip Route */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-300 font-semibold uppercase tracking-wider">Pickup</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{trip.pickup}</div>
          </div>
          
          <FiArrowRight className="flex-shrink-0 text-gray-400 dark:text-gray-500 text-xl" />
          
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-300 font-semibold uppercase tracking-wider">Dropoff</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{trip.dropoff}</div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor()} flex-shrink-0`}>
            {trip.status || 'Unknown'}
          </span>
        </div>
        
        {/* Trip Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider">Distance</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{trip.distance || '--'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{trip.duration || '--'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{trip.customerName || '--'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment</div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{trip.paymentMethod || 'Cash'}</div>
          </div>
        </div>
        
        {/* Date and Time */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {trip.date} at {trip.time}
        </div>
      </div>
      
      {/* Fare and Actions */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">₹{trip.fare || '0'}</div>
          {trip.rating && (
            <div className="flex items-center gap-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="text-xs text-gray-600 dark:text-gray-300">{trip.rating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Ongoing Trip Actions */}
          {status === 'ongoing' && (
            <>
              <button 
                className={`bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => handleAction(e, onComplete)}
                disabled={isLoading}
              >
                Complete
              </button>
              <button 
                className={`bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => handleAction(e, onCancel)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </>
          )}
          
          {/* Pending Ride Requests */}
          {status === 'pending' && (
            <>
              <button
                className={`bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => handleAction(e, onAccept)}
                disabled={isLoading}
              >
                Accept
              </button>
              <button
                className={`bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={(e) => handleAction(e, onReject)}
                disabled={isLoading}
              >
                Reject
              </button>
            </>
          )}
          
          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={(e) => handleAction(e, onDelete)}
              title="Delete trip"
              className={`text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Delete trip"
              disabled={isLoading}
            >
              <FiTrash2 className="text-lg" />
            </button>
          )}
        </div>
      </div>
      
      {/* Ongoing Trip Indicator */}
      {status === 'ongoing' && (
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-2 mt-3 flex items-center justify-between">
          <span className="text-blue-700 dark:text-blue-300 font-semibold text-xs flex items-center gap-1">
            <FaCar className="text-sm" />
            <span>Trip in Progress</span>
          </span>
        </div>
      )}
      
      {/* Cancellation Reason */}
      {status === 'cancelled' && trip.cancelReason && (
        <div className="text-red-600 dark:text-red-400 font-semibold text-xs mt-2">
          Cancelled: {trip.cancelReason}
        </div>
      )}
    </div>
  );
};

TripCard.propTypes = {
  trip: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    pickup: PropTypes.string,
    dropoff: PropTypes.string,
    distance: PropTypes.string,
    duration: PropTypes.string,
    customerName: PropTypes.string,
    paymentMethod: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    fare: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rating: PropTypes.number,
    cancelReason: PropTypes.string,
  }),
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onComplete: PropTypes.func,
  onCancel: PropTypes.func,
  onAccept: PropTypes.func,
  onReject: PropTypes.func,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default TripCard;