import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderInsideTaxi from "../ComponentsTaxi/HeaderInsideTaxi";
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import locationPin from "../ImagesTaxi/location-sugg-list.svg";
import FareDetailsModal from "../ComponentsTaxi/FareDetailsModal";
import editIcon from '../../Icons/editicon.svg'; // Import the edit icon
import Map from '../ComponentsTaxi/Map';


function RideConfirmationScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pickupLocation, destination } = location.state || {};

    const [map, setMap] = useState(null);
    const [showFareDetails, setShowFareDetails] = useState(false);
    const [selectedFareVehicle, setSelectedFareVehicle] = useState(null);

    const [pickupCoords, setPickupCoords] = useState(null);
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [routePolyline, setRoutePolyline] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Custom toast notification (same as e-commerce)
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // In-memory cache for geocoding results
    const geocodeCache = React.useRef({});

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Geocoding function using LocationIQ with cache
    const geocodeAddress = useCallback(async (address) => {
        if (!address) return null;
        if (geocodeCache.current[address]) {
            return geocodeCache.current[address];
        }
        const apiKey = 'pk.351516f78852b1514e896c713ccfb032'; // LocationIQ API key
        const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(address)}&format=json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.length > 0) {
                const coords = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                geocodeCache.current[address] = coords;
                return coords;
            } else {
                console.error("Geocoding failed for", address, ": No results");
                return null;
            }
        } catch (error) {
            console.error("Geocoding failed for", address, ":", error);
            return null;
        }
    }, []);

    // Debounced version of coordinate fetching
    const debouncedFetchCoordinates = debounce(async (pickupLocation, destination) => {
        const pCoords = await geocodeAddress(pickupLocation);
        const dCoords = await geocodeAddress(destination);
        setPickupCoords(pCoords);
        setDestinationCoords(dCoords);
        // Fetch real driving route from LocationIQ if both coordinates are available
        if (pCoords && dCoords) {
            fetchLocationIQRoute(pCoords, dCoords);
        }
    }, 400);

    // Helper to build markers array for Map component
    const mapMarkers = React.useMemo(() => {
        const arr = [];
        if (pickupCoords) arr.push({ position: pickupCoords, title: 'Pickup' });
        if (destinationCoords) arr.push({ position: destinationCoords, title: 'Dropoff' });
        return arr;
    }, [pickupCoords, destinationCoords]);

    // Polyline decoder for LocationIQ encoded polylines
    // Source: https://github.com/mapbox/polyline (MIT License)
    function decodePolyline(str, precision = 5) {
        let index = 0, lat = 0, lng = 0, coordinates = [], shift = 0, result = 0, byte = null, latitude_change, longitude_change, factor = Math.pow(10, precision);
        while (index < str.length) {
            byte = null; shift = 0; result = 0;
            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
            shift = result = 0;
            do {
                byte = str.charCodeAt(index++) - 63;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);
            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += latitude_change;
            lng += longitude_change;
            coordinates.push([lat / factor, lng / factor]);
        }
        return coordinates;
    }

    // Add fare calculation function
    function calculateFare(distanceKm, durationMin, vehicleType) {
        // Example rates (customize as needed)
        let baseFare = 40;
        let perKm = 10;
        let perMin = 1;
        if (vehicleType === 'SUV') { baseFare = 80; perKm = 18; perMin = 2; }
        if (vehicleType === 'Auto') { baseFare = 30; perKm = 8; perMin = 0.8; }
        if (vehicleType === 'Bike') { baseFare = 25; perKm = 7; perMin = 0.5; }
        return Math.round(baseFare + (distanceKm * perKm) + (durationMin * perMin));
    }

    // Add state for dynamic distance/duration
    const [distance, setDistance] = useState(null);
    const [duration, setDuration] = useState(null);

    // Update fetchLocationIQRoute to also set distance/duration
    const fetchLocationIQRoute = React.useCallback(async (start, end) => {
        const apiKey = 'pk.351516f78852b1514e896c713ccfb032';
        const url = `https://us1.locationiq.com/v1/directions/driving/${start.lng},${start.lat};${end.lng},${end.lat}?key=${apiKey}&overview=full&geometries=polyline`;
        let retries = 3;
        let lastError = null;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url);
                if (response.status === 429) {
                    await new Promise(res => setTimeout(res, 1000));
                    continue;
                }
                const data = await response.json();
                if (data && data.routes && data.routes[0]) {
                    const polyline = decodePolyline(data.routes[0].geometry);
                    setRoutePolyline(polyline);
                    // Set distance and duration
                    setDistance(data.routes[0].distance / 1000); // km
                    setDuration(data.routes[0].duration / 60); // min
                    return;
                } else {
                    setRoutePolyline(null);
                    setDistance(null);
                    setDuration(null);
                    return;
                }
            } catch (err) {
                lastError = err;
                if (attempt < retries) {
                    await new Promise(res => setTimeout(res, 1000));
                }
            }
        }
        setRoutePolyline(null);
        setDistance(null);
        setDuration(null);
    }, []);

    // When a vehicle is selected, calculate dynamic fare
    useEffect(() => {
        if (selectedFareVehicle && distance && duration) {
            const fare = calculateFare(distance, duration, selectedFareVehicle.type);
            setSelectedFareVehicle({ ...selectedFareVehicle, price: `₹${fare}` });
        }
    }, [selectedFareVehicle?.type, distance, duration]);

    useEffect(() => {
        console.log('RideConfirmationScreen mounted with state:', location.state);
        if (!location.state || !pickupLocation || !destination) {
            console.log('Missing required state, redirecting to select location');
            navigate('/home-taxi', { replace: true });
            return;
        }

        // Only fetch coords if locations exist
        if (pickupLocation && destination) {
            debouncedFetchCoordinates(pickupLocation, destination);
        }
    }, [location.state, navigate, pickupLocation, destination]);

    const onMapLoad = useCallback((mapInstance) => {
        setMap(mapInstance);
    }, []);

    const onMapUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const defaultCenter = {
        lat: 13.0827,  // Chennai coordinates (fallback if geocoding fails or takes time)
        lng: 80.2707
    };

    const mapContainerStyle = {
        width: '100%',
        height: '40vh'
    };

    const mapOptions = {
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
            }
        ]
    };

    // Vehicle types and icons
    const vehicleTypes = [
        { type: "Bike", icon: "https://img.icons8.com/color/48/motorcycle.png", description: "Quick Bike rides", pax: 1 },
        { type: "Auto", icon: "https://img.icons8.com/color/48/auto-rickshaw.png", description: "", pax: 1 },
        { type: "Cab Economy", icon: "https://img.icons8.com/color/48/car.png", description: "", pax: 4 },
        { type: "Cab Premium", icon: "https://img.icons8.com/color/48/suv.png", description: "", pax: 4 },
        { type: "Sedan", icon: "https://img.icons8.com/color/48/sedan.png", description: "Comfortable and spacious", pax: 4 },
        { type: "SUV", icon: "https://img.icons8.com/color/48/suv--v1.png", description: "Premium, large vehicle", pax: 6 }
    ];

    // Dynamically generate vehicle options with fare
    const vehicleOptions = vehicleTypes.map(v => {
        let price = "-";
        if (distance && duration) {
            price = `₹${calculateFare(distance, duration, v.type)}`;
        }
        return {
            ...v,
            timeAway: "2 mins away", // You can make this dynamic if you want
            dropTime: "-", // You can make this dynamic if you want
            price,
            fareDetails: {
                totalEstimated: price,
                rideFare: price,
                disclaimer: "*Price may vary based on final pickup or drop location, time taken, final route and toll area.",
                rateDetails: "Rs.8.5/km till 5KMs, Rs.9.5/km up to 10KMs & Rs.12.5/km post 10KMs",
                waitingCharges: "Waiting charges after 3 mins of captain arrival is ₹1.5/min"
            }
        };
    });

    const handleBack = () => {
        navigate('/select-location');
    };

    const handleBookBike = () => {
        if (!pickupLocation || !destination || !selectedFareVehicle) {
            showToast('Please select pickup, destination, and vehicle.');
            return;
        }
        // Parse base fare from selected vehicle (remove ₹ and parse as float)
        const baseFare = parseFloat(selectedFareVehicle.price.replace(/[^\d.]/g, ''));
        const totalFare = baseFare;
        // Pass dynamic values to next step
        navigate('/select-pickup-point', {
            state: {
                pickupLocation,
                destination,
                selectedVehicle: selectedFareVehicle.type,
                baseFare,
                totalFare,
                distance,
                duration
            },
            replace: true // Replace history so back does not return here
        });
    };

    const handleVehicleClick = (vehicle) => {
        if (selectedFareVehicle?.type === vehicle.type) {
            // If already selected, open fare details
            setShowFareDetails(true);
        } else {
            // First click: just select
            setSelectedFareVehicle(vehicle);
        }
    };

    const handleCloseFareDetails = () => {
        setShowFareDetails(false);
    };

    // Decide map center based on geocoded coordinates, fallback to default
    const mapCenter = (pickupCoords && destinationCoords) ? 
        {
            lat: (pickupCoords.lat + destinationCoords.lat) / 2,
            lng: (pickupCoords.lng + destinationCoords.lng) / 2
        } : 
        pickupCoords || destinationCoords || defaultCenter;

    // Debug output for coordinates and polyline
    console.log("pickupCoords", pickupCoords, "destinationCoords", destinationCoords);
    console.log("Polyline prop", pickupCoords && destinationCoords ? [
        [pickupCoords.lat, pickupCoords.lng],
        [destinationCoords.lat, destinationCoords.lng]
    ] : []);

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
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

        <div className="relative min-h-screen bg-white bg-opacity-80 rounded-3xl shadow-sm border border-blue-100 p-2 md:p-6">
            <HeaderInsideTaxi />
            {/* Map absolutely at the top, 50vh, rounded bottom corners */}
            <div className="absolute top-0 left-0 w-full" style={{ height: '48vh', zIndex: 10, padding: 0, margin: 0 }}>
                <div className="w-full h-full" style={{ padding: 0, margin: 0 }}>
                    
                    <Map
                        center={pickupCoords && isFinite(pickupCoords.lat) && isFinite(pickupCoords.lng) ? pickupCoords : defaultCenter}
                        markers={[
                            (pickupCoords && isFinite(pickupCoords.lat) && isFinite(pickupCoords.lng)) ? { position: pickupCoords, title: 'Pickup' } : null,
                            (destinationCoords && isFinite(destinationCoords.lat) && isFinite(destinationCoords.lng)) ? { position: destinationCoords, title: 'Destination' } : null
                        ].filter(Boolean)}
                        polyline={Array.isArray(routePolyline) && routePolyline.every(p => Array.isArray(p) && p.length === 2 && isFinite(p[0]) && isFinite(p[1])) ? routePolyline : []}
                        onMapClick={() => {}}
                        forceLocationIcon={true}
                    />
                </div>
                {/* Floating Back Button */}
                <button
                    onClick={handleBack}
                    className="absolute left-4 top-4 bg-white p-2 rounded-full shadow-md flex items-center justify-center z-20"
                >
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-arrow-left'%3E%3Cpath d='m12 19-7-7 7-7'/%3E%3Cpath d='M19 12H5'/%3E%3C/svg%3E" alt="back" className="w-6 h-6 text-gray-800" />
                </button>
                {/* Floating Current Location Button */}
                <button
                    className="absolute right-4 top-4 bg-white p-2 rounded-full shadow-md flex items-center justify-center z-20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-crosshair" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                </button>
            </div>
            {/* Add Stop Bar - floating pill above the card */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[90%] z-30" style={{ top: 'calc(48vh - 48px)' }}>
                <div className="flex items-center bg-white rounded-full shadow px-4 py-2 w-full border border-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin mr-2 text-blue-500" viewBox="0 0 24 24"><path d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 0 1 16 0c0 4.97-3.582 9-8 9z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span className="text-gray-600 text-sm flex-1 truncate">Add stop to drop your friends</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right ml-2 text-gray-400" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </div>
            </div>
            {/* Floating Card - full width, always reaches footer, no gap */}
            <div className="absolute left-0 right-0 top-[48vh] bottom-0 z-20 pointer-events-none">
                <div className="rounded-t-3xl shadow-lg bg-white p-2 pt-2 h-full overflow-y-auto pointer-events-auto w-full flex flex-col pb-[64px]" style={{ marginTop: 0 }}>
                    {/* Ride Options */}
                    {vehicleOptions.map((option, index) => (
                        <div
                            key={index}
                            className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 cursor-pointer rounded-xl transition-all duration-150 ${selectedFareVehicle?.type === option.type 
    ? 'border-2 border-blue-600 shadow-lg bg-blue-50' 
    : 'border border-gray-200 bg-white'}`}

                            onClick={() => handleVehicleClick(option)}
                        >
                            <div className="flex items-center">
                                <img src={option.icon} alt={option.type} className="w-8 h-8 mr-3" />
                                <div>
                                    <p className="font-semibold text-sm">{option.type}</p>
                                    <p className="text-xs text-gray-500">{option.timeAway} • Drop {option.dropTime}</p>
                                </div>
                            </div>
                            <div className="text-base font-medium text-black">{option.price}</div>
                        </div>
                    ))}
                    {/* Discount Banner */}
                    <div className="my-1"></div>
                    {/* Payment/Offers Row */}
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet mr-1" viewBox="0 0 24 24"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h12a2 2 0 0 1 0 4H5a2 2 0 0 0 0 4h12a2 2 0 0 0 2-2v-3"/><path d="M22 7V4a1 1 0 0 0-1-1H3a2 2 0 0 0 0 4h18a2 2 0 0 1 0 4H3a2 2 0 0 0 0 4h18a2 2 0 0 0 2-2v-3"/><path d="M3 11h2v2H3z"/></svg>
                            <span className="font-semibold text-xs">Cash</span>
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tag mr-1" viewBox="0 0 24 24"><path d="M9 19H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5l6-6 6 6v5a2 2 0 0 1-2 2h-5l-6 6Z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span className="font-semibold text-xs">Offers</span>
                        </div>
                    </div>
                    {/* Book Bike Button */}
                    <button
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white py-3 rounded-xl text-base font-semibold shadow-lg mt-2 hover:from-blue-600 hover:to-blue-500 transition-colors duration-200"
                        onClick={handleBookBike}
                    >
                        {selectedFareVehicle ? `Book ${selectedFareVehicle.type}` : 'Book Ride'}
                    </button>
                </div>
            </div>
            </div>
<FooterTaxi />

            <FareDetailsModal
                isOpen={showFareDetails}
                onClose={handleCloseFareDetails}
                fareDetails={selectedFareVehicle?.fareDetails}
                vehicleType={selectedFareVehicle?.type}
                price={selectedFareVehicle?.price}
            />
        </div>
    );
}

export default RideConfirmationScreen;