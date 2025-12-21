import React from 'react';
import { FaTimes } from 'react-icons/fa';

const OrderDetailsViewModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative w-full max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-0">
        <div className="bg-white rounded-md shadow-lg overflow-hidden flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Order Details - {order.order_number}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          {/* Scrollable Content */}
          <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: '60vh' }}>
            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {order.user?.name}</p>
                  <p><strong>Email:</strong> {order.user?.email}</p>
                  <p><strong>Phone:</strong> {order.user?.phone || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </p>
                  <p><strong>Payment:</strong> {order.payment_method} 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </p>
                  <p><strong>Total:</strong> {formatCurrency(order.total_amount)}</p>
                </div>
              </div>
            </div>
            {/* Order Items */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <img
                              src={item.product_data?.image || '/placeholder.png'}
                              alt={item.product_data?.name || 'Product'}
                              className="h-12 w-12 rounded object-cover mr-3"
                            />
                            <div>
                              <div className="font-medium text-sm">{item.product_data?.name || 'N/A'}</div>
                              <div className="text-gray-500 text-xs">{item.product_data?.sku || ''}</div>
                              {item.product_data?.variation && (
                                <div className="text-gray-400 text-xs">
                                  {item.product_data.variation.attributes &&
                                    Object.entries(item.product_data.variation.attributes).map(([key, value]) => (
                                      <span key={key} className="mr-2">{key}: {value}</span>
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Order Totals */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Order Totals</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-sm font-medium">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax:</span>
                    <span className="text-sm font-medium">{formatCurrency(order.tax_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shipping:</span>
                    <span className="text-sm font-medium">{formatCurrency(order.shipping_amount)}</span>
                  </div>
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Discount:</span>
                      <span className="text-sm font-medium text-red-600">-{formatCurrency(order.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-sm font-medium text-gray-900">Total:</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {order.shipping_address?.address_line1 && <p>{order.shipping_address.address_line1}</p>}
                  {order.shipping_address?.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                  {order.shipping_address?.city && order.shipping_address?.state && (
                    <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                  )}
                  {order.shipping_address?.country && order.shipping_address?.pincode && (
                    <p>{order.shipping_address.country} {order.shipping_address.pincode}</p>
                  )}
                  {!order.shipping_address && (
                    <p className="text-gray-400 italic">No shipping address provided</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Billing Address</h4>
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {order.billing_address?.address_line1 && <p>{order.billing_address.address_line1}</p>}
                  {order.billing_address?.address_line2 && <p>{order.billing_address.address_line2}</p>}
                  {order.billing_address?.city && order.billing_address?.state && (
                    <p>{order.billing_address.city}, {order.billing_address.state}</p>
                  )}
                  {order.billing_address?.country && order.billing_address?.pincode && (
                    <p>{order.billing_address.country} {order.billing_address.pincode}</p>
                  )}
                  {!order.billing_address && (
                    <p className="text-gray-400 italic">Same as shipping address</p>
                  )}
                </div>
              </div>
            </div>
            {/* Notes */}
            {order.notes && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Order Notes</h4>
                <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  {order.notes}
                </div>
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="flex justify-end space-x-3 px-5 py-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsViewModal; 