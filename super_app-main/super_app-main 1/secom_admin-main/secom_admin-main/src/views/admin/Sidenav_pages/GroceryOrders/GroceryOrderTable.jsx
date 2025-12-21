import React, { useState, useEffect, useRef } from 'react';
import { adminGroceryOrderService } from 'services/orderService';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { FaEye, FaEdit, FaEllipsisV } from 'react-icons/fa';

const GroceryOrderTable = ({ onViewOrder, onEditOrder, highlightOrderId }) => {
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
    payment_method: '',
    customer_id: ''
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
      const response = await adminGroceryOrderService.getAllGroceryOrders({
        page: currentPage,
        limit: 20,
        ...filters
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.pagination?.total_pages || 0);
      setTotalItems(response.pagination?.total_items || 0);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch grocery orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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
      customer_id: ''
    });
    setCurrentPage(1);
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select orders to perform bulk action');
      return;
    }

    try {
      await adminGroceryOrderService.bulkUpdateGroceryOrders({
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
      const blob = await adminGroceryOrderService.exportGroceryOrders({
        ...filters,
        format: 'csv'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grocery-orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to export orders');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen pt-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Removed Navbar */}
      <div className="w-full mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Grocery Orders Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and track grocery orders</p>
        </div>

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
                    placeholder="Order number, customer name, email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full rounded-md border focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full rounded-md border focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All Statuses</option>
                  <option value="pending" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Pending</option>
                  <option value="confirmed" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Confirmed</option>
                  <option value="preparing" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Preparing</option>
                  <option value="ready" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Ready</option>
                  <option value="out_for_delivery" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Out for Delivery</option>
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
                  className="w-full rounded-md border focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full rounded-md border focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full rounded-md border focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full rounded-md border focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Loading grocery orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
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
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Order
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
                        <td className="px-4 py-3 break-all max-w-[150px]">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {order.order_number}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-normal max-w-[200px]">
                          <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{order.user?.name || '-'}</div>
                          <div className="text-xs break-all" style={{ color: 'var(--text-secondary)' }}>{order.user?.email || '-'}</div>
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)} dark:bg-opacity-70`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-xs" style={{ color: 'var(--text-primary)' }}>{order.payment_method || '-'}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)} dark:bg-opacity-70`}>
                              {order.payment_status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium flex justify-center">
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
              <FiSearch className="mx-auto h-12 w-12 transition-colors" style={{ color: 'var(--text-secondary)' }} />
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
};

export default GroceryOrderTable;