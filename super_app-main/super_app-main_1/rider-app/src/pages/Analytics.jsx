import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineMapPin
} from 'react-icons/hi';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import tripService from '../services/trips.jsx';
import earningsService from '../services/earnings.jsx';
import authService from '../services/auth.jsx';

const Analytics = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [tripStats, setTripStats] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load analytics data
  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Load trip statistics
      const stats = await tripService.getTripStats();
      setTripStats(stats);

      // Load earnings data
      const earnings = await earningsService.getEarnings(selectedPeriod);
      setEarningsData(earnings);

      // Load performance metrics
      const metrics = await earningsService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);

      // Load chart data
      const chart = await earningsService.getEarningsChartData(selectedPeriod);
      setChartData(chart);

      // Load trips for location analysis
      const trips = await tripService.getTrips();
      const locations = analyzeTopLocations(trips);
      setTopLocations(locations);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze top pickup/dropoff locations
  const analyzeTopLocations = (trips) => {
    const locationCount = {};
    
    trips.forEach(trip => {
      if (trip.pickup) {
        locationCount[trip.pickup] = (locationCount[trip.pickup] || 0) + 1;
      }
      if (trip.dropoff) {
        locationCount[trip.dropoff] = (locationCount[trip.dropoff] || 0) + 1;
      }
    });

    return Object.entries(locationCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  };

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    await loadAnalyticsData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/');
      return;
    }

    loadAnalyticsData();
  }, [navigate, selectedPeriod]);

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🔄</div>
          <div style={{ fontSize: 16, color: '#666' }}>Loading Analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header 
        title="Analytics" 
        showBackButton={true}
        onBack={() => navigate('/dashboard')}
        rightAction={
          <button 
            onClick={refreshData}
            disabled={isRefreshing}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.5 : 1
            }}
          >
            <HiOutlineRefresh style={{ transform: isRefreshing ? 'rotate(360deg)' : 'none' }} />
          </button>
        }
      />

      <div style={{ padding: '16px' }}>
        {/* Period Selector */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', background: 'white', borderRadius: 12, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {['week', 'month', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: 8,
                  background: selectedPeriod === period ? '#3B82F6' : 'transparent',
                  color: selectedPeriod === period ? 'white' : '#666',
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        {tripStats && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Key Metrics</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981', marginBottom: 4 }}>
                  {tripStats.total}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>Total Trips</div>
              </div>
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4 }}>
                  {tripStats.completed}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>Completed</div>
              </div>
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B', marginBottom: 4 }}>
                  {tripStats.averageRating}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>Avg Rating</div>
              </div>
              <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 }}>
                  {tripStats.cancelled}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>Cancelled</div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Overview */}
        {performanceMetrics && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Performance Overview</div>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', marginBottom: 4 }}>
                    {formatCurrency(performanceMetrics.totalEarnings)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>Total Earnings</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#3B82F6', marginBottom: 4 }}>
                    {performanceMetrics.totalOrders}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>Total Orders</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#F59E0B', marginBottom: 4 }}>
                    {formatCurrency(performanceMetrics.avgEarningsPerOrder)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>Avg per Order</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#EF4444', marginBottom: 4 }}>
                    {performanceMetrics.completionRate}%
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>Completion Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Trend Chart */}
        {chartData.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Earnings Trend</div>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chartData.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < chartData.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                        {formatDate(item.date)}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {item.orders} orders
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981' }}>
                      {formatCurrency(item.earnings)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Locations */}
        {topLocations.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Top Locations</div>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topLocations.map((location, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: index < topLocations.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#3B82F6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                          {location.location}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          {location.count} trips
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      {((location.count / tripStats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Performance Insights */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Performance Insights</div>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#10B981',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}>
                  <HiOutlineTrendingUp />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>Completion Rate</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {performanceMetrics?.completionRate || 0}% of orders completed successfully
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#F59E0B',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}>
                  <HiOutlineStar />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>Average Rating</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {tripStats?.averageRating || 0} stars from customer ratings
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#3B82F6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18
                }}>
                  <HiOutlineCurrencyRupee />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>Average Earnings</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {formatCurrency(performanceMetrics?.avgEarningsPerOrder || 0)} per order
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => navigate('/trips')}
              style={{
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <HiOutlineCalendar />
              View Trips
            </button>
            <button
              onClick={() => navigate('/earnings')}
              style={{
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <HiOutlineCurrencyRupee />
              View Earnings
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Analytics;