import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderInsideTaxi from "../ComponentsTaxi/HeaderInsideTaxi";
// import mapPlaceholder from "../../FoodDilvery/ImagesF/mapfromFigma.svg";
import locationPin from "../ImagesTaxi/location-sugg-list.svg";
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import Map from '../ComponentsTaxi/Map';
import L from 'leaflet';

function SelectPickupPointScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { pickupLocation, destination, selectedVehicle, baseFare, totalFare, distance, duration } = location.state || {};
    console.log('pickupLocation (from state):', pickupLocation);
    
    // Initialize selectedPoint with null
    const [selectedPoint, setSelectedPoint] = useState(null);
    // Saved locations: { home: {name, coords}, work: {name, coords}, custom: {name, coords} }
    const [savedLocations, setSavedLocations] = useState({
        home: null,
        work: null,
        custom: null
    });
    const [customLocationName, setCustomLocationName] = useState('');
    // Recent pickups from localStorage
    const [recentPickups, setRecentPickups] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentPickups') || '[]');
        } catch {
            return [];
        }
    });
    // For current location
    const [currentLoc, setCurrentLoc] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    // Show more/less for pickup points
    const [showAllPoints, setShowAllPoints] = useState(false);
    // Track if a recent location is selected
    const [selectedRecentIdx, setSelectedRecentIdx] = useState(null);
    const [error, setError] = useState("");
    // Add state for live distance, duration, and fare
    const [liveDistance, setLiveDistance] = useState(null);
    const [liveDuration, setLiveDuration] = useState(null);
    const [liveFare, setLiveFare] = useState(null);
    const [previousPickup, setPreviousPickup] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    // State for selected address and coordinates to trigger recalculation
    const [selectedAddressState, setSelectedAddressState] = useState('');
    const [selectedCoordinatesState, setSelectedCoordinatesState] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);

    // Custom toast notification (same as e-commerce)
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    useEffect(() => {
        console.log('SelectPickupPointScreen mounted with state:', location.state);
        if (!location.state || !pickupLocation || !destination) {
            console.log('Missing required state, redirecting back');
            navigate('/select-location');
            return;
        }
        // Load saved locations from localStorage
        try {
            const stored = JSON.parse(localStorage.getItem('taxiSavedLocations') || '{}');
            setSavedLocations({
                home: stored.home || null,
                work: stored.work || null,
                custom: stored.custom || null
            });
            setCustomLocationName(stored.custom?.name || '');
        } catch {}
    }, [location.state, navigate, pickupLocation, destination]);

    const geocodeAddress = useCallback(async (address) => {
        const apiKey = 'pk.351516f78852b1514e896c713ccfb032';
        const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(address)}&format=json`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            } else {
                setError("Could not find the location. Please try a different address.");
                return null;
            }
        } catch (error) {
            setError("Network error while searching for location. Please check your connection.");
            return null;
        }
    }, []);

    useEffect(() => {
        async function handlePickupLocation() {
            if (!selectedPoint && pickupLocation) {
                if (typeof pickupLocation === 'string') {
                    const coords = await geocodeAddress(pickupLocation);
                    if (coords) {
                        setSelectedPoint({ lat: coords.lat, lng: coords.lng, label: pickupLocation });
                        console.log('Geocoded and set selectedPoint:', coords);
                    } else {
                        console.log('Failed to geocode pickupLocation:', pickupLocation);
                    }
                } else if (pickupLocation.lat && pickupLocation.lng) {
                    setSelectedPoint({ lat: pickupLocation.lat, lng: pickupLocation.lng, label: pickupLocation.label || '' });
                    console.log('Set selectedPoint from pickupLocation object:', pickupLocation);
                } else {
                    console.log('pickupLocation missing lat/lng:', pickupLocation);
                }
            }
        }
        handlePickupLocation();
    }, [pickupLocation, selectedPoint, geocodeAddress]);

    useEffect(() => {
        if (selectedPoint && selectedPoint.lat && selectedPoint.lng) {
            setCurrentLoc({ lat: selectedPoint.lat, lng: selectedPoint.lng });
            console.log('Set currentLoc from selectedPoint:', selectedPoint);
        } else if (selectedPoint) {
            console.log('selectedPoint missing lat/lng:', selectedPoint);
        }
    }, [selectedPoint]);

    // Helper: city to pickup points mapping
    const cityPickupPoints = {
  Chennai: [
    { id: 1, lat: 13.0827, lng: 80.2707, label: 'Chennai Central', address: 'Chennai Central Railway Station' },
    { id: 2, lat: 13.0635, lng: 80.2409, label: 'T Nagar', address: 'T Nagar, Chennai' },
    { id: 3, lat: 13.0480, lng: 80.2098, label: 'Guindy', address: 'Guindy, Chennai' },
    { id: 4, lat: 13.0604, lng: 80.2496, label: 'Egmore', address: 'Egmore, Chennai' }
  ],
  Coimbatore: [
    { id: 1, lat: 11.0168, lng: 76.9558, label: 'Gandhipuram', address: 'Gandhipuram, Coimbatore' },
    { id: 2, lat: 11.0183, lng: 76.9725, label: 'Town Hall', address: 'Town Hall, Coimbatore' },
    { id: 3, lat: 11.0186, lng: 76.9488, label: 'Ukkadam', address: 'Ukkadam, Coimbatore' },
    { id: 4, lat: 11.0357, lng: 77.0285, label: 'Peelamedu', address: 'Peelamedu, Coimbatore' }
  ],
  Salem: [
    { id: 1, lat: 11.6643, lng: 78.1460, label: 'New Bus Stand', address: 'New Bus Stand, Salem' },
    { id: 2, lat: 11.6537, lng: 78.1621, label: 'Junction', address: 'Salem Junction Railway Station' },
    { id: 3, lat: 11.6640, lng: 78.1580, label: 'Five Roads', address: 'Five Roads, Salem' },
    { id: 4, lat: 11.6691, lng: 78.1402, label: 'Gugai', address: 'Gugai, Salem' }
  ],
  Madurai: [
    { id: 1, lat: 9.9252, lng: 78.1198, label: 'Meenakshi Temple', address: 'Meenakshi Temple, Madurai' },
    { id: 2, lat: 9.9174, lng: 78.1196, label: 'Periyar', address: 'Periyar Bus Stand, Madurai' },
    { id: 3, lat: 9.9300, lng: 78.1140, label: 'Mattuthavani', address: 'Mattuthavani, Madurai' },
    { id: 4, lat: 9.9297, lng: 78.1450, label: 'Anna Nagar', address: 'Anna Nagar, Madurai' }
  ],
  Pondicherry: [
    { id: 1, lat: 11.9416, lng: 79.8083, label: 'Rock Beach', address: 'Rock Beach, Pondicherry' },
    { id: 2, lat: 11.9375, lng: 79.8356, label: 'Auroville', address: 'Auroville, Pondicherry' },
    { id: 3, lat: 11.9396, lng: 79.8317, label: 'White Town', address: 'White Town, Pondicherry' },
    { id: 4, lat: 11.9480, lng: 79.7856, label: 'Serenity Beach', address: 'Serenity Beach, Pondicherry' }
  ]
};

    // Improved city extraction
    function extractCity(locationStr) {
        if (!locationStr) return null;
        const cities = Object.keys(cityPickupPoints);
        // Try to match by splitting on comma and trimming
        const parts = locationStr.split(',').map(s => s.trim().toLowerCase());
        for (const city of cities) {
            if (parts.includes(city.toLowerCase())) {
                return city;
            }
        }
        // Fallback: substring match
        for (const city of cities) {
            if (locationStr.toLowerCase().includes(city.toLowerCase())) {
                return city;
            }
        }
        return null;
    }

    // Pickup points (dynamic)
    const pickupCity = extractCity(pickupLocation);
    console.log('pickupLocation:', pickupLocation, 'Detected city:', pickupCity);
    const pickupPoints = cityPickupPoints[pickupCity] || [];

    // Determine if pickupLocation is a geocoded address (not a city)
    const isGeocodedPickup = !pickupCity && selectedPoint && selectedPoint.lat && selectedPoint.lng;
    const mapZoom = isGeocodedPickup ? 13 : 15;
    // If selectedPoint is a geocoded address (not a city), always add it as the main pickup point
    const allPickupPoints = (isGeocodedPickup || currentLoc)
        ? [
            { id: 99, lat: (isGeocodedPickup ? selectedPoint.lat : currentLoc.lat), lng: (isGeocodedPickup ? selectedPoint.lng : currentLoc.lng), label: 'Current Location', address: 'Current Location' },
            ...pickupPoints
        ]
        : pickupPoints;

    // Show only first 2 unless expanded
    const pointsToShow = showAllPoints ? allPickupPoints : allPickupPoints.slice(0, 2);
    const mapCenter = (currentLoc && typeof currentLoc.lat === 'number' && typeof currentLoc.lng === 'number' && !isNaN(currentLoc.lat) && !isNaN(currentLoc.lng))
        ? { lat: currentLoc.lat, lng: currentLoc.lng }
        : (allPickupPoints.length > 0 && typeof allPickupPoints[0].lat === 'number' && typeof allPickupPoints[0].lng === 'number')
            ? { lat: allPickupPoints[0].lat, lng: allPickupPoints[0].lng }
            : { lat: 13.0827, lng: 80.2707 };

    // Custom marker icon for selected and unselected
    const greenMarker = new L.DivIcon({
        className: '',
        html: `<div style="width:28px;height:28px;background:#fff;border:4px solid #22c55e;border-radius:50%;box-shadow:0 2px 8px rgba(34,197,94,0.2);"></div>`
    });
    const selectedMarker = new L.DivIcon({
        className: '',
        html: `<div style="width:38px;height:38px;background:#fff;border:6px solid #facc15;border-radius:50%;box-shadow:0 4px 16px rgba(250,204,21,0.4);animation:bounce 0.6s;animation-iteration-count:1;"></div>`
    });

    // Map Markers with custom icons (defensive: only valid lat/lng)
    const mapMarkers = allPickupPoints
        .filter(point => typeof point.lat === 'number' && typeof point.lng === 'number' && !isNaN(point.lat) && !isNaN(point.lng))
        .map(point => ({
            position: { lat: point.lat, lng: point.lng },
            title: point.id === 99 ? 'Pickup' : point.label,
            // Only use custom icon for non-pickup markers
            icon: point.id === 99 ? undefined : ( (selectedPoint && selectedPoint.id ? selectedPoint.id : selectedPoint) === point.id ? selectedMarker : greenMarker )
        }));

    // Find selected address and update state
    let selectedAddress = '';
    let selectedCoordinates = null;
    if (selectedRecentIdx !== null && recentPickups[selectedRecentIdx]) {
        selectedAddress = recentPickups[selectedRecentIdx].address;
        selectedCoordinates = recentPickups[selectedRecentIdx].coordinates;
    } else if (selectedPoint) {
        if (selectedPoint === 99 && currentLoc && currentLoc.address) {
            selectedAddress = currentLoc.address;
            selectedCoordinates = { lat: currentLoc.lat, lng: currentLoc.lng };
        } else {
            const point = allPickupPoints.find(p => p.id === selectedPoint);
            if (point) {
                selectedAddress = point.label;
                selectedCoordinates = { lat: point.lat, lng: point.lng };
            } else if (selectedPoint.label) {
                selectedAddress = selectedPoint.label;
                selectedCoordinates = { lat: selectedPoint.lat, lng: selectedPoint.lng };
            }
        }
    }

    // Update state when selected address/coordinates change
    useEffect(() => {
        if (selectedAddress !== selectedAddressState || 
            JSON.stringify(selectedCoordinates) !== JSON.stringify(selectedCoordinatesState)) {
            setSelectedAddressState(selectedAddress);
            setSelectedCoordinatesState(selectedCoordinates);
        }
    }, [selectedAddress, selectedCoordinates, selectedAddressState, selectedCoordinatesState]);

    // Handle selecting a pickup point
    const handlePointSelect = (point) => {
        if (point && typeof point === 'object' && 'id' in point) {
            if (point.id === 99) {
                // If 'Current Location' is selected
                if (selectedPoint === 99) {
                    // Unselect: restore previous pickup
                    if (previousPickup !== null) {
                        setSelectedPoint(previousPickup);
                        setPreviousPickup(null);
                    }
                } else {
                    // Store current selection before switching to current location
                    setPreviousPickup(selectedPoint);
                    handleSetCurrentLocation();
                }
            } else {
                setSelectedPoint(point.id);
                setCurrentLoc({ lat: point.lat, lng: point.lng, address: point.address || '' });
                setPreviousPickup(null);
            }
        } else {
            setSelectedPoint(point);
            setPreviousPickup(null);
            // Optionally set currentLoc if you have lat/lng info here
        }
        setSelectedRecentIdx(null);
    };

    // Handle saving a location
    // Save/Remove location as Home, Work, or Custom
    const handleSaveLocation = (type) => {
        let point = null;
        if (selectedRecentIdx !== null && recentPickups[selectedRecentIdx]) {
            point = {
                name: type === 'custom' ? customLocationName : type.charAt(0).toUpperCase() + type.slice(1),
                coords: recentPickups[selectedRecentIdx].coordinates,
                address: recentPickups[selectedRecentIdx].address
            };
        } else if (selectedPoint) {
            const p = allPickupPoints.find(p => p.id === selectedPoint) || selectedPoint;
            point = {
                name: type === 'custom' ? customLocationName : type.charAt(0).toUpperCase() + type.slice(1),
                coords: { lat: p.lat, lng: p.lng },
                address: p.label || p.address || ''
            };
        }
        setSavedLocations(prev => {
            const updated = {
                ...prev,
                [type]: prev[type] ? null : point
            };
            // Persist to localStorage
            localStorage.setItem('taxiSavedLocations', JSON.stringify(updated));
            // Reset custom name if unsetting
            if (type === 'custom' && prev.custom) setCustomLocationName('');
            return updated;
        });
        if (type === 'custom' && !savedLocations.custom) {
            setCustomLocationName('');
        }
    };

    // Back button
    const handleBack = () => {
        navigate('/ride-confirmation', { 
            state: { 
                pickupLocation, 
                destination 
            } 
        });
    };

    // Helper: calculate fare
    function calculateFare(distanceKm, durationMin, vehicleType) {
        let baseFare = 40;
        let perKm = 10;
        let perMin = 1;
        if (vehicleType === 'SUV') { baseFare = 80; perKm = 18; perMin = 2; }
        if (vehicleType === 'Auto') { baseFare = 30; perKm = 8; perMin = 0.8; }
        if (vehicleType === 'Bike') { baseFare = 25; perKm = 7; perMin = 0.5; }
        return Math.round(baseFare + (distanceKm * perKm) + (durationMin * perMin));
    }

    // Effect: recalculate distance, duration, and fare whenever pickup or destination changes
    useEffect(() => {
        async function recalcRoute() {
            if (!selectedAddressState || !selectedCoordinatesState || !destination || !selectedVehicle) {
                setLiveDistance(null);
                setLiveDuration(null);
                setLiveFare(null);
                setIsCalculating(false);
                return;
            }
            setIsCalculating(true);
            setError(''); // Clear any previous errors
            try {
                const apiKey = 'pk.351516f78852b1514e896c713ccfb032';
                // Geocode destination if needed
                let destCoords = null;
                if (typeof destination === 'string') {
                    const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(destination)}&format=json`;
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Failed to geocode destination');
                    }
                    const data = await response.json();
                    if (data && data.length > 0) {
                        destCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                    } else {
                        throw new Error('Destination not found');
                    }
                } else if (destination.lat && destination.lng) {
                    destCoords = { lat: destination.lat, lng: destination.lng };
                }
                if (destCoords) {
                    const url = `https://us1.locationiq.com/v1/directions/driving/${selectedCoordinatesState.lng},${selectedCoordinatesState.lat};${destCoords.lng},${destCoords.lat}?key=${apiKey}&overview=false`;
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error('Failed to calculate route');
                    }
                    const data = await response.json();
                    if (data && data.routes && data.routes[0]) {
                        const d = data.routes[0].distance / 1000;
                        const t = data.routes[0].duration / 60;
                        setLiveDistance(d);
                        setLiveDuration(t);
                        setLiveFare(calculateFare(d, t, selectedVehicle));
                        setIsCalculating(false);
                        setError(''); // Clear error on success
                        return;
                    } else {
                        throw new Error('No route found');
                    }
                } else {
                    throw new Error('Could not determine destination coordinates');
                }
            } catch (err) {
                console.error('Error calculating route:', err);
                setError(err.message || 'Failed to calculate distance and fare. Please try again.');
                setLiveDistance(null);
                setLiveDuration(null);
                setLiveFare(null);
            } finally {
                setIsCalculating(false);
            }
        }
        recalcRoute();
    }, [selectedAddressState, selectedCoordinatesState, destination, selectedVehicle]);

    const handleConfirmPickup = async () => {
        if (!selectedPoint && selectedRecentIdx === null) {
            showToast('Please select a pickup point', 'error');
            return;
        }
        // Save to recent pickups
        if (selectedAddress && selectedCoordinates) {
            const newRecent = [
                { address: selectedAddress, coordinates: selectedCoordinates },
                ...recentPickups.filter(r => r.address !== selectedAddress)
            ].slice(0, 3);
            setRecentPickups(newRecent);
            localStorage.setItem('recentPickups', JSON.stringify(newRecent));
        }
        // Recalculate distance, duration, and fare using LocationIQ
        let newDistance = distance;
        let newDuration = duration;
        let newTotalFare = totalFare;
        if (selectedCoordinates && destination) {
            try {
                const apiKey = 'pk.351516f78852b1514e896c713ccfb032';
                // Geocode destination if needed
                let destCoords = null;
                if (typeof destination === 'string') {
                    const url = `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(destination)}&format=json`;
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        destCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                    }
                } else if (destination.lat && destination.lng) {
                    destCoords = { lat: destination.lat, lng: destination.lng };
                }
                if (destCoords) {
                    const url = `https://us1.locationiq.com/v1/directions/driving/${selectedCoordinates.lng},${selectedCoordinates.lat};${destCoords.lng},${destCoords.lat}?key=${apiKey}&overview=false`;
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data && data.routes && data.routes[0]) {
                        newDistance = data.routes[0].distance / 1000;
                        newDuration = data.routes[0].duration / 60;
                        newTotalFare = calculateFare(newDistance, newDuration, selectedVehicle);
                    }
                }
            } catch (err) {
                // If API fails, fallback to previous values
            }
        }
        // Prepare navigation state
        const navigationState = { 
            pickupLocation: selectedAddress,
            destination,
            selectedPickupPoint: selectedPoint,
            pickupCoordinates: selectedCoordinates,
            savedLocations,
            selectedVehicle,
            baseFare,
            totalFare: newTotalFare,
            distance: newDistance,
            duration: newDuration
        };
        navigate('/ride-finding', { state: navigationState, replace: true });
    };

    // Handle current location
    const handleSetCurrentLocation = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                let address = 'Current Location';
                try {
                    const apiKey = 'pk.351516f78852b1514e896c713ccfb032';
                    const url = `https://us1.locationiq.com/v1/reverse?key=${apiKey}&lat=${lat}&lon=${lng}&format=json`;
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data && data.display_name) {
                        address = data.display_name;
                    }
                } catch (err) {
                    // If reverse geocoding fails, keep default label
                }
                const newLoc = {
                    lat,
                    lng,
                    address,
                    label: address
                };
                setCurrentLoc(newLoc);
                setSelectedPoint(99); // Set to id 99 for current location
                setIsLocating(false);
                setError("");
            },
            (err) => {
                setError('Unable to fetch your location. Please enable location services and try again.');
                setIsLocating(false);
            }
        );
    };

    // Set selectedPoint to first available id after allPickupPoints is defined
    useEffect(() => {
        if (allPickupPoints.length > 0) {
            setSelectedPoint(allPickupPoints[0].id);
        }
        setSelectedRecentIdx(null);
    }, [pickupLocation, allPickupPoints.length]);

    if (!location.state || !pickupLocation || !destination) {
        return (
            <div className="relative h-screen bg-gray-100 flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
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
            
            <HeaderInsideTaxi />
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg px-4 py-3 mb-2 max-w-md mx-auto shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{error}</span>
                        </div>
                        <button 
                            onClick={() => setError('')}
                            className="ml-3 text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            {/* Map fixed at the top, 50vh, rounded bottom corners */}
            <div className="absolute top-0 left-0 w-full" style={{ height: '46vh', zIndex: 10 }}>
                <div className="w-full h-full rounded-b-3xl overflow-hidden shadow-lg relative">
                    <Map
                        center={mapCenter}
                        markers={mapMarkers}
                        onMapClick={() => {}}
                        zoom={mapZoom}
                        showBikes={false}
                    />
                    {/* Floating Pickup Point label above selected marker */}
                    {selectedPoint && (
                        <div style={{ position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%, -100%)', zIndex: 30 }}>
                            <div className="bg-green-600 text-white px-5 py-2 rounded-full shadow text-sm font-semibold flex items-center animate-bounce">
                                <img src={locationPin} alt="pin" className="w-4 h-4 mr-1"/>
                                Pickup Point
                            </div>
                        </div>
                    )}
                    {/* Current Location Button */}
                    <button 
                        onClick={handleSetCurrentLocation}
                        className="absolute top-5 right-5 bg-white p-2 rounded-full shadow-md z-30 border border-gray-200 hover:bg-gray-100 transition-colors"
                        title="Use my location"
                        disabled={isLocating}
                    >
                        {isLocating ? (
                            <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="4" opacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#22c55e" strokeWidth="4"/></svg>
                        ) : (
                            <svg width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
                        )}
                    </button>
                </div>
                {/* Floating Back Button */}
                <button 
                    onClick={handleBack}
                    className="absolute bottom-5 left-5 bg-white p-2 rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-20"
                >
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-arrow-left'%3E%3Cpath d='m12 19-7-7 7-7'/%3E%3Cpath d='M19 12H5'/%3E%3C/svg%3E" alt="back" className="w-6 h-6 text-gray-800" />
                </button>
            </div>
            {/* Bottom Sheet for Location Selection, scrollable */}
            <div className="absolute left-0 right-0 top-[46vh] bottom-0 z-20 pointer-events-none">
                <div className="relative flex-1 bg-white rounded-t-3xl shadow-lg p-4 flex flex-col overflow-y-auto pointer-events-auto pb-24 h-full">
                    <div className="flex items-center mb-2">
                        <img src={locationPin} alt="pickup" className="w-5 h-5 mr-2" />
                        <div className="flex flex-col">
                            <p className="font-semibold text-base leading-tight">Select a pickup point</p>
                            <p className="text-xs text-gray-500 leading-tight">Drag map or select from below</p>
                        </div>
                    </div>
                    {/* Location Input Fields */}
                    <div className="space-y-2 mb-3">
                        {/* Pickup Location Display */}
                        <div className="flex items-center bg-white border-2 border-blue-400 rounded-full px-4 py-2 shadow-md transition-all duration-150">
                            <img src={locationPin} alt="pickup" className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-800 truncate flex-1">
                                {selectedAddress || 'Select pickup point'}
                            </span>
                        </div>
                        {/* Destination Location Display with Edit Button */}
                        <div className="flex items-center bg-white border-2 border-gray-300 rounded-full px-4 py-2 shadow-md transition-all duration-150">
                            <div className="w-3 h-3 rounded-full bg-black mr-2 flex-shrink-0"></div>
                            <span className="text-sm font-medium text-gray-800 truncate flex-1">
                                {destination || 'Destination'}
                            </span>
                            <button
                                onClick={() => navigate('/select-location', { 
                                    state: { 
                                        pickupLocation: selectedAddress || pickupLocation,
                                        dropLocation: destination 
                                    } 
                                })}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-xs font-semibold flex-shrink-0"
                                title="Change destination"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                    {/* ETA Display */}
                    <div className="flex items-center mt-1 mb-2 text-xs text-gray-600">
                        <svg width="16" height="16" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span className="ml-1">Driver ETA: 4 min</span>
                    </div>
                    {/* Live Distance/Fare Display */}
                    <div className="flex items-center mt-2 mb-2">
                        {isCalculating ? (
                            <div className="flex items-center text-xs text-blue-600">
                                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Calculating distance and fare...</span>
                            </div>
                        ) : liveDistance && liveFare ? (
                            <div className="flex items-center text-xs text-blue-700 font-semibold">
                                <span>Distance: {liveDistance.toFixed(2)} km</span>
                                <span className="mx-2">|</span>
                                <span>Fare: ₹{liveFare}</span>
                            </div>
                        ) : (
                            <div className="text-xs text-gray-500">
                                Select a pickup point to see distance and fare
                            </div>
                        )}
                    </div>
                    {/* Recent Locations Section */}
                    {recentPickups.length > 0 && (
                        <div className="mb-3 px-2 md:px-4">
                            <p className="font-semibold text-xs text-gray-700 mb-2">Recent Locations</p>
                            <div className="flex flex-col gap-2">
                                {recentPickups.map((loc, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center w-full px-3 py-2 border rounded-lg text-xs font-medium transition-colors text-left focus:outline-none ${selectedRecentIdx === idx ? 'border-2 border-blue-500 bg-blue-100 shadow' : 'border border-blue-200 bg-blue-50 hover:border-blue-300'}`}
                                    >
                                        <button
                                            className="flex-1 flex items-center text-left"
                                            type="button"
                                            onClick={() => {
                                                setCurrentLoc({ lat: loc.coordinates.lat, lng: loc.coordinates.lng, address: loc.address });
                                                setSelectedRecentIdx(idx);
                                                setSelectedPoint(null);
                                            }}
                                        >
                                            <span className="mr-3 flex items-center justify-center w-4 h-4">
                                                <svg width="16" height="16" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <polyline points="12 6 12 12 16 14"/>
                                                </svg>
                                            </span>
                                            <div className="flex flex-col flex-1">
                                                <span className="font-semibold text-sm">{loc.address}</span>
                                            </div>
                                        </button>
                                        <button
                                            className="ml-2 text-gray-400 hover:text-red-500"
                                            title="Remove"
                                            type="button"
                                            onClick={() => {
                                                const newRecents = recentPickups.filter((_, i) => i !== idx);
                                                setRecentPickups(newRecents);
                                                localStorage.setItem('recentPickups', JSON.stringify(newRecents));
                                                if (selectedRecentIdx === idx) setSelectedRecentIdx(null);
                                            }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <hr className="my-1 border-gray-200" />
                        </div>
                    )}
                    {/* Save Location As Section */}
                    <div className="mb-5 px-2 md:px-4">
                        <p className="font-medium text-xs text-gray-700 mb-2">Save location as</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <button 
                                onClick={() => handleSaveLocation('home')}
                                className={`flex items-center px-3 py-2 border rounded-full text-xs font-medium transition-colors ${
                                    savedLocations.home 
                                        ? 'border-2 border-blue-500 bg-blue-100 text-blue-700' 
                                        : 'border border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300'
                                }`}
                                title={savedLocations.home ? (savedLocations.home.address || savedLocations.home.name) : ''}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home mr-1" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                Home
                            </button>
                            <button 
                                onClick={() => handleSaveLocation('work')}
                                className={`flex items-center px-3 py-2 border rounded-full text-xs font-medium transition-colors ${
                                    savedLocations.work 
                                        ? 'border-2 border-blue-500 bg-blue-100 text-blue-700' 
                                        : 'border border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300'
                                }`}
                                title={savedLocations.work ? (savedLocations.work.address || savedLocations.work.name) : ''}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-briefcase mr-1" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
                                Work
                            </button>
                            <button 
                                onClick={() => handleSaveLocation('custom')}
                                className={`flex items-center px-3 py-2 border rounded-full text-xs font-medium transition-colors ${
                                    savedLocations.custom 
                                        ? 'border-2 border-blue-500 bg-blue-100 text-blue-700' 
                                        : 'border border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300'
                                }`}
                                title={savedLocations.custom ? (savedLocations.custom.address || savedLocations.custom.name) : ''}
                            >
                                <span className="mr-1">+ Add New</span>
                            </button>
                        </div>
                        {savedLocations.custom && (
                            <input
                                type="text"
                                className="block w-full border border-blue-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-blue-400 transition mt-3 mb-3"
                                placeholder="Custom location name"
                                value={customLocationName}
                                onChange={e => {
                                    setCustomLocationName(e.target.value);
                                    setSavedLocations(prev => {
                                        const updated = { ...prev, custom: prev.custom ? { ...prev.custom, name: e.target.value } : null };
                                        localStorage.setItem('taxiSavedLocations', JSON.stringify(updated));
                                        return updated;
                                    });
                                }}
                            />
                        )}
                    </div>
                    {/* Pickup Points List */}
                    <div className="mb-3 px-2 md:px-4">
                        <p className="font-medium text-xs text-gray-700 mb-1">Or select from suggested points</p>
                        <div className="flex flex-col gap-2">
                            {pointsToShow.map(point => (
                                <button
                                    key={point.id}
                                    className={`flex items-center w-full px-3 py-2 border rounded-lg text-xs font-medium transition-colors text-left focus:outline-none ${selectedPoint === point.id ? 'border-2 border-blue-500 bg-blue-100 shadow' : 'border border-blue-200 bg-blue-50 hover:border-blue-300'}`}
                                    onClick={() => handlePointSelect(point)}
                                >
                                    <span className={`mr-3 flex items-center justify-center w-4 h-4 rounded-full border ${selectedPoint === point.id ? 'border-yellow-400 bg-yellow-400' : 'border-gray-300 bg-white'}`}
                                        style={{ minWidth: '1rem' }}
                                    >
                                        {selectedPoint === point.id && (
                                            <span className="block w-2 h-2 bg-white rounded-full mx-auto" />
                                        )}
                                    </span>
                                    <div className="flex flex-col flex-1">
                                        <span className="font-semibold text-sm">{point.label}</span>
                                        <span className="text-gray-500 text-xs">{point.address}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {allPickupPoints.length > 2 && (
                            <button
                                className="text-xs text-green-600 underline mt-1"
                                onClick={() => setShowAllPoints(!showAllPoints)}
                            >
                                {showAllPoints ? 'Show Less' : 'Show More'}
                            </button>
                        )}
                    </div>
                    {/* Confirm Pickup Button */}
                    <button
                        onClick={handleConfirmPickup}
                        className="w-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 text-white py-3 rounded-xl text-base font-bold shadow-lg mt-auto transition-all duration-150 hover:from-blue-600 hover:to-blue-700"
                        style={{ letterSpacing: '0.02em' }}
                    >
                        Confirm Pickup
                    </button>
                </div>
            </div>
            <FooterTaxi />
        </div>
    );
}

export default SelectPickupPointScreen;