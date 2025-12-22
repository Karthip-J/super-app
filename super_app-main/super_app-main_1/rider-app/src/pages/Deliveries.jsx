import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import DeliveryBottomNav from '../components/DeliveryBottomNav.jsx';
import deliveryService from '../services/deliveries.jsx';

const Deliveries = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [isLoading, setIsLoading] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render

  // Filter deliveries based on status and search term
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesFilter = filter === 'all' || delivery.status === filter;
    const matchesSearch = !searchTerm || (
      (delivery.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (delivery.pickup?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (delivery.dropoff?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (delivery.package?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (delivery.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (delivery.itemDescription?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    return matchesFilter && matchesSearch;
  });

  // Sort filtered deliveries based on selected sort option
  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    switch (sortBy) {
      case 'time':
        const aTime = new Date(a.startTime || 0).getTime();
        const bTime = new Date(b.startTime || 0).getTime();
        return bTime - aTime; // Most recent first
      case 'payment':
        return (b.payment || b.fare || 0) - (a.payment || a.fare || 0); // Highest payment first
      case 'distance':
        const aDist = parseFloat(a.distance?.replace(' km', '') || '0');
        const bDist = parseFloat(b.distance?.replace(' km', '') || '0');
        return bDist - aDist; // Longest distance first
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1); // High priority first
      default:
        // Default to time sorting
        const defaultATime = new Date(a.startTime || 0).getTime();
        const defaultBTime = new Date(b.startTime || 0).getTime();
        return defaultBTime - defaultATime;
    }
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date
  const formatDate = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle delivery action
  const handleDeliveryAction = (delivery) => {
    console.log('Handling delivery action:', delivery);
    
    if (delivery.status === 'pending') {
      // Start delivery - transition to active
      console.log('Starting delivery:', delivery.id);
      const result = deliveryService.startDelivery(delivery.id);
      console.log('Start delivery result:', result);
      
      navigate('/delivery-navigate-to-pickup', { 
        state: { 
          id: delivery.id,
          pickup: delivery.pickup, 
          dropoff: delivery.dropoff, 
          package: delivery.package || delivery.itemDescription,
          payment: delivery.payment || delivery.fare,
          customer: delivery.customer || delivery.customerName,
          pickupType: delivery.pickupType,
          dropoffType: delivery.dropoffType
        } 
      });
    } else if (delivery.status === 'active') {
      // Continue delivery
      console.log('Continuing active delivery:', delivery.id);
      navigate('/delivery-in-progress', { 
        state: { 
          id: delivery.id,
          pickup: delivery.pickup, 
          dropoff: delivery.dropoff, 
          package: delivery.package || delivery.itemDescription,
          payment: delivery.payment || delivery.fare,
          customer: delivery.customer || delivery.customerName,
          pickupType: delivery.pickupType,
          dropoffType: delivery.dropoffType
        } 
      });
    }
  };

  // Handle delivery cancellation
  const handleCancelDelivery = (delivery, reason) => {
    deliveryService.cancelDelivery(delivery.id, reason);
    // Force refresh
    setForceUpdate(prev => prev + 1);
  };

  // Handle delivery deletion
  const handleDeleteDelivery = (deliveryId) => {
    deliveryService.deleteDelivery(deliveryId);
    setForceUpdate(prev => prev + 1);
  };

  // Load deliveries from service
  const loadDeliveries = () => {
    console.log('Loading deliveries from service...');
    const allDeliveries = deliveryService.reloadFromStorage();
    console.log('Deliveries loaded in UI:', allDeliveries);
    console.log('Active deliveries:', allDeliveries.filter(d => d.status === 'active'));
    console.log('Completed deliveries:', allDeliveries.filter(d => d.status === 'completed'));
    console.log('Pending deliveries:', allDeliveries.filter(d => d.status === 'pending'));
    console.log('Cancelled deliveries:', allDeliveries.filter(d => d.status === 'cancelled'));
    
    setDeliveries(allDeliveries);
    setForceUpdate(prev => prev + 1); // Force re-render
  };

  // Refresh deliveries
  const refreshDeliveries = async () => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      loadDeliveries();
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    // Load initial deliveries
    console.log('Deliveries component mounted');
    loadDeliveries();
    
    // Listen for delivery updates
    const handleDeliveriesChanged = () => {
      console.log('Deliveries data changed event received');
      // Add a small delay to ensure the service has updated
      setTimeout(() => {
        loadDeliveries();
      }, 100);
    };
    
    window.addEventListener('deliveriesDataChanged', handleDeliveriesChanged);
    console.log('Event listener added for deliveriesDataChanged');
    
    // Set up periodic refresh (every 10 seconds for better responsiveness)
    const interval = setInterval(refreshDeliveries, 10000);
    
    return () => {
      window.removeEventListener('deliveriesDataChanged', handleDeliveriesChanged);
      clearInterval(interval);
    };
  }, []);

  // Monitor deliveries state changes
  useEffect(() => {
    console.log('Deliveries state changed:', deliveries.map(d => ({ id: d.id, status: d.status })));
    console.log('Active count:', deliveries.filter(d => d.status === 'active').length);
    console.log('Completed count:', deliveries.filter(d => d.status === 'completed').length);
    console.log('Pending count:', deliveries.filter(d => d.status === 'pending').length);
    console.log('Cancelled count:', deliveries.filter(d => d.status === 'cancelled').length);
  }, [deliveries]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="w-full max-w-md mx-auto overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deliveries</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage and track all your deliveries
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-600">
                    {deliveries.filter(d => d.status === 'active').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">📦</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {deliveries.filter(d => d.status === 'completed').length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Results Count */}
          {filter !== 'all' && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Showing {sortedDeliveries.length} {filter} delivery{sortedDeliveries.length !== 1 ? 'ies' : ''} 
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search deliveries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {['all', 'active', 'pending', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    filter === status
                      ? 'bg-yellow-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
              >
                <option value="time">Time</option>
                <option value="payment">Payment</option>
                <option value="distance">Distance</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          {/* Deliveries List */}
          <div className="space-y-4">
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Refreshing...</p>
              </div>
            )}

            {sortedDeliveries.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-gray-600 dark:text-gray-400">No deliveries found</p>
              </div>
            ) : (
              sortedDeliveries.map((delivery) => {
                console.log('Rendering delivery card:', {
                  id: delivery.id,
                  status: delivery.status,
                  statusColor: getStatusColor(delivery.status || 'unknown'),
                  priority: delivery.priority,
                  priorityColor: getPriorityColor(delivery.priority || 'low')
                });
                
                return (
                  <div
                    key={`${delivery.id}-${delivery.status}-${forceUpdate}`}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          #{delivery.id || 'N/A'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status || 'unknown')}`}>
                          {delivery.status || 'unknown'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(delivery.priority || 'low')}`}>
                          {delivery.priority || 'low'}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-green-600">₹{delivery.payment || delivery.fare || 0}</span>
                    </div>

                    {/* Route */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">{delivery.pickup || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-gray-700 dark:text-gray-300">{delivery.dropoff || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                        <span className="ml-1 text-gray-700 dark:text-gray-300">{delivery.customer || delivery.customerName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                        <span className="ml-1 text-gray-700 dark:text-gray-300">{delivery.customerPhone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Package:</span>
                        <span className="ml-1 text-gray-700 dark:text-gray-300">{delivery.package || delivery.itemDescription || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Distance:</span>
                        <span className="ml-1 text-gray-700 dark:text-gray-300">{delivery.distance || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* Grocery Items Display */}
                    {delivery.groceryItems && Array.isArray(delivery.groceryItems) && delivery.groceryItems.length > 0 && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Order Items</h4>
                        <div className="space-y-1">
                          {delivery.groceryItems.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs">
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

                    {/* Time Information + Delete Button */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <div>
                        {delivery.status === 'completed' ? (
                          <>
                            Started: {formatDate(delivery.startTime)} at {formatTime(delivery.startTime)}
                            <br />
                            Completed: {formatDate(delivery.endTime)} at {formatTime(delivery.endTime)}
                          </>
                        ) : delivery.status === 'cancelled' ? (
                          <>
                            Started: {formatDate(delivery.startTime)} at {formatTime(delivery.startTime)}
                            <br />
                            Cancelled: {formatDate(delivery.cancelledAt)} at {formatTime(delivery.cancelledAt)}
                          </>
                        ) : (
                          <>
                            Started: {formatDate(delivery.startTime)} at {formatTime(delivery.startTime)}
                            {delivery.startedAt && delivery.startedAt !== delivery.startTime && (
                              <span className="ml-2">
                                • Active: {formatDate(delivery.startedAt)} at {formatTime(delivery.startedAt)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteDelivery(delivery.id)}
                        className="p-2 rounded-full transition-colors duration-150 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                        title="Delete Delivery"
                        aria-label="Delete Delivery"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>

                    {/* Action Buttons */}
                    {(delivery.status === 'pending' || delivery.status === 'active') && (
                      <button
                        onClick={() => handleDeliveryAction(delivery)}
                        className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                          delivery.status === 'active'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        }`}
                      >
                        {delivery.status === 'active' ? 'Continue Delivery' : 'Start Delivery'}
                      </button>
                    )}

                    {/* Cancel Reason */}
                    {delivery.status === 'cancelled' && delivery.cancelReason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Cancelled: {delivery.cancelReason}
                        </span>
                      </div>
                    )}

                    {/* Completion Details */}
                    {delivery.status === 'completed' && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <div className="text-xs text-green-600 dark:text-green-400">
                          <div>✅ Delivery completed successfully</div>
                          {delivery.rating && (
                            <div className="mt-1">⭐ Rating: {delivery.rating}/5</div>
                          )}
                          {delivery.paymentMethod && (
                            <div className="mt-1">💳 Payment: {delivery.paymentMethod}</div>
                          )}
                          {delivery.groceryItems && Array.isArray(delivery.groceryItems) && delivery.groceryItems.length > 0 && (
                            <div className="mt-1">📦 {delivery.groceryItems.length} items delivered</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <DeliveryBottomNav />
    </div>
  );
};

export default Deliveries; 