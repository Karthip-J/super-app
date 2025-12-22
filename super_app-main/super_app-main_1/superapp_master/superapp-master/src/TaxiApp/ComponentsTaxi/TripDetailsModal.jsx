import React from 'react';

const TripDetailsModal = ({ isOpen, onClose, pickupLocation, destination, totalFare, paymentMethod, onCancelRide }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg ring-2 ring-blue-200 p-4 w-11/12 max-w-sm mx-auto mb-16 md:mb-24 animate-bounceIn overflow-hidden">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Trip Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
                            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="font-medium text-gray-700">Pickup:</span>
                        <span className="text-sm text-gray-600 flex-1 text-right">{pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="font-medium text-gray-700">Destination:</span>
                        <span className="text-sm text-gray-600 flex-1 text-right">{destination}</span>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-lg">Total fare</span>
                        <span className="font-bold text-xl">₹{totalFare}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h12a2 2 0 0 1 0 4H5a2 2 0 0 0 0 4h12a2 2 0 0 0 2-2v-3"/><path d="M22 7V4a1 1 0 0 0-1-1H3a2 2 0 0 0 0 4h18a2 2 0 0 1 0 4H3a2 2 0 0 0 0 4h18a2 2 0 0 0 2-2v-3"/><path d="M3 11h2v2H3z"/></svg>
                        <span>Paying via {paymentMethod}</span>
                    </div>
                </div>

                <div className="flex flex-col space-y-3">
                    <button 
                        onClick={onClose}
                        className="w-full bg-yellow-500 text-black py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-yellow-600 transition-colors"
                    >
                        Back
                    </button>
                    <button 
                        onClick={onCancelRide}
                        className="w-full border border-red-500 text-red-500 py-3 rounded-xl text-lg font-semibold hover:bg-red-50 transition-colors"
                    >
                        Cancel Ride
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TripDetailsModal; 