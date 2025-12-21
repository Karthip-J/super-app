import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingPage from './BookingHotel';

const BookingPageWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hotel = location.state?.hotel;
  const city = location.state?.city;
  const checkInDate = location.state?.checkInDate;
  const checkOutDate = location.state?.checkOutDate;
  const roomsGuests = location.state?.roomsGuests;

  const handleConfirm = (bookingDetails) => {
    navigate('/hotel-payment', { state: { hotel, city, checkInDate, checkOutDate, roomsGuests, bookingDetails } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return <BookingPage hotel={hotel} city={city} checkInDate={checkInDate} checkOutDate={checkOutDate} roomsGuests={roomsGuests} onConfirm={handleConfirm} onBack={handleBack} />;
};

export default BookingPageWrapper; 