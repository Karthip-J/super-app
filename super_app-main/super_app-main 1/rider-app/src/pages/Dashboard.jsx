import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiArrowRight, 
  HiCurrencyRupee,
  HiStar,
  HiCheckCircle,
  HiOutlineStatusOnline,
  HiOutlineCollection,
  HiOutlineCash,
  HiOutlineCreditCard,
  HiOutlineUserCircle,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineClock
} from 'react-icons/hi';
import Header from '../components/Header.jsx';
import Map from '../components/Map.jsx';
import BottomNav from '../components/BottomNav.jsx';
import tripService from '../services/trips.jsx';
import earningsService from '../services/earnings.jsx';
import authService from '../services/auth.jsx';
import { riderAPI } from '../config/superAppApi';
import DeliveryDashboard from './DeliveryDashboard.jsx';
import deliveryService from '../services/deliveries.jsx';

const Dashboard = ({ isOnline, toggleOnline }) => {
  const navigate = useNavigate();
  const professionalType = localStorage.getItem('professionalType');
  const [currentUser, setCurrentUser] = useState(null);
  const [userIsOnline, setUserIsOnline] = useState(false);
  const [tripStats, setTripStats] = useState(null);
  const [earningsStats, setEarningsStats] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recentCompletedTrip, setRecentCompletedTrip] = useState(null);
  const [recentRatingTrip, setRecentRatingTrip] = useState(null);
  const [recentPayment, setRecentPayment] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [riderRating, setRiderRating] = useState(0);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load user profile
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      
      // Set online status from user data
      if (user) {
        setUserIsOnline(user.is_online || false);
      }

      // Load rider profile from backend to get rating
      try {
        const profileResponse = await riderAPI.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const profile = profileResponse.data;
          // Use rider's rating from profile, or calculate average_rating if available
          const profileRating = profile.average_rating || profile.rating || 0;
          setRiderRating(profileRating);
        }
      } catch (error) {
        console.error('Error fetching rider profile:', error);
      }

      // Load trip statistics
      const stats = await tripService.getTripStats();
      setTripStats(stats);

      // Load earnings data
      const earnings = await earningsService.getEarnings('all');
      setEarningsStats(earnings);

      // Load recent trips
      const trips = await tripService.getTrips();
      const latestCompleted = trips.find(trip => trip.status === 'completed');
      setRecentCompletedTrip(latestCompleted || null);
      
      const latestRating = trips.find(trip => trip.rating && trip.rating > 0);
      setRecentRatingTrip(latestRating || null);

      // Load recent payments
      const recentTransactions = await earningsService.getRecentTransactions(5);
      setRecentPayment(recentTransactions[0] || null);

      // Load available orders
      const orders = await tripService.getAvailableOrders();
      setAvailableOrders(orders);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  // Handle online/offline toggle
  const handleOnlineToggle = async () => {
    try {
      const newStatus = !userIsOnline;
      setUserIsOnline(newStatus);
      
      // Update backend
      await riderAPI.toggleOnlineStatus(newStatus);
      
      // Update local user data
      if (currentUser) {
        const updatedUser = { ...currentUser, is_online: newStatus };
        setCurrentUser(updatedUser);
        localStorage.setItem('rider-user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating online status:', error);
      // Revert on error
      setUserIsOnline(!userIsOnline);
    }
  };

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/');
      return;
    }

    loadDashboardData();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(refreshDashboard, 30000);

    return () => {
      clearInterval(refreshInterval);
    };
  }, [navigate]);

  if (professionalType === 'delivery') {
    return <DeliveryDashboard />;
  }

  // Helper to format 'time ago'
  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    switch (action) {
      case 'go_online':
        toggleOnline();
        break;
      case 'view_trips':
        navigate('/trips');
        break;
      case 'view_earnings':
        navigate('/earnings');
        break;
      case 'view_profile':
        navigate('/profile');
        break;
      case 'view_analytics':
        navigate('/analytics');
        break;
      case 'view_available_orders':
        navigate('/available-orders');
        break;
      default:
        break;
    }
  };

  // Handle accepting an order
  const handleAcceptOrder = async (order) => {
    try {
      // Get order type from order object - backend returns 'type' field
      const orderType = order.type || order.order_type || 'grocery';
      // Convert orderId to string in case it's an ObjectId
      const orderId = String(order.id || order.order_id || order._id || '');
      
      console.log('Accepting order:', { orderId, orderType, order });
      
      if (!orderId || orderId === 'undefined' || orderId === 'null') {
        alert('Invalid order. Missing order ID.');
        return;
      }
      
      // Accept the order via backend API
      const acceptResult = await tripService.acceptOrder(orderId, orderType);
      
      console.log('Accept result:', acceptResult);
      
      if (acceptResult) {
        // Create a delivery entry for tracking
        const newDelivery = deliveryService.createDelivery({
          pickup: order.pickup,
          dropoff: order.dropoff,
          package: orderType,
          payment: order.fare || order.payment || 0,
          customer: order.customerName || order.customer || 'Customer',
          customerPhone: order.customer_phone || order.customerPhone || '',
          pickupType: order.pickupType || 'address',
          dropoffType: order.dropoffType || 'address',
          groceryItems: order.groceryItems || [],
          status: 'pending',
        });

        // Navigate to pickup page with the order data
        navigate('/delivery-navigate-to-pickup', { 
          state: { 
            id: newDelivery.id,
            orderId: orderId,
            pickup: order.pickup, 
            dropoff: order.dropoff, 
            package: orderType,
            payment: order.fare || order.payment || 0,
            customer: order.customerName || order.customer || 'Customer',
            customerPhone: order.customer_phone || order.customerPhone || '',
            pickupType: order.pickupType || 'address',
            dropoffType: order.dropoffType || 'address',
            groceryItems: order.groceryItems || [],
            otp: newDelivery.otp
          } 
        });
      } else {
        alert('Failed to accept order. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      // Show the actual error message from backend
      const errorMessage = error.message || error.data?.message || 'Failed to accept order. Please try again.';
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="text-2xl mb-4">🔄</div>
          <div className="text-base text-gray-600 dark:text-gray-400">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header 
        title="Dashboard" 
        showBackButton={false}
        rightAction={
          <button 
            onClick={refreshDashboard}
            disabled={isRefreshing}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.5 : 1
            }}
          >
            {isRefreshing ? '🔄' : '🔄'}
          </button>
        }
      />

      <div className="p-4">
        {/* Online Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-md transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold mb-1 text-gray-900 dark:text-white">
                {currentUser?.name || 'Rider'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser?.vehicle_type || 'Bike'} • {currentUser?.vehicle_model || 'Vehicle'}
              </div>
            </div>
            <div 
              onClick={handleOnlineToggle}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 20,
                background: userIsOnline ? '#10B981' : '#EF4444',
                color: 'white',
                fontSize: 14,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <HiOutlineStatusOnline />
              {userIsOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard 
            value={tripStats?.total || 0}
            label="Total Trips"
            icon={<HiOutlineCollection />}
          />
          <StatCard 
            value={earningsService.formatCurrency(earningsStats?.total_earnings || 0)}
            label="Total Earnings"
            icon={<HiCurrencyRupee />}
          />
          <StatCard 
            value={tripStats?.completed || 0}
            label="Completed"
            icon={<HiCheckCircle />}
          />
          <StatCard 
            value={riderRating > 0 ? riderRating : (tripStats?.averageRating || 0)}
            label="Rating"
            icon={<HiStar />}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <div className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              onClick={() => handleQuickAction('view_trips')}
              icon={<HiOutlineCalendar />}
              label="My Trips"
              subtext="View trip history"
              color="blue"
            />
            <ActionButton
              onClick={() => handleQuickAction('view_earnings')}
              icon={<HiOutlineCash />}
              label="Earnings"
              subtext="Check your earnings"
              color="green"
            />
            <ActionButton
              onClick={() => handleQuickAction('view_profile')}
              icon={<HiOutlineUserCircle />}
              label="Profile"
              subtext="Update your profile"
              color="purple"
            />
            <ActionButton
              onClick={() => handleQuickAction('view_analytics')}
              icon={<HiOutlineChartBar />}
              label="Analytics"
              subtext="View performance"
              color="orange"
            />
          </div>
        </div>

        {/* Available Orders */}
        {availableOrders.length > 0 && (
          <div className="mb-4">
            <div className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              Available Orders ({availableOrders.length})
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md transition-colors duration-300">
              {availableOrders.slice(0, 3).map((order, index) => (
                <div key={order.id} className={`flex justify-between items-center py-3 ${index < availableOrders.slice(0, 3).length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {order.order_type} Delivery
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {order.pickup} → {order.dropoff}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-green-600 dark:text-green-400">
                      ₹{order.fare}
                    </div>
                    <button
                      onClick={() => handleAcceptOrder(order)}
                      className="bg-green-600 hover:bg-green-700 text-white border-none rounded-md px-2 py-1 text-xs cursor-pointer transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
              {availableOrders.length > 3 && (
                <div style={{ textAlign: 'center', paddingTop: 12 }}>
                  <button
                    onClick={() => navigate('/available-orders')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3B82F6',
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    View All ({availableOrders.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-4">
          <div className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Recent Activity</div>
          
          {recentCompletedTrip && (
            <ActivityCard
              icon={<HiCheckCircle />}
              title="Trip Completed"
              description={`${recentCompletedTrip.pickup} → ${recentCompletedTrip.dropoff}`}
              meta={`₹${recentCompletedTrip.fare}`}
              time={timeAgo(recentCompletedTrip.endTime)}
              color="green"
            />
          )}
          
          {recentRatingTrip && (
            <ActivityCard
              icon={<HiStar />}
              title="New Rating"
              description={`${recentRatingTrip.customerName} rated your service`}
              meta={`${recentRatingTrip.rating}⭐`}
              time={timeAgo(recentRatingTrip.endTime)}
              color="yellow"
            />
          )}
          
          {recentPayment && (
            <ActivityCard
              icon={<HiCurrencyRupee />}
              title="Payment Received"
              description={recentPayment.description}
              meta={earningsService.formatCurrency(recentPayment.amount)}
              time={timeAgo(recentPayment.date)}
              color="blue"
            />
          )}
          
          {!recentCompletedTrip && !recentRatingTrip && !recentPayment && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
              No recent activity
            </div>
          )}
        </div>

        {/* Map Toggle */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowMap(!showMap)}
            style={{
              width: '100%',
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {showMap ? 'Hide Map' : 'Show Map'}
            <HiArrowRight style={{ transform: showMap ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        {showMap && (
          <div style={{ marginBottom: 16 }}>
            <Map />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ value, label, icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-md transition-colors duration-300">
    <div className="text-2xl mb-2 text-gray-700 dark:text-gray-300">{icon}</div>
    <div className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{value}</div>
    <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
  </div>
);

// Action Button Component
const ActionButton = ({ onClick, icon, label, subtext, color, variant = 'solid' }) => (
  <button
    onClick={onClick}
    style={{
      background: variant === 'solid' ? color : 'white',
      color: variant === 'solid' ? 'white' : color,
      border: variant === 'outline' ? `2px solid ${color}` : 'none',
      borderRadius: 12,
      padding: 16,
      cursor: 'pointer',
      textAlign: 'left',
      width: '100%'
    }}
  >
    <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 12, opacity: 0.8 }}>{subtext}</div>
  </button>
);

// Activity Card Component
const ActivityCard = ({ icon, title, description, meta, time, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };
  const textColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400'
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-2 shadow-md flex items-center gap-3 transition-colors duration-300">
      <div className={`w-10 h-10 rounded-full ${colorClasses[color] || 'bg-blue-500'} text-white flex items-center justify-center text-lg`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold mb-0.5 text-gray-900 dark:text-white">{title}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{description}</div>
        <div className="text-xs text-gray-500 dark:text-gray-500">{time}</div>
      </div>
      <div className={`text-sm font-bold ${textColorClasses[color] || 'text-blue-600'}`}>{meta}</div>
    </div>
  );
};

export default Dashboard;