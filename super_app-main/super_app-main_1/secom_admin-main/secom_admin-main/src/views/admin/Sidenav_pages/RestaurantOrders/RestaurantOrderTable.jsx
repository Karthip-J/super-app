import React, { useState, useEffect, useRef } from 'react';
import { adminRestaurantOrderService } from 'services/orderService';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiDownload, FiEye, FiEdit, FiRefreshCw } from 'react-icons/fi';
import { FaEye, FaEdit, FaTrashAlt, FaFileExport } from 'react-icons/fa';

const RestaurantOrderTable = ({ onViewOrder, onEditOrder, highlightOrderId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const highlightedRowRef = useRef(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: '',
    payment_status: '',
    payment_method: '',
    restaurant_id: ''
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminRestaurantOrderService.getAllRestaurantOrders({
        page: currentPage,
        limit: 20,
        ...filters
      });
      setOrders(response.data);
      setTotalPages(response.pagination?.total_pages || 1);
      setTotalItems(response.pagination?.total_items || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch restaurant orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  // Handle order search from navigation state
  useEffect(() => {
    if (highlightOrderId) {
      // Check if the order is already in the current page
      const orderExists = orders.some(order => {
        const orderId = order.id || order._id;
        return orderId === highlightOrderId ||
          orderId?.toString() === highlightOrderId?.toString() ||
          order.order_number === highlightOrderId ||
          order.order_number === highlightOrderId?.toString();
      });

      if (!orderExists) {
        // Order not on current page, search for it using order number
        // Only set search if it's not already set to avoid infinite loop
        if (filters.search !== highlightOrderId && filters.search !== highlightOrderId?.toString()) {
          setFilters(prev => ({ ...prev, search: highlightOrderId }));
          setCurrentPage(1);
        }
      }
    }
  }, [highlightOrderId, orders.length]);

  // Scroll to highlighted order when it's loaded
  useEffect(() => {
    if (highlightOrderId && orders.length > 0) {
      // Check if the highlighted order is in the current page
      const orderExists = orders.some(order => {
        const orderId = order.id || order._id;
        return orderId === highlightOrderId ||
          orderId?.toString() === highlightOrderId?.toString() ||
          order.order_number === highlightOrderId;
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
      payment_method: '',
      restaurant_id: ''
    });
    setCurrentPage(1);
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select orders to perform bulk action');
      return;
    }

    try {
      await adminRestaurantOrderService.bulkUpdateRestaurantOrders({
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
      const blob = await adminRestaurantOrderService.exportRestaurantOrders({
        ...filters,
        format: 'csv'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `restaurant-orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Restaurant orders exported successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to export orders');
    }
  };

  // Status colors are now handled inline with dark mode support
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      ready: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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
    <div className="w-full mx-auto px-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Filters */}
      <div
        className="rounded-lg shadow-sm p-4 mb-6 transition-colors"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 1px 3px 0 var(--shadow-color)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm font-medium border rounded-md transition-colors"
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
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All Status</option>
                <option value="pending" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Pending</option>
                <option value="confirmed" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Confirmed</option>
                <option value="preparing" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Preparing</option>
                <option value="ready" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Ready</option>
                <option value="out_for_delivery" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Out for Delivery</option>
                <option value="delivered" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Delivered</option>
                <option value="cancelled" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Payment Status</label>
              <select
                value={filters.payment_status}
                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Date From</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Date To</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, or restaurant..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                />
              </div>
            </div>

            <div className="md:col-span-2 flex items-end space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium border rounded-md transition-colors"
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
                Clear Filters
              </button>
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
              {totalItems} restaurant orders found
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
                  <option value="preparing" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Preparing</option>
                  <option value="ready" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Ready</option>
                  <option value="out_for_delivery" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Out for Delivery</option>
                  <option value="delivered" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Delivered</option>
                  <option value="cancelled" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Mark as Cancelled</option>
                </select>
              </div>
            )}

            <button
              onClick={handleExport}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600"
            >
              <FaFileExport className="mr-2" />
              Export
            </button>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50 transition-colors"
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
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Loading restaurant orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y transition-colors" style={{ borderColor: 'var(--border-color)' }}>
              <thead className="transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Restaurant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
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

                  const isHighlighted = highlightOrderId && (
                    orderId === highlightOrderId ||
                    orderId?.toString() === highlightOrderId?.toString() ||
                    order.order_number === highlightOrderId
                  );

                  return (
                    <tr
                      key={orderId}
                      ref={isHighlighted ? highlightedRowRef : null}
                      className={`transition-all duration-300 ${isHighlighted
                        ? 'bg-yellow-100 border-4 border-yellow-400 shadow-lg dark:bg-yellow-900 dark:border-yellow-600'
                        : ''
                        }`}
                      style={{
                        backgroundColor: isHighlighted ? undefined : 'var(--bg-card)',
                        borderColor: 'var(--border-color)'
                      }}
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders([...selectedOrders, order.id]);
                            } else {
                              setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                            }
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                          style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                        />
                      </td>
                      <td className="px-4 py-3 break-all max-w-[150px]">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {order.order_number}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-normal max-w-[200px]">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{order.restaurant?.name}</div>
                        <div className="text-xs break-all" style={{ color: 'var(--text-secondary)' }}>{order.restaurant?.address}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-normal max-w-[200px]">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{order.user?.name}</div>
                        <div className="text-xs break-all" style={{ color: 'var(--text-secondary)' }}>{order.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                          {order.items?.length || 0} items
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {formatCurrency(order.total_amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            order.status === 'preparing' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              order.status === 'ready' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                                order.status === 'out_for_delivery' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                      order.status === 'refunded' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.payment_method}</div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          order.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            order.payment_status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              order.payment_status === 'refunded' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onViewOrder(order)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onEditOrder(order)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="px-4 py-3 flex items-center justify-between border-t sm:px-6 mt-6 rounded-lg shadow-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: '0 1px 3px 0 var(--shadow-color)'
          }}
        >
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
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
              className="ml-3 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
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
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Showing page <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{currentPage}</span> of{' '}
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium disabled:opacity-50 transition-colors"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${currentPage === page
                        ? 'z-10 border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : ''
                        }`}
                      style={{
                        borderColor: currentPage === page ? undefined : 'var(--border-color)',
                        color: currentPage === page ? undefined : 'var(--text-secondary)',
                        backgroundColor: currentPage === page ? 'var(--bg-secondary)' : 'var(--bg-card)'
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== page) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== page) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium disabled:opacity-50 transition-colors"
                  style={{
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrderTable;