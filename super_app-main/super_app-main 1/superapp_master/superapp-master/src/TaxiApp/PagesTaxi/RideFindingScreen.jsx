import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderInsideTaxi from "../ComponentsTaxi/HeaderInsideTaxi";
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import TripDetailsModal from '../ComponentsTaxi/TripDetailsModal';
import CancelReasonModal from '../ComponentsTaxi/CancelReasonModal';
import Map from '../ComponentsTaxi/Map';
import { createBikeIcon } from '../ComponentsTaxi/BikeIcon';
import { getAvailableDrivers, getSmartDriverAssignment, createRide } from '../../services/taxiBookingService';

function RideFindingScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pickupLocation, destination, selectedPickupPoint, pickupCoordinates, selectedVehicle, baseFare, totalFare, distance, duration } = location.state || {};

    const [showTripDetails, setShowTripDetails] = useState(false);
    const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [tip, setTip] = useState(0);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [captainLocation, setCaptainLocation] = useState(pickupCoordinates || { lat: 13.0827, lng: 80.2707 });
    const [captainLocations, setCaptainLocations] = useState([]);
    const [bikeStates, setBikeStates] = useState([]); // Each bike: {lat, lng, angle}
    const [drivers, setDrivers] = useState([]);
    const [apiError, setApiError] = useState('');
    const [assignedDriver, setAssignedDriver] = useState(null);
    const [fallbackMode, setFallbackMode] = useState(false);

    const paymentMethod = "cash";

    useEffect(() => {
        async function fetchDrivers() {
            setApiError('');
            // Try smart driver assignment first
            const smartDriver = await getSmartDriverAssignment();
            if (smartDriver) {
                console.log('🚕 Smart driver assigned:', smartDriver.name);
                setDrivers([smartDriver]); // Use single smart driver
            } else {
                // Fallback to old method if smart assignment fails
                console.log('🔄 Falling back to random driver selection');
            const apiDrivers = await getAvailableDrivers();
            if (apiDrivers && Array.isArray(apiDrivers) && apiDrivers.length > 0) {
                setDrivers(apiDrivers);
            } else {
                setApiError('Failed to fetch drivers. Please try again later.');
                }
            }
        }
        fetchDrivers();
    }, []);

    useEffect(() => {
        setIsLoading(true);
        setProgress(0);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 8000); // 8 seconds loading (slower)
        return () => clearTimeout(timer);
    }, [location.state, navigate, pickupLocation, destination]);

    useEffect(() => {
        let interval;
        if (isLoading) {
            setProgress(0);
            const start = Date.now();
            interval = setInterval(() => {
                const elapsed = Date.now() - start;
                const percent = Math.min((elapsed / 8000) * 100, 100);
                setProgress(percent);
            }, 50);
        } else {
            setProgress(100);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        if (!pickupLocation || !destination) {
            navigate('/home-taxi', { replace: true });
            return;
        }
    }, [pickupLocation, destination, navigate]);

    useEffect(() => {
        console.log('RideFindingScreen: useEffect triggered', { isLoading, drivers });
        if (!isLoading) {
            if (drivers.length === 0) {
                console.warn('RideFindingScreen: No drivers available, returning early');
                setApiError('No drivers available. Please try again later.');
                return;
            }
            // Use the smart-assigned driver (or random if fallback)
            const driver = drivers[0]; // Smart assignment returns single driver
            setAssignedDriver(driver); // <-- Save assigned driver for UI
            console.log('RideFindingScreen: Assigned driver:', driver);
            // Robustly extract vehicle_id
            let vehicleId = driver.vehicle_id;
            if (!vehicleId && driver.vehicle && typeof driver.vehicle === 'object') {
                vehicleId = driver.vehicle._id;
            } else if (!vehicleId && typeof driver.vehicle === 'string') {
                vehicleId = driver.vehicle;
            }
            if (!vehicleId) {
                console.warn('RideFindingScreen: No vehicle assigned to driver, returning early', driver);
                setApiError('No vehicle assigned to driver. Cannot create ride.');
                return;
            }
            // Create the ride in the backend
            async function bookRide() {
                let user_id = null;
                try {
                  const userData = JSON.parse(localStorage.getItem('userData'));
                  user_id = userData?._id || userData?.id;
                } catch {}
                if (!user_id) {
                  // DEV ONLY: fallback to demo user
                  user_id = '68678c6f2ccb87d7ca07fd6e'; // Replace with your demo user ObjectId if needed
                  console.warn('RideFindingScreen: Using fallback demo user_id for development:', user_id);
                }
                if (!user_id) {
                  console.warn('RideFindingScreen: User not logged in or user ID missing, returning early');
                  setApiError('User not logged in or user ID missing. Please log in again.');
                  return;
                }
                const rideData = {
                    user_id, // <-- ensure user_id is included
                    driver_id: driver._id,
                    vehicle_id: vehicleId,
                    pickup_location: {
                        address: pickupLocation,
                        latitude: pickupCoordinates?.lat,
                        longitude: pickupCoordinates?.lng
                    },
                    dropoff_location: { address: destination },
                    fare: totalFare,
                    status: 'pending',
                    distance,
                    duration
                };
                console.log('RideFindingScreen: About to call createRide with:', rideData);
                let createdRide = null;
                try {
                  createdRide = await createRide(rideData);
                  console.log('RideFindingScreen: API response:', createdRide);
                } catch (err) {
                  setFallbackMode(true);
                  setApiError('API error, running in fallback mode.');
                  console.error('RideFindingScreen: API error:', err);
                }
                // Fallback: if ride creation fails, simulate a ride object
                if (!createdRide) {
                  setFallbackMode(true);
                  console.warn('RideFindingScreen: Fallback mode triggered, rideData:', rideData);
                  createdRide = {
                    ...rideData,
                    _id: 'FAKE_RIDE_ID_' + Date.now(),
                    driver,
                    status: 'pending',
                    fallback: true
                  };
                }
                if (createdRide) {
                    navigate('/captain-on-the-way', {
                        state: {
                            pickupLocation,
                            destination,
                            pickupCoordinates,
                            selectedVehicle,
                            baseFare,
                            totalFare,
                            tip,
                            distance,
                            duration,
                            driver: driver,
                            ride: createdRide,
                            fallback: fallbackMode
                        },
                        replace: true
                    });
                } else {
                    setApiError('Failed to create ride. Please check driver/vehicle data and try again.');
                    console.error('RideFindingScreen: Ride creation failed:', rideData);
                }
            }
            bookRide();
        } else {
            console.log('RideFindingScreen: Still loading, not attempting ride creation');
        }
    }, [isLoading, drivers]);

    useEffect(() => {
        if (!isLoading || !pickupCoordinates) {
            setCaptainLocations([]);
            setBikeStates([]);
            return;
        }
        const numBikes = 7;
        const radius = 0.002; // ~200m
        // Initialize bikes in random positions around pickup
        let bikes = Array.from({ length: numBikes }).map(() => {
            const angle = Math.random() * 2 * Math.PI;
            const r = radius * (0.5 + 0.5 * Math.random());
            return {
                lat: pickupCoordinates.lat + Math.sin(angle) * r,
                lng: pickupCoordinates.lng + Math.cos(angle) * r,
                angle: angle
            };
        });
        setBikeStates(bikes);

        const interval = setInterval(() => {
            bikes = bikes.map(bike => {
                // Randomly change direction a bit
                let newAngle = bike.angle + (Math.random() - 0.5) * 0.5;
                // Move a small step in the current direction
                const step = 0.00015 + Math.random() * 0.0001;
                let newLat = bike.lat + Math.sin(newAngle) * step;
                let newLng = bike.lng + Math.cos(newAngle) * step;
                // Keep within radius from pickup
                const dLat = newLat - pickupCoordinates.lat;
                const dLng = newLng - pickupCoordinates.lng;
                const dist = Math.sqrt(dLat * dLat + dLng * dLng);
                if (dist > radius) {
                    // Reflect back toward center
                    newAngle += Math.PI;
                    newLat = pickupCoordinates.lat + Math.sin(newAngle) * radius * 0.95;
                    newLng = pickupCoordinates.lng + Math.cos(newAngle) * radius * 0.95;
                }
                return {
                    lat: newLat,
                    lng: newLng,
                    angle: newAngle
                };
            });
            setBikeStates(bikes);
            setCaptainLocations(bikes.map(({ lat, lng }) => ({ lat, lng })));
        }, 500);
        return () => clearInterval(interval);
    }, [isLoading, pickupCoordinates]);

    // Forced navigation fallback for dev/testing only! Remove or disable for production deployments.
    useEffect(() => {
        let timeoutId;
        if (!isLoading && assignedDriver) {
            // If not already navigated, force navigation after 8 seconds
            timeoutId = setTimeout(() => {
                setFallbackMode(true);
                // Simulate a ride object with all required fields
                const fakeRide = {
                    _id: 'FAKE_RIDE_ID_' + Date.now(),
                    user_id: assignedDriver.user_id || '',
                    driver_id: assignedDriver._id || '',
                    vehicle_id: assignedDriver.vehicle_id || (assignedDriver.vehicle && assignedDriver.vehicle._id) || '',
                    pickup_location: pickupCoordinates || { lat: 0, lng: 0 },
                    dropoff_location: { address: destination || 'N/A' },
                    fare: totalFare || 0,
                    status: 'pending',
                    distance: distance || 0,
                    duration: duration || 0,
                    driver: assignedDriver,
                    payment_method: '',
                    fallback: true
                };
                navigate('/captain-on-the-way', {
                    state: {
                        pickupLocation: pickupLocation || 'N/A',
                        destination: destination || 'N/A',
                        pickupCoordinates: pickupCoordinates || { lat: 0, lng: 0 },
                        selectedVehicle: selectedVehicle || 'N/A',
                        baseFare: baseFare || 0,
                        totalFare: totalFare || 0,
                        tip: tip || 0,
                        distance: distance || 0,
                        duration: duration || 0,
                        driver: assignedDriver,
                        ride: fakeRide,
                        fallback: true
                    },
                    replace: true
                });
            }, 8000); // 8 seconds fallback
        }
        return () => clearTimeout(timeoutId);
    }, [isLoading, assignedDriver]);

    const handleShowTripDetails = () => setShowTripDetails(true);
    const handleCloseTripDetails = () => setShowTripDetails(false);
    const handleCancelRide = () => {
        setShowTripDetails(false);
        setShowCancelReasonModal(true);
    };
    const handleCloseCancelReasonModal = () => setShowCancelReasonModal(false);
    const handleReasonSelect = (reason) => {
        setShowCancelReasonModal(false);
        navigate('/home-taxi');
    };

    if (!pickupLocation || !destination) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-100">
                <div className="sticky top-0 z-20 bg-white">
                    <HeaderInsideTaxi />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 mt-10">
                        <p className="text-lg text-gray-600 text-center mb-4">Please select your pickup and destination locations to continue.</p>
                        <button
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
                            onClick={() => navigate('/select-location')}
                        >
                            Go to Location Selection
                        </button>
                    </div>
                </div>
                <FooterTaxi />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 pt-[64px]">
            {fallbackMode && (
              <div className="w-full bg-yellow-100 text-yellow-800 text-center py-2 px-4 font-semibold">
                Fallback mode: External API failed or rate-limited. Simulated ride flow active.
              </div>
            )}
            <div className="fixed top-0 left-0 w-full z-50 bg-white">
                <HeaderInsideTaxi />
                {/* Back Button */}
                {pickupLocation && destination && (
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-4 top-[76px] bg-white p-2 rounded-full shadow-md flex items-center justify-center z-20 border border-gray-200 hover:bg-gray-100 transition"
                        style={{width:'40px',height:'40px'}}
                    >
                        <svg width="22" height="22" fill="none" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/><path d="M19 12H9"/></svg>
                    </button>
                )}
            </div>
            {(showTripDetails || showCancelReasonModal) ? (
                <>
                    {showTripDetails && (
                        <TripDetailsModal
                            isOpen={showTripDetails}
                            onClose={handleCloseTripDetails}
                            pickupLocation={pickupLocation}
                            destination={destination}
                            totalFare={totalFare}
                            paymentMethod={paymentMethod}
                            onCancelRide={handleCancelRide}
                        />
                    )}
                    {showCancelReasonModal && (
                        <CancelReasonModal
                            isOpen={showCancelReasonModal}
                            onClose={handleCloseCancelReasonModal}
                            onReasonSelect={handleReasonSelect}
                        />
                    )}
                </>
            ) : (
                <div className={showTripDetails || showCancelReasonModal ? 'hidden' : ''}>
                    <div className="w-full flex flex-col" style={{height: 'calc(100vh - 64px)'}}>
                        {/* Map fixed height, not scrollable, sits directly below header */}
                        <div className="w-full h-[220px] rounded-b-3xl overflow-hidden flex-shrink-0 mt-4">
                            <Map
                                center={pickupCoordinates || { lat: 13.0827, lng: 80.2707 }}
                                markers={isLoading && captainLocations.length > 0 ? [
                                    ...captainLocations.map(loc => ({ position: loc, title: 'Captain', icon: createBikeIcon() })),
                                    pickupCoordinates && { position: pickupCoordinates, title: 'Pickup' }
                                ].filter(Boolean) :
                                pickupCoordinates ? [{ position: pickupCoordinates, title: 'Pickup' }] : []}
                                onMapClick={() => {}}
                                height="220px"
                                showZoomControl={false}
                                bikeAnimationCenter={null}
                                showBikes={false}
                            />
                        </div>
                        {/* Card/content scrollable */}
                        <div className="flex-1 overflow-y-auto w-full bg-white rounded-t-3xl shadow-lg p-5 -mt-6">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
                            <div className="flex items-center justify-between mb-4">
                                <p className="font-semibold text-lg">Looking for your<br />Bike ride</p>
                                <button 
                                    onClick={handleShowTripDetails}
                                    className="px-4 py-2 border border-gray-300 rounded-full text-gray-700 text-sm font-medium"
                                >
                                    Trip Details
                                </button>
                            </div>
                            {/* Assigned Driver Info */}
                            {assignedDriver && (
                              <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex flex-col items-start">
                                <div className="font-semibold text-base text-blue-800 mb-1">Driver Assigned</div>
                                <div className="text-sm text-gray-800">Name: {assignedDriver.name || assignedDriver.driver_name || 'N/A'}</div>
                                <div className="text-sm text-gray-800">Phone: {assignedDriver.phone || 'N/A'}</div>
                                <div className="text-sm text-gray-800">Vehicle: {assignedDriver.vehicle?.make || assignedDriver.vehicle_make || 'N/A'} {assignedDriver.vehicle?.model || assignedDriver.vehicle_model || ''}</div>
                              </div>
                            )}
                            {isLoading ? (
                                <div className="w-full flex flex-col justify-center items-center mb-6">
                                    {/* Animated Spinner */}
                                    <div className="flex justify-center items-center mb-4">
                                        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 border-opacity-70"></div>
                                    </div>
                                    <div className="w-2/3 h-2 bg-gray-200 rounded-full relative overflow-hidden mb-4">
                                        <div
                                            className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full transition-all duration-100"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    {/* Quick Tip Selection - now just below the loading bar */}
                                    <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 mt-2 mb-4">
                                        <div className="mb-2 text-sm font-semibold text-gray-700">Add a tip for your captain</div>
                                        <div className="flex gap-3 mb-2">
                                            {[10, 20, 30, 40].map(amount => (
                                                <button
                                                    key={amount}
                                                    className={`px-4 py-2 rounded-full border font-semibold text-sm ${tip === amount ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white text-gray-700 border-gray-300'}`}
                                                    onClick={() => setTip(amount)}
                                                >
                                                    + ₹{amount}
                                                </button>
                                            ))}
                                        </div>
                                        {tip > 0 && (
                                            <div className="text-xs text-green-600 font-medium">Tip added: ₹{tip}</div>
                                        )}
                                        {/* Book Again Button below tips */}
                                        <button
                                            className="w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white rounded-xl text-base font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition-all mt-4 py-3"
                                            onClick={() => navigate('/select-location')}
                                        >
                                            Book Again
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col justify-center items-center w-full mb-6">
                                    <div className="flex justify-between w-full mb-4">
                                        <div className="h-2 bg-blue-500 w-1/3 rounded-full"></div>
                                        <div className="h-2 bg-gray-200 w-1/3 rounded-full mx-2"></div>
                                        <div className="h-2 bg-gray-200 w-1/3 rounded-full"></div>
                                    </div>
                                </div>
                            )}
                            
                        </div>
                    </div>
                </div>
            )}
            <FooterTaxi />
            {apiError && <div style={{ color: 'red', fontSize: 14 }}>{apiError}</div>}
        </div>
    );
}

export default RideFindingScreen; 
