import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const CancellationModal = ({ isOpen, onClose, onConfirm, isProcessing }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation.');
      return;
    }
    // Pass the reason to the confirmation handler
    onConfirm(reason);
  };

  const handleReasonChange = (e) => {
    setReason(e.target.value);
    if (error) {
      setError('');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md">
        <div className="p-3 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base sm:text-xl font-bold text-gray-800">Cancel Your Booking</h2>
          <button onClick={onClose} disabled={isProcessing} className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="p-3 sm:p-6">
          <div className="mb-3 sm:mb-4">
            <label htmlFor="cancellationReason" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Reason for Cancellation <span className="text-sky-500">*</span>
            </label>
            <textarea
              id="cancellationReason"
              value={reason}
              onChange={handleReasonChange}
              rows="3"
              className={`w-full border rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:ring-2 bg-gray-50 ${error ? 'border-sky-500 focus:ring-sky-400 focus:border-sky-400' : 'border-gray-300 focus:ring-sky-400 focus:border-sky-400'}`}
              placeholder="Please let us know why you're cancelling..."
              disabled={isProcessing}
            />
            {error && <p className="text-sky-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="p-2 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs sm:text-sm">
            <p className="font-semibold">Refund Policy</p>
            <p>
              Amount refunds are subject to the hotel vendor's cancellation policy. Upon cancellation, the eligibility for a refund will be determined by the hotel's specific terms and conditions.
            </p>
          </div>
        </div>
        <div className="p-3 sm:p-6 bg-gray-50 rounded-b-2xl flex justify-end space-x-2 sm:space-x-4">
          <button
            onClick={onClose}
            className="py-1.5 px-3 sm:py-2 sm:px-5 bg-gray-200 text-gray-700 rounded-lg text-xs sm:text-base font-semibold hover:bg-gray-300 transition disabled:opacity-50"
            disabled={isProcessing}
          >
            Keep Booking
          </button>
          <button
            onClick={handleConfirm}
            className="py-1.5 px-3 sm:py-2 sm:px-5 bg-sky-600 text-white rounded-lg text-xs sm:text-base font-semibold hover:bg-sky-700 transition shadow flex items-center justify-center w-28 sm:w-44 disabled:bg-sky-400"
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal; 