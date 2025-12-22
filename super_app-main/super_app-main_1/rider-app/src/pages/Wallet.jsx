import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import { useEarnings, useTransactions } from '../TransactionContext.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { FiArrowUpRight, FiTrendingUp, FiAward, FiZap, FiCreditCard, FiBarChart2, FiPlus, FiHome, FiArrowUp, FiArrowDown, FiCheck, FiX, FiTrash2, FiPieChart, FiDollarSign } from 'react-icons/fi';

const Wallet = ({ isOnline, toggleOnline }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { earnings } = useEarnings();
  const { transactions, addTransaction, updateTransaction } = useTransactions();

  // Withdrawal state
  const [amount, setAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Bank account state
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [newBankError, setNewBankError] = useState('');
  const [banks, setBanks] = useState([
    { id: 'hdfc', name: 'HDFC Bank', account: '****1234' },
    { id: 'icici', name: 'ICICI Bank', account: '****5678' },
    { id: 'sbi', name: 'SBI Bank', account: '****9012' },
  ]);
  
  // Payment methods state
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [newMethodType, setNewMethodType] = useState('bank');
  const [newMethodName, setNewMethodName] = useState('');
  const [newMethodNumber, setNewMethodNumber] = useState('');
  const [newMethodError, setNewMethodError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'bank', name: 'HDFC Bank', number: '****1234', isDefault: true },
    { id: '2', type: 'upi', name: 'UPI ID', number: 'user@upi', isDefault: false }
  ]);

  const balance = earnings?.balance ?? 0;
  const totalEarnings = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const handleWithdraw = () => {
    if (loading) return;
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (num < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }
    if (num > balance) {
      setError('Amount exceeds available balance');
      return;
    }
    if (!selectedBank) {
      setError('Please select a payment method');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const bankObj = banks.find(b => b.id === selectedBank);
    const bankDesc = bankObj ? `${bankObj.name} (${bankObj.account})` : selectedBank;
    const newTx = {
      id: 'w' + Date.now(),
      type: 'withdrawal',
      amount: -num,
      description: `Withdrawal to ${bankDesc}`,
      date: new Date().toISOString(),
      status: 'pending',
    };
    
    addTransaction(newTx);
    setSuccess(true);
    setAmount('');
    setSelectedBank(banks[0]?.id || '');
    
    setTimeout(() => {
      updateTransaction(newTx.id, { status: 'completed' });
      setSuccess(false);
      setLoading(false);
    }, 2000);
  };

  const handleAddBank = () => {
    if (!newBankName.trim() || !newBankAccount.trim()) {
      setNewBankError('Please enter both bank name and account number');
      return;
    }
    if (banks.some(b => b.account === '****' + newBankAccount.trim().slice(-4))) {
      setNewBankError('This account is already added');
      return;
    }
    
    const newId = 'bank' + (banks.length + 1);
    setBanks(prev => [...prev, { 
      id: newId, 
      name: newBankName.trim(), 
      account: '****' + newBankAccount.trim().slice(-4) 
    }]);
    
    setSelectedBank(newId);
    setShowAddBank(false);
    setNewBankName('');
    setNewBankAccount('');
    setNewBankError('');
  };

  const handleAddPaymentMethod = () => {
    if (!newMethodName.trim() || !newMethodNumber.trim()) {
      setNewMethodError('Please enter all details');
      return;
    }
    if (paymentMethods.some(pm => pm.number === newMethodNumber.trim())) {
      setNewMethodError('This account/UPI is already added');
      return;
    }
    
    const newMethod = {
      id: 'pm' + (paymentMethods.length + 1),
      type: newMethodType,
      name: newMethodName.trim(),
      number: newMethodType === 'bank' ? '****' + newMethodNumber.trim().slice(-4) : newMethodNumber.trim(),
      isDefault: paymentMethods.length === 0
    };
    
    setPaymentMethods(prev => [...prev, newMethod]);
    setShowAddMethod(false);
    setNewMethodName('');
    setNewMethodNumber('');
    setNewMethodError('');
  };

  const handleRemovePaymentMethod = (id) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const handleSetDefault = (id) => {
    setPaymentMethods(prev => 
      prev.map(pm => ({
        ...pm,
        isDefault: pm.id === id
      }))
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiPieChart size={16} /> },
    { id: 'transactions', label: 'Transactions', icon: <FiDollarSign size={16} /> },
    { id: 'withdraw', label: 'Withdraw', icon: <FiArrowUp size={16} /> },
    { id: 'payment', label: 'Payment', icon: <FiCreditCard size={16} /> }
  ];

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'trip': return <FiTrendingUp size={18} />;
      case 'bonus': return <FiAward size={18} />;
      case 'incentive': return <FiZap size={18} />;
      case 'withdrawal': return <FiCreditCard size={18} />;
      default: return <span style={{fontSize:18, fontWeight:'bold'}}>₹</span>;
    }
  };

  const getTransactionColor = (type, amount) => {
    if (amount < 0) return '#f44336';
    switch (type) {
      case 'trip': return '#4CAF50';
      case 'bonus': return '#FF9800';
      case 'incentive': return '#9C27B0';
      case 'withdrawal': return '#f44336';
      default: return '#2196F3';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Header />
      <main className="p-4 max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 text-gray-800 dark:text-gray-100 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="m-0 mb-2 text-xl font-semibold flex items-center gap-2">
            <span style={{fontSize:20, fontWeight:'bold'}}>₹</span> My Wallet
          </h2>
          <p className="m-0 text-gray-500 dark:text-gray-300 text-sm leading-snug">
            Manage your earnings and withdrawals
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex gap-1 flex-wrap justify-between">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-lg border-none text-xs capitalize flex-1 min-w-fit font-semibold flex flex-col items-center transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-medium'}`}
              >
                <div className="flex items-center gap-1">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Balance Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-4 shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-sm text-gray-500 dark:text-gray-300 mb-2 flex items-center justify-center gap-1">
                Available Balance
              </div>
              <h1 className="m-0 mb-4 text-3xl text-gray-800 dark:text-gray-100 font-bold tracking-tight">
                ₹{balance.toLocaleString('en-IN')}
              </h1>
              <div className="flex gap-2 justify-center mt-4">
                <button
                  className="bg-blue-600 text-white border-none rounded-lg px-4 py-3 text-sm font-semibold flex items-center gap-2 flex-1 min-w-fit transition-colors hover:bg-blue-700"
                  onClick={() => setActiveTab('withdraw')}
                >
                  <FiArrowUpRight size={16} /> Withdraw
                </button>
                <button
                  className="bg-white dark:bg-gray-900 text-blue-600 border border-blue-600 rounded-lg px-4 py-3 text-sm font-semibold flex items-center gap-2 flex-1 min-w-fit transition-colors hover:bg-blue-50 dark:hover:bg-gray-800"
                  onClick={() => setActiveTab('transactions')}
                >
                  <FiBarChart2 size={16} /> History
                </button>
              </div>
            </div>

            {/* Earnings Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900 rounded-xl flex items-center justify-center text-green-600 dark:text-green-300">
                    <FiTrendingUp size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">This Week</div>
                    <div className="text-base font-semibold text-gray-800 dark:text-gray-100">₹{(earnings?.thisWeek ?? 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-300">
                    <FiBarChart2 size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">This Month</div>
                    <div className="text-base font-semibold text-gray-800 dark:text-gray-100">₹{(earnings?.thisMonth ?? 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-300">
                    <FiDollarSign size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Total Earnings</div>
                    <div className="text-base font-semibold text-gray-800 dark:text-gray-100">₹{totalEarnings.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-300">
                    <FiHome size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Payment Methods</div>
                    <div className="text-base font-semibold text-gray-800 dark:text-gray-100">{paymentMethods.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0 text-base text-gray-800 dark:text-gray-100 font-semibold">Transaction History</h3>
              <button className="bg-transparent text-blue-600 dark:text-blue-300 border-none text-xs font-semibold flex items-center gap-1 cursor-pointer">
                View All <FiArrowUpRight size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {transactions.slice(0, 5).map(transaction => (
                <div key={transaction.id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ background: getTransactionColor(transaction.type, transaction.amount) + '20', color: getTransactionColor(transaction.type, transaction.amount) }}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 leading-tight">{transaction.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: getTransactionColor(transaction.type, transaction.amount) }}>
                      {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                    </div>
                    <div className={`text-[10px] font-medium mt-0.5 capitalize ${transaction.status === 'completed' ? 'text-green-600 dark:text-green-400' : transaction.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="py-5 text-center text-gray-500 dark:text-gray-300 text-sm">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
              <h3 className="m-0 mb-4 text-lg text-gray-800 dark:text-gray-100 font-semibold">Withdraw Funds</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-2">Amount to Withdraw</label>
                <input
                  type="number"
                  placeholder="Enter amount (min ₹100)"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={100}
                  max={balance}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-2">Payment Method</label>
                <div className="flex gap-2">
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a bank account</option>
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name} ({bank.account})</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowAddBank(true)}
                    disabled={loading}
                    className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus size={20} />
                  </button>
                </div>
              </div>
              
              {showAddBank && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="m-0 mb-3 text-sm text-gray-800 dark:text-gray-100 font-semibold">Add New Bank Account</h4>
                  <input
                    type="text"
                    placeholder="Bank Name (e.g. HDFC Bank)"
                    value={newBankName}
                    onChange={e => setNewBankName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={newBankAccount}
                    onChange={e => setNewBankAccount(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {newBankError && <div className="text-red-600 text-sm mb-2">{newBankError}</div>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddBank}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <FiCheck size={16} /> Add Bank
                    </button>
                    <button
                      onClick={() => {
                        setShowAddBank(false);
                        setNewBankName('');
                        setNewBankAccount('');
                        setNewBankError('');
                      }}
                      className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      <FiX size={16} /> Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {error && <div className="text-red-600 text-sm mb-4 text-center">{error}</div>}
              {success && <div className="text-green-600 text-sm mb-4 text-center">Withdrawal request submitted successfully!</div>}
              
              <button
                onClick={handleWithdraw}
                disabled={loading || !amount || !selectedBank}
                className={`w-full py-3 rounded-lg text-base font-semibold text-white transition-colors ${loading || !amount || !selectedBank ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? 'Processing...' : 'Withdraw Funds'}
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <h4 className="m-0 mb-3 text-sm text-gray-800 dark:text-gray-100 font-semibold">Withdrawal Information</h4>
              <ul className="m-0 pl-4 text-sm text-gray-500 dark:text-gray-300 leading-relaxed">
                <li className="mb-2">• Minimum withdrawal amount: ₹100</li>
                <li className="mb-2">• Processing time: 2-4 business hours</li>
                <li className="mb-2">• No withdrawal charges applied</li>
                <li>• Daily withdrawal limit: ₹10,000</li>
              </ul>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment' && (
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="m-0 text-base text-gray-800 dark:text-gray-100 font-semibold">Payment Methods</h3>
                <button
                  onClick={() => setShowAddMethod(true)}
                  className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <FiPlus size={16} />
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {paymentMethods.length === 0 ? (
                  <div className="py-5 text-center text-gray-500 dark:text-gray-300 text-sm">
                    No payment methods added yet
                  </div>
                ) : (
                  paymentMethods.map(method => (
                    <div key={method.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.type === 'upi' ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'}`}>
                          {method.type === 'upi' ? <FiCreditCard size={18} /> : <FiHome size={18} />}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">{method.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-300">{method.number}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {method.isDefault ? (
                            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg">Default</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleSetDefault(method.id)}
                                className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                title="Set as default"
                              >
                                <FiCheck size={16} />
                              </button>
                              <button
                                onClick={() => handleRemovePaymentMethod(method.id)}
                                className="w-8 h-8 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                                title="Remove"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {showAddMethod && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="m-0 mb-3 text-sm text-gray-800 dark:text-gray-100 font-semibold">Add Payment Method</h4>
                
                <select
                  value={newMethodType}
                  onChange={e => setNewMethodType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-base mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bank">Bank Account</option>
                  <option value="upi">UPI ID</option>
                </select>
                
                <input
                  type="text"
                  placeholder={newMethodType === 'bank' ? 'Bank Name (e.g. HDFC Bank)' : 'UPI Name (e.g. yourname)'}
                  value={newMethodName}
                  onChange={e => setNewMethodName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-base mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <input
                  type="text"
                  placeholder={newMethodType === 'bank' ? 'Account Number' : 'UPI ID (e.g. yourname@upi)'}
                  value={newMethodNumber}
                  onChange={e => setNewMethodNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-base mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                {newMethodError && <div className="text-red-600 text-sm mb-3">{newMethodError}</div>}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPaymentMethod}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <FiCheck size={16} /> Add Method
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMethod(false);
                      setNewMethodName('');
                      setNewMethodNumber('');
                      setNewMethodError('');
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <FiX size={16} /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Wallet;