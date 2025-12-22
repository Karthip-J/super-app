import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { adminOrderService } from 'services/orderService';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { FaEye, FaEdit, FaEllipsisV } from 'react-icons/fa';
// Removed Navbar import
// import Navbar from 'components/navbar';

const OrderTable = forwardRef(({ onViewOrder, onEditOrder, highlightOrderId }, ref) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: '',
    payment_status: '',
    payment_method: ''
  });
  const dropdownRef = useRef(null);
  const highlightedRowRef = useRef(null);

  // Handle click outside to close dropdown (optional for hover-based)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // No state to update for hover-based, but kept for consistency
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminOrderService.getAllOrders({
        page: currentPage,
        limit: 20,
        ...filters
      });
      
      // Debug: Log first order to check user data
      if (response.data && response.data.length > 0) {
        console.log('First order data:', {
          orderId: response.data[0]._id || response.data[0].id,
          orderNumber: response.data[0].order_number,
          user: response.data[0].user,
          userName: response.data[0].user?.name,
          userEmail: response.data[0].user?.email,
          userId: response.data[0].user_id
        });
      }
      
      setOrders(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.pagination.total_pages || 0);
      setTotalItems(response.pagination.total_items || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filters]);

  // Scroll to highlighted order when it's loaded
  useEffect(() => {
    if (highlightOrderId && orders.length > 0) {
      // Check if the highlighted order is in the current page
      const orderExists = orders.some(order => {
        const orderId = order.id || order._id;
        return orderId === highlightOrderId || orderId?.toString() === highlightOrderId?.toString() || order.order_number === highlightOrderId;
      });

      if (orderExists) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          if (highlightedRowRef.current) {
            highlightedRowRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 500);
      }
    }
  }, [highlightOrderId, orders]);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchOrders
  }));

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      date_from: '',
      date_to: '',
      payment_status: '',
      payment_method: ''
    });
    setCurrentPage(1);
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select orders to perform bulk action');
      return;
    }

    try {
      await adminOrderService.bulkUpdateOrders({
        order_ids: selectedOrders,
        status: action
      });
      toast.success(`Updated ${selectedOrders.length} orders successfully`);
      setSelectedOrders([]);
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to update orders');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await adminOrderService.exportOrders({
        ...filters,
        format: 'csv'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to export orders');
    }
  };

  // Status colors are now handled inline with dark mode support
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full mx-auto px-4">
        {/* Filters Section */}
        <div 
          className="rounded-lg shadow-sm p-6 mb-6 transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 1px 3px 0 var(--shadow-color)'
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Filters</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-colors duration-150"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
              >
                <FiFilter className="mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm font-medium border rounded-md transition-colors duration-150"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Search
                </label>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Customer name, email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All Status</option>
                  <option value="pending" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Pending</option>
                  <option value="confirmed" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Confirmed</option>
                  <option value="processing" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Processing</option>
                  <option value="shipped" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Shipped</option>
                  <option value="delivered" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Delivered</option>
                  <option value="cancelled" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Cancelled</option>
                  <option value="refunded" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Payment Status
                </label>
                <select
                  value={filters.payment_status}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                  className="w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All Payment Status</option>
                  <option value="pending" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Pending</option>
                  <option value="paid" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Paid</option>
                  <option value="failed" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Failed</option>
                  <option value="refunded" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Payment Method
                </label>
                <select
                  value={filters.payment_method}
                  onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                  className="w-full rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All Methods</option>
                  <option value="cod" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Cash on Delivery</option>
                  <option value="card" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Credit Card</option>
                  <option value="paypal" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>PayPal</option>
                  <option value="stripe" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Stripe</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div 
          className="rounded-lg shadow-sm p-4 mb-6 transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 1px 3px 0 var(--shadow-color)'
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {totalItems} orders found
              </span>
              {selectedOrders.length > 0 && (
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedOrders.length} selected
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              {selectedOrders.length > 0 && (
                <div className="flex space-x-2">
                  <select
                    onChange={(e) => handleBulkAction(e.target.value)}
                    className="px-3 py-2 text-sm border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Bulk Actions</option>
                    <option value="confirmed" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Confirmed</option>
                    <option value="processing" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Processing</option>
                    <option value="shipped" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Shipped</option>
                    <option value="delivered" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Delivered</option>
                    <option value="cancelled" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Cancelled</option>
                  </select>
                </div>
              )}
              
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors duration-150 dark:bg-green-500 dark:hover:bg-green-600"
              >
                <FiDownload className="mr-2" />
                Export
              </button>
              
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 transition-colors duration-150"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }
                }}
              >
                <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div 
          className="rounded-lg shadow-sm overflow-hidden transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 1px 3px 0 var(--shadow-color)'
          }}
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                <thead className="transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders(orders.map(order => order.id));
                          } else {
                            setSelectedOrders([]);
                          }
                        }}
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                        style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                        aria-label="Select all orders"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  {orders.map((order) => {
                    const orderId = order.id || order._id;
                    if (!orderId) {
                      console.error('Order ID is missing:', order);
                      return null;
                    }
                    
                    // Debug: Log order data to check user information
                    if (orders.indexOf(order) === 0) {
                      console.log('Order data in table:', {
                        orderId,
                        orderNumber: order.order_number,
                        user: order.user,
                        userId: order.user_id,
                        userName: order.user?.name || order.user_id?.name,
                        userEmail: order.user?.email || order.user_id?.email
                      });
                    }
                    const isHighlighted = highlightOrderId && (
                      orderId === highlightOrderId || 
                      orderId?.toString() === highlightOrderId?.toString() ||
                      order.order_number === highlightOrderId
                    );
                    
                    return (
                      <tr 
                        key={orderId} 
                        ref={isHighlighted ? highlightedRowRef : null}
                        className={`transition-all duration-300 ${
                          isHighlighted 
                            ? 'bg-yellow-100 dark:bg-yellow-900 border-4 border-yellow-400 dark:border-yellow-600 shadow-lg' 
                            : ''
                        }`}
                        style={{ borderColor: isHighlighted ? undefined : 'var(--border-color)' }}
                        onMouseEnter={(e) => {
                          if (!isHighlighted) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isHighlighted) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                          }
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(orderId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders([...selectedOrders, orderId]);
                              } else {
                                setSelectedOrders(selectedOrders.filter(id => id !== orderId));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                            style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                            aria-label={`Select order ${order.order_number}`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {order.order_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {order.user?.name || order.user_id?.name || 'N/A'}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {order.user?.email || order.user_id?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                            {order.items?.length || 0} items
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(order.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            order.status === 'processing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            order.status === 'refunded' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.payment_method || '-'}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            order.payment_status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            order.payment_status === 'refunded' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center">
                          <div className="relative inline-block group" ref={dropdownRef}>
                            <button
                              className="transition-colors"
                              style={{ color: 'var(--text-secondary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                              aria-label={`More actions for order ${order.order_number}`}
                              aria-haspopup="true"
                            >
                              <FaEllipsisV />
                            </button>
                            <div
                              className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                            >
                              {/* <button
                                onClick={() => onViewOrder && onViewOrder(order)}
                                className="text-blue-600 hover:text-blue-800"
                                aria-label={`View order ${order.order_number}`}
                              >
                                <FaEye />
                              </button> */}
                              <button
                                onClick={() => onEditOrder && onEditOrder(order)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                aria-label={`Edit order ${order.order_number}`}
                              >
                                <FaEdit />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <FiSearch className="mx-auto h-12 w-12" style={{ color: 'var(--text-muted)' }} />
              <h3 className="mt-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No orders found</h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {filters.search || filters.status ? 'Try adjusting your filters.' : 'No orders available at this time.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Showing page {currentPage} of {totalPages} ({totalItems} total orders)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 transition-colors duration-150"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 transition-colors duration-150"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

OrderTable.displayName = 'OrderTable';

export default OrderTable;