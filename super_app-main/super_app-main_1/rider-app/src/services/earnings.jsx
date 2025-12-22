// Earnings Management Service - Integrated with Super App Backend
import { riderAPI } from '../config/superAppApi';

class EarningsService {
  constructor() {
    this.isLoading = false;
    this.cache = {
      earnings: null,
      lastFetch: null,
      cacheDuration: 5 * 60 * 1000 // 5 minutes
    };
  }

  // Get earnings data from backend
  async getEarnings(period = 'all') {
    try {
      // Check cache first
      if (this.cache.earnings && this.cache.lastFetch && 
          (Date.now() - this.cache.lastFetch) < this.cache.cacheDuration) {
        return this.cache.earnings;
      }

      this.isLoading = true;
      const response = await riderAPI.getEarnings(period);
      
      if (response.success) {
        const earningsData = this._transformEarningsData(response.data);
        
        // Update cache
        this.cache.earnings = earningsData;
        this.cache.lastFetch = Date.now();
        
        return earningsData;
      }
      
      return this._getDefaultEarnings();
    } catch (error) {
      console.error('Error fetching earnings:', error);
      return this._getDefaultEarnings();
    } finally {
      this.isLoading = false;
    }
  }

  // Get earnings breakdown by period
  async getEarningsBreakdown() {
    try {
      const periods = ['today', 'week', 'month', 'all'];
      const breakdown = {};
      
      for (const period of periods) {
        const earnings = await this.getEarnings(period);
        breakdown[period] = earnings;
      }
      
      return breakdown;
    } catch (error) {
      console.error('Error fetching earnings breakdown:', error);
      return {
        today: this._getDefaultEarnings(),
        week: this._getDefaultEarnings(),
        month: this._getDefaultEarnings(),
        all: this._getDefaultEarnings()
      };
    }
  }

  // Get recent transactions
  async getRecentTransactions(limit = 10) {
    try {
      const earnings = await this.getEarnings('all');
      return earnings.assignments.slice(0, limit).map(assignment => ({
        id: assignment._id || assignment.id,
        type: 'credit',
        amount: assignment.earnings,
        description: `${assignment.order_type} delivery`,
        date: assignment.completed_at || assignment.createdAt,
        status: 'completed',
        order_type: assignment.order_type
      }));
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  // Get earnings summary
  async getEarningsSummary() {
    try {
      const today = await this.getEarnings('today');
      const week = await this.getEarnings('week');
      const month = await this.getEarnings('month');
      const all = await this.getEarnings('all');
      
      return {
        today: {
          earnings: today.total_earnings,
          orders: today.total_orders,
          period: 'today'
        },
        week: {
          earnings: week.total_earnings,
          orders: week.total_orders,
          period: 'week'
        },
        month: {
          earnings: month.total_earnings,
          orders: month.total_orders,
          period: 'month'
        },
        all: {
          earnings: all.total_earnings,
          orders: all.total_orders,
          period: 'all'
        }
      };
    } catch (error) {
      console.error('Error fetching earnings summary:', error);
      return {
        today: { earnings: 0, orders: 0, period: 'today' },
        week: { earnings: 0, orders: 0, period: 'week' },
        month: { earnings: 0, orders: 0, period: 'month' },
        all: { earnings: 0, orders: 0, period: 'all' }
      };
    }
  }

  // Get earnings chart data
  async getEarningsChartData(period = 'week') {
    try {
      const earnings = await this.getEarnings(period);
      const assignments = earnings.assignments || [];
      
      // Group by date
      const groupedData = {};
      assignments.forEach(assignment => {
        const date = new Date(assignment.completed_at || assignment.createdAt).toDateString();
        if (!groupedData[date]) {
          groupedData[date] = {
            date,
            earnings: 0,
            orders: 0
          };
        }
        groupedData[date].earnings += assignment.earnings || 0;
        groupedData[date].orders += 1;
      });
      
      // Convert to array and sort by date
      return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error('Error fetching earnings chart data:', error);
      return [];
    }
  }

  // Get performance metrics
  async getPerformanceMetrics() {
    try {
      const all = await this.getEarnings('all');
      const week = await this.getEarnings('week');
      
      const totalEarnings = all.total_earnings;
      const totalOrders = all.total_orders;
      const weeklyEarnings = week.total_earnings;
      const weeklyOrders = week.total_orders;
      
      const avgEarningsPerOrder = totalOrders > 0 ? totalEarnings / totalOrders : 0;
      const avgWeeklyEarnings = weeklyEarnings;
      const completionRate = 100; // This would need to be calculated from trip data
      
      return {
        totalEarnings,
        totalOrders,
        weeklyEarnings,
        weeklyOrders,
        avgEarningsPerOrder: Math.round(avgEarningsPerOrder * 100) / 100,
        avgWeeklyEarnings,
        completionRate
      };
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return {
        totalEarnings: 0,
        totalOrders: 0,
        weeklyEarnings: 0,
        weeklyOrders: 0,
        avgEarningsPerOrder: 0,
        avgWeeklyEarnings: 0,
        completionRate: 0
      };
    }
  }

  // Clear cache
  clearCache() {
    this.cache.earnings = null;
    this.cache.lastFetch = null;
  }

  // Get loading state
  getLoadingState() {
    return this.isLoading;
  }

  // Transform backend earnings data to frontend format
  _transformEarningsData(data) {
    return {
      total_earnings: data.total_earnings || 0,
      total_orders: data.total_orders || 0,
      period: data.period || 'all',
      assignments: data.assignments || [],
      average_per_order: data.total_orders > 0 ? data.total_earnings / data.total_orders : 0
    };
  }

  // Get default earnings structure
  _getDefaultEarnings() {
    return {
      total_earnings: 0,
      total_orders: 0,
      period: 'all',
      assignments: [],
      average_per_order: 0
    };
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format time
  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Create singleton instance
const earningsService = new EarningsService();
export default earningsService; 