import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import earningsService from './services/earnings.jsx';

const TransactionContext = createContext();
const EarningsContext = createContext();
const NotificationContext = createContext();

const getInitialNotifications = () => {
  try {
    const stored = localStorage.getItem('notifications');
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
};

export const TransactionProvider = ({ children }) => {
  // Centralized transaction state
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    // Load initial data from service only if user is logged in
    const loadData = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('rider-token');
        if (!token) {
          console.log('User not logged in, skipping earnings fetch');
          return;
        }

        const [transactionsData, earningsData] = await Promise.all([
          earningsService.getRecentTransactions(500),
          earningsService.getEarningsSummary()
        ]);
        setTransactions(transactionsData);
        setEarnings(earningsData);
      } catch (error) {
        console.error('Error loading transaction data:', error);
        setTransactions([]);
        setEarnings(null);
      }
    };

    loadData();
    
    // Listen for dashboard data changes
    const reload = () => {
      loadData();
    };
    window.addEventListener('dashboardDataChanged', reload);
    return () => window.removeEventListener('dashboardDataChanged', reload);
  }, []);

  // Add a new transaction (e.g., withdrawal)
  const addTransaction = (tx) => {
    setTransactions(prev => [tx, ...prev]);
  };

  // Update a transaction by id
  const updateTransaction = (id, updates) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx));
  };

  // Update earnings after withdrawal
  const updateEarnings = (period, amount) => {
    setEarnings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [period]: {
          ...prev[period],
          earnings: (prev[period]?.earnings || 0) - amount
        }
      };
    });
  };

  // Calculate balance from transactions
  const balance = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  // Always provide balance in the earnings context
  const earningsWithBalance = earnings ? { ...earnings, balance } : { balance: 0 };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction }}>
      <EarningsContext.Provider value={{ earnings: earningsWithBalance, setEarnings, updateEarnings }}>
        {children}
      </EarningsContext.Provider>
    </TransactionContext.Provider>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(getInitialNotifications());

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      type: notification.type || 'info',
      title: notification.title || 'Notification',
      message: notification.message || '',
      time: notification.time || new Date().toLocaleTimeString(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    // Show toast if NotificationManager is present
    if (window.showNotification) {
      window.showNotification(newNotification.title + ': ' + newNotification.message, newNotification.type);
    }
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext); 
export const useEarnings = () => useContext(EarningsContext); 
export const useNotification = () => useContext(NotificationContext); 