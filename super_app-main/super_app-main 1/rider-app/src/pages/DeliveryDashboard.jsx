import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryHeader from '../components/DeliveryHeader.jsx';
import DeliveryBottomNav from '../components/DeliveryBottomNav.jsx';
import deliveryService from '../services/deliveries.jsx';
import authService from '../services/auth.jsx';

const DeliveryDashboard = () => {
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    completionRate: 0,
    cancellationRate: 0
  });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Delivery Partner');
  const navigate = useNavigate();

  // Get current user
  const currentUser = authService.getCurrentUser?.();
  
  // Update user name when component mounts or user changes
  useEffect(() => {
    const updateUserName = () => {
      const user = authService.getCurrentUser?.();
      const name = user?.name || user?.profile?.personal?.name || 'Delivery Partner';
      setUserName(name);
    };
    
    updateUserName();
  }, []);

  // Load delivery data
  useEffect(() => {
    const loadDeliveryData = () => {
      const stats = deliveryService.getDeliveryStats();
      
      // Calculate completed deliveries for today only
      const allDeliveries = deliveryService.getDeliveries();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedToday = allDeliveries.filter(delivery => {
        if (delivery.status !== 'completed') return false;
        if (!delivery.completedAt && !delivery.endTime) return false;
        
        const completedDate = new Date(delivery.completedAt || delivery.endTime);
        completedDate.setHours(0, 0, 0, 0);
        
        return completedDate.getTime() === today.getTime();
      }).length;
      
      // Update stats with today's completed count
      const updatedStats = {
        ...stats,
        completed: completedToday
      };
      
      setDeliveryStats(updatedStats);
      
      // Get recent deliveries (last 3)
      const recent = allDeliveries
        .sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0))
        .slice(0, 3);
      setRecentDeliveries(recent);
      
      setIsLoading(false);
    };
    
    // Load data initially
    loadDeliveryData();
    
    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(loadDeliveryData, 30000);
    
    // Listen for delivery updates
    const handleDeliveriesChanged = () => {
      loadDeliveryData();
    };
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      // Update user name when profile changes
      const user = authService.getCurrentUser?.();
      const name = user?.name || user?.profile?.personal?.name || 'Delivery Partner';
      setUserName(name);
    };
    
    window.addEventListener('deliveriesDataChanged', handleDeliveriesChanged);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('deliveriesDataChanged', handleDeliveriesChanged);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      clearInterval(interval);
    };
  }, []);
  const handleQuickAction = (action) => {
    switch (action) {
      case 'go_online': navigate('/go-online'); break;
      case 'view_deliveries': navigate('/deliveries'); break;
      case 'view_earnings': navigate('/delivery-earnings'); break;
      case 'view_wallet': navigate('/delivery-wallet'); break;
      default: break;
    }
  };

  // Helper to format 'time ago'
  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-yellow-50 dark:bg-gray-900 flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-200">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 dark:bg-gray-900 pb-20">
      <DeliveryHeader />
      
      <main className="p-4 max-w-md mx-auto">
        <div className="bg-gradient-to-r from-yellow-100 to-yellow-300 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 mb-4 shadow-sm border border-yellow-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">
            Welcome, {userName}!
          </h1>
          <p className="text-gray-700 dark:text-gray-300">Ready to deliver packages and earn more?</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <DeliveryStatCard value={`₹${deliveryStats.totalEarnings || 0}`} label="Total Earnings" />
          <DeliveryStatCard value={deliveryStats.completed} label="Completed Today" />
          <DeliveryStatCard value={`${deliveryStats.completionRate || 0}%`} label="Completion Rate" />
          <DeliveryStatCard value={deliveryStats.averageRating || 0} label="Average Rating" />
          <DeliveryStatCard value={`${deliveryStats.total}`} label="Total Deliveries" />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <DeliveryActionButton 
              label="Go Online" 
              color="bg-yellow-500 hover:bg-yellow-600" 
              onClick={() => handleQuickAction('go_online')} 
            />
            <DeliveryActionButton 
              label="Deliveries" 
              color="bg-blue-500 hover:bg-blue-600" 
              onClick={() => handleQuickAction('view_deliveries')} 
            />
            <DeliveryActionButton 
              label="Earnings" 
              color="bg-green-500 hover:bg-green-600" 
              onClick={() => handleQuickAction('view_earnings')} 
            />
            <DeliveryActionButton 
              label="Wallet" 
              color="bg-purple-500 hover:bg-purple-600" 
              onClick={() => handleQuickAction('view_wallet')} 
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-800 dark:text-gray-100">Recent Deliveries</h3>
            <button
              onClick={() => navigate('/deliveries')}
              className="text-yellow-600 dark:text-yellow-400 text-sm flex items-center"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentDeliveries.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No deliveries yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs">Start accepting deliveries to see them here</p>
              </div>
            ) : (
              recentDeliveries.map((delivery) => (
                <DeliveryActivityCard 
                  key={delivery.id}
                  title={delivery.status === 'completed' ? 'Delivery Completed' : 
                         delivery.status === 'cancelled' ? 'Delivery Cancelled' :
                         delivery.status === 'active' ? 'Delivery Active' : 'Delivery Pending'}
                  description={`${delivery.pickup || 'N/A'} → ${delivery.dropoff || 'N/A'}`}
                  meta={delivery.payment ? `₹${delivery.payment} earned` : ''}
                  time={timeAgo(delivery.startTime)}
                  status={delivery.status}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const DeliveryStatCard = ({ value, label }) => (
  <div className="bg-yellow-100 dark:bg-gray-800 p-3 rounded-lg shadow-xs flex flex-col items-center">
    <div className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-1">{value}</div>
    <div className="flex items-center text-yellow-700 dark:text-yellow-300 text-xs font-normal">{label}</div>
  </div>
);

const DeliveryActionButton = ({ label, color, onClick }) => (
  <button className={`rounded-xl p-3 transition-all duration-200 flex flex-col items-center text-white font-medium ${color}`} onClick={onClick}>
    <span className="text-lg mb-1">{label}</span>
  </button>
);

const DeliveryActivityCard = ({ title, description, meta, time, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center p-2 bg-yellow-50 dark:bg-gray-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-gray-700 transition-colors">
      <div className="mr-3">
        <span className="bg-yellow-200 dark:bg-yellow-900 p-2 rounded-full">📦</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-100 truncate">{title}</h4>
          {status && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {status}
            </span>
          )}
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 truncate">{description} {meta && `• ${meta}`}</p>
      </div>
      <div className="text-xs text-yellow-500 ml-2 whitespace-nowrap">{time}</div>
    </div>
  );
};

export default DeliveryDashboard; 