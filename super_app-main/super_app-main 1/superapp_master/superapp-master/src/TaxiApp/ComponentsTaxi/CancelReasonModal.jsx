import React from 'react';

const CancelReasonModal = ({ isOpen, onClose, onReasonSelect }) => {
    if (!isOpen) return null;

    const cancellationReasons = [
        "Selected Wrong Pickup Location",
        "Selected Wrong Drop Location",
        "Booked by mistake",
        "Selected different service/vehicle",
        "Taking too long to confirm the ride",
        "Got a ride elsewhere",
        "Others"
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-3 w-full max-w-xs sm:max-w-sm mx-auto animate-slideUp overflow-hidden">
                <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold">Why do you want to cancel?</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                        </svg>
                    </button>
                </div>
                <p className="text-xs text-gray-600 mb-4">Please provide the reason for cancellation</p>

                <div className="flex flex-col space-y-2">
                    {cancellationReasons.map((reason, index) => (
                        <button
                            key={index}
                            onClick={() => onReasonSelect(reason)}
                            className="flex justify-between items-center w-full px-3 py-2 border-b border-gray-200 last:border-b-0 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                        >
                            <span>{reason}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CancelReasonModal; 