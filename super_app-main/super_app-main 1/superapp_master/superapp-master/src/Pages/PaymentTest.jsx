import React, { useState, useEffect } from 'react';
import PaymentButton from '../Components/PaymentButton';
import PaymentSuccess from '../Components/PaymentSuccess';
import paymentService from '../services/paymentService';

const PaymentTest = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);

  // Test order configurations
  const testOrders = [
    {
      id: 'ecommerce',
      name: 'E-commerce Order',
      icon: '🛍️',
      order_model: 'Order',
      amount: 1500,
      description: 'Test e-commerce order payment'
    },
    {
      id: 'food',
      name: 'Food Delivery',
      icon: '🍕',
      order_model: 'FoodOrder',
      amount: 800,
      description: 'Test food delivery payment'
    },
    {
      id: 'grocery',
      name: 'Grocery Order',
      icon: '🥬',
      order_model: 'GroceryOrder',
      amount: 1200,
      description: 'Test grocery order payment'
    },
    {
      id: 'hotel',
      name: 'Hotel Booking',
      icon: '🏨',
      order_model: 'Booking',
      amount: 2500,
      description: 'Test hotel booking payment'
    },
    {
      id: 'taxi',
      name: 'Taxi Ride',
      icon: '🚗',
      order_model: 'TaxiRide',
      amount: 300,
      description: 'Test taxi ride payment'
    },
    {
      id: 'porter',
      name: 'Porter Service',
      icon: '🧳',
      order_model: 'PorterBooking',
      amount: 500,
      description: 'Test porter service payment'
    }
  ];

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    try {
      setIsLoading(true);
      const status = await paymentService.testPaymentEndpoint();
      setServiceStatus(status);
    } catch (error) {
      setServiceStatus({ success: false, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (data) => {
    setPaymentStatus('success');
    setPaymentData(data);
    setError(null);
  };

  const handlePaymentError = (error) => {
    setPaymentStatus('error');
    setError(error.message);
  };

  const handlePaymentCancel = () => {
    setPaymentStatus('cancelled');
    setError('Payment was cancelled by user');
  };

  const handleTestPayment = (testOrder) => {
    // Create test order data
    const orderData = {
      amount: testOrder.amount * 100, // Convert to paise
      currency: 'INR',
      order_id: `${testOrder.order_model}_${Date.now()}`,
      order_model: testOrder.order_model,
      description: testOrder.description,
      email: 'test@example.com',
      contact: '9876543210',
      customerName: 'Test User'
    };

    setOrderData(orderData);
    setPaymentStatus(null);
    setPaymentData(null);
    setError(null);
  };

  const resetPayment = () => {
    setPaymentStatus(null);
    setPaymentData(null);
    setOrderData(null);
    setError(null);
  };

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Test Results
            </h1>
            <p className="text-gray-600">
              Test the payment integration with different order types
            </p>
          </div>
          
          <PaymentSuccess
            paymentData={paymentData}
            orderData={orderData}
            onContinue={resetPayment}
            className="mb-8"
          />
          
          <div className="text-center">
            <button
              onClick={resetPayment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Test Another Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Integration Test
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Test the Razorpay payment integration with different order types
          </p>
          
          {/* Service Status */}
          <div className="inline-flex items-center px-4 py-2 rounded-lg bg-white shadow-sm">
            <div className={`w-3 h-3 rounded-full mr-3 ${serviceStatus?.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isLoading ? 'Checking service...' : 
               serviceStatus?.success ? 'Payment service is available' : 
               'Payment service unavailable'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Payment Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="text-center mb-4">
                <span className="text-4xl mb-3 block">{order.icon}</span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {order.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {order.description}
                </p>
                <div className="text-2xl font-bold text-green-600 mb-4">
                  ₹{order.amount}
                </div>
              </div>

              <PaymentButton
                orderData={{
                  amount: order.amount * 100,
                  currency: 'INR',
                  order_id: `${order.order_model}_${Date.now()}`,
                  order_model: order.order_model,
                  description: order.description,
                  email: 'test@example.com',
                  contact: '9876543210',
                  customerName: 'Test User'
                }}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
                disabled={!serviceStatus?.success}
                className="w-full"
              >
                Test Payment
              </PaymentButton>
            </div>
          ))}
        </div>

        {/* Custom Payment Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Custom Payment Test
          </h2>
          
          <div className="max-w-md mx-auto">
            <PaymentButton
              orderData={{
                amount: 1000, // ₹10
                currency: 'INR',
                order_id: `CUSTOM_${Date.now()}`,
                order_model: 'Order',
                description: 'Custom test payment',
                email: 'custom@example.com',
                contact: '9876543210',
                customerName: 'Custom User'
              }}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
              disabled={!serviceStatus?.success}
              className="w-full"
              theme="success"
            >
              Test ₹10 Payment
            </PaymentButton>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Test Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Test Cards:</h4>
              <ul className="space-y-1">
                <li>• Success: 4111 1111 1111 1111</li>
                <li>• Failure: 4000 0000 0000 0002</li>
                <li>• Any future date and CVV</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Real payment processing</li>
                <li>• Payment verification</li>
                <li>• Error handling</li>
                <li>• Success confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest; 