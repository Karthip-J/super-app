import React, { useState } from 'react';
import paymentService from '../services/paymentService';

const PaymentButton = ({ 
  orderData, 
  onSuccess, 
  onError, 
  onCancel, 
  className = '', 
  children,
  disabled = false,
  loading = false,
  theme = 'primary'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Theme configurations
  const themes = {
    primary: {
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      loading: 'bg-blue-500',
      disabled: 'bg-gray-400 cursor-not-allowed'
    },
    success: {
      button: 'bg-green-600 hover:bg-green-700 text-white',
      loading: 'bg-green-500',
      disabled: 'bg-gray-400 cursor-not-allowed'
    },
    danger: {
      button: 'bg-red-600 hover:bg-red-700 text-white',
      loading: 'bg-red-500',
      disabled: 'bg-gray-400 cursor-not-allowed'
    },
    outline: {
      button: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
      loading: 'border-blue-400 text-blue-400',
      disabled: 'border-gray-300 text-gray-400 cursor-not-allowed'
    }
  };

  const currentTheme = themes[theme] || themes.primary;

  const handlePayment = async () => {
    if (disabled || loading || isProcessing) return;

    console.log('🔍 PaymentButton: Starting payment process...');
    console.log('🔍 PaymentButton: Order data:', orderData);

    setIsProcessing(true);
    setError(null);

    try {
      // Validate payment data
      console.log('🔍 PaymentButton: Validating payment data...');
      const validation = paymentService.validatePaymentData(orderData);
      console.log('🔍 PaymentButton: Validation result:', validation);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      console.log('🔍 PaymentButton: Validation passed, processing payment...');

      // Process payment
      await paymentService.processPayment(orderData, {
        onSuccess: (paymentData) => {
          console.log('🔍 PaymentButton: Payment successful:', paymentData);
          setIsProcessing(false);
          if (onSuccess) {
            onSuccess(paymentData);
          }
        },
        onError: (error) => {
          console.log('🔍 PaymentButton: Payment error:', error);
          setIsProcessing(false);
          setError(error.message);
          if (onError) {
            onError(error);
          }
        },
        onCancel: () => {
          console.log('🔍 PaymentButton: Payment cancelled');
          setIsProcessing(false);
          if (onCancel) {
            onCancel();
          }
        },
        businessName: 'Super App',
        themeColor: '#3399cc'
      });

    } catch (error) {
      console.log('🔍 PaymentButton: Caught error:', error);
      setIsProcessing(false);
      setError(error.message);
      if (onError) {
        onError(error);
      }
    }
  };

  const getButtonClasses = () => {
    let baseClasses = 'px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2';
    
    if (disabled || loading) {
      return `${baseClasses} ${currentTheme.disabled}`;
    }
    
    if (isProcessing) {
      return `${baseClasses} ${currentTheme.loading}`;
    }
    
    return `${baseClasses} ${currentTheme.button}`;
  };

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing Payment...
        </>
      );
    }

    if (loading) {
      return (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      );
    }

    return children || 'Pay Now';
  };

  return (
    <div className="w-full">
      <button
        onClick={handlePayment}
        disabled={disabled || loading || isProcessing}
        className={`${getButtonClasses()} ${className}`}
      >
        {getButtonContent()}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PaymentButton; 