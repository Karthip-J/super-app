import axios from 'axios';
import API_CONFIG from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const dashboardService = {
  // Get dashboard statistics aggregated from all modules
  getDashboardStats: async () => {
    try {
      // Fetch data from all available endpoints in parallel
      const [
        usersRes,
        ordersRes,
        groceryOrdersRes,
        foodOrdersRes,
        hotelBookingsRes,
        taxiRidesRes,
        productsRes,
        groceriesRes,
        hotelsRes,
        restaurantsRes,
        ridersRes
      ] = await Promise.allSettled([
        api.get('/api/users'),
        api.get('/api/admin/orders'),
        api.get('/api/grocery-orders/admin/all'),
        api.get('/api/food-orders/admin/all'),
        api.get('/api/bookings'),
        api.get('/api/taxi-rides'),
        api.get('/api/products'),
        api.get('/api/groceries'),
        api.get('/api/hotels'),
        api.get('/api/restaurants'),
        api.get('/api/riders')
      ]);

      // Helper to safely extract data
      const getData = (result, defaultValue = []) => {
        if (result.status === 'fulfilled') {
          const data = result.value?.data;
          if (Array.isArray(data)) return data;
          if (data?.data && Array.isArray(data.data)) return data.data;
          if (data?.orders && Array.isArray(data.orders)) return data.orders;
          return defaultValue;
        }
        return defaultValue;
      };

      // Extract data from responses
      const users = getData(usersRes);
      const ecommerceOrders = getData(ordersRes);
      const groceryOrders = getData(groceryOrdersRes);
      const foodOrders = getData(foodOrdersRes);
      const hotelBookings = getData(hotelBookingsRes);
      const taxiRides = getData(taxiRidesRes);
      const products = getData(productsRes);
      const groceries = getData(groceriesRes);
      const hotels = getData(hotelsRes);
      const restaurants = getData(restaurantsRes);
      const riders = getData(ridersRes);

      // Calculate total revenue from all order types
      const ecommerceRevenue = ecommerceOrders.reduce((sum, order) => sum + (order.total_amount || order.totalAmount || 0), 0);
      const groceryRevenue = groceryOrders.reduce((sum, order) => sum + (order.total_amount || order.totalAmount || 0), 0);
      const foodRevenue = foodOrders.reduce((sum, order) => sum + (order.total_amount || order.totalAmount || 0), 0);
      const hotelRevenue = hotelBookings.reduce((sum, booking) => sum + (booking.final_amount || booking.total_amount || 0), 0);
      const taxiRevenue = taxiRides.reduce((sum, ride) => sum + (ride.fare || ride.total_fare || 0), 0);

      const totalRevenue = ecommerceRevenue + groceryRevenue + foodRevenue + hotelRevenue + taxiRevenue;

      // Calculate order counts by status
      const allOrders = [...ecommerceOrders, ...groceryOrders, ...foodOrders];
      const pendingOrders = allOrders.filter(o => o.status === 'pending' || o.order_status === 'pending').length;
      const completedOrders = allOrders.filter(o => o.status === 'delivered' || o.status === 'completed' || o.order_status === 'delivered').length;

      // Calculate weekly data (last 7 days)
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const weeklyOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.created_at);
        return orderDate >= weekAgo;
      });

      const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + (order.total_amount || order.totalAmount || 0), 0);

      // Daily breakdown for charts (last 7 days)
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayOrders = allOrders.filter(order => {
          const orderDate = new Date(order.createdAt || order.created_at);
          return orderDate >= dayStart && orderDate <= dayEnd;
        });

        const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total_amount || order.totalAmount || 0), 0);

        dailyData.push({
          date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: dayStart.toISOString().split('T')[0],
          orders: dayOrders.length,
          revenue: dayRevenue,
          ecommerce: dayOrders.filter(o => o.type === 'ecommerce' || !o.type).length,
          grocery: dayOrders.filter(o => o.type === 'grocery').length,
          food: dayOrders.filter(o => o.type === 'food').length
        });
      }

      // Monthly data for trend chart (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        const monthOrders = allOrders.filter(order => {
          const orderDate = new Date(order.createdAt || order.created_at);
          return orderDate >= monthDate && orderDate <= monthEnd;
        });

        const monthRevenue = monthOrders.reduce((sum, order) => sum + (order.total_amount || order.totalAmount || 0), 0);

        monthlyData.push({
          month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          orders: monthOrders.length,
          revenue: monthRevenue
        });
      }

      // Revenue breakdown by category
      const revenueBreakdown = {
        ecommerce: ecommerceRevenue,
        grocery: groceryRevenue,
        food: foodRevenue,
        hotel: hotelRevenue,
        taxi: taxiRevenue
      };

      // Calculate percentages for pie chart
      const totalForPie = totalRevenue || 1; // Avoid division by zero
      const pieData = [
        { name: 'Ecommerce', value: ecommerceRevenue, percentage: ((ecommerceRevenue / totalForPie) * 100).toFixed(1) },
        { name: 'Grocery', value: groceryRevenue, percentage: ((groceryRevenue / totalForPie) * 100).toFixed(1) },
        { name: 'Food', value: foodRevenue, percentage: ((foodRevenue / totalForPie) * 100).toFixed(1) },
        { name: 'Hotel', value: hotelRevenue, percentage: ((hotelRevenue / totalForPie) * 100).toFixed(1) },
        { name: 'Taxi', value: taxiRevenue, percentage: ((taxiRevenue / totalForPie) * 100).toFixed(1) }
      ].filter(item => item.value > 0);

      return {
        success: true,
        data: {
          // Summary stats
          totalRevenue,
          weeklyRevenue,
          totalOrders: allOrders.length,
          pendingOrders,
          completedOrders,
          totalUsers: users.length,
          totalProducts: products.length,
          totalGroceries: groceries.length,
          totalHotels: hotels.length,
          totalRestaurants: restaurants.length,
          totalRiders: riders.length,
          hotelBookings: hotelBookings.length,
          taxiRides: taxiRides.length,
          
          // Revenue breakdown
          revenueBreakdown,
          pieData,
          
          // Chart data
          dailyData,
          monthlyData,
          
          // Recent orders (last 10)
          recentOrders: allOrders
            .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
            .slice(0, 10)
            .map(order => ({
              id: order._id || order.id,
              orderNumber: order.order_number || order.orderNumber || `#${(order._id || order.id)?.slice(-6)}`,
              customer: order.user?.name || order.customer_name || 'Guest',
              amount: order.total_amount || order.totalAmount || 0,
              status: order.status || order.order_status || 'pending',
              date: order.createdAt || order.created_at,
              type: order.type || 'ecommerce'
            })),

          // Traffic/visitor estimate based on user activity
          dailyTraffic: users.length > 0 ? Math.floor(users.length * 2.5) : 100
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.message,
        data: {
          totalRevenue: 0,
          weeklyRevenue: 0,
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalUsers: 0,
          totalProducts: 0,
          totalGroceries: 0,
          totalHotels: 0,
          totalRestaurants: 0,
          totalRiders: 0,
          hotelBookings: 0,
          taxiRides: 0,
          revenueBreakdown: {},
          pieData: [],
          dailyData: [],
          monthlyData: [],
          recentOrders: [],
          dailyTraffic: 0
        }
      };
    }
  }
};

export default dashboardService;

