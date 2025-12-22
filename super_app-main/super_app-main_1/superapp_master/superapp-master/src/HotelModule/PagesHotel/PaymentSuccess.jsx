import API_CONFIG from "../../config/api.config.js";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingInfo = location.state?.bookingDetails;
    
    // Extract booking data from the actual structure passed from PaymentPage
    const bookingData = bookingInfo?.data || bookingInfo;
    
    console.log('PaymentSuccess - location.state:', location.state);
    console.log('PaymentSuccess - bookingInfo:', bookingInfo);
    console.log('PaymentSuccess - bookingData:', bookingData);
    
    // If no booking data, try to get it from localStorage as fallback
    if (!bookingData) {
        const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
        if (bookings.length > 0) {
            const lastBooking = bookings[bookings.length - 1];
            console.log('PaymentSuccess - Using last booking from localStorage:', lastBooking);
        }
    }
    console.log('PaymentSuccess - bookingInfo:', bookingInfo);
    console.log('PaymentSuccess - bookingData:', bookingData);
    
    const {
        name,
        contact_number,
        check_in_date,
        check_out_date,
        guests,
        total_nights,
        price_per_night,
        total_amount,
        final_amount,
        hotel_id,
        room_id
    } = bookingData || {};
    
    // Get user email from localStorage
    const userProfile = JSON.parse(localStorage.getItem('hotelUserProfile') || '{}');
    const userEmail = userProfile.email || 'email@example.com';
    
    const [hotelDetails, setHotelDetails] = useState(null);
    
    // Format dates for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            return dateString;
        }
    };

    // Fetch hotel details
    useEffect(() => {
        const fetchHotelDetails = async () => {
            if (hotel_id) {
                try {
                    const token = localStorage.getItem('token') || 'demo-token';
                    const response = await fetch(API_CONFIG.getUrl(`/api/hotels/${hotel_id}`), {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    const result = await response.json();
                    if (result.success) {
                        setHotelDetails(result.data);
                    }
                } catch (error) {
                    console.error('Error fetching hotel details:', error);
                }
            }
        };
        fetchHotelDetails();
    }, [hotel_id]);

    // Save booking to localStorage after payment success
    useEffect(() => {
        if (bookingData) {
            // Create normalized booking structure for UserDashboard
            const normalized = {
                hotel: hotelDetails || { name: 'Hotel Name' },
                city: hotelDetails?.address?.city || 'City',
                bookingDetails: {
                    name: name || 'Guest Name',
                    contact: contact_number || 'Contact Number', // Changed from contact_number to contact
                    checkIn: check_in_date || 'N/A',
                    checkOut: check_out_date || 'N/A',
                    guests: guests?.adults || 'N/A',
                    total_nights: total_nights || 1,
                    price_per_night: price_per_night || 0,
                    total_amount: total_amount || 0,
                    totalAmount: final_amount || 0, // Added totalAmount field
                    hotel_id: hotel_id || '',
                    room_id: room_id || ''
                }
            };

            console.log('PaymentSuccess - Saving normalized booking to localStorage:', normalized);
            const bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
            bookings.push(normalized);
            localStorage.setItem('hotelBookings', JSON.stringify(bookings));
        }
    }, [bookingData, hotelDetails]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center mt-20">
                <svg className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4" />
                </svg>
                <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
                <p className="text-gray-700 mb-4">Your hotel booking is confirmed.</p>
                <div className="bg-gray-50 rounded-xl p-4 w-full max-w-md mb-4">
                    <div className="font-semibold text-gray-800">{hotelDetails?.name || 'Hotel Name'}</div>
                    <div className="text-sm text-gray-500">{hotelDetails?.address?.city ? `${hotelDetails.address.city}, ${hotelDetails.address.country}` : 'City, Country'}</div>
                    <div className="text-sm text-gray-500 mt-2">Guest: {name || bookingData?.name || 'Guest Name'}</div>
                    <div className="text-sm text-gray-500">Contact: {contact_number ? `+91 ${contact_number}` : bookingData?.contact_number ? `+91 ${bookingData.contact_number}` : 'Contact Number'}</div>
                    <div className="text-sm text-gray-500">Check-In: {formatDate(check_in_date)}</div>
                    <div className="text-sm text-gray-500">Check-Out: {formatDate(check_out_date)}</div>
                    <div className="text-sm text-gray-500">Guests: {guests?.adults || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Total Amount: ₹{final_amount?.toLocaleString() || 'N/A'}</div>
                </div>
                <button
                    onClick={() => navigate('/home-hotel/bookings')}
                    className="mt-2 bg-sky-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-sky-700 transition"
                >
                    Go to My Bookings
                </button>
            </div>
        </div>
    );
}

export default PaymentSuccess; 