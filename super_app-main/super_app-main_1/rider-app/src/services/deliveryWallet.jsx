// Delivery Wallet Management Service
import deliveryService from './deliveries.jsx';

class DeliveryWalletService {
  constructor() {
    this.transactions = [];
    this.paymentMethods = [
      {
        id: 'bank1',
        type: 'bank',
        name: 'HDFC Bank',
        number: 'XXXX1234',
        isDefault: true,
        isVerified: true
      },
      {
        id: 'upi1',
        type: 'upi',
        name: 'UPI ID',
        number: 'delivery@upi',
        isDefault: false,
        isVerified: true
      }
    ];
    this.walletBalance = 0;
    this.withdrawalHistory = [];
    
    // Load existing data from localStorage
    this.loadFromStorage();
    
    // Calculate initial balance from completed deliveries
    this.calculateBalanceFromDeliveries();
  }

  _saveToStorage() {
    localStorage.setItem('deliveryWallet', JSON.stringify({
      transactions: this.transactions,
      paymentMethods: this.paymentMethods,
      walletBalance: this.walletBalance,
      withdrawalHistory: this.withdrawalHistory
    }));
  }

  _loadFromStorage() {
    const stored = localStorage.getItem('deliveryWallet');
    if (stored) {
      const data = JSON.parse(stored);
      this.transactions = data.transactions || [];
      this.paymentMethods = data.paymentMethods || this.paymentMethods;
      this.walletBalance = data.walletBalance || 0;
      this.withdrawalHistory = data.withdrawalHistory || [];
    }
  }

  loadFromStorage() {
    this._loadFromStorage();
  }

  // Calculate balance from completed deliveries
  calculateBalanceFromDeliveries() {
    const completedDeliveries = deliveryService.getDeliveries('completed');
    const deliveryEarnings = completedDeliveries.reduce((sum, delivery) => {
      return sum + (delivery.fare || 0);
    }, 0);

    // Calculate total withdrawn
    const totalWithdrawn = this.withdrawalHistory.reduce((sum, withdrawal) => {
      return sum + withdrawal.amount;
    }, 0);

    // Update balance
    this.walletBalance = deliveryEarnings - totalWithdrawn;
    this._saveToStorage();
  }

  // Get current wallet balance
  getWalletBalance() {
    return this.walletBalance;
  }

  // Add delivery earnings
  addDeliveryEarnings(deliveryId, amount) {
    const transaction = {
      id: `DELTXN${Date.now()}`,
      type: 'credit',
      amount: amount,
      description: `Delivery Payment - ${deliveryId}`,
      date: new Date().toISOString(),
      status: 'completed',
      category: 'delivery_earnings',
      deliveryId: deliveryId
    };

    this.transactions.unshift(transaction);
    this.walletBalance += amount;
    this._saveToStorage();
    return transaction;
  }

  // Process withdrawal
  processWithdrawal(amount, paymentMethodId) {
    if (amount > this.walletBalance) {
      throw new Error('Insufficient balance');
    }

    if (amount < 100) {
      throw new Error('Minimum withdrawal amount is ₹100');
    }

    const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
    if (!paymentMethod) {
      throw new Error('Invalid payment method');
    }

    const transaction = {
      id: `DELTXN${Date.now()}`,
      type: 'debit',
      amount: amount,
      description: `Withdrawal to ${paymentMethod.name}`,
      date: new Date().toISOString(),
      status: 'processing',
      category: 'withdrawal',
      paymentMethod: paymentMethod.name
    };

    this.transactions.unshift(transaction);
    this.walletBalance -= amount;
    this.withdrawalHistory.push(transaction);
    this._saveToStorage();

    // Simulate processing time
    setTimeout(() => {
      transaction.status = 'completed';
      this._saveToStorage();
    }, 2000);

    return transaction;
  }

  // Get all transactions
  getTransactions(limit = 50) {
    return this.transactions.slice(0, limit);
  }

  // Get transactions by type
  getTransactionsByType(type) {
    return this.transactions.filter(txn => txn.type === type);
  }

