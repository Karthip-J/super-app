import React from 'react';
import { FaTimes } from 'react-icons/fa';

const GroceryOrderDetailsViewModal = ({ order, isOpen, onClose }) => {
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-2xl font-bold">Grocery Order Details</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar">
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
              <div>
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Payment:</span>
                <div className="text-sm text-gray-900">{order.payment_method}</div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                  {order.payment_status}
                </span>
              </div>
            </div>
          </div>
          {/* Delivery Address */}
          {order.delivery_address && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">{order.delivery_address.address_line1}</p>
                {order.delivery_address.address_line2 && (
                  <p className="text-sm text-gray-900">{order.delivery_address.address_line2}</p>
                )}
                <p className="text-sm text-gray-900">
                  {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.postal_code}
                </p>
              </div>
            </div>
          )}
          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product_data?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    {item.special_instructions && (
                      <p className="text-sm text-gray-500">Note: {item.special_instructions}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroceryOrderDetailsViewModal; 