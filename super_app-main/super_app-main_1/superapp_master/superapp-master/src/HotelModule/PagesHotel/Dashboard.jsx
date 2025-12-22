import React from 'react';

const Dashboard = () => (
  <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center py-4 sm:py-10 px-1 sm:px-2">
    {/* Hero/Heading */}
    <div className="w-full max-w-xs sm:max-w-2xl mx-auto text-center mb-4 sm:mb-8">
      <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-1 sm:mb-2 drop-shadow">My Bookings</h1>
      <p className="text-xs sm:text-base md:text-lg text-gray-600">View your upcoming, past, and cancelled hotel reservations here.</p>
    </div>
    {/* Dashboard Card */}
    <div className="w-full max-w-xs sm:max-w-2xl bg-white rounded-2xl shadow-2xl p-3 sm:p-6 md:p-10 mx-auto">
      {/* Booking List Placeholder */}
      <div className="flex flex-col gap-2 sm:gap-4">
        {/* Example: No bookings yet */}
        <div className="flex flex-col items-center justify-center py-6 sm:py-12">
          <svg className="w-10 h-10 sm:w-16 sm:h-16 text-gray-300 mb-2 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="text-base sm:text-lg font-semibold text-gray-700 mb-0.5 sm:mb-1">No bookings yet</div>
          <div className="text-xs sm:text-sm text-gray-500">Your booked hotels will appear here once you make a reservation.</div>
        </div>
      </div>
    </div>
  </div>
);

export default Dashboard; 