import React, { useState } from 'react';
import { adminRestaurantOrderService } from 'services/orderService';
import { toast } from 'react-toastify';
import { FaTimes, FaSave, FaShippingFast, FaCreditCard } from 'react-icons/fa';

const RestaurantOrderDetailsModal = ({ order, isOpen, onClose, onUpdate }) => {
  const [status, setStatus] = useState(order?.status || '');
  const [notes, setNotes] = useState(order?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      await adminRestaurantOrderService.updateRestaurantOrderStatus(order.id, {
        status,
        notes
      });
      toast.success('Restaurant order updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update restaurant order');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b transition-colors" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Update Restaurant Order
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Order Number:</span>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.order_number}</p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Order Date:</span>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Restaurant:</span>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.restaurant?.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Customer:</span>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{order.user?.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Amount:</span>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(order.total_amount)}</p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Update Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Order Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
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
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  placeholder="Add any notes about this order..."
                />
              </div>
            </div>
          </div>

          {/* Current Status Display */}
          <div className="rounded-lg p-4 mb-6 transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Current Status</h4>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
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
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t transition-colors" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={onClose}
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
            Cancel
          </button>
          <button
            onClick={handleStatusUpdate}
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <FaSave className="mr-2" />
            {loading ? 'Updating...' : 'Update Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrderDetailsModal; 