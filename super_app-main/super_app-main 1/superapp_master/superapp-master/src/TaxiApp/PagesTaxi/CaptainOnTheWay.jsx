import API_CONFIG from "../../config/api.config.js";
import React, { useEffect, useState, useRef } from 'react';
import HeaderInsideTaxi from "../ComponentsTaxi/HeaderInsideTaxi";
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import profilePic from '../../Clothes/Images/profilepic.svg';
import Map from '../ComponentsTaxi/Map';
import TripDetailsModal from '../ComponentsTaxi/TripDetailsModal';
import CancelReasonModal from '../ComponentsTaxi/CancelReasonModal';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, Shield } from 'lucide-react';
import carIcon from '../../Icons/arrow-right-black.svg';
import { createRide } from '../../services/taxiBookingService';
import paymentService from '../../services/paymentService';
import axios from 'axios';

function CaptainOnTheWay() {
    const navigate = useNavigate();
    const location = useLocation();
    // Always get these from location.state, not from ride
    const { ride, pickupLocation, destination, pickupCoordinates, selectedVehicle, baseFare, totalFare, tip, distance, duration, driver, fallback } = location.state || {};

    // Defensive vehicle info rendering
    function getVehicleType(driver) {
        if (!driver) return 'N/A';
        if (typeof driver.vehicle === 'string') return driver.vehicle;
        if (driver.vehicle && typeof driver.vehicle === 'object') {
            return [driver.vehicle.make, driver.vehicle.model].filter(Boolean).join(' ') || driver.vehicle.vehicle_number || 'N/A';
        }
        return driver.vehicle_make || 'N/A';
    }
    function getVehicleNumber(driver) {
        if (!driver) return 'N/A';
        if (typeof driver.vehicleNumber === 'string') return driver.vehicleNumber;
        if (driver.vehicle && typeof driver.vehicle === 'object') {
            return driver.vehicle.vehicle_number || driver.vehicleNumber || 'N/A';
        }
        return driver.vehicleNumber || 'N/A';
    }
    const vehicleType = getVehicleType(driver);
    const vehicleNumber = getVehicleNumber(driver);
    const captainName = driver?.name || "Rahul Kumar";
    const captainRating = driver?.rating || 4.8;
    const captainPhone = driver?.phone || "tel:+919876543210";
    const captainLicense = driver?.license || "TN-2024-123456";

    const [showTripDetails, setShowTripDetails] = React.useState(false);
    const [showMessageModal, setShowMessageModal] = React.useState(false);
    const [selectedMessage, setSelectedMessage] = React.useState("");
    const [customMessage, setCustomMessage] = React.useState("");
    const [showToast, setShowToast] = React.useState(false);
    const [showCancelReasonModal, setShowCancelReasonModal] = React.useState(false);
    const [showCancelConfirmModal, setShowCancelConfirmModal] = React.useState(false);
    const [pendingCancelReason, setPendingCancelReason] = React.useState("");
    const [driverLocation, setDriverLocation] = useState({ lat: 13.0827, lng: 80.2707 });
    const [routePolyline, setRoutePolyline] = useState([]);
    const mapRef = useRef(null);
    const [apiError, setApiError] = useState('');
    const [rideStatus, setRideStatus] = useState('On the way');
    const [eta, setEta] = useState(1); // minutes
    const [distanceLeft, setDistanceLeft] = useState(0.5); // km
    const [loading, setLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const paymentMethods = [
        { label: 'Cash', value: 'cash' },
        { label: 'Card', value: 'card' },
        { label: 'UPI', value: 'upi' },
        { label: 'Razorpay', value: 'razorpay' }
    ];
    const quickMessages = [
        "I am waiting at the pickup point",
        "Please call me",
        "Running late, please wait",
        "I will be there in 2 minutes",
        "Please come to the main gate",
        "Traffic is heavy, sorry for the delay",
        "Custom message"
    ];

    // Fix: define paymentMethod and pin
    const paymentMethod = 'cash';
    const pin = [9, 2, 6, 5];

    // Move logging into useEffect to avoid infinite loops
    useEffect(() => {
        console.log('CaptainOnTheWay: ride', ride);
        console.log('CaptainOnTheWay: pickupLocation', pickupLocation);
        console.log('CaptainOnTheWay: destination', destination);
        console.log('CaptainOnTheWay: pickupCoordinates', pickupCoordinates);
        console.log('CaptainOnTheWay: driver', driver);
        console.log('CaptainOnTheWay: location.state', location.state);
    }, []);

    // All useEffect and hooks here (no conditional returns above)
    React.useEffect(() => {
        if (!pickupLocation || !destination) {
            // Do not redirect, just log
            console.warn('Missing pickupLocation or destination');
        }
        if (location.state?.rideCompleted) {
            navigate('/home-taxi', { replace: true });
        }
    }, [pickupLocation, destination, navigate, location.state]);

    useEffect(() => {
        if (!pickupLocation || !destination || !pickupCoordinates) return;
        const pickupCoords = pickupCoordinates;
        // For demo, simulate a destination a bit away from pickup
        const destCoords = {
            lat: pickupCoords.lat + 0.01,
            lng: pickupCoords.lng + 0.01
        };
        let t = 0;
        const interval = setInterval(() => {
            t += 0.02;
            if (t > 1) t = 0;
            const lat = pickupCoords.lat + (destCoords.lat - pickupCoords.lat) * t;
            const lng = pickupCoords.lng + (destCoords.lng - pickupCoords.lng) * t;
            setDriverLocation({ lat, lng });
        }, 1200);
        return () => clearInterval(interval);
    }, [pickupLocation, destination, pickupCoordinates]);

    useEffect(() => {
        async function fetchRoute() {
            if (!pickupCoordinates) return;
            // Simulate a destination a bit away from pickup
            const destCoords = {
                lat: pickupCoordinates.lat + 0.01,
                lng: pickupCoordinates.lng + 0.01
            };
            const apiKey = '5b3ce3597851110001cf624873aebef5eb7e493a95fb769c7223a38b';
            const url = `https://api.openrouteservice.org/v2/directions/cycling-regular?api_key=${apiKey}&start=${pickupCoordinates.lng},${pickupCoordinates.lat}&end=${destCoords.lng},${destCoords.lat}`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                if (data && data.features && data.features[0]) {
                    const coords = data.features[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                    setRoutePolyline(coords);
                }
            } catch {}
        }
        fetchRoute();
    }, [pickupCoordinates]);

    useEffect(() => {
        if (!routePolyline || routePolyline.length < 2) return;
        let idx = 0;
        setDriverLocation({ lat: routePolyline[0][0], lng: routePolyline[0][1] });
        const interval = setInterval(() => {
            idx = (idx + 1) % routePolyline.length;
            setDriverLocation({ lat: routePolyline[idx][0], lng: routePolyline[idx][1] });
        }, 1000);
        return () => clearInterval(interval);
    }, [routePolyline]);

    useEffect(() => {
        if (!pickupCoordinates) {
            setLoading(true);
            return;
        }
        setLoading(false);
        const pickupCoords = pickupCoordinates;
        const destCoords = {
            lat: pickupCoords.lat + 0.01,
            lng: pickupCoords.lng + 0.01
        };
        let t = 0;
        let interval = setInterval(() => {
            t += 0.02;
            if (t > 1) t = 1;
            const lat = pickupCoords.lat + (destCoords.lat - pickupCoords.lat) * t;
            const lng = pickupCoords.lng + (destCoords.lng - pickupCoords.lng) * t;
            setDriverLocation({ lat, lng });
            setEta(Math.max(1, Math.round((1 - t) * 5)));
            setDistanceLeft(Math.max(0, ((1 - t) * 0.5).toFixed(2)));
            if (t < 0.2) setRideStatus('On the way');
            else if (t < 0.8) setRideStatus('In Progress');
            else if (t < 1) setRideStatus('Arriving');
            else setRideStatus('Arrived');
            if (t >= 1) clearInterval(interval);
        }, 1200);
        return () => clearInterval(interval);
    }, [pickupCoordinates]);

    useEffect(() => {
        const interval = setInterval(() => {
            setDriverLocation(prev => ({
                lat: prev.lat + (Math.random() - 0.5) * 0.0005,
                lng: prev.lng + (Math.random() - 0.5) * 0.0005,
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Defensive fallback UI if required data is missing
    const isCriticalMissing = (ride === undefined || ride === null) || (pickupLocation === undefined || pickupLocation === null) || (destination === undefined || destination === null);
    if (isCriticalMissing) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-yellow-50">
                <HeaderInsideTaxi />
                <div className="bg-white rounded-xl shadow-lg p-6 mt-10 max-w-lg w-full text-center">
                    <div className="text-2xl font-bold text-yellow-700 mb-2">Missing Ride Data</div>
                    <div className="text-gray-700 mb-4">Some required ride information is missing. Please try again or go back.</div>
                    <pre className="bg-gray-100 rounded p-2 text-xs text-left overflow-x-auto max-h-48 mb-4">
{JSON.stringify({ ride, pickupLocation, destination, pickupCoordinates, driver, locationState: location.state }, null, 2)}
                    </pre>
                    <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold" onClick={() => navigate('/select-location')}>Back to Location Selection</button>
                </div>
                <FooterTaxi />
            </div>
        );
    }

    const handleShowTripDetails = () => setShowTripDetails(true);
    const handleCloseTripDetails = () => setShowTripDetails(false);
    const handleCancelRide = () => {
        setShowTripDetails(false);
        setShowCancelReasonModal(true);
    };
    const handleShowMessageModal = () => setShowMessageModal(true);
    const handleCloseMessageModal = () => {
        setShowMessageModal(false);
        setSelectedMessage("");
        setCustomMessage("");
    };
    const handleSendMessage = () => {
        // Here you would integrate with backend or SMS/notification system
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        handleCloseMessageModal();
    };
    const handleCloseCancelReasonModal = () => setShowCancelReasonModal(false);
    const handleReasonSelect = (reason) => {
        setPendingCancelReason(reason);
        setShowCancelReasonModal(false);
        setShowCancelConfirmModal(true);
    };
    const handleCancelConfirm = () => {
        // Add cancelled ride to history
        const ride = {
            pickupLocation,
            destination,
            totalFare,
            distance,
            duration,
            date: new Date().toLocaleString(),
            status: 'cancelled',
            driver,
            cancelReason: pendingCancelReason,
        };
        let rides = [];
        try {
            rides = JSON.parse(localStorage.getItem('taxiRides')) || [];
        } catch {}
        rides.unshift(ride);
        localStorage.setItem('taxiRides', JSON.stringify(rides.slice(0, 20)));
        setShowCancelConfirmModal(false);
        setPendingCancelReason("");
        navigate('/home-taxi');
    };
    const handleCancelGoBack = () => {
        setShowCancelConfirmModal(false);
        setShowCancelReasonModal(true);
    };
    // Modified handleCompleteRide to show payment modal first
    const handleCompleteRide = async () => {
        if (!selectedPaymentMethod) {
            setShowPaymentModal(true);
            return;
        }
        if (!ride || !ride._id) {
            setApiError('Ride data missing. Cannot complete ride.');
            return;
        }

        // Handle Razorpay payment
        if (selectedPaymentMethod === 'razorpay') {
            try {
                console.log('🚗 Starting Razorpay payment for taxi ride...');
                const paymentData = {
                    amount: totalFare || 1100,
                    currency: 'INR',
                    order_model: 'TaxiRide',
                    order_data: {
                        user_id: ride.user_id || '507f1f77bcf86cd799439011', // Default user ID
                        driver_id: ride.driver_id || '507f1f77bcf86cd799439011',
                        vehicle_id: ride.vehicle_id || '507f1f77bcf86cd799439012',
                        pickup_location: ride.pickup_location || {
                            address: pickupLocation || 'Current Location',
                            latitude: pickupCoordinates?.lat || 0,
                            longitude: pickupCoordinates?.lng || 0
                        },
                        dropoff_location: ride.dropoff_location || {
                            address: destination || 'Destination',
                            latitude: 0,
                            longitude: 0
                        },
                        distance: distance || 0,
                        duration: duration || 0,
                        fare: totalFare || 1100
                    },
                    email: 'user@example.com',
                    contact: '9999999999'
                };

                await paymentService.processPayment(paymentData, {
                    onSuccess: (successData) => {
                        console.log('✅ Taxi payment successful:', successData);
                        navigate('/ride-completed', {
                            state: {
                                ride: {
                                    ...ride,
                                    status: 'completed',
                                    completed_at: new Date().toISOString(),
                                    payment_method: 'Razorpay',
                                    payment_id: successData.payment_id
                                }
                            }
                        });
                    },
                    onError: (error) => {
                        console.error('❌ Taxi payment failed:', error);
                        setApiError('Payment failed: ' + error.message);
                    },
                    onCancel: () => {
                        console.log('🚫 Taxi payment cancelled');
                        setApiError('Payment was cancelled');
                    }
                });
            } catch (error) {
                console.error('❌ Taxi payment error:', error);
                setApiError('Payment error: ' + error.message);
            }
            return;
        }

        // If fake/fallback ride, simulate completion in frontend
        if (ride.fallback === true || (typeof ride._id === 'string' && ride._id.startsWith('FAKE_RIDE_ID_'))) {
            navigate('/ride-completed', { state: { ride: { ...ride, status: 'completed', completed_at: new Date().toISOString(), payment_method: selectedPaymentMethod } } });
            return;
        }

        // For other payment methods, update ride status and complete
        try {
            const token = localStorage.getItem('token');
            await axios.put(API_CONFIG.getUrl(`/api/taxi-rides/${ride._id}`), {
                status: 'completed',
                completed_at: new Date().toISOString(),
                payment_method: selectedPaymentMethod
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/ride-completed', { state: { ride: { ...ride, status: 'completed', completed_at: new Date().toISOString(), payment_method: selectedPaymentMethod } } });
        } catch (err) {
            setApiError('Failed to complete ride. Please try again.');
        }
    };

    // Payment modal UI
    const PaymentModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-sm mx-auto animate-bounceIn">
                <h2 className="text-lg font-bold mb-4 text-center">Select Payment Method</h2>
                <div className="flex flex-col gap-3 mb-4">
                    {paymentMethods.map(method => (
                        <button
                            key={method.value}
                            className={`w-full px-4 py-3 rounded-lg border text-base font-semibold transition-colors ${selectedPaymentMethod === method.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-blue-50'}`}
                            onClick={() => setSelectedPaymentMethod(method.value)}
                        >
                            {method.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-3 mt-4">
                    <button
                        className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onClick={() => { setShowPaymentModal(false); handleCompleteRide(); }}
                        disabled={!selectedPaymentMethod}
                    >
                        Confirm & Complete Ride
                    </button>
                    <button
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                        onClick={() => setShowPaymentModal(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
            {/* Fixed Header */}
            <div className="fixed top-0 left-0 w-full z-50 bg-white">
                <HeaderInsideTaxi />
            </div>
            {/* Fixed Map or fallback */}
            {pickupCoordinates ? (
                <div className="fixed left-0 w-full z-40" style={{ top: '64px', height: '200px' }}>
                    <Map
                        ref={mapRef}
                        center={driverLocation}
                        markers={[
                            driverLocation && { position: driverLocation, title: 'Driver', icon: carIcon },
                            pickupCoordinates && { position: pickupCoordinates, title: 'Pickup' },
                        ].filter(Boolean)}
                        polyline={routePolyline}
                        onMapClick={() => {}}
                        height="200px"
                        showZoomControl={false}
                    />
                </div>
            ) : (
                <div className="fixed left-0 w-full z-40 flex items-center justify-center bg-gray-200" style={{ top: '64px', height: '200px' }}>
                    <span className="text-gray-600">Map unavailable</span>
                </div>
            )}
            {/* Trip Details Modal */}
            <TripDetailsModal
                isOpen={showTripDetails}
                onClose={handleCloseTripDetails}
                pickupLocation={pickupLocation}
                destination={destination}
                totalFare={totalFare}
                paymentMethod={paymentMethod}
                onCancelRide={handleCancelRide}
            />
            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg ring-2 ring-blue-200 p-4 w-11/12 max-w-sm mx-auto mb-16 md:mb-24 animate-bounceIn overflow-hidden">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Send Message to Captain</h2>
                            <button onClick={handleCloseMessageModal} className="text-blue-700 hover:text-blue-900">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 mb-4">
                            {quickMessages.map((msg, idx) => (
                                <button
                                    key={msg}
                                    className={`w-full text-left px-4 py-2 rounded-lg border ${selectedMessage === msg ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-200'} hover:bg-blue-50`}
                                    onClick={() => setSelectedMessage(msg)}
                                >
                                    {msg}
                                </button>
                            ))}
                        </div>
                        {selectedMessage === "Custom message" && (
                            <textarea
                                className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                                rows={2}
                                placeholder="Type your message..."
                                value={customMessage}
                                onChange={e => setCustomMessage(e.target.value)}
                            />
                        )}
                        <button
                            className="w-full bg-blue-600 text-white py-3 rounded-xl text-base font-semibold shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
                            onClick={handleSendMessage}
                            disabled={selectedMessage === "" || (selectedMessage === "Custom message" && !customMessage.trim())}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
            {/* Toast/Snackbar */}
            {showToast && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-[100] text-base font-semibold animate-fadeInOut">
                    Message sent to captain
                </div>
            )}
            {/* Cancel Reason Modal */}
            <CancelReasonModal
                isOpen={showCancelReasonModal}
                onClose={handleCloseCancelReasonModal}
                onReasonSelect={handleReasonSelect}
            />
            {/* Cancel Confirmation Modal */}
            {showCancelConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-11/12 max-w-sm mx-auto mb-24 animate-slideUp overflow-hidden">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="flex flex-col items-center mb-4">
                            <h2 className="text-lg font-bold mb-2 text-center">Are you sure you want to cancel this ride?</h2>
                            <p className="text-blue-800 text-sm text-center mb-4">Reason: <span className="font-semibold">{pendingCancelReason}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="flex-1 bg-red-600 text-white py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                                onClick={handleCancelConfirm}
                            >
                                Yes, Cancel Ride
                            </button>
                            <button
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                onClick={handleCancelGoBack}
                            >
                                No, Go Back
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Scrollable Card */}
            <div className="flex-1 overflow-y-auto pt-[264px] pb-[64px]">
                <div className="w-full bg-white rounded-t-3xl shadow-lg p-4">
                    {/* Top row: Captain on the way, animated ETA badge, Help button */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-lg text-blue-900">Captain {rideStatus}</span>
                        <div className="flex items-center gap-2">
                            <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-semibold text-xs animate-pulse">{eta} min</span>
                            <button className="ml-2 p-2 bg-red-50 hover:bg-red-100 rounded-full border border-red-200" title="Help/Safety">
                                <Shield className="w-5 h-5 text-red-500" />
                            </button>
                        </div>
                    </div>
                    <div className="text-blue-700 mb-2 text-xs">{distanceLeft} km away</div>
                    {/* PIN row */}
                    <div className="mb-4">
                        <span className="text-xs text-blue-800">Start your order with PIN</span>
                        <div className="flex gap-2 mt-2">
                            {pin.map((digit, idx) => (
                                <span key={idx} className="w-10 h-10 flex items-center justify-center text-lg font-mono border border-gray-300 rounded bg-gray-100">{digit}</span>
                            ))}
                        </div>
                    </div>
                    {/* Captain info row with call button */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                        <img src={profilePic} alt="Captain" className="w-12 h-12 rounded-full border-2 border-blue-500" />
                        <div className="flex-1">
                            <div className="font-semibold text-base text-black">{captainName}</div>
                            <div className="text-xs text-black">{vehicleType} • {vehicleNumber}</div>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-xs font-semibold text-black">{captainRating}</span>
                            </div>
                        </div>
                        <a href={captainPhone} className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full border border-blue-200" title="Call Captain">
                            <Phone className="w-5 h-5 text-blue-600" />
                        </a>
                    </div>
                    {/* Always show pickup/destination info */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="text-xs text-blue-700">Pickup From</div>
                            <div className="font-semibold text-sm text-black truncate max-w-[180px]">{pickupLocation || 'N/A'}</div>
                        </div>
                        <button 
                            className="px-3 py-1 border border-gray-300 rounded-full text-xs font-medium"
                            onClick={handleShowTripDetails}
                        >
                            Trip Details
                        </button>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="text-xs text-blue-700">Destination</div>
                            <div className="font-semibold text-sm text-black truncate max-w-[180px]">{destination || 'N/A'}</div>
                        </div>
                    </div>
                    {/* Bottom row: Issue with Pickup and Share feedback */}
                    <div className="flex items-center justify-between mt-2 border-t pt-2">
                        <button className="text-blue-600 text-sm flex items-center gap-1">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 11-12 0 6 6 0 0112 0z"/><path d="M12 14v7m-4 0h8"/></svg>
                            Issue with Pickup?
                        </button>
                        <button className="text-blue-600 text-sm flex items-center gap-1">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2"/><path d="M12 15v-6"/><path d="M9 12h6"/></svg>
                            Share feedback
                        </button>
                    </div>
                    {/* Complete Ride Button */}
                    {pickupLocation && destination && (
                        <button
                            className='w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white py-3 rounded-xl text-base font-bold shadow-lg mt-6 hover:from-blue-600 hover:to-blue-700 transition-all'
                            onClick={() => setShowPaymentModal(true)}
                        >
                            Complete Ride
                        </button>
                    )}
                    {showPaymentModal && <PaymentModal />}
                    {/* Fallback: if loading or error, show info card */}
                    {loading && (
                        <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4 text-center">
                            <div className="font-semibold text-base text-yellow-800 mb-1">Loading ride details...</div>
                            <div className="text-sm text-gray-800">If this takes too long, please check your connection or try again.</div>
                        </div>
                    )}
                    {apiError && (
                        <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 mt-4 text-center">
                            <div className="font-semibold text-base text-red-800 mb-1">Error</div>
                            <div className="text-sm text-gray-800">{apiError}</div>
                        </div>
                    )}
                </div>
            </div>
            <FooterTaxi />
            {apiError && <div style={{ color: 'red', fontSize: 14 }}>{apiError}</div>}
        </div>
    );
}

export default CaptainOnTheWay; 