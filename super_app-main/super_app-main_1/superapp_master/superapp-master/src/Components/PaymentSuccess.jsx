import React from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';

const PaymentSuccess = ({
  paymentData,
  orderData,
  onContinue,
  showDetails = true,
  className = ''
}) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      // Default navigation based on order type
      switch (orderData?.order_model) {
        case 'Order':
          navigate('/clothes/myorders');
          break;
        case 'FoodOrder':
          navigate('/fooddelivery/myorders');
          break;
        case 'GroceryOrder':
          navigate('/grocery/myorders');
          break;
        case 'Booking':
          navigate('/hotel/mybookings');
          break;
        case 'TaxiRide':
          navigate('/taxi/myrides');
          break;
        case 'PorterBooking':
          navigate('/porter/mybookings');
          break;
        default:
          navigate('/');
      }
    }
  };

  const handleViewOrder = () => {
    // Navigate to specific order details
    switch (orderData?.order_model) {
      case 'Order':
        navigate(`/clothes/order/${orderData.order_id}`);
        break;
      case 'FoodOrder':
        navigate(`/fooddelivery/order/${orderData.order_id}`);
        break;
      case 'GroceryOrder':
        navigate(`/grocery/order/${orderData.order_id}`);
        break;
      case 'Booking':
        navigate(`/hotel/booking/${orderData.order_id}`);
        break;
      case 'TaxiRide':
        navigate(`/taxi/ride/${orderData.order_id}`);
        break;
      case 'PorterBooking':
        navigate(`/porter/booking/${orderData.order_id}`);
        break;
      default:
        navigate('/');
    }
  };

  const getOrderTypeText = () => {
    const typeMap = {
      'Order': 'E-commerce Order',
      'FoodOrder': 'Food Delivery Order',
      'GroceryOrder': 'Grocery Order',
      'Booking': 'Hotel Booking',
      'TaxiRide': 'Taxi Ride',
      'PorterBooking': 'City Move Service'
    };
    return typeMap[orderData?.order_model] || 'Order';
  };

  const getOrderTypeIcon = () => {
    const iconMap = {
      'Order': '🛍️',
      'FoodOrder': '🍕',
      'GroceryOrder': '🥬',
      'Booking': '🏨',
      'TaxiRide': '🚗',
      'PorterBooking': '🧳'
    };
    return iconMap[orderData?.order_model] || '📦';
  };

  return (
    <div className={`max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600">
          Your {getOrderTypeText().toLowerCase()} has been confirmed
        </p>
      </div>

      {/* Order Type */}
      <div className="flex items-center justify-center mb-6">
        <span className="text-3xl mr-3">{getOrderTypeIcon()}</span>
        <span className="text-lg font-semibold text-gray-700">
          {getOrderTypeText()}
        </span>
      </div>

      {/* Payment Details */}
      {showDetails && paymentData && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Payment Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">
                {paymentService.formatAmount(paymentData.amount, paymentData.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment ID:</span>
              <span className="font-mono text-xs text-gray-500">
                {paymentData.razorpay_payment_id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono text-xs text-gray-500">
                {orderData?.order_id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${paymentService.getPaymentStatusColor(paymentData.status)}`}>
                {paymentService.getPaymentStatusText(paymentData.status)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-700">
                {new Date(paymentData.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {showDetails && (
          <button
            onClick={handleViewOrder}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            View Order Details
          </button>
        )}

        <button
          onClick={handleContinue}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Continue Shopping
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Back to Home
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          A confirmation email has been sent to your registered email address
        </p>
        <p className="text-xs text-gray-500 mt-1">
          For any queries, please contact our support team
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess; 