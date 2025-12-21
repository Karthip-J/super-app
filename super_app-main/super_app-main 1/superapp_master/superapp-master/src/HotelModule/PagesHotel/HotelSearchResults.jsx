// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import FooterHotel from '../ComponentsHotel/FooterHotel';
// import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';

// function HotelSearchResults() {
//     const location = useLocation();
//     const navigate = useNavigate();
//     const { hotels, city = '', checkInDate = '', checkOutDate = '', roomsGuests = '' } = location.state || {};
//     const safeHotels = Array.isArray(hotels) ? hotels : [];

//     const handleBookNow = (hotel) => {
//         navigate('/hotel-booking', { state: { hotel, city, checkInDate, checkOutDate, roomsGuests } });
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 pb-16">
//             {/* Custom Hotel Search Header */}
//             <header className="fixed top-0 left-0 w-full z-50 bg-sky-600 shadow-md flex items-center px-2 md:px-6 h-14 md:h-20">
//                 <button
//                     onClick={() => navigate(-1)}
//                     className="text-white hover:text-sky-200 focus:outline-none mr-2 md:mr-4 p-1 md:p-2 rounded-full"
//                     aria-label="Go back"
//                 >
//                     <ArrowLeft size={24} className="md:w-8 md:h-8" />
//                 </button>
//                 <h1 className="text-lg md:text-2xl font-bold text-white tracking-wide">Hotel Search</h1>
//             </header>
//             {/* Search summary bar */}
//             <div className="fixed top-14 md:top-20 left-0 w-full z-40 bg-white shadow flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-1 md:gap-y-2 text-xs md:text-sm text-gray-600 px-2 md:px-6 py-2 border-b border-gray-100">
//                 <div className="flex items-center gap-1">
//                     <MapPin size={16} className="text-sky-500" />
//                     <span>{city || 'N/A'}</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <Calendar size={16} className="text-sky-500" />
//                     <span>{checkInDate || 'N/A'} - {checkOutDate || 'N/A'}</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <Users size={16} className="text-sky-500" />
//                     <span>{roomsGuests || 'N/A'}</span>
//                 </div>
//             </div>
//             <div className="pt-28 md:pt-32 px-1 md:px-2 max-w-xs md:max-w-3xl mx-auto">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
//                     {safeHotels.length === 0 && <div className="text-xs text-gray-500">No hotels found.</div>}
//                     {safeHotels.map((hotel) => (
//                         <div key={hotel.id} className="bg-white rounded-xl md:rounded-2xl shadow flex flex-col overflow-hidden border border-gray-100">
//                             <img src={hotel.image} alt={hotel.name} className="w-full h-20 md:h-32 object-cover" />
//                             <div className="flex-1 flex flex-col p-2 md:p-4">
//                                 <div className="font-bold text-base md:text-lg text-gray-900 mb-0.5 md:mb-1">{hotel.name}</div>
//                                 <div className="text-gray-600 text-xs md:text-sm mb-1 md:mb-2">24 hours air conditioning with free wifi and room service</div>
//                                 <div className="mt-auto pt-1 md:pt-2">
//                                     <button onClick={() => navigate(`/hotel-details/${hotel.id}`)} className="w-full bg-sky-600 text-white font-semibold py-1 md:py-2 rounded-lg shadow hover:bg-sky-700 transition text-xs md:text-base">View Details</button>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//             <div className="fixed bottom-0 left-0 w-full z-50">
//                 <FooterHotel />
//             </div>
//         </div>
//     );
// }

// export default HotelSearchResults;




import API_CONFIG from "../../config/api.config.js";
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FooterHotel from '../ComponentsHotel/FooterHotel';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import axios from 'axios';

function HotelSearchResults() {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        city = '',
        checkInDate = '',
        checkOutDate = '',
        roomsGuests = ''
    } = location.state || {};

    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(API_CONFIG.getUrl(`/api/hotels?city=${city}`), {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setHotels(response.data.data || []);
            } catch (err) {
                console.error('Error fetching hotels:', err);
                setError('Failed to fetch hotels.');
            } finally {
                setLoading(false);
            }
        };

        if (city) {
            fetchHotels();
        } else {
            setLoading(false);
            setError('City not specified.');
        }
    }, [city]);

    const getImageUrl = (path) => {
        if (!path) return '/placeholder-image.png';
        return path.startsWith('http') ? path : API_CONFIG.getUrl(path);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Header */}
            <header className="fixed top-0 left-0 w-full z-50 bg-sky-600 shadow-md flex items-center px-2 md:px-6 h-14 md:h-20">
                <button
                    onClick={() => navigate(-1)}
                    className="text-white hover:text-sky-200 focus:outline-none mr-2 md:mr-4 p-1 md:p-2 rounded-full"
                >
                    <ArrowLeft size={24} className="md:w-8 md:h-8" />
                </button>
                <h1 className="text-lg md:text-2xl font-bold text-white tracking-wide">Hotel Search</h1>
            </header>

            {/* Filter Summary */}
            <div className="fixed top-14 md:top-20 left-0 w-full z-40 bg-white shadow flex flex-wrap items-center gap-x-2 md:gap-x-4 gap-y-1 md:gap-y-2 text-xs md:text-sm text-gray-600 px-2 md:px-6 py-2 border-b border-gray-100">
                <div className="flex items-center gap-1">
                    <MapPin size={16} className="text-sky-500" />
                    <span>{city}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Calendar size={16} className="text-sky-500" />
                    <span>{checkInDate || 'N/A'} - {checkOutDate || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Users size={16} className="text-sky-500" />
                    <span>{roomsGuests || 'N/A'}</span>
                </div>
            </div>

            {/* Hotel Results */}
            <div className="pt-28 md:pt-32 px-1 md:px-2 max-w-xs md:max-w-4xl mx-auto">
                {loading && (
                    <div className="text-center text-gray-500 text-sm py-6">Loading hotels...</div>
                )}
                {error && (
                    <div className="text-center text-red-500 text-sm py-6">{error}</div>
                )}
                {!loading && !error && hotels.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-6">No hotels found in "{city}".</div>
                )}

                {!loading && hotels.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                        {hotels.map((hotel) => (
                            <div
                                key={hotel._id}
                                className="bg-white rounded-xl shadow border border-gray-100 flex flex-col overflow-hidden"
                            >
                                <img
                                    src={getImageUrl(hotel.main_image)}
                                    alt={hotel.name}
                                    className="w-full h-20 md:h-32 object-cover"
                                    onError={(e) => {
                                        console.error('Failed to load hotel image:', hotel.main_image);
                                        e.target.onerror = null; // Prevent infinite loop
                                        e.target.src = '/placeholder-image.png';
                                        e.target.alt = `${hotel.name} - Image not available`;
                                    }}
                                />
                                <div className="flex-1 flex flex-col p-2 md:p-4">
                                    <div className="font-bold text-base md:text-lg text-gray-900 mb-0.5 md:mb-1">{hotel.name}</div>
                                    <div className="text-gray-600 text-xs md:text-sm mb-1 md:mb-2">
                                        {hotel.description?.slice(0, 60) || '24hr AC, Free WiFi, Room Service'}
                                    </div>
                                    <div className="mt-auto pt-1 md:pt-2">
                                        <button
                                            onClick={() => navigate(`/hotel-details/${hotel._id}`)}
                                            className="w-full bg-sky-600 text-white font-semibold py-1 md:py-2 rounded-lg shadow hover:bg-sky-700 transition text-xs md:text-base"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full z-50">
                <FooterHotel />
            </div>
        </div>
    );
}

export default HotelSearchResults;
