import React from 'react';

function FareDetailsModal({ isOpen, onClose, fareDetails, vehicleType, price }) {
    if (!isOpen || !fareDetails) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl w-full max-w-[340px] mx-auto shadow-xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-2 border-b border-gray-200 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-base font-bold">{vehicleType} Fare Details</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='lucide lucide-x'%3E%3Cpath d='M18 6 6 18'/%3E%3Cpath d='m6 6 12 12'/%3E%3C/svg%3E" alt="close" className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-2 overflow-y-auto flex-1">
                    {/* Total Fare */}
                    <div className="bg-blue-50 rounded-xl p-2 mb-2">
                        <p className="text-xs text-gray-600">Total Estimated fare price</p>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-600">including taxes</p>
                            <p className="font-bold text-base text-blue-600">{price}</p>
                        </div>
                    </div>

                    {/* Ride Fare */}
                    <div className="mb-2">
                        <p className="text-xs text-gray-600">Ride Fare</p>
                        <p className="font-semibold text-xs mt-1">{fareDetails.rideFare}</p>
                    </div>

                    {/* Rate Details */}
                    <div className="bg-gray-50 rounded-xl p-2 mb-2">
                        <p className="text-xs text-gray-600 mb-1">Rate Details</p>
                        <p className="text-xs text-gray-700">{fareDetails.rateDetails}</p>
                    </div>

                    {/* Waiting Charges */}
                    <div className="bg-gray-50 rounded-xl p-2 mb-2">
                        <p className="text-xs text-gray-600 mb-1">Waiting Charges</p>
                        <p className="text-xs text-gray-700">{fareDetails.waitingCharges}</p>
                    </div>

                    {/* Disclaimer */}
                    <p className="text-[10px] text-gray-500 mb-2">
                        {fareDetails.disclaimer}
                    </p>
                </div>

                {/* Action Button */}
                <div className="p-2 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FareDetailsModal; 