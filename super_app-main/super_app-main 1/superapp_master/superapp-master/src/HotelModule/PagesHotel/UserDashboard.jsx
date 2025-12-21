import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { MapPin, Calendar, Users, User, Star, ArrowLeft, Trash2 } from "lucide-react";
import CancellationModal from '../ComponentsHotel/CancellationModal';
import { cancelBooking } from '../Services/hotelApi';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelIndex, setCancelIndex] = useState(null); // Track which booking to cancel
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Custom toast notification (same as e-commerce)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch bookings from backend on mount
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('🔍 UserDashboard: Fetching bookings with token:', token ? 'present' : 'missing');
        if (!token) throw new Error('Not authenticated');
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.MY_BOOKINGS), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('🔍 UserDashboard: API response status:', response.status);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const data = await response.json();
        console.log('🔍 UserDashboard: API returned bookings:', data);
        setBookings(data);
      } catch (err) {
        console.log('🔍 UserDashboard: API failed, falling back to localStorage:', err.message);
        // Fallback to localStorage if API fails
        const arr = localStorage.getItem('hotelBookings');
        const localBookings = arr ? JSON.parse(arr) : [];
        console.log('🔍 UserDashboard: localStorage bookings:', localBookings);
        setBookings(localBookings);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter out empty/invalid bookings
  const filteredBookings = bookings.filter(booking => {
    const { hotel, bookingDetails } = booking || {};
    const hasHotel = hotel && hotel.name && hotel.name !== 'Hotel Name';
    const hasGuest = bookingDetails && bookingDetails.name && bookingDetails.name !== 'N/A';
    const hasCheckIn = bookingDetails && bookingDetails.checkIn && bookingDetails.checkIn !== 'N/A';
    const hasCheckOut = bookingDetails && bookingDetails.checkOut && bookingDetails.checkOut !== 'N/A';
    const isValid = hasHotel || hasGuest || hasCheckIn || hasCheckOut;
    
    if (!isValid) {
      console.log('🔍 UserDashboard: Filtered out booking:', { hotel, bookingDetails });
    }
    
    return isValid;
  });
  
  console.log('🔍 UserDashboard: Total bookings:', bookings.length, 'Filtered bookings:', filteredBookings.length);

  const openCancelModal = (idx) => {
    setCancelIndex(idx);
    setIsModalOpen(true);
  };

  const handleConfirmCancellation = async (reason) => {
    setIsCancelling(true);
    try {
      const booking = bookings[cancelIndex];
      await cancelBooking(booking, reason);
      const updated = bookings.filter((_, i) => i !== cancelIndex);
      setBookings(updated);
      localStorage.setItem('hotelBookings', JSON.stringify(updated));
    } catch (error) {
      showToast("An error occurred during cancellation. Please try again.", "error");
    } finally {
      setIsCancelling(false);
      setIsModalOpen(false);
      setCancelIndex(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-center text-gray-500">Loading bookings...</div>;
  }

  if (!filteredBookings.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-sky-600 mb-4">No Bookings Found</h2>
          <Link
            to="/home-hotel"
            className="bg-sky-600 text-white py-3 px-6 rounded-lg text-base font-semibold shadow-md hover:bg-sky-700 transition"
          >
            Find a Hotel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{toast.message}</span>
            <button 
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <CancellationModal
        isOpen={isModalOpen}
        onClose={() => !isCancelling && setIsModalOpen(false)}
        onConfirm={handleConfirmCancellation}
        isProcessing={isCancelling}
      />
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-4 md:py-8 px-1 md:px-4">
        <div className="max-w-xs md:max-w-3xl mx-auto">
          <div className="relative text-center mb-4 md:mb-8">
            <button
              onClick={() => navigate('/home-hotel')}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-sky-600 hover:text-sky-700 focus:outline-none bg-sky-100 rounded-full p-1 md:p-2 shadow-sm transition-transform duration-150 ease-in-out hover:scale-110"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>
            <h1 className="text-lg md:text-4xl font-extrabold text-sky-600 tracking-tight">Your Bookings</h1>
            <p className="mt-1 md:mt-2 text-xs md:text-lg text-gray-500">All your hotel reservations in one place.</p>
          </div>
          
          {/* Book another stay button - moved to top */}
          <div className="mb-4 md:mb-8 p-2 md:p-6 bg-gray-50 text-center rounded-xl md:rounded-2xl shadow">
            <Link
              to="/home-hotel"
              className="text-sky-600 hover:text-sky-700 font-semibold text-xs md:text-base"
            >
              Book another stay
            </Link>
          </div>
          
          <div className="space-y-4 md:space-y-8">
            {filteredBookings.map((booking, idx) => {
              const { hotel, city, bookingDetails } = booking;
              const { name, contact, special, checkIn, checkOut, guests } = bookingDetails || {};
              return (
                <div key={idx} className="bg-white rounded-xl md:rounded-2xl shadow overflow-hidden">
                  <div className="p-2 md:p-8 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-base md:text-2xl font-bold text-gray-900">{hotel?.name || 'Hotel Name'}</h2>
                      <div className="flex items-center text-xs md:text-gray-600 mt-1 md:mt-2">
                        <MapPin className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2 text-sky-500" />
                        <span>{city || 'City'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => openCancelModal(idx)}
                      className="flex items-center text-sky-600 hover:text-sky-700 font-semibold bg-sky-50 border border-sky-200 rounded-lg px-2 md:px-3 py-1 md:py-2 ml-2 md:ml-4 text-xs md:text-base"
                    >
                      <Trash2 className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-2" /> Cancel
                    </button>
                  </div>
                  <div className="p-2 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-2 md:gap-x-8 gap-y-2 md:gap-y-6">
                    <div className="space-y-2 md:space-y-4">
                      <h3 className="text-xs md:text-lg font-semibold text-gray-800 border-b pb-1 md:pb-2 flex items-center">
                        <User className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-3 text-sky-500" />
                        Guest Information
                      </h3>
                      <div>
                        <label className="block text-[10px] md:text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-xs md:text-base font-semibold text-gray-800 mt-0.5 md:mt-1">{name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] md:text-sm font-medium text-gray-500">Contact Number</label>
                        <p className="text-xs md:text-base font-semibold text-gray-800 mt-0.5 md:mt-1">{contact || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="space-y-2 md:space-y-4">
                      <h3 className="text-xs md:text-lg font-semibold text-gray-800 border-b pb-1 md:pb-2 flex items-center">
                        <Calendar className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-3 text-sky-500" />
                        Reservation Dates
                      </h3>
                      <div className="flex justify-between">
                        <div>
                          <label className="block text-[10px] md:text-sm font-medium text-gray-500">Check-in</label>
                          <p className="text-xs md:text-base font-semibold text-gray-800 mt-0.5 md:mt-1">{checkIn || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-[10px] md:text-sm font-medium text-gray-500 text-right">Check-out</label>
                          <p className="text-xs md:text-base font-semibold text-gray-800 mt-0.5 md:mt-1 text-right">{checkOut || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] md:text-sm font-medium text-gray-500">Guests</label>
                        <p className="text-xs md:text-base font-semibold text-gray-800 mt-0.5 md:mt-1 flex items-center">
                          <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> 
                          {guests && typeof guests === 'object' 
                            ? `${guests.adults || 0} Adult${guests.adults > 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? 'ren' : ''}` : ''}${guests.infants > 0 ? `, ${guests.infants} Infant${guests.infants > 1 ? 's' : ''}` : ''}`
                            : guests || 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    {special && (
                      <div className="md:col-span-2 space-y-1 md:space-y-2 mt-2 md:mt-4">
                        <h3 className="text-xs md:text-lg font-semibold text-gray-800 border-b pb-1 md:pb-2 flex items-center">
                          <Star className="w-3 h-3 md:w-5 md:h-5 mr-1 md:mr-3 text-sky-500" />
                          Special Requests
                        </h3>
                        <p className="text-xs md:text-gray-700 bg-gray-50 p-2 md:p-4 rounded-lg">{special}</p>
                      </div>
                    )}
                    <div className="md:col-span-2 mt-2 md:mt-4 pt-2 md:pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs md:text-lg font-medium text-gray-600">Total Price</span>
                        <span className="text-base md:text-2xl font-bold text-sky-600">₹{bookingDetails?.totalAmount?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </div>
    </>
  );
};

export default UserDashboard; 