import React, { useState } from 'react';

const WithdrawModal = ({ open, onClose, maxAmount, banks = [], addBank, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [bank, setBank] = useState(banks[0]?.id || '');
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'loading' | 'success' | 'addbank'
  const [showToast, setShowToast] = useState(false);
  // New bank form state
  const [newBankName, setNewBankName] = useState('');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [newBankError, setNewBankError] = useState('');

  React.useEffect(() => {
    if (banks.length && !banks.find(b => b.id === bank)) {
      setBank(banks[0].id);
    }
  }, [banks]);

  if (!open) return null;

  const handleNext = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (num > maxAmount) {
      setError('Amount exceeds available earnings');
      return;
    }
    if (!bank) {
      setError('Select a bank account');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleWithdraw = () => {
    setStep('loading');
    setTimeout(() => {
      setStep('success');
      setShowToast(true);
      onWithdraw(parseFloat(amount), bank);
      setTimeout(() => {
        setShowToast(false);
        handleClose();
      }, 1500);
    }, 1800);
  };

  const handleClose = () => {
    setAmount('');
    setError('');
    setStep('form');
    setNewBankName('');
    setNewBankAccount('');
    setNewBankError('');
    onClose();
  };

  const isConfirmDisabled = step === 'loading' || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount || !bank;

  // Add bank logic
  const handleAddBank = () => {
    if (!newBankName.trim() || !newBankAccount.trim()) {
      setNewBankError('Enter both bank name and account number');
      return;
    }
    if (banks.some(b => b.account === newBankAccount.trim())) {
      setNewBankError('This account is already added');
      return;
    }
    addBank({ name: newBankName.trim(), account: '****' + newBankAccount.trim().slice(-4) });
    setBank('bank' + (banks.length + 1));
    setStep('form');
    setNewBankName('');
    setNewBankAccount('');
    setNewBankError('');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-30 flex items-center justify-center z-[1000] overflow-y-auto p-0">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 min-w-0 w-full max-w-md shadow-2xl text-center relative m-2 max-h-[95vh] overflow-y-auto flex flex-col justify-center">
        {step === 'form' && (
          <>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Withdraw Earnings</h2>
            <div className="mb-4">
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                min={1}
                max={maxAmount}
                onChange={e => setAmount(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 text-lg mb-1 box-border focus:outline-none focus:ring-2 focus:ring-green-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                disabled={step === 'loading'}
              />
            </div>
            <div className="mb-4 text-left">
              <label className="text-sm text-gray-700 dark:text-gray-300 font-medium">Bank Account</label>
              <div className="flex gap-2 items-center mt-2">
                <select
                  value={bank}
                  onChange={e => setBank(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 text-base box-border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                  disabled={step === 'loading'}
                >
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.account})</option>
                  ))}
                </select>
                <button
                  className="bg-blue-600 text-white rounded-lg px-3 py-2 font-bold text-base whitespace-nowrap hover:bg-blue-700 transition-colors"
                  onClick={() => setStep('addbank')}
                  disabled={step === 'loading'}
                  type="button"
                >
                  + Add
                </button>
              </div>
            </div>
            {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={() => {
                  // Always allow click, but validate inside
                  const num = parseFloat(amount);
                  if (isNaN(num) || num <= 0) {
                    setError('Enter a valid amount');
                    return;
                  }
                  if (maxAmount <= 0) {
                    setError('You do not have sufficient balance to withdraw.');
                    return;
                  }
                  if (num > maxAmount) {
                    setError('Amount exceeds available earnings');
                    return;
                  }
                  if (!bank) {
                    setError('Select a bank account');
                    return;
                  }
                  setError('');
                  setStep('confirm');
                }}
                className="bg-green-600 text-white rounded-lg py-3 font-bold flex-1 text-lg hover:bg-green-700 transition-colors"
              >
                Withdraw
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg py-3 font-bold flex-1 text-lg hover:bg-gray-300 dark:hover:bg-gray-900 transition-colors"
                disabled={step === 'loading'}
              >
                Cancel
              </button>
            </div>
          </>
        )}
        {step === 'addbank' && (
          <>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Add Bank Account</h2>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Bank Name (e.g. ICICI Bank)"
                value={newBankName}
                onChange={e => setNewBankName(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 text-base mb-2 box-border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                disabled={step === 'loading'}
              />
              <input
                type="text"
                placeholder="Account Number"
                value={newBankAccount}
                onChange={e => setNewBankAccount(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 text-base box-border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                disabled={step === 'loading'}
              />
            </div>
            {newBankError && <div className="text-red-600 mb-2 text-sm">{newBankError}</div>}
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={handleAddBank}
                className="bg-blue-600 text-white rounded-lg py-3 font-bold flex-1 text-lg hover:bg-blue-700 transition-colors"
                disabled={step === 'loading'}
              >
                Add Bank
              </button>
              <button
                onClick={() => setStep('form')}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg py-3 font-bold flex-1 text-lg hover:bg-gray-300 dark:hover:bg-gray-900 transition-colors"
                disabled={step === 'loading'}
              >
                Cancel
              </button>
            </div>
          </>
        )}
        {step === 'confirm' && (
          <>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">Confirm Withdrawal</h2>
            <div className="mb-4 text-lg text-gray-900 dark:text-gray-100">Withdraw <span className="text-green-600 font-bold">₹{amount}</span> to <span className="text-blue-600 font-bold">{banks.find(b => b.id === bank)?.name} ({banks.find(b => b.id === bank)?.account})</span>?</div>
            <div className="flex gap-2 justify-center mt-2">
              <button
                onClick={handleWithdraw}
                className="bg-green-600 text-white rounded-lg py-3 font-bold flex-1 text-lg hover:bg-green-700 transition-colors"
                disabled={step === 'loading'}
              >
                Confirm
              </button>
              <button
                onClick={() => setStep('form')}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg py-3 font-bold flex-1 text-lg hover:bg-gray-300 dark:hover:bg-gray-900 transition-colors"
                disabled={step === 'loading'}
              >
                Cancel
              </button>
            </div>
          </>
        )}
        {step === 'loading' && (
          <div className="py-10 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-green-500 mb-4"></div>
            <div className="text-lg text-gray-600 dark:text-gray-300">Processing withdrawal...</div>
          </div>
        )}
        {step === 'success' && (
          <div className="py-10 flex flex-col items-center">
            <div className="text-5xl text-green-500 mb-4">✔️</div>
            <div className="text-xl font-bold text-green-600 mb-2">Withdrawal Requested!</div>
            <div className="text-base text-gray-600 dark:text-gray-300">Funds will arrive in your bank soon.</div>
          </div>
        )}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-transparent border-none text-2xl text-gray-500 dark:text-gray-300 cursor-pointer z-20"
          aria-label="Close"
          disabled={step === 'loading'}
        >
          ×
        </button>
        {showToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-10 py-3 rounded-2xl font-bold text-lg shadow-lg z-2000">
            Withdrawal Requested!
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawModal; 