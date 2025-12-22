import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryHeader from '../components/DeliveryHeader.jsx';
import DeliveryBottomNav from '../components/DeliveryBottomNav.jsx';
import deliveryService from '../services/deliveries.jsx';
import { 
  HiCurrencyRupee,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineStar
} from 'react-icons/hi';

const DeliveryEarnings = () => {
  const navigate = useNavigate();
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
    deliveries: [],
    stats: {
      totalDeliveries: 0,
      averageRating: 0,
      onTimeRate: 0,
      totalDistance: 0,
      averagePerDelivery: 0
    }
  });
  const [timeFilter, setTimeFilter] = useState('today');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate earnings from real delivery data
  const calculateEarnings = () => {
    const allDeliveries = deliveryService.getDeliveries();
    const completedDeliveries = allDeliveries.filter(d => d.status === 'completed');
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const todayDeliveries = completedDeliveries.filter(d => 
      new Date(d.endTime || d.startTime) >= today
    );
    const weekDeliveries = completedDeliveries.filter(d => 
      new Date(d.endTime || d.startTime) >= weekAgo
    );
    const monthDeliveries = completedDeliveries.filter(d => 
      new Date(d.endTime || d.startTime) >= monthAgo
    );
    
    const todayEarnings = todayDeliveries.reduce((sum, d) => sum + (d.fare || 0), 0);
    const weekEarnings = weekDeliveries.reduce((sum, d) => sum + (d.fare || 0), 0);
    const monthEarnings = monthDeliveries.reduce((sum, d) => sum + (d.fare || 0), 0);
    const totalEarnings = completedDeliveries.reduce((sum, d) => sum + (d.fare || 0), 0);
    
    // Calculate stats
    const totalDeliveries = completedDeliveries.length;
    const averageRating = totalDeliveries > 0 
      ? (completedDeliveries.reduce((sum, d) => sum + (d.rating || 0), 0) / totalDeliveries).toFixed(1)
      : 0;
    const averagePerDelivery = totalDeliveries > 0 ? Math.round(totalEarnings / totalDeliveries) : 0;
    
    // Recent deliveries (last 5)
    const recentDeliveries = completedDeliveries
      .sort((a, b) => new Date(b.endTime || b.startTime) - new Date(a.endTime || a.startTime))
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        date: d.endTime || d.startTime,
        pickup: d.pickup,
        dropoff: d.dropoff,
        customer: d.customerName || 'Customer',
        amount: d.fare || 0,
        status: d.status,
        rating: d.rating || 0
      }));
    
    return {
      today: todayEarnings,
      week: weekEarnings,
      month: monthEarnings,
      total: totalEarnings,
      deliveries: recentDeliveries,
      stats: {
        totalDeliveries,
        averageRating: parseFloat(averageRating),
        onTimeRate: 98, // Could be calculated based on actual delivery times
        totalDistance: 0, // Could be calculated if distance is stored
        averagePerDelivery
      }
    };
  };

  // Load earnings data
  const loadEarnings = () => {
    setIsLoading(true);
    const calculatedEarnings = calculateEarnings();
    setEarnings(calculatedEarnings);
    setIsLoading(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get earnings for selected time period
  const getEarningsForPeriod = (period) => {
    switch (period) {
      case 'today': return earnings.today;
      case 'week': return earnings.week;
      case 'month': return earnings.month;
      case 'total': return earnings.total;
      default: return earnings.today;
    }
  };

  // Refresh earnings data
  const refreshEarnings = async () => {
    loadEarnings();
  };

  useEffect(() => {
    loadEarnings();
    
    // Listen for delivery updates
    const handleDeliveriesChanged = () => {
      loadEarnings();
    };
    
    window.addEventListener('deliveriesDataChanged', handleDeliveriesChanged);
    
    // Set up real-time updates (every 30 seconds)
    const interval = setInterval(loadEarnings, 30000);
    
    return () => {
      window.removeEventListener('deliveriesDataChanged', handleDeliveriesChanged);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DeliveryHeader />
      <div className="w-full max-w-md mx-auto overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delivery Earnings</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track your delivery income and performance
            </p>
          </div>

          {/* Main Earnings Card */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(getEarningsForPeriod(timeFilter))}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <HiCurrencyRupee className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            {/* Time Filter Buttons */}
            <div className="flex space-x-2">
              {['today', 'week', 'month', 'total'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    timeFilter === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {earnings.stats.totalDeliveries}
                  </p>
                </div>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📦</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {earnings.stats.averageRating}⭐
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <HiOutlineStar className="text-yellow-600 text-sm" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {earnings.stats.onTimeRate}%
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">⏱️</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Per Delivery</p>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{earnings.stats.averagePerDelivery}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-sm">💰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800 dark:text-gray-100">Recent Deliveries</h3>
              <button 
                onClick={refreshEarnings}
                disabled={isLoading}
                className="text-yellow-600 dark:text-yellow-400 text-sm flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  'Refresh'
                )}
              </button>
            </div>
            
            <div className="space-y-3">
              {earnings.deliveries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No completed deliveries yet</p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs">Complete some deliveries to see your earnings here</p>
                </div>
              ) : (
                earnings.deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          #{delivery.id}
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{delivery.amount}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {delivery.pickup} → {delivery.dropoff}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Customer: {delivery.customer}</span>
                        <div className="flex items-center space-x-2">
                          <span>{delivery.rating}⭐</span>
                          <span>•</span>
                          <span>{formatDate(delivery.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mt-4">
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Performance Insights</h3>
            <div className="space-y-3">
              {earnings.stats.totalDeliveries > 0 ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center">
                      <HiOutlineTrendingUp className="text-green-600 mr-2" />
                      <span className="text-sm text-green-700 dark:text-green-300">Total earnings from {earnings.stats.totalDeliveries} deliveries</span>
                    </div>
                    <span className="text-green-600 font-medium">₹{earnings.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center">
                      <HiOutlineClock className="text-blue-600 mr-2" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">On-time delivery rate</span>
                    </div>
                    <span className="text-blue-600 font-medium">{earnings.stats.onTimeRate}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center">
                      <HiOutlineStar className="text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-700 dark:text-yellow-300">Average customer rating</span>
                    </div>
                    <span className="text-yellow-600 font-medium">{earnings.stats.averageRating}⭐</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Complete your first delivery to see insights</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <DeliveryBottomNav />
    </div>
  );
};

export default DeliveryEarnings; 