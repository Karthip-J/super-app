import React from 'react';
import { FaTimes } from 'react-icons/fa';

const RestaurantOrderDetailsViewModal = ({ order, isOpen, onClose }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Restaurant Order Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Order Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Order Number:</span>
                  <p className="text-sm text-gray-900">{order.order_number}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Order Date:</span>
                  <p className="text-sm text-gray-900">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                  <p className="text-sm text-gray-900">{order.payment_method}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Payment Status:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Restaurant Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Restaurant Name:</span>
                  <p className="text-sm text-gray-900">{order.restaurant?.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Restaurant Address:</span>
                  <p className="text-sm text-gray-900">{order.restaurant?.address}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Restaurant Phone:</span>
                  <p className="text-sm text-gray-900">{order.restaurant?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-500">Customer Name:</span>
                <p className="text-sm text-gray-900">{order.user?.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Customer Email:</span>
                <p className="text-sm text-gray-900">{order.user?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Customer Phone:</span>
                <p className="text-sm text-gray-900">{order.user?.phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
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
                    <p className="text-sm font-medium text-gray-900">{item.dish_name}</p>
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

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivery Fee:</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(order.delivery_fee)}</span>
                </div>
              )}
              {order.tax_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              {order.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-medium text-gray-900">-{formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-300 pt-2">
                <span className="text-base font-medium text-gray-900">Total:</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantOrderDetailsViewModal; 