  // Get delivery earnings for specific period
  getDeliveryEarningsForPeriod(period = 'today') {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const periodTransactions = this.transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= startDate && txn.type === 'credit' && txn.category === 'delivery_earnings';
    });

    const totalEarnings = periodTransactions.reduce((sum, txn) => sum + txn.amount, 0);
    const deliveryCount = periodTransactions.length;

    return {
      total: totalEarnings,
      count: deliveryCount,
      average: deliveryCount > 0 ? Math.round(totalEarnings / deliveryCount) : 0
    };
  }

  // Get earnings breakdown
  getEarningsBreakdown() {
    const today = this.getDeliveryEarningsForPeriod('today');
    const week = this.getDeliveryEarningsForPeriod('week');
    const month = this.getDeliveryEarningsForPeriod('month');
    const total = this.getDeliveryEarningsForPeriod('all');

    return {
      today: today.total,
      week: week.total,
      month: month.total,
      total: total.total,
      breakdown: {
        today,
        week,
        month,
        total
      }
    };
  }

  // Get payment methods
  getPaymentMethods() {
    return this.paymentMethods;
  }

  // Add payment method
  addPaymentMethod(paymentMethod) {
    const newMethod = {
      id: `pm${Date.now()}`,
      ...paymentMethod,
      isVerified: false
    };
    this.paymentMethods.push(newMethod);
    this._saveToStorage();
    return newMethod;
  }

  // Set default payment method
  setDefaultPaymentMethod(methodId) {
    this.paymentMethods.forEach(pm => {
      pm.isDefault = pm.id === methodId;
    });
    this._saveToStorage();
  }

  // Remove payment method
  removePaymentMethod(methodId) {
    const index = this.paymentMethods.findIndex(pm => pm.id === methodId);
    if (index !== -1) {
      this.paymentMethods.splice(index, 1);
      this._saveToStorage();
      return true;
    }
    return false;
  }

  // Get withdrawal history
  getWithdrawalHistory() {
    return this.withdrawalHistory;
  }

  // Get delivery wallet statistics
  getDeliveryWalletStats() {
    const totalEarnings = this.getDeliveryEarningsForPeriod('all').total;
    const thisMonth = this.getDeliveryEarningsForPeriod('month').total;
    const thisWeek = this.getDeliveryEarningsForPeriod('week').total;
    const today = this.getDeliveryEarningsForPeriod('today').total;

    const deliveryTransactions = this.transactions.filter(txn => txn.category === 'delivery_earnings');
    const averagePerDelivery = deliveryTransactions.length > 0 
      ? Math.round(deliveryTransactions.reduce((sum, txn) => sum + txn.amount, 0) / deliveryTransactions.length)
      : 0;

    return {
      totalEarnings,
      thisMonth,
      thisWeek,
      today,
      averagePerDelivery,
      totalDeliveries: deliveryTransactions.length,
      totalWithdrawn: this.withdrawalHistory.reduce((sum, w) => sum + w.amount, 0)
    };
  }

  // Add bonus
  addBonus(amount, description = 'Delivery Bonus') {
    const transaction = {
      id: `DELTXN${Date.now()}`,
      type: 'credit',
      amount: amount,
      description: description,
      date: new Date().toISOString(),
      status: 'completed',
      category: 'bonus'
    };

    this.transactions.unshift(transaction);
    this.walletBalance += amount;
    this._saveToStorage();
    return transaction;
  }

  // Get pending withdrawals
  getPendingWithdrawals() {
    return this.withdrawalHistory.filter(w => w.status === 'processing');
  }

  // Sync with delivery service (call this when deliveries are completed)
  syncWithDeliveries() {
    this.calculateBalanceFromDeliveries();
  }

  // Reset wallet (for testing)
  resetWallet() {
    this.transactions = [];
    this.walletBalance = 0;
    this.withdrawalHistory = [];
    this._saveToStorage();
  }
}

const deliveryWalletService = new DeliveryWalletService();

export default deliveryWalletService; 