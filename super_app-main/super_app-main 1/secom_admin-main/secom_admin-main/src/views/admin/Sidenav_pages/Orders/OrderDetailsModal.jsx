import React, { useState, useEffect } from 'react';
import { adminOrderService } from 'services/orderService';
import { toast } from 'react-toastify';
import { FaTimes, FaSave, FaShippingFast, FaCreditCard } from 'react-icons/fa';

const OrderDetailsModal = ({ order, isOpen, onClose, onUpdate }) => {
  const [orderData, setOrderData] = useState(null);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch full order details when modal opens or order changes
  useEffect(() => {
    if (isOpen && order) {
      // Always try to get order ID from various possible fields
      // MongoDB uses _id, but sometimes it's serialized as id
      const orderId = order._id || order.id;
      
      if (orderId) {
        console.log('Modal opened, fetching fresh order details for ID:', orderId);
        // Always fetch fresh data from backend to ensure customer info is up-to-date
        fetchOrderDetails(orderId);
      } else {
        console.warn('No order ID found in order object:', order);
        // Fallback: use order object directly if no ID (shouldn't happen normally)
        setOrderData(order);
      }
    } else if (!isOpen) {
      // Clear data when modal closes
      setOrderData(null);
      setStatus('');
      setTrackingNumber('');
      setNotes('');
    }
  }, [isOpen, order?._id, order?.id]); // Re-fetch when modal opens or order ID changes

  // Sync form state when orderData changes
  useEffect(() => {
    if (orderData) {
      setStatus(orderData.status || '');
      setTrackingNumber(orderData.tracking_number || '');
      setNotes(orderData.notes || '');
    }
  }, [orderData]);


  const fetchOrderDetails = async (orderId) => {
    if (!orderId) {
      console.warn('fetchOrderDetails called without orderId');
      return;
    }
    
    setFetching(true);
    try {
      console.log('Fetching order with ID:', orderId);
      const response = await adminOrderService.getOrderById(orderId);
      if (response.success && response.data) {
        // Log to verify user data is being received
        console.log('Order data received:', {
          orderId: response.data._id || response.data.id,
          user: response.data.user,
          userName: response.data.user?.name,
          userEmail: response.data.user?.email,
          userPhone: response.data.user?.phone,
          hasUser: !!response.data.user
        });
        
        // Ensure we set the order data with the fresh user information
        setOrderData(response.data);
      } else {
        console.error('Failed to fetch order:', response);
        toast.error(response.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setFetching(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!orderData?._id && !orderData?.id) {
      toast.error('Order ID is missing');
      return;
    }

    setLoading(true);
    try {
      const orderId = orderData._id || orderData.id;
      const response = await adminOrderService.updateOrderStatus(orderId, {
        status,
        tracking_number: trackingNumber,
        notes
      });
      
      if (response.success) {
        toast.success('Order updated successfully');
        // Re-fetch the full order details to get updated customer info and all populated data
        await fetchOrderDetails(orderId);
        // Call onUpdate callback to refresh parent component
        if (onUpdate) {
          const updatedOrder = response.data || orderData;
          onUpdate(updatedOrder);
        }
        // Don't close modal, just update the data
      } else {
        toast.error(response.message || 'Failed to update order');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !orderData) return null;

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
              Order Details - {orderData.order_number || orderData.orderNumber || 'N/A'}
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
            {fetching ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading order details...</div>
              </div>
            ) : (
              <>
                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FaCreditCard className="mr-2" />
                      Customer Information
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Name:</strong> {orderData.user?.name || orderData.user_id?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {orderData.user?.email || orderData.user_id?.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {orderData.user?.phone || orderData.user_id?.phone || orderData.shipping_address?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <FaShippingFast className="mr-2" />
                      Order Summary
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Date:</strong> {formatDate(orderData.createdAt || orderData.created_at)}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(orderData.status)}`}>
                          {orderData.status || 'N/A'}
                        </span>
                      </p>
                      <p><strong>Payment:</strong> {orderData.payment_method || 'N/A'} 
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(orderData.payment_status)}`}>
                          {orderData.payment_status || 'N/A'}
                        </span>
                      </p>
                      <p><strong>Total:</strong> {formatCurrency(orderData.total_amount || 0)}</p>
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
                        {orderData.items && orderData.items.length > 0 ? (
                          orderData.items.map((item, index) => {
                            // Get product image - check multiple possible paths
                            const productImage = item.product?.image || 
                                              item.product?.images?.[0] || 
                                              item.product_snapshot?.image ||
                                              '/placeholder.png';
                            
                            // Get product name
                            const productName = item.product?.name || 
                                              item.product_snapshot?.name || 
                                              'Product N/A';
                            
                            // Get product SKU
                            const productSku = item.product?.sku || 
                                             item.product_snapshot?.sku || 
                                             '';
                            
                            return (
                              <tr key={item._id || item.id || index}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center">
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      className="h-12 w-12 rounded object-cover mr-3"
                                      onError={(e) => {
                                        e.target.src = '/placeholder.png';
                                      }}
                                    />
                                    <div>
                                      <div className="font-medium text-sm">{productName}</div>
                                      {productSku && (
                                        <div className="text-gray-500 text-xs">SKU: {productSku}</div>
                                      )}
                                      {item.variation && (
                                        <div className="text-gray-400 text-xs">
                                          {item.variation.attributes &&
                                            Object.entries(item.variation.attributes).map(([key, value]) => (
                                              <span key={key} className="mr-2">{key}: {value}</span>
                                            ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {formatCurrency(item.price || 0)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {item.quantity || 0}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                  {formatCurrency(item.total_price || 0)}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-3 text-center text-sm text-gray-500">
                              No items found
                            </td>
                          </tr>
                        )}
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
                        <span className="text-sm font-medium">{formatCurrency(orderData.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tax:</span>
                        <span className="text-sm font-medium">{formatCurrency(orderData.tax_amount || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Shipping:</span>
                        <span className="text-sm font-medium">{formatCurrency(orderData.shipping_amount || 0)}</span>
                      </div>
                      {(orderData.discount_amount || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Discount:</span>
                          <span className="text-sm font-medium text-red-600">-{formatCurrency(orderData.discount_amount || 0)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Total:</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(orderData.total_amount || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1">
                      {orderData.shipping_address ? (
                        <>
                          {orderData.user?.name && (
                            <p><strong>Name:</strong> {orderData.user.name}</p>
                          )}
                          {orderData.shipping_address.phone && (
                            <p><strong>Phone:</strong> {orderData.shipping_address.phone}</p>
                          )}
                          {orderData.shipping_address.address_line1 && (
                            <p>{orderData.shipping_address.address_line1}</p>
                          )}
                          {orderData.shipping_address.address_line2 && (
                            <p>{orderData.shipping_address.address_line2}</p>
                          )}
                          {orderData.shipping_address.city && orderData.shipping_address.state && (
                            <p>{orderData.shipping_address.city}, {orderData.shipping_address.state}</p>
                          )}
                          {orderData.shipping_address.country && orderData.shipping_address.pincode && (
                            <p>{orderData.shipping_address.country} {orderData.shipping_address.pincode}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400 italic">No shipping address provided</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Billing Address</h4>
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 space-y-1">
                      {orderData.billing_address ? (
                        <>
                          {orderData.user?.name && (
                            <p><strong>Name:</strong> {orderData.user.name}</p>
                          )}
                          {orderData.billing_address.phone && (
                            <p><strong>Phone:</strong> {orderData.billing_address.phone}</p>
                          )}
                          {orderData.billing_address.address_line1 && (
                            <p>{orderData.billing_address.address_line1}</p>
                          )}
                          {orderData.billing_address.address_line2 && (
                            <p>{orderData.billing_address.address_line2}</p>
                          )}
                          {orderData.billing_address.city && orderData.billing_address.state && (
                            <p>{orderData.billing_address.city}, {orderData.billing_address.state}</p>
                          )}
                          {orderData.billing_address.country && orderData.billing_address.pincode && (
                            <p>{orderData.billing_address.country} {orderData.billing_address.pincode}</p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400 italic">Same as shipping address</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Update Form */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-4">Update Order</h4>
                  <p className="text-xs text-gray-600 mb-4">
                    Use this section to update the order status, add tracking information, and save notes for internal reference.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                        className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Add order notes (internal use only)..."
                      className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Actions */}
          <div className="flex justify-end space-x-3 px-5 py-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={loading}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {loading ? 'Updating...' : 'Update Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal; 