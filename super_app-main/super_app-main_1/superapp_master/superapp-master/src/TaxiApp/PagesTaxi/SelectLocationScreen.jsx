import React, { useState, useEffect } from "react";
import HeaderInsideTaxi from "../ComponentsTaxi/HeaderInsideTaxi";
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import locationPin from "../ImagesTaxi/location-sugg-list.svg"; 
import { useNavigate, useLocation } from "react-router-dom";
import { getRecentLocations, addRecentLocation, deleteRecentLocation } from '../../services/taxiRecentLocationsService';

const LOCATIONIQ_API_KEY = 'pk.351516f78852b1514e896c713ccfb032';

const fetchLocationIQSuggestions = async (query) => {
    if (!query || query.trim().length < 2) return [];
    
    try {
        const url = `https://api.locationiq.com/v1/autocomplete?` + new URLSearchParams({
            key: LOCATIONIQ_API_KEY,
            q: query.trim(),
            countrycodes: 'in',
            tag: 'place:city,place:town,place:village,place:suburb',
            dedupe: 1,
            limit: 10,
            viewbox: '76.2246,8.0788,80.2709,13.9044', // Bounding box around Tamil Nadu
            bounded: 1
        });
        
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) return [];
        
        const data = await response.json();
        
        // Additional filtering to ensure only Tamil Nadu locations
        return data.filter(place => {
            const lowerName = place.display_name.toLowerCase();
            return (
                (place.address && place.address.state === 'Tamil Nadu') ||
                lowerName.includes('tamil nadu') ||
                lowerName.includes('chennai') ||
                lowerName.includes('coimbatore') ||
                lowerName.includes('madurai') ||
                lowerName.includes('trichy') ||
                lowerName.includes('salem') ||
                lowerName.includes('tirunelveli') ||
                lowerName.includes('tiruppur') ||
                lowerName.includes('erode') ||
                lowerName.includes('vellore')
            );
        }).map(place => ({
            display_name: place.display_name,
            lat: place.lat,
            lon: place.lon
        }));
    } catch (error) {
        console.error('Error fetching locations:', error);
        return [];
    }
};

const MAX_RECENT_LOCATIONS = 5;

export default function SelectLocationScreen() {
    const [pickupLocation, setPickupLocation] = useState(""); // Start empty to allow typing
    const [destination, setDestination] = useState(""); // Start empty
    const [query, setQuery] = useState(""); // To hold current input value for suggestions
    const [suggestions, setSuggestions] = useState([]); // To hold filtered suggestions
    const [activeInput, setActiveInput] = useState(null); // 'pickup' or 'destination'
    const [favorites, setFavorites] = useState({});
    const [recentLocations, setRecentLocations] = useState([]);
    const [recentLocApiWarning, setRecentLocApiWarning] = useState('');
    const [apiError, setApiError] = useState(''); // New state for API error
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const navigate = useNavigate(); // Initialize useNavigate
    const location = useLocation(); // Get navigation state

    // Custom toast notification (same as e-commerce)
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // Prefill pickup or drop location if passed in navigation state or localStorage
    useEffect(() => {
        if (location.state && location.state.pickupLocation) {
            setPickupLocation(location.state.pickupLocation);
        }
        if (location.state && location.state.dropLocation) {
            setDestination(location.state.dropLocation);
        }
    }, [location.state]);

    // Load recent locations on component mount
    useEffect(() => {
        async function fetchRecentLocs() {
            setRecentLocApiWarning('');
            const apiLocs = await getRecentLocations();
            if (apiLocs && Array.isArray(apiLocs)) {
                setRecentLocations(apiLocs);
            } else {
                setRecentLocApiWarning('Recent locations API failed, using localStorage fallback.');
                try {
                    const stored = localStorage.getItem('recentTaxiLocations');
                    if (stored) setRecentLocations(JSON.parse(stored));
                } catch { setRecentLocations([]); }
            }
        }
        fetchRecentLocs();
    }, []);

    // Save a new location to recent locations
    const saveToRecentLocations = async (locationName, fullAddress) => {
        const newLocation = {
            title: locationName,
            address: fullAddress,
            timestamp: new Date().toISOString()
        };
        let success = false;
        if (!recentLocApiWarning) {
            const apiRes = await addRecentLocation(newLocation);
            if (apiRes) {
                setRecentLocations(prev => [apiRes, ...prev.filter(l => l.title !== locationName)].slice(0, 5));
                success = true;
            }
        }
        if (!success) {
            // Fallback to localStorage
            try {
                const stored = localStorage.getItem('recentTaxiLocations');
                let recent = stored ? JSON.parse(stored) : [];
                recent = recent.filter(loc => loc.title !== locationName);
                recent.unshift(newLocation);
                recent = recent.slice(0, 5);
                localStorage.setItem('recentTaxiLocations', JSON.stringify(recent));
                setRecentLocations(recent);
            } catch {}
        }
    };

    // Remove a location from recent locations
    const removeFromRecentLocations = async (locationTitle, id) => {
        let success = false;
        if (!recentLocApiWarning && id) {
            const apiRes = await deleteRecentLocation(id);
            if (apiRes) {
                setRecentLocations(prev => prev.filter(l => l._id !== id));
                success = true;
            }
        }
        if (!success) {
            // Fallback to localStorage
            try {
                const stored = localStorage.getItem('recentTaxiLocations');
                if (stored) {
                    let recent = JSON.parse(stored);
                    recent = recent.filter(loc => loc.title !== locationTitle);
                    localStorage.setItem('recentTaxiLocations', JSON.stringify(recent));
                    setRecentLocations(recent);
                }
            } catch {}
        }
    };

    // Handle selecting a recent location
    const handleSelectRecentLocation = (location, type) => {
        if (type === 'pickup') {
            setPickupLocation(location.title);
        } else {
            setDestination(location.title);
            saveToRecentLocations(location.title, location.address);
        }
        setActiveInput(null);
        setSuggestions([]);
    };

    // Debounce utility
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Debounced version of suggestion fetcher
    const debouncedFetchSuggestions = debounce(async (value) => {
        if (value && value.length >= 3) {
            try {
                const results = await fetchLocationIQSuggestions(value);
                setSuggestions(results.map(s => s.display_name));
                setApiError(''); // Clear error on successful fetch
            } catch (err) {
                if (err?.response?.status === 429) {
                    setSuggestions([]);
                    setApiError('Too many requests. Please wait a moment and try again.');
                } else {
                    setSuggestions([]);
                }
            }
        } else {
            setSuggestions([]);
        }
    }, 1000); // 1000ms debounce

    const handleInputChange = (e, inputType) => {
        const value = e.target.value;
        setQuery(value);
        setActiveInput(inputType);
        debouncedFetchSuggestions(value);
    };

    const handleSelectSuggestion = (suggestion) => {
        if (activeInput === 'pickup') {
            setPickupLocation(suggestion);
        } else if (activeInput === 'destination') {
            setDestination(suggestion);
        }
        setSuggestions([]);
        setQuery("");
        setActiveInput(null);
    };

    const handleClearInput = (inputType) => {
        if (inputType === 'pickup') {
            setPickupLocation("");
        } else if (inputType === 'destination') {
            setDestination("");
        }
        setSuggestions([]);
        setQuery("");
        setActiveInput(null);
    };

    const handleBookRide = () => {
        if (!pickupLocation || !destination) {
            showToast("Please enter both pickup and drop locations.", 'error');
            return;
        }
        if (pickupLocation.trim() === destination.trim()) {
            showToast("Pickup and drop locations cannot be the same. Please select different locations.", 'error');
            return;
        }
        saveToRecentLocations(destination, destination);
        navigate("/ride-confirmation", { 
            state: { 
                pickupLocation, 
                destination
            } 
        });
    };

    const toggleFavorite = (idx) => {
        setFavorites((prev) => ({ ...prev, [idx]: !prev[idx] }));
    };

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
            <div className="absolute top-[64px] bottom-[64px] left-0 right-0 flex flex-col p-1 overflow-hidden">
                {/* Location Inputs Container */}
                <div className="bg-white rounded-xl shadow-lg p-2 mb-2 border-l-4 border-blue-200">
                    {/* Pickup Location Input */}
                    <div className="mt-3 p-2 bg-blue-50 border border-gray-200 rounded flex items-center relative">
                        <img src={locationPin} alt="pickup location icon" className="w-4 h-4 mr-2 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Pickup Location"
                            value={activeInput === 'pickup' ? query : pickupLocation}
                            onChange={(e) => handleInputChange(e, 'pickup')}
                            onFocus={() => setActiveInput('pickup')}
                            className="w-full bg-transparent border-none focus:outline-none text-sm"
                        />
                        {pickupLocation && (
                            <button onClick={() => handleClearInput('pickup')} className="ml-1 text-gray-500 text-base font-bold leading-none hover:text-red-400 transition">&times;</button>
                        )}
                    </div>

                    {/* Drop Location Input */}
                    <div className="mt-2 p-2 bg-blue-50 border border-gray-200 rounded flex items-center relative">
                        <div className="w-3 h-3 rounded-full bg-black mr-2 flex-shrink-0"></div>
                        <input
                            type="text"
                            placeholder="Drop Location"
                            value={activeInput === 'destination' ? query : destination}
                            onChange={(e) => handleInputChange(e, 'destination')}
                            onFocus={() => setActiveInput('destination')}
                            className="w-full bg-transparent border-none focus:outline-none text-sm"
                        />
                        {destination && (
                            <button onClick={() => handleClearInput('destination')} className="ml-1 text-gray-500 text-base font-bold leading-none hover:text-red-400 transition">&times;</button>
                        )}
                    </div>
                </div>

                {/* Book Ride Button - Fixed Position */}
                <div className="flex justify-center mb-2">
                    <button
                        className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-full font-semibold text-base shadow-md hover:from-blue-600 hover:to-blue-500 transition"
                        onClick={handleBookRide}
                    >
                        Book Ride
                    </button>
                </div>

                {/* Combined Suggestions and Recent Locations */}
                <div className="flex-1 overflow-y-auto -mx-1 px-1">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="py-1.5 px-2 border-b border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-600">
                                {activeInput && suggestions.length > 0 ? 'Suggestions' : 'Recent Locations'}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {/* Show Suggestions when typing */}
                            {activeInput && suggestions.length > 0 && suggestions.map((suggestion, index) => (
                                <div
                                    key={`suggestion-${index}`}
                                    className="py-2 px-3 hover:bg-blue-50 cursor-pointer flex items-center"
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                >
                                    <img src={locationPin} alt="location" className="w-4 h-4 mr-2 flex-shrink-0" />
                                    <span className="text-sm">{suggestion}</span>
                                </div>
                            ))}

                            {/* Show Recent Locations */}
                            {(!activeInput || !suggestions.length) && recentLocations.map((location, index) => (
                                <div key={`recent-${index}`} className="relative group">
                                    <div
                                        className="py-2 px-3 hover:bg-blue-50 cursor-pointer flex items-start"
                                        onClick={() => handleSelectRecentLocation(location, activeInput === 'pickup' ? 'pickup' : 'destination')}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24" className="mr-2 mt-0.5 flex-shrink-0">
                                            <path d="M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"/>
                                            <path d="M12 8v4"/>
                                            <path d="M12 16h.01"/>
                                        </svg>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{location.title}</div>
                                            <div className="text-xs text-gray-500 truncate">{location.address}</div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromRecentLocations(location.title, location._id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Show message when no results */}
                            {activeInput && suggestions.length === 0 && query && (
                                <div className="py-3 px-3 text-center text-sm text-gray-500">
                                    No locations found
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {recentLocApiWarning && <div style={{ color: 'orange', fontSize: 12 }}>{recentLocApiWarning}</div>}
                {apiError && <div style={{ color: 'orange', fontSize: 14 }}>{apiError}</div>}
            </div>
            <FooterTaxi />
        </div>
    );
} 