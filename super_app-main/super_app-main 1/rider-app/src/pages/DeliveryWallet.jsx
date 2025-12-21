import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryHeader from '../components/DeliveryHeader.jsx';
import DeliveryBottomNav from '../components/DeliveryBottomNav.jsx';
import deliveryWalletService from '../services/deliveryWallet.jsx';
import { 
  HiCurrencyRupee,
  HiOutlineCreditCard,
  HiOutlineOfficeBuilding,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineEye,
  HiOutlineEyeOff
} from 'react-icons/hi';

const DeliveryWallet = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [walletData, setWalletData] = useState({
    balance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
    transactions: [],
    paymentMethods: []
  });

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get transaction icon
  const getTransactionIcon = (transaction) => {
    if (transaction.type === 'credit') {
      return <HiOutlineArrowDown className="text-green-600" />;
    } else {
      return <HiOutlineArrowUp className="text-red-600" />;
    }
  };

  // Get transaction color
  const getTransactionColor = (transaction) => {
    if (transaction.type === 'credit') {
      return 'text-green-600';
    } else {
      return 'text-red-600';
    }
  };

  // Load wallet data
  const loadWalletData = () => {
    setIsLoading(true);
    try {
      const balance = deliveryWalletService.getWalletBalance();
      const transactions = deliveryWalletService.getTransactions(10);
      const paymentMethods = deliveryWalletService.getPaymentMethods();
      const walletStats = deliveryWalletService.getDeliveryWalletStats();
      
      setWalletData({
        balance,
        totalEarned: walletStats.totalEarnings,
        totalWithdrawn: walletStats.totalWithdrawn,
        transactions,
        paymentMethods
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to load wallet data. Please try again.');
      console.error('Failed to load wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAmount || !selectedMethod) {
      setErrorMessage('Please enter an amount and select a payment method.');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }
    if (amount < 100) {
      setErrorMessage('Minimum withdrawal amount is ₹100.');
      return;
    }
    if (amount > walletData.balance) {
      setErrorMessage('Withdrawal amount exceeds available balance.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const transaction = deliveryWalletService.processWithdrawal(amount, selectedMethod);
      
      // Reload wallet data after withdrawal
      loadWalletData();
      
      setSuccessMessage(`Successfully withdrew ${formatCurrency(amount)}!`);
      setTimeout(() => setSuccessMessage(''), 3000); // Clear success message after 3 seconds
      setWithdrawAmount('');
      setSelectedMethod('');
      setShowWithdrawModal(false);
    } catch (error) {
      setErrorMessage('Withdrawal failed. Please try again.');
      console.error('Withdrawal failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh wallet data
  const refreshWallet = async () => {
    setIsLoading(true);
    try {
      loadWalletData();
      setSuccessMessage('Wallet refreshed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to refresh wallet. Please try again.');
      console.error('Failed to refresh wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add payment method
  const addPaymentMethod = (methodData) => {
    try {
      deliveryWalletService.addPaymentMethod(methodData);
      loadWalletData();
      setSuccessMessage('Payment method added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to add payment method. Please try again.');
      console.error('Failed to add payment method:', error);
    }
  };

  useEffect(() => {
    loadWalletData();
    
    // Listen for delivery updates
    const handleDeliveriesChanged = () => {
      deliveryWalletService.syncWithDeliveries();
      loadWalletData();
    };
    
    window.addEventListener('deliveriesDataChanged', handleDeliveriesChanged);
    
    // Set up real-time updates (every 60 seconds)
    const interval = setInterval(loadWalletData, 60000);
    
    return () => {
      window.removeEventListener('deliveriesDataChanged', handleDeliveriesChanged);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DeliveryHeader />
      <div className="w-full max-w-md mx-auto overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Delivery Wallet</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Manage your delivery earnings and payments
            </p>
          </div>

          {/* Notifications */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-sm">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}

          {/* Balance Card */}
          <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Available Balance</p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {showBalance ? formatCurrency(walletData.balance) : '₹****'}
                  </p>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="ml-2 p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {showBalance ? <HiOutlineEyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <HiOutlineEye className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                  </button>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <HiCurrencyRupee className="text-2xl text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={walletData.balance <= 0 || isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Withdraw
              </button>
              <button
                onClick={refreshWallet}
                disabled={isLoading}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Earned</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(walletData.totalEarned)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <HiOutlineArrowDown className="text-green-600 text-sm" />
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Withdrawn</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(walletData.totalWithdrawn)}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <HiOutlineArrowUp className="text-red-600 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Payment Methods</h3>
            {walletData.paymentMethods.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center">No payment methods added yet.</div>
            )}
            <div className="space-y-3">
              {walletData.paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      {method.type === 'bank' ? <HiOutlineOfficeBuilding className="text-blue-600" /> : <HiOutlineCreditCard className="text-blue-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{method.number}</p>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Recent Transactions</h3>
            {walletData.transactions.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm text-center">No transactions yet.</div>
            )}
            <div className="space-y-3">
              {walletData.transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                    {getTransactionIcon(transaction)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {transaction.description}
                      </span>
                      <span className={`font-bold ${getTransactionColor(transaction)}`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{transaction.deliveryId ? `Delivery: ${transaction.deliveryId}` : transaction.category}</span>
                      <span>{formatDate(transaction.date)}</span>
                    </div>
                    {transaction.status === 'processing' && (
                      <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Processing
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Withdraw Funds</h3>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => {
                  setWithdrawAmount(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Enter amount (min ₹100)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                max={walletData.balance}
                min="100"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select payment method</option>
                {walletData.paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name} ({method.number})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setErrorMessage('');
                  setWithdrawAmount('');
                  setSelectedMethod('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || !selectedMethod || isLoading || parseFloat(withdrawAmount) < 100 || parseFloat(withdrawAmount) > walletData.balance}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeliveryBottomNav />
    </div>
  );
};

export default DeliveryWallet;