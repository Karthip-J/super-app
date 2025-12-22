import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from "react";
import FooterHotel from "../ComponentsHotel/FooterHotel";
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, User, Landmark, Calendar, Users, FileText } from 'lucide-react';
import PaymentButton from '../../Components/PaymentButton';
import PaymentSuccess from '../../Components/PaymentSuccess';
import paymentService from '../../services/paymentService';
import PaymentSuccessHotel from './PaymentSuccess';

const PaymentPageEnhanced = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingInfo = location.state?.booking;
    console.log("Payment Page Enhanced - Booking Info:", bookingInfo);
    console.log("Payment Page Enhanced - location.state:", location.state);
    
    // Extract data from the actual booking response structure - handle multiple possible structures
    // Also check localStorage as fallback
    const bookingData = bookingInfo?.data || bookingInfo || JSON.parse(localStorage.getItem('hotelBookingData') || '{}');
    console.log("Payment Page Enhanced - bookingData:", bookingData);
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
    
    // Debug the extracted values
    console.log("Payment Page Enhanced - Extracted values:", {
        price_per_night,
        total_amount,
        final_amount,
        amount: price_per_night || total_amount || 0
    });
    
    // Use the actual values from booking data, fallback to calculated values
    const amount = price_per_night || total_amount || 0;
    const taxes = Math.round(amount * 0.18);
    const total = final_amount || total_amount || (amount + taxes);
    
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

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [error, setError] = useState("");
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [hotelDetails, setHotelDetails] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [orderData, setOrderData] = useState(null);
    
    // Get user email from localStorage
    const userProfile = JSON.parse(localStorage.getItem('hotelUserProfile') || '{}');
    const userEmail = userProfile.email || 'email@example.com';

    // Payment methods
    const paymentMethods = [
        {
            id: 'razorpay',
            name: 'Pay Online (Cards, UPI, Net Banking)',
            type: 'razorpay',
            description: 'Secure payment via Razorpay'
        },
        {
            id: 'cod',
            name: 'Pay at Hotel',
            type: 'cod',
            description: 'Pay when you check in'
        }
    ];

    useEffect(() => {
        // Skip authentication - go directly to payment
        // Set demo token for API calls
        localStorage.setItem('hotelUser', 'true');
        localStorage.setItem('token', 'demo-token');
        
        // Debug: Log if booking data is missing
        if (!bookingInfo) {
            console.warn("Payment Page Enhanced - No booking data found in location.state");
        }
    }, [bookingInfo]);

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

    const handlePaymentSuccess = (data) => {
        console.log('✅ Hotel payment successful:', data);
        setPaymentStatus('success');
        setPaymentData(data);
        
        // Navigate to hotel payment success page after a short delay
        setTimeout(() => {
            navigate('/hotel-payment-success', { 
                state: { 
                    paymentSuccess: true, 
                    bookingDetails: bookingInfo,
                    paymentData: data 
                } 
            });
        }, 2000);
    };

    const handlePaymentError = (error) => {
        console.error('❌ Hotel payment failed:', error);
        setPaymentStatus('error');
        setError(`Payment failed: ${error.message || 'Please try again'}`);
    };

    const handlePaymentCancel = () => {
        console.log('❌ Hotel payment cancelled by user');
        setPaymentStatus('cancelled');
        setError('Payment was cancelled. You can try again or select a different payment method.');
    };

    const handleCODBooking = async () => {
        setError("");
        if (!selectedPayment) {
            setError("Please select a payment method.");
            return;
        }

        setProcessing(true);
        try {
            // Create booking with COD payment method
            const bookingData = {
                hotel_id,
                room_id,
                name,
                contact_number,
                check_in_date,
                check_out_date,
                guests,
                total_nights,
                price_per_night: amount,
                total_amount: total,
                payment_method: 'cod',
                status: 'confirmed'
            };

            const token = localStorage.getItem('token') || 'demo-token';
            const response = await fetch(API_CONFIG.getUrl('/api/bookings'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            const result = await response.json();
            if (result.success) {
                // Navigate to success page
                navigate('/hotel-payment-success', { 
                    state: { 
                        paymentSuccess: true, 
                        bookingDetails: { data: result.data },
                        paymentMethod: 'cod'
                    } 
                });
            } else {
                throw new Error(result.message || 'Failed to create booking');
            }
        } catch (error) {
            console.error('Error creating COD booking:', error);
            setError(error.message || 'Failed to create booking');
        } finally {
            setProcessing(false);
        }
    };

    const createRazorpayOrderData = () => {
        return {
            amount: total, // Send amount in rupees, backend will convert to paise
            currency: 'INR',
            receipt: `hotel_booking_${Date.now()}`,
            notes: {
                order_type: 'Booking',
                hotel_id: hotel_id,
                room_id: room_id,
                check_in_date: check_in_date,
                check_out_date: check_out_date,
                total_nights: total_nights,
                customer_name: name,
                customer_contact: contact_number
            },
            order_model: 'Booking',
            order_data: {
                hotel_id,
                room_id,
                name,
                contact_number,
                check_in_date,
                check_out_date,
                guests,
                total_nights,
                price_per_night: amount,
                total_amount: total,
                payment_method: 'razorpay',
                status: 'pending'
            }
        };
    };

    // Show payment success if payment was successful
    if (paymentStatus === 'success' && paymentData) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <div className="pt-16 flex items-center justify-center min-h-screen">
                    <PaymentSuccess 
                        paymentData={paymentData}
                        orderData={orderData}
                        onContinue={() => navigate('/hotel')}
                        showDetails={true}
                        className="w-full max-w-md mx-4"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Custom Payment Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-sky-600 shadow-md flex items-center px-2 md:px-6 h-14 md:h-20">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white hover:text-sky-200 focus:outline-none mr-2 md:mr-4 p-1 md:p-2 rounded-full"
                    aria-label="Go back"
                >
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-lg md:text-2xl font-bold text-white tracking-wide">Hotel Payment</h1>
            </header>
            <main className="flex-1 w-full max-w-xs md:max-w-2xl mx-auto pt-16 md:pt-24 pb-20 md:pb-28 px-1 md:px-4">
                <section className="bg-white shadow-lg rounded-2xl p-2 md:p-6">
                    <div className="text-center mb-3 md:mb-6">
                        <h1 className="text-base md:text-2xl font-bold text-gray-800">Confirm and Pay</h1>
                        <p className="text-sm md:text-base text-gray-600">Complete your hotel booking</p>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gray-50 rounded-xl p-3 md:p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-semibold text-gray-800">Booking Summary</h2>
                            <button
                                onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
                                className="text-sky-600 hover:text-sky-700"
                            >
                                {isInvoiceOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-in:</span>
                                <span className="font-medium">{formatDate(check_in_date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Check-out:</span>
                                <span className="font-medium">{formatDate(check_out_date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Guests:</span>
                                <span className="font-medium">{guests || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nights:</span>
                                <span className="font-medium">{total_nights || 'N/A'}</span>
                            </div>
                        </div>

                        {isInvoiceOpen && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Room Rate:</span>
                                        <span className="font-medium">₹{amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Taxes & Fees:</span>
                                        <span className="font-medium">₹{taxes}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                                        <span>Total:</span>
                                        <span className="text-sky-600">₹{total}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Payment Methods */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Select Payment Method</h3>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                        
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div key={method.id}
                                    className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment?.id === method.id ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'}`}
                                    onClick={() => setSelectedPayment(method)}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">{method.name}</span>
                                            <p className="text-xs text-gray-500">{method.description}</p>
                                        </div>
                                        <input
                                            type="radio"
                                            checked={selectedPayment?.id === method.id}
                                            onChange={() => setSelectedPayment(method)}
                                            className="w-4 h-4 text-sky-600"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Buttons */}
                    <div className="space-y-4">
                        {selectedPayment?.id === 'razorpay' && (
                            <PaymentButton
                                orderData={createRazorpayOrderData()}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                                onCancel={handlePaymentCancel}
                                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold text-lg"
                                disabled={processing}
                                loading={processing}
                                theme="primary"
                            >
                                Pay Online - ₹{total}
                            </PaymentButton>
                        )}
                        
                        {selectedPayment?.id === 'cod' && (
                            <button
                                onClick={handleCODBooking}
                                disabled={processing}
                                className={`w-full py-4 text-white rounded-lg font-semibold text-lg transition-colors
                                    ${processing ? 
                                        'bg-gray-400 cursor-not-allowed' : 
                                        'bg-sky-600 hover:bg-sky-700'}
                                `}
                            >
                                {processing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    `Confirm Booking (Pay at Hotel) - ₹${total}`
                                )}
                            </button>
                        )}
                        
                        {!selectedPayment && (
                            <button
                                disabled
                                className="w-full py-4 bg-gray-400 text-white rounded-lg font-semibold text-lg cursor-not-allowed"
                            >
                                Please select a payment method
                            </button>
                        )}
                    </div>
                </section>
            </main>
            <FooterHotel />
        </div>
    );
};

export default PaymentPageEnhanced; 