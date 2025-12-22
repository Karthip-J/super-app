import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from "react";
import FooterHotel from "../ComponentsHotel/FooterHotel";
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, User, Landmark, Calendar, Users, FileText } from 'lucide-react';
import PaymentSuccess from './PaymentSuccess';
import paymentService from "../../services/paymentService";

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const bookingInfo = location.state?.booking;
    console.log("Payment Page - Booking Info:", bookingInfo);
    console.log("Payment Page - location.state:", location.state);
    
    // Extract data from the actual booking response structure - handle multiple possible structures
    // Also check localStorage as fallback
    const bookingData = bookingInfo?.data || bookingInfo || JSON.parse(localStorage.getItem('hotelBookingData') || '{}');
    console.log("Payment Page - bookingData:", bookingData);
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
    console.log("Payment Page - Extracted values:", {
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

    const [paymentMethod, setPaymentMethod] = useState(null); // 'upi', 'card'
    const [upiApp, setUpiApp] = useState(null); // 'gpay', 'phonepe', 'paytm'
    const [upiId, setUpiId] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [error, setError] = useState("");
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [hotelDetails, setHotelDetails] = useState(null);
    
    // Get user email from localStorage
    const userProfile = JSON.parse(localStorage.getItem('hotelUserProfile') || '{}');
    const userEmail = userProfile.email || 'email@example.com';

    useEffect(() => {
        // Skip authentication - go directly to payment
        // Set demo token for API calls
        localStorage.setItem('hotelUser', 'true');
        localStorage.setItem('token', 'demo-token');
        
        // Debug: Log if booking data is missing
        if (!bookingInfo) {
            console.warn("Payment Page - No booking data found in location.state");
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

    const handlePayment = async () => {
        setError("");
        setProcessing(true);

        try {
            // Prepare payment data for hotel booking
            const paymentData = {
                amount: total,
                currency: 'INR',
                order_model: 'Booking',
                email: userEmail,
                contact: contact_number || '+91 9876543210',
                description: `Hotel Booking - ${hotelDetails?.name || 'Hotel'}`,
                order_data: {
                    ...bookingData,
                    hotel_id: hotel_id,
                    room_id: room_id,
                    name: name,
                    contact_number: contact_number,
                    check_in_date: check_in_date,
                    check_out_date: check_out_date,
                    guests: guests,
                    total_nights: total_nights,
                    price_per_night: price_per_night,
                    total_amount: total_amount,
                    final_amount: final_amount
                }
            };

            console.log('🔍 Hotel Payment - Payment data:', paymentData);

            // Process payment using payment service
            await paymentService.processPayment(paymentData, {
                onSuccess: (successData) => {
                    console.log('✅ Hotel Payment successful:', successData);
                    setProcessing(false);
                    navigate('/hotel-payment-success', { 
                        state: { 
                            paymentSuccess: true, 
                            bookingDetails: successData.dbOrder,
                            paymentDetails: successData.payment
                        } 
                    });
                },
                onError: (error) => {
                    console.error('❌ Hotel Payment failed:', error);
                    setError(error.message || 'Payment failed. Please try again.');
                    setProcessing(false);
                },
                onCancel: () => {
                    console.log('🚫 Hotel Payment cancelled by user');
                    setError('Payment was cancelled.');
                    setProcessing(false);
                }
            });

        } catch (error) {
            console.error('❌ Hotel Payment error:', error);
            setError(error.message || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    // Card number input handler: only 16 digits, auto-format with spaces
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Only digits
        value = value.slice(0, 16); // Max 16 digits
        // Add spaces every 4 digits
        value = value.replace(/(.{4})/g, '$1 ').trim();
        setCardNumber(value);
    };

    // Expiry input handler: auto-insert slash after 2 digits
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/[^\d]/g, ''); // Only digits
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
        setExpiry(value);
    };

    // Add a handler for CVV input
    const handleCvvChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Only digits
        value = value.slice(0, 3); // Max 3 digits
        setCvv(value);
    };

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
                        <p className="text-xs md:text-gray-500 mt-0.5 md:mt-1">{hotelDetails?.name || 'Hotel Name'}</p>
                    </div>

                    {/* Invoice Section */}
                    <div className="border rounded-xl mb-3 md:mb-6 bg-gray-50">
                        <button
                            onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
                            className="w-full flex justify-between items-center p-2 md:p-4 focus:outline-none"
                        >
                            <span className="font-semibold text-xs md:text-gray-700">Invoice Summary</span>
                            {isInvoiceOpen ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                        {isInvoiceOpen && (
                            <div className="p-2 md:p-4 border-t bg-white rounded-b-xl">
                                {/* Billing and Hotel Info */}
                                <div className="grid md:grid-cols-2 gap-2 md:gap-6 mb-2 md:mb-4">
                                    <div className="space-y-1 md:space-y-2">
                                        <h2 className="text-xs md:text-md font-semibold text-gray-700 flex items-center"><User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-sky-500" /> Billed To</h2>
                                        <div className="text-gray-600 text-xs md:text-sm">
                                            <p className="font-bold">{name || 'Guest Name'}</p>
                                            <p>{contact_number ? `+91 ${contact_number}` : 'Contact Number'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 md:space-y-2 text-left md:text-right">
                                        <h2 className="text-xs md:text-md font-semibold text-gray-700 flex items-center md:justify-end"><Landmark className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-sky-500" /> Hotel Details</h2>
                                        <div className="text-gray-600 text-xs md:text-sm">
                                            <p className="font-bold">{hotelDetails?.name || 'Hotel Name'}</p>
                                            <p>{hotelDetails?.address?.city ? `${hotelDetails.address.city}, ${hotelDetails.address.country}` : 'City, Country'}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Booking Summary */}
                                <div className="mb-2 md:mb-4">
                                    <h2 className="text-xs md:text-md font-semibold text-gray-700 mb-1 md:mb-2 flex items-center"><Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-sky-500" /> Booking Summary</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 text-center text-xs md:text-sm">
                                        <div className="bg-gray-50 p-1 md:p-2 rounded-lg">
                                            <p className="text-[10px] md:text-xs text-gray-500">Check-In</p>
                                            <p className="font-semibold text-gray-800">{formatDate(check_in_date)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-1 md:p-2 rounded-lg">
                                            <p className="text-[10px] md:text-xs text-gray-500">Check-Out</p>
                                            <p className="font-semibold text-gray-800">{formatDate(check_out_date)}</p>
                                        </div>
                                        <div className="bg-gray-50 p-1 md:p-2 rounded-lg">
                                            <p className="text-[10px] md:text-xs text-gray-500">Guests</p>
                                            <p className="font-semibold text-gray-800 flex items-center justify-center"><Users className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5 md:mr-1" />{guests?.adults || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-1 md:p-2 rounded-lg">
                                            <p className="text-[10px] md:text-xs text-gray-500">Room nights</p>
                                            <p className="font-semibold text-gray-800">{total_nights || 1}</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Price Breakdown */}
                                <div>
                                    <h2 className="text-xs md:text-md font-semibold text-gray-700 mb-1 md:mb-2 flex items-center"><FileText className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-sky-500" /> Price Details</h2>
                                    <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                                        <div className="flex justify-between text-gray-800">
                                            <p>Room Rate ({total_nights || 1} night)</p>
                                            <p>₹{amount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between text-gray-800">
                                            <p>Taxes & Fees (18%)</p>
                                            <p>₹{taxes.toLocaleString()}</p>
                                        </div>
                                        <div className="flex justify-between text-gray-800 font-bold text-xs md:text-md border-t pt-1 md:pt-2 mt-1 md:mt-2">
                                            <p>Total Amount</p>
                                            <p>₹{(amount + taxes).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-sky-50 flex justify-between items-center w-full rounded-full px-3 md:px-6 py-2 md:py-4 border border-sky-100">
                        <p className="font-semibold text-xs md:text-base text-gray-700">Total Amount</p>
                        <p className="font-bold text-base md:text-xl text-sky-600">₹{(amount + taxes).toLocaleString()}</p>
                    </div>

                    <div className="text-gray-800 text-xs md:text-lg font-semibold mt-3 md:mt-6 mb-2 md:mb-3">Choose Payment Method</div>

                    {/* UPI / Wallet */}
                    <div
                        className={`bg-white border-2 rounded-xl p-2 md:p-4 mt-1 md:mt-2 cursor-pointer transition-all ${paymentMethod === 'upi' ? 'border-sky-500 shadow-md' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('upi')}
                    >
                        <div className="font-medium text-xs md:text-base">Pay with UPI</div>
                        {paymentMethod === 'upi' && (
                            <div className="mt-2 md:mt-4">
                                <div className="grid grid-cols-3 gap-1 md:gap-3 mb-2 md:mb-4">
                                    <button type="button" onClick={e => { e.stopPropagation(); setUpiApp('gpay'); }} className={`py-1 md:py-2 rounded-md text-xs md:text-sm font-semibold border transition-colors ${upiApp === 'gpay' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-blue-50'}`}>GPay</button>
                                    <button type="button" onClick={e => { e.stopPropagation(); setUpiApp('phonepe'); }} className={`py-1 md:py-2 rounded-md text-xs md:text-sm font-semibold border transition-colors ${upiApp === 'phonepe' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-purple-50'}`}>PhonePe</button>
                                    <button type="button" onClick={e => { e.stopPropagation(); setUpiApp('paytm'); }} className={`py-1 md:py-2 rounded-md text-xs md:text-sm font-semibold border transition-colors ${upiApp === 'paytm' ? 'bg-sky-500 text-white border-sky-500' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-sky-50'}`}>Paytm</button>
                                </div>
                                {upiApp && (
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={e => setUpiId(e.target.value)}
                                        placeholder="Enter your UPI ID"
                                        className="w-full border border-gray-200 rounded-lg p-1 md:p-3 text-xs md:text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-gray-50"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Card Payment */}
                    <div
                        className={`bg-white border-2 rounded-xl p-2 md:p-4 mt-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-sky-500 shadow-md' : 'border-gray-200'}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <div className="font-medium text-xs md:text-base">Pay with Card</div>
                        {paymentMethod === 'card' && (
                            <div className="mt-2 md:mt-4 space-y-2 md:space-y-4">
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    placeholder="Card Number"
                                    className="w-full border border-gray-200 rounded-lg p-1 md:p-3 text-xs md:text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-gray-50"
                                    maxLength={19}
                                />
                                <div className="flex gap-1 md:gap-3">
                                    <input
                                        type="text"
                                        value={expiry}
                                        onChange={handleExpiryChange}
                                        placeholder="MM/YY"
                                        className="w-1/2 border border-gray-200 rounded-lg p-1 md:p-3 text-xs md:text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-gray-50"
                                        maxLength={5}
                                    />
                                    <input
                                        type="password"
                                        value={cvv}
                                        onChange={handleCvvChange}
                                        placeholder="CVV"
                                        className="w-1/2 border border-gray-200 rounded-lg p-1 md:p-3 text-xs md:text-sm focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-gray-50"
                                        maxLength={3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Netbanking and Wallet (disabled for demo) */}
                    <div className={`bg-white border-2 rounded-xl p-4 mt-3 opacity-60 cursor-not-allowed border-gray-200`}>Netbanking (Coming Soon)</div>
                    <div className={`bg-white border-2 rounded-xl p-4 mt-3 opacity-60 cursor-not-allowed border-gray-200`}>Wallet (Coming Soon)</div>

                    {error && <div className="text-xs md:text-sm text-red-600 mt-2">{error}</div>}

                    <button
                        type="button"
                        onClick={handlePayment}
                        className="w-full mt-3 md:mt-6 bg-sky-600 text-white py-2 md:py-3 rounded-xl text-xs md:text-lg font-semibold shadow hover:bg-sky-700 transition disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : 'Pay Now'}
                    </button>
                </section>
            </main>
            <FooterHotel />
            {processing && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex flex-col items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
                        <svg className="animate-spin h-10 w-10 text-sky-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        <div className="text-lg font-semibold text-sky-600">Processing Payment...</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentPage;