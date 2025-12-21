import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from "react";
import HeaderInsideTaxi from "../ComponentsTaxi/HeaderInsideTaxi";
import { useNavigate } from "react-router-dom";
import search from "../../Icons/search.svg";
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import axios from 'axios';
import { getRecentLocations } from '../../services/taxiRecentLocationsService';

function SidebarMenuItem({ icon, label, subLabel, onClick }) {
    return (
        <div className="flex items-center px-4 py-3 hover:bg-gray-100 rounded-lg cursor-pointer transition mb-1" onClick={onClick}>
            <div className="w-6 h-6 flex items-center justify-center mr-3">{icon}</div>
            <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{label}</div>
                {subLabel && <div className="text-xs text-gray-500">{subLabel}</div>}
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        </div>
    );
}

function HomeScreenTaxi() {
    const navigate = useNavigate();
    const [showAllServices, setShowAllServices] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [recentLocations, setRecentLocations] = useState([]);
    const [recentLocApiWarning, setRecentLocApiWarning] = useState('');
    const [showAllRecent, setShowAllRecent] = useState(false);
    // Vehicle/service state
    const [vehicleServices, setVehicleServices] = useState(null);
    const [vehicleApiError, setVehicleApiError] = useState(null);

    useEffect(() => {
        if (sidebarOpen) {
            const saved = localStorage.getItem('taxiProfile');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    setProfileName(data.fullName || '');
                    setProfilePhone(data.phone || '');
                } catch {}
            }
        }
    }, [sidebarOpen]);

    useEffect(() => {
        async function fetchRecentLocs() {
            setRecentLocApiWarning('');
            const apiLocs = await getRecentLocations();
            if (apiLocs && Array.isArray(apiLocs)) {
                setRecentLocations(apiLocs);
            } else {
                setRecentLocApiWarning('Recent locations API failed, using localStorage fallback.');
                const stored = localStorage.getItem('recentTaxiLocations');
                if (stored) {
                    try {
                        setRecentLocations(JSON.parse(stored));
                    } catch {
                        setRecentLocations([]);
                    }
                }
            }
        }
        fetchRecentLocs();
    }, []);

    useEffect(() => {
        // Fetch vehicle/service list from backend
        async function fetchVehicles() {
            try {
                // TODO: Replace with real token logic if needed
                const token = localStorage.getItem('token');
                const res = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.TAXI_VEHICLES), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data && res.data.success && Array.isArray(res.data.data)) {
                    setVehicleServices(res.data.data);
                } else {
                    setVehicleApiError('API returned unexpected data');
                }
            } catch (err) {
                // If forbidden/unauthorized, fallback to static data
                setVehicleApiError(err.response?.status === 401 || err.response?.status === 403 ? 'Not authorized to access vehicle API' : 'Failed to fetch vehicle data');
                setVehicleServices(null);
            }
        }
        fetchVehicles();
    }, []);

    const addRecentLocation = (location) => {
        setRecentLocations(prev => {
            const filtered = prev.filter(l => l.title !== location.title);
            const updated = [location, ...filtered].slice(0, 5);
            localStorage.setItem('recentTaxiLocations', JSON.stringify(updated));
            return updated;
        });
    };

    const handleSearchClick = () => {
        navigate("/select-location");
    };

    // Defensive icon mapping for vehicles
    const getVehicleIcon = (vehicle) => {
        // Use vehicle.photo or vehicle.image_url if available and is a string
        if (vehicle && typeof vehicle.photo === 'string' && vehicle.photo.startsWith('http')) {
            return vehicle.photo;
        }
        if (vehicle && typeof vehicle.image_url === 'string' && vehicle.image_url.startsWith('http')) {
            return vehicle.image_url;
        }
        // Fallback to default taxi icon
        return 'https://img.icons8.com/color/48/taxi.png';
    };
    // TODO: Replace with API - Vehicle/Service List
    const explore = vehicleServices
        ? vehicleServices.map(v => ({ label: v.model || v.make || 'Vehicle', icon: getVehicleIcon(v) }))
        : [
            { label: "Bike", icon: "https://img.icons8.com/color/48/motorcycle.png" },
            { label: "SUV", icon: "https://img.icons8.com/color/48/suv--v1.png" },
            { label: "Cab Economy", icon: "https://img.icons8.com/color/48/taxi.png" },
            { label: "Auto", icon: "https://img.icons8.com/color/48/auto-rickshaw.png" }
        ];
    // TODO: Replace with API - All Services List
    const allServices = vehicleServices
        ? vehicleServices.map(v => ({ label: v.model || v.make || 'Vehicle', icon: getVehicleIcon(v) }))
        : [
            { label: "Bike Rental", icon: "https://img.icons8.com/color/48/motorcycle.png" },
            { label: "Car Rental", icon: "https://img.icons8.com/color/48/car.png" },
            { label: "Cab Economy", icon: "https://img.icons8.com/color/48/taxi.png" },
            { label: "Auto", icon: "https://img.icons8.com/color/48/auto-rickshaw.png" },
            { label: "Bike", icon: "https://img.icons8.com/color/48/motorcycle.png" },
            { label: "Bike Pink", icon: "https://img.icons8.com/color/48/scooter.png" },
            { label: "Bike Lite", icon: "https://img.icons8.com/color/48/bicycle.png" },
            { label: "Cab Premium", icon: "https://img.icons8.com/color/48/sedan.png" },
            { label: "Shared Auto", icon: "https://img.icons8.com/color/48/bus.png" }
        ];
    // TODO: Replace with API - Go Places List
    const goPlaces = [
        { title: "Chennai International Airp...", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" },
        { title: "Chennai Central Railway Station", img: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80" },
        { title: "Chennai Bus Stand", img: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80" }
    ];
    // TODO: Replace with API - Profile and Recent Locations
    // Profile and recent locations are currently loaded from localStorage. Should be fetched from backend API for persistence across devices.
    // Example API endpoints needed: /api/user/profile, /api/taxi/recent-locations

    // Defensive image getter for Go Places
    const getGoPlaceImg = (place) => {
        if (place && typeof place.img === 'string' && place.img.startsWith('http')) {
            return place.img;
        }
        // Fallback to a default scenic image
        return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
            <div className="shadow">
  <HeaderInsideTaxi />
</div>
            {/* Sidebar Drawer */}
            {sidebarOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-50 bg-black bg-opacity-40 transition-opacity duration-300"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                    {/* Sidebar */}
                    <div className="fixed top-0 left-0 z-50 h-full w-60 max-w-full bg-white shadow-xl transition-transform duration-300 animate-slidein flex flex-col rounded-r-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <span className="text-base font-semibold">Menu</span>
                            <button onClick={() => setSidebarOpen(false)} className="text-xl text-gray-400 hover:text-gray-700 leading-none">&times;</button>
                        </div>
                        {/* Profile Card */}
                        <div
                            className="bg-white rounded-xl shadow p-3 mx-3 mt-3 mb-2 flex flex-col gap-2 cursor-pointer hover:bg-gray-100 transition"
                            onClick={() => { setSidebarOpen(false); navigate('/home-taxi/account'); }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg width="28" height="28" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 8-4 8-4s8 0 8 4"/></svg>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm text-gray-800">{profileName || 'Your Name'}</div>
                                    <div className="text-xs text-gray-500">{profilePhone || 'Your Phone'}</div>
                                </div>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <svg width="14" height="14" fill="none" stroke="#FFD700" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12,2 15,8.5 22,9.3 17,14.1 18.2,21 12,17.8 5.8,21 7,14.1 2,9.3 9,8.5"/></svg>
                                <span className="text-xs font-medium text-gray-700">5.00 My Rating</span>
                            </div>
                        </div>
                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto px-1 pb-4">
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                            } label="Help" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/help'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
                            } label="Payment" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/payment'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></svg>
                            } label="My Rides" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/my-rides'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                            } label="Safety" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/safety'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
                            } label="Refer and Earn" subLabel="Get ₹50" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/refer'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
                            } label="My Rewards" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/rewards'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
                            } label="Power Pass" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/power-pass'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                            } label="Taxi Coins" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/coins'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
                            } label="Notifications" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/notification'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
                            } label="Claims" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/claims'); }} />
                            <SidebarMenuItem icon={
                                <svg width="22" height="22" fill="none" stroke="#888" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/></svg>
                            } label="Settings" onClick={() => { setSidebarOpen(false); navigate('/home-taxi/settings'); }} />
                            {/* Banner */}
                            <div className="bg-yellow-50 rounded-xl p-3 mt-4 flex items-center gap-3">
                                <div className="flex-1 text-xs text-yellow-900 font-semibold">Earn money with Rapido<br /><span className="text-[10px] font-normal">Become a Captain!</span></div>
                                <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=80&q=80" alt="banner" className="w-16 h-12 rounded-lg object-cover" />
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* Main Content */}
            <div className="absolute top-[64px] bottom-[64px] left-0 right-0 overflow-y-auto">
                {/* Search Bar */}
                <div className="p-4 bg-gradient-to-r from-blue-50 via-blue-100 to-white rounded-b-3xl shadow-sm">
                    <div className="flex items-center bg-blue-50 border border-blue-200 rounded-full px-4 py-3 shadow-sm">
                        {/* Hamburger menu icon */}
                        <span onClick={() => setSidebarOpen(true)} className="mr-3 cursor-pointer">
                            <svg width="24" height="24" fill="none" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                        </span>
                        <div className="flex items-center flex-1 cursor-pointer" onClick={handleSearchClick}>
                            <img src={search} alt="search" className="w-5 h-5 mr-3" />
                            <span className="text-blue-600 font-medium flex-1">Where are you going?</span>
                        </div>
                    </div>
                </div>
                {/* Recent Locations */}
                <div className="bg-white bg-opacity-80 px-4 pt-2 pb-3 rounded-2xl shadow-sm border-l-2 border-blue-100 mt-2">
                    {recentLocations.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-4">No recent locations yet.</div>
                    ) : (
                        <>
                        <div className="flex flex-col gap-3">
                            {recentLocations.slice(0, 3).map((loc, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center p-3 bg-white rounded-xl shadow border border-blue-100 cursor-pointer hover:bg-blue-50 transition min-w-0"
                                    onClick={() => {
                                        localStorage.setItem('dropLocation', JSON.stringify(loc));
                                        navigate('/select-location', { state: { dropLocation: typeof loc.title === 'string' ? loc.title : '' } });
                                    }}
                                >
                                    {/* Location Pin Icon (left) */}
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-3">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 0 1 16 0c0 4.97-3.582 9-8 9z"/><circle cx="12" cy="12" r="3"/></svg>
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-sm text-blue-700 truncate whitespace-nowrap">{typeof loc.title === 'string' ? loc.title : 'Unknown Location'}</div>
                                        <div className="text-xs text-gray-500 truncate whitespace-nowrap">{typeof loc.address === 'string' ? loc.address : ''}</div>
                                    </div>
                                    {/* Blue heart icon (right) */}
                                    <span className="ml-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#2563eb" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                    </span>
                                </div>
                            ))}
                        </div>
                        </>
                    )}
                </div>
                {/* Show API warning in the UI */}
                {recentLocApiWarning && <div style={{ color: 'orange', fontSize: 12 }}>{recentLocApiWarning}</div>}
                {/* Explore Section */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-4 mt-4 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-base text-blue-700 tracking-wide">Explore</span>
                        <button className="text-blue-600 bg-blue-100 hover:bg-blue-200 text-xs font-medium px-3 py-1 rounded-full shadow-sm transition duration-200" onClick={() => setShowAllServices(true)}>View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {explore.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center min-w-[70px]">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                                    <img src={typeof item.icon === 'string' ? item.icon : 'https://img.icons8.com/color/48/taxi.png'} alt={item.label} className="w-7 h-7" />
                                </div>
                                <span className="text-xs text-gray-700 text-center">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Banner */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mx-4 my-3 flex items-center gap-3">
                    <div className="flex-1 text-xs text-yellow-900 font-semibold">Thank you for helping us reach the mark of <span className="font-bold">4000000 rides a day!</span><br /><span className="text-[10px] font-normal">Keep riding with us</span></div>
                    <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=80&q=80" alt="banner" className="w-16 h-12 rounded-lg object-cover" />
                </div>
                {/* Go Places with Taxi */}
                {goPlaces.length > 0 && (
  <div className="mt-6 px-4">
    <div className="font-semibold text-base text-gray-800 mb-2">Go Places with Taxi</div>
    <div className="flex gap-3 overflow-x-auto pb-2">
      {goPlaces.map((place, idx) => (
        <div key={idx} className="min-w-[120px] bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
          <img src={getGoPlaceImg(place)} alt={typeof place.title === 'string' ? place.title : 'Place'} className="w-full h-20 object-cover" />
          <div className="p-2 text-xs font-semibold text-gray-700 truncate">{typeof place.title === 'string' ? place.title : 'Unknown Place'}</div>
        </div>
      ))}
    </div>
  </div>
)}
                {/* Show dev warning if API fails */}
                {vehicleApiError && (
                    <div style={{ color: 'red', fontSize: 12, margin: 8 }}>Vehicle API error: {vehicleApiError} (showing static data)</div>
                )}
            </div>
            <FooterTaxi />
            {/* All Services Modal/Bottom Sheet */}
            {showAllServices && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40">
                    <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl p-4 pb-8 relative animate-slideup shadow-lg">
                        <button
                            className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700"
                            onClick={() => setShowAllServices(false)}
                        >
                            &times;
                        </button>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div className="font-bold text-lg text-gray-800 mb-4 text-center">All services</div>
                        <div className="grid grid-cols-4 gap-4">
                            {allServices.map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-2 shadow-sm border border-blue-100">
    <img src={typeof item.icon === 'string' ? item.icon : 'https://img.icons8.com/color/48/taxi.png'} alt={item.label} className="w-8 h-8" />
</div>
<span className="text-xs text-blue-700 text-center font-normal mt-1">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomeScreenTaxi;
