import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { city, checkInDate, checkOutDate, roomsGuests, hotels } = location.state || {};

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-md py-4 px-6 fixed top-0 left-0 w-full z-50">
                <h1 className="text-2xl font-bold text-blue-800">Search Results</h1>
                <div className="text-sm text-gray-600 mt-1">
                    {city} • {checkInDate} - {checkOutDate} • {roomsGuests}
                </div>
            </div>

            {/* Search Results */}
            <div className="pt-24 px-4 pb-20">
                {hotels && hotels.length > 0 ? (
                    hotels.map((hotel) => (
                        <div
                            key={hotel.id}
                            className="bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => navigate(`/hotel-details/${hotel.id}`)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold">{hotel.name}</h2>
                                    <div className="flex items-center text-gray-600 mt-1">
                                        <FaMapMarkerAlt className="mr-1" />
                                        <span>{hotel.location}</span>
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <FaStar className="text-yellow-400 mr-1" />
                                        <span className="font-medium">{hotel.rating}</span>
                                        <span className="text-gray-500 ml-1">({hotel.reviews} reviews)</span>
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="text-2xl font-bold text-[#5C3FFF]">${hotel.price}</p>
                                    <p className="text-gray-500">per night</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <h2 className="text-xl font-semibold text-gray-700">No hotels found</h2>
                        <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
                    </div>
                )}
            </div>

            {/* Back Button */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-full bg-[#5C3FFF] text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
                >
                    Back to Search
                </button>
            </div>
        </div>
    );
};

export default SearchResults; 