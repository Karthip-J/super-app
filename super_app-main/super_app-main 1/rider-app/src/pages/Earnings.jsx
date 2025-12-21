import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineRefresh
} from 'react-icons/hi';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import earningsService from '../services/earnings.jsx';
import authService from '../services/auth.jsx';

const Earnings = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [earningsData, setEarningsData] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load earnings data
  const loadEarningsData = async () => {
    try {
      setIsLoading(true);
      
      // Load earnings for selected period
      const earnings = await earningsService.getEarnings(selectedPeriod);
      setEarningsData(earnings);

      // Load earnings breakdown
      const breakdownData = await earningsService.getEarningsBreakdown();
      setBreakdown(breakdownData);

      // Load chart data
      const chart = await earningsService.getEarningsChartData(selectedPeriod);
      setChartData(chart);

      // Load recent transactions
      const transactions = await earningsService.getRecentTransactions(10);
      setRecentTransactions(transactions);

      // Load performance metrics
      const metrics = await earningsService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);

    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setIsRefreshing(true);
    await loadEarningsData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/');
      return;
    }

    loadEarningsData();
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

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🔄</div>
          <div style={{ fontSize: 16, color: '#666' }}>Loading Earnings...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header 
        title="Earnings" 
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
            {['today', 'week', 'month', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: 8,
                  background: selectedPeriod === period ? '#10B981' : 'transparent',
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

        {/* Main Earnings Card */}
        {earningsData && (
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
              {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Earnings
            </div>
            <div style={{ fontSize: 32, fontWeight: 'bold', color: '#10B981', marginBottom: 8 }}>
              {formatCurrency(earningsData.total_earnings)}
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              {earningsData.total_orders} orders • ₹{earningsData.average_per_order?.toFixed(0) || 0} avg per order
            </div>
          </div>
        )}

        {/* Breakdown Cards */}
        {breakdown && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Earnings Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {Object.entries(breakdown).map(([period, data]) => (
                <div key={period} style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 16,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: 20, fontWeight: 'bold', color: '#10B981', marginBottom: 4 }}>
                    {formatCurrency(data.total_earnings)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </div>
                  <div style={{ fontSize: 10, color: '#999' }}>
                    {data.total_orders} orders
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Performance Metrics</div>
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6' }}>
                    {formatCurrency(performanceMetrics.totalEarnings)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>Total Earnings</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>
                    {performanceMetrics.totalOrders}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>Total Orders</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B' }}>
                    {formatCurrency(performanceMetrics.avgEarningsPerOrder)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>Avg per Order</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444' }}>
                    {performanceMetrics.completionRate}%
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>Completion Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart Data */}
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

        {/* Recent Transactions */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Recent Transactions</div>
          
          {recentTransactions.length > 0 ? (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
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
                        <HiOutlineCheckCircle />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                          {transaction.description}
                        </div>
                        <div style={{ fontSize: 12, color: '#666' }}>
                          {formatDate(transaction.date)} • {formatTime(transaction.date)}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981' }}>
                        +{formatCurrency(transaction.amount)}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {transaction.order_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              color: '#666'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💰</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No transactions yet</div>
              <div style={{ fontSize: 14 }}>Complete your first order to see earnings here</div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => navigate('/wallet')}
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
              <HiOutlineCurrencyRupee />
              View Wallet
            </button>
            <button
              onClick={() => navigate('/analytics')}
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
              <HiOutlineChartBar />
              Analytics
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Earnings;