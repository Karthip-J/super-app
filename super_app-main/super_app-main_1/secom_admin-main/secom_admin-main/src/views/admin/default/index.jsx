import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart, MdDashboard, MdShoppingCart, MdPeople, MdRestaurant, MdLocalTaxi, MdHotel, MdDeliveryDining } from "react-icons/md";
import { FaBoxOpen } from "react-icons/fa";

import { useEffect, useState, createContext, useContext } from "react";

import { columnsDataCheck, columnsDataComplex } from "./variables/columnsData";

import Widget from "components/widget/Widget";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import TaskCard from "views/admin/default/components/TaskCard";

import { useNavigate } from "react-router-dom";
import API_CONFIG from "../../../config/api.config";
import dashboardService from "../../../services/dashboardService";

// Create context for dashboard data
export const DashboardContext = createContext(null);

// Custom hook to use dashboard data
export const useDashboardData = () => useContext(DashboardContext);

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const expirationTime = localStorage.getItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);

      if (!token) {
        navigate("/");
        return false;
      }

      if (expirationTime && Date.now() > expirationTime) {
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
        navigate("/");
        return false;
      }
      return true;
    };

    if (checkTokenExpiration()) {
      fetchDashboardData();
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getDashboardStats();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.error || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `₹${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toFixed(0)}`;
  };

  // Calculate growth percentage (mock for now - would need historical data)
  const getGrowth = () => {
    return '+2.45%';
  };

  // Prepare table data from recent orders
  const getRecentOrdersTableData = () => {
    if (!dashboardData?.recentOrders) return [];
    return dashboardData.recentOrders.map((order, index) => ({
      name: order.customer || 'Guest',
      progress: Math.min(100, Math.floor(Math.random() * 40 + 60)), // Placeholder progress
      quantity: 1,
      date: new Date(order.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  };

  const getComplexTableData = () => {
    if (!dashboardData?.recentOrders) return [];
    return dashboardData.recentOrders.map((order) => ({
      name: order.orderNumber || order.id?.slice(-8),
      status: order.status === 'delivered' || order.status === 'completed' ? 'Approved' : 
              order.status === 'cancelled' ? 'Error' : 
              order.status === 'processing' ? 'Disable' : 'Pending',
      date: new Date(order.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      progress: order.status === 'delivered' || order.status === 'completed' ? 100 : 
                order.status === 'cancelled' ? 0 : 
                Math.floor(Math.random() * 60 + 20)
    }));
  };

  if (loading) {
    return (
      <div className="pt-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={dashboardData}>
      <div className="pt-6">
        {/* Card widgets */}
        <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-6">
          <Widget
            icon={<MdBarChart className="h-7 w-7" />}
            title={"Total Revenue"}
            subtitle={formatCurrency(dashboardData?.totalRevenue || 0)}
          />
          <Widget
            icon={<MdShoppingCart className="h-6 w-6" />}
            title={"Total Orders"}
            subtitle={String(dashboardData?.totalOrders || 0)}
          />
          <Widget
            icon={<MdPeople className="h-7 w-7" />}
            title={"Total Users"}
            subtitle={String(dashboardData?.totalUsers || 0)}
          />
          <Widget
            icon={<FaBoxOpen className="h-6 w-6" />}
            title={"Products"}
            subtitle={String((dashboardData?.totalProducts || 0) + (dashboardData?.totalGroceries || 0))}
          />
          <Widget
            icon={<MdHotel className="h-7 w-7" />}
            title={"Hotels"}
            subtitle={String(dashboardData?.totalHotels || 0)}
          />
          <Widget
            icon={<MdRestaurant className="h-6 w-6" />}
            title={"Restaurants"}
            subtitle={String(dashboardData?.totalRestaurants || 0)}
          />
          <Widget
            icon={<MdLocalTaxi className="h-6 w-6" />}
            title={"Taxi Rides"}
            subtitle={String(dashboardData?.taxiRides || 0)}
          />
          <Widget
            icon={<MdDeliveryDining className="h-7 w-7" />}
            title={"Riders"}
            subtitle={String(dashboardData?.totalRiders || 0)}
          />
        </div>
        
        {/* Charts */}
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <TotalSpent 
            totalRevenue={dashboardData?.totalRevenue || 0}
            monthlyData={dashboardData?.monthlyData || []}
          />
          <WeeklyRevenue 
            weeklyRevenue={dashboardData?.weeklyRevenue || 0}
            dailyData={dashboardData?.dailyData || []}
          />
        </div>

        {/* Tables & Charts */}
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Recent Orders Table */}
          <div>
            <CheckTable
              columnsData={columnsDataCheck}
              tableData={getRecentOrdersTableData()}
              title="Recent Orders"
            />
          </div>

          {/* Traffic chart & Pie Chart */}
          <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
            <DailyTraffic 
              traffic={dashboardData?.dailyTraffic || 0}
              dailyData={dashboardData?.dailyData || []}
            />
            <PieChartCard 
              pieData={dashboardData?.pieData || []}
              revenueBreakdown={dashboardData?.revenueBreakdown || {}}
            />
          </div>

          {/* Order Status Table */}
          <ComplexTable
            columnsData={columnsDataComplex}
            tableData={getComplexTableData()}
            title="Order Status"
          />

          {/* Task chart & Calendar */}
          <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
            <TaskCard 
              pendingOrders={dashboardData?.pendingOrders || 0}
              completedOrders={dashboardData?.completedOrders || 0}
            />
            <div className="grid grid-cols-1 rounded-[20px]">
              <MiniCalendar />
            </div>
          </div>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};

export default Dashboard;
