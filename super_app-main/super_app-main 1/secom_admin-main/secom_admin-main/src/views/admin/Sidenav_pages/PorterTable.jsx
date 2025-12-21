import React, { useEffect, useState } from 'react';
import { getAllBookings, updateBookingStatus } from '../../../services/porter_service';
import axios from 'axios';
import API_CONFIG from '../../../config/api.config';

const API_BASE_URL = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PORTER_BOOKINGS);

const PorterTable = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.driver_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id.slice(-6).includes(searchTerm) ||
      booking.pickup_location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.dropoff_location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings();
      console.log('🔍 PorterTable: Raw API response:', res);
      console.log('🔍 PorterTable: Bookings data:', res.data);
      
      if (res.data && Array.isArray(res.data)) {
        // Log the status of each booking
        res.data.forEach((booking, index) => {
          console.log(`🔍 Booking ${index + 1}:`, {
            id: booking._id,
            status: booking.status,
            payment_status: booking.payment_status,
            pickup: booking.pickup_location?.address,
            fare: booking.fare
          });
        });
      }
      
      setBookings(res.data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
      showToast('Failed to fetch bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debug: Check what tokens are available
    const adminToken = localStorage.getItem('OnlineShop-accessToken');
    const regularToken = localStorage.getItem('token');
    console.log('Available tokens:', {
      adminToken: adminToken ? 'Found' : 'Not found',
      regularToken: regularToken ? 'Found' : 'Not found'
    });
    
    // Set demo token for testing if no admin token exists
    if (!adminToken && !regularToken) {
      localStorage.setItem('OnlineShop-accessToken', 'demo-token');
      console.log('Set demo token for testing');
    }
    
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id + status);
    try {
      await updateBookingStatus(id, status);
      await fetchBookings();
      showToast(`Booking status updated to ${status.replace('_', ' ')} successfully!`, 'success');
    } catch (error) {
      console.error('Error updating booking status:', error);
      showToast(`Failed to update status: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setActionLoading(null);
    }
  };



  // Helper function to get relevant action buttons based on status
  const getActionButtons = (booking) => {
    const buttons = [];
    const { status, _id } = booking;

    // Show "Cancel" button for pending/assigned bookings
    if (['pending', 'assigned'].includes(status)) {
      buttons.push(
        <button
          key="cancel"
          onClick={() => handleStatusUpdate(_id, 'cancelled')}
          className="bg-red-100 text-red-700 px-3 py-1 rounded text-xs hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={actionLoading === _id + 'cancelled'}
        >
          {actionLoading === _id + 'cancelled' ? '⏳ Updating...' : '❌ Cancel'}
        </button>
      );
    }

    // Show "Picked Up" button only for pending/assigned bookings
    if (['pending', 'assigned'].includes(status)) {
      buttons.push(
        <button
          key="picked_up"
          onClick={() => handleStatusUpdate(_id, 'picked_up')}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={actionLoading === _id + 'picked_up'}
        >
          {actionLoading === _id + 'picked_up' ? '⏳ Updating...' : '📦 Picked Up'}
        </button>
      );
    }

    // Show "Delivered" button only for picked_up bookings
    if (status === 'picked_up') {
      buttons.push(
                      <button
          key="delivered"
          onClick={() => handleStatusUpdate(_id, 'delivered')}
          className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={actionLoading === _id + 'delivered'}
        >
          {actionLoading === _id + 'delivered' ? '⏳ Updating...' : '✅ Delivered'}
                      </button>
      );
    }

    // Show "Complete" button only for delivered bookings
    if (status === 'delivered') {
      buttons.push(
                      <button
          key="completed"
          onClick={() => handleStatusUpdate(_id, 'completed')}
          className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={actionLoading === _id + 'completed'}
        >
          {actionLoading === _id + 'completed' ? '⏳ Updating...' : '🎉 Complete'}
                      </button>
      );
    }

    // If no buttons to show, display status info
    if (buttons.length === 0) {
      if (status === 'completed') {
        return <span className="text-xs text-gray-500">✅ Completed</span>;
      } else if (status === 'cancelled') {
        return <span className="text-xs text-red-500">❌ Cancelled</span>;
      }
      return <span className="text-xs text-gray-500">No actions available</span>;
    }

    return <div className="flex flex-wrap gap-1">{buttons}</div>;
  };

  return (
    <div 
      className="min-h-screen p-6 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            <span>{toast.type === 'success' ? '✅' : '❌'}</span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div 
          className="rounded-lg shadow-sm border p-6 mb-6 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                🚚 Goods Delivery Bookings
              </h1>
              <p 
                className="mt-1 transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                Manage and track all delivery bookings
              </p>
            </div>
            <div className="flex gap-3">
              {/* Refresh button removed - user will refresh manually */}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div 
            className="rounded-lg shadow-sm border p-4 transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-blue-600 dark:text-blue-300 text-xl">📋</span>
              </div>
              <div className="ml-3">
                <p 
                  className="text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Total Bookings
                </p>
                <p 
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {bookings.length}
                </p>
              </div>
            </div>
          </div>
          <div 
            className="rounded-lg shadow-sm border p-4 transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <span className="text-yellow-600 dark:text-yellow-300 text-xl">⏳</span>
              </div>
              <div className="ml-3">
                <p 
                  className="text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Pending
                </p>
                <p 
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div 
            className="rounded-lg shadow-sm border p-4 transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-green-600 dark:text-green-300 text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p 
                  className="text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Completed
                </p>
                <p 
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div 
            className="rounded-lg shadow-sm border p-4 transition-colors duration-300"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <span className="text-red-600 dark:text-red-300 text-xl">❌</span>
              </div>
              <div className="ml-3">
                <p 
                  className="text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Cancelled
                </p>
                <p 
                  className="text-2xl font-bold transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {bookings.filter(b => b.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div 
          className="rounded-lg shadow-sm border p-4 mb-6 transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Search
              </label>
              <input
                type="text"
                placeholder="Search by customer, driver, ID, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              />
            </div>
            <div className="sm:w-48">
              <label 
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">⏳ Pending</option>
                <option value="assigned">👨‍💼 Assigned</option>
                <option value="picked_up">📦 Picked Up</option>
                <option value="delivered">✅ Delivered</option>
                <option value="completed">🎉 Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>
          <div 
            className="flex justify-between items-center text-sm transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span>
              Showing {filteredBookings.length} of {bookings.length} bookings
              {(searchTerm || statusFilter !== 'all') && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  (filtered)
                </span>
              )}
            </span>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div 
          className="rounded-lg shadow-sm border overflow-hidden transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p 
                className="transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                Loading bookings...
              </p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center">
              <div 
                className="text-6xl mb-4 transition-colors duration-300"
                style={{ color: 'var(--text-muted)' }}
              >
                🔍
              </div>
              <h3 
                className="text-lg font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                {bookings.length === 0 ? 'No bookings found' : 'No matching bookings'}
              </h3>
              <p 
                className="mb-4 transition-colors duration-300"
                style={{ color: 'var(--text-secondary)' }}
              >
                {bookings.length === 0 
                  ? 'There are no delivery bookings to display.' 
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              <button
                onClick={fetchBookings}
                className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y transition-colors duration-300" style={{ borderColor: 'var(--border-color)' }}>
                <thead 
                  className="transition-colors duration-300"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <tr>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th> */}
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Customer
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Driver
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Pickup
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Dropoff
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Vehicle
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Fare
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      Status
                    </th>
                     {/* Actions column hidden */}
                  </tr>
                </thead>
                {console.log('filteredBookings=================>'+JSON.stringify(filteredBookings))}
                <tbody 
                  className="divide-y transition-colors duration-300"
                  style={{ 
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  {filteredBookings.map((booking) => (
                    <tr 
                      key={booking._id} 
                      className="transition-colors duration-300 hover:opacity-80"
                      style={{ 
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)'
                      }}
                    >
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        #{booking._id.slice(-6)}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium transition-colors duration-300"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {booking.user_id?.name || 'N/A'}
                        </div>
                        <div 
                          className="text-sm transition-colors duration-300"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {booking.user_id?.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm font-medium transition-colors duration-300"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {booking.driver_id?.name || 'N/A'}
                        </div>
                        <div 
                          className="text-sm transition-colors duration-300"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {booking.driver_id?.phone || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div 
                          className="text-sm max-w-xs truncate transition-colors duration-300"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {booking.pickup_location?.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div 
                          className="text-sm max-w-xs truncate transition-colors duration-300"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {booking.dropoff_location?.address || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-300"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {booking.vehicle_type}
                        </span>
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        ₹{booking.fare}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                          booking.status === 'assigned' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                          booking.status === 'picked_up' ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' :
                          booking.status === 'delivered' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                          booking.status === 'completed' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                          booking.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {booking.status === 'pending' ? '⏳ Pending' :
                           booking.status === 'assigned' ? '👨‍💼 Assigned' :
                           booking.status === 'picked_up' ? '📦 Picked Up' :
                           booking.status === 'delivered' ? '✅ Delivered' :
                           booking.status === 'completed' ? '🎉 Completed' :
                           booking.status === 'cancelled' ? '❌ Cancelled' :
                           booking.status}
                        </span>
                      </td>
                      {/* Actions column hidden */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PorterTable; 