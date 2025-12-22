import API_CONFIG from "../../config/api.config.js";
import React, { useEffect, useState } from 'react';
import HotelImage1 from '../ImagesHotel/HotelImage1.svg';

const CitiesAndRecommendedHotel = ({
  navigate = () => { },
  handleCityClick = () => { },
  detectedCity = null
}) => {
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [popularCities, setPopularCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const token = localStorage.getItem('token') || 'demo-token';
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.HOTELS), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();

        const hotels = Array.isArray(result?.data) ? result.data : [];

        // Sort hotels by creation time if available (descending, recent last)
        const sortedHotels = hotels.slice().reverse(); // assumes last is newest
        setRecommendedHotels(sortedHotels);

        const cityMap = {};
        sortedHotels.forEach((hotel) => {
          const city = hotel.address?.city;
          if (city && !cityMap[city]) {
            cityMap[city] = {
              name: city,
              image: hotel.main_image
                ? API_CONFIG.getImageUrl(hotel.main_image)
                : HotelImage1,
              description: `Explore stays in ${city}`
            };
          }
        });

        // Get only first 6 unique cities
        const uniqueCities = Object.values(cityMap).slice(0, 6);
        setPopularCities(uniqueCities);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []); // Empty dependency array - only run once on mount

  // Add a section for nearby hotels if location is detected
  const renderNearbyHotels = () => {
    if (!detectedCity || !detectedCity.city) return null;

    // Filter hotels by detected city
    const nearbyHotels = recommendedHotels.filter(hotel =>
      hotel.address?.city?.toLowerCase().includes(detectedCity.city.toLowerCase()) ||
      detectedCity.city.toLowerCase().includes(hotel.address?.city?.toLowerCase())
    ).slice(0, 3);

    if (nearbyHotels.length === 0) return null;

    return (
      <div className="max-w-6xl mx-auto mt-8 px-2">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">Hotels Near You</h2>
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory relative scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
          {nearbyHotels.map((hotel) => (
            <div
              key={hotel._id}
              className="min-w-[60vw] max-w-[70vw] md:min-w-[200px] md:max-w-[220px] bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-0 overflow-hidden flex flex-col cursor-pointer group flex-shrink-0 snap-start border border-gray-100 md:p-0"
              onClick={() => navigate(`/hotel-details/${hotel._id}`)}
            >
              <div className="relative h-28 md:h-28 w-full overflow-hidden">
                <img
                  src={hotel.main_image ? API_CONFIG.getImageUrl(hotel.main_image) : HotelImage1}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2 md:p-3 flex-1 flex flex-col justify-between">
                <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 truncate">{hotel.name}</h3>
                <p className="text-xs md:text-sm text-gray-600 mb-1 truncate">{hotel.address?.city || 'No Location'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Nearby Hotels Section (if location detected) */}
      {renderNearbyHotels()}

      {/* Popular Cities Section */}
      <div className="max-w-4xl mx-auto mt-6 px-2">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-800">Explore Popular Cities</h2>
        <div className="flex flex-row gap-3 md:gap-4 overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible pb-2 md:pb-0 scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
          {popularCities.map((city, index) => (
            <div
              key={index}
              className="min-w-[50vw] max-w-[60vw] md:min-w-0 md:max-w-none relative rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow group flex-shrink-0 snap-start border border-gray-100"
              onClick={() => handleCityClick(city.name)}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="w-full aspect-square md:aspect-[4/3] bg-gray-200 overflow-hidden max-h-32 md:max-h-24">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-1 md:p-2">
                <h3 className="text-xs md:text-sm font-semibold truncate">{city.name}</h3>
                <p className="text-[10px] md:text-xs truncate">{city.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Hotels Section */}
      <div className="max-w-6xl mx-auto mt-8 px-2 pb-32">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">Recommended for you</h2>

        {loading ? (
          <p className="text-center text-sky-600 font-medium">Loading hotels...</p>
        ) : (
          <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory relative scrollbar-hide -mx-2 px-2 md:mx-0 md:px-0">
            {recommendedHotels.map((hotel) => (
              <div
                key={hotel._id}
                className="min-w-[60vw] max-w-[70vw] md:min-w-[200px] md:max-w-[220px] bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-0 overflow-hidden flex flex-col cursor-pointer group flex-shrink-0 snap-start border border-gray-100 md:p-0"
                onClick={() => navigate(`/hotel-details/${hotel._id}`)}
              >
                <div className="relative h-28 md:h-28 w-full overflow-hidden">
                  <img
                    src={hotel.main_image ? API_CONFIG.getImageUrl(hotel.main_image) : HotelImage1}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2 md:p-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 truncate">{hotel.name}</h3>
                  <p className="text-xs md:text-sm text-gray-600 mb-1 truncate">{hotel.address?.city || 'No Location'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CitiesAndRecommendedHotel;