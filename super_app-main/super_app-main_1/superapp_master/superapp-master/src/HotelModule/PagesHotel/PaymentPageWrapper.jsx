import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentPage from './PaymentPage';

const PaymentPageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingInfo = location.state;

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem('hotelUserPhone');
    if (!isLoggedIn) {
      // If not logged in, redirect to login page,
      // preserving the booking info to redirect back later.
      navigate('/hotel-login', { state: { from: bookingInfo }, replace: true });
    }
  }, [navigate, bookingInfo]);

  const handleSuccess = () => {
    // Save booking info to an array in localStorage
    const prev = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
    localStorage.setItem('hotelBookings', JSON.stringify([...prev, bookingInfo]));
    navigate('/home-hotel/bookings');
  };

  // Render nothing or a loader while checking auth
  const isLoggedIn = !!localStorage.getItem('hotelUserPhone');
  if (!isLoggedIn) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <PaymentPage bookingInfo={bookingInfo} onSuccess={handleSuccess} />;
};

export default PaymentPageWrapper; 