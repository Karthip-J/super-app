import React, { useState } from 'react';
import { adminGroceryOrderService } from 'services/orderService';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

const GroceryOrderDetailsModal = ({ order, isOpen, onClose, onUpdate }) => {
  const [status, setStatus] = useState(order?.status || '');
  const [notes, setNotes] = useState(order?.notes || '');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    setLoading(true);
    try {
      await adminGroceryOrderService.updateGroceryOrderStatus(order.id, {
        status,
        notes
      });
      toast.success('Grocery order updated successfully');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update grocery order');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FaTimes className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Edit Grocery Order</h2>
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Order Number:</span>
              <p className="text-sm text-gray-900">{order.order_number}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Order Date:</span>
              <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Customer:</span>
              <p className="text-sm text-gray-900">{order.user?.name}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Total Amount:</span>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(order.total_amount)}</p>
            </div>
          </div>
        </div>
        {/* Status Update */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleStatusUpdate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroceryOrderDetailsModal; 