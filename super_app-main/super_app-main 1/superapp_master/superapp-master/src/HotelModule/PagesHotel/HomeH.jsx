import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import { Search, Calendar, Bed, MapPin } from 'lucide-react';
import FooterHotel from '../ComponentsHotel/FooterHotel';
import GuestsHotel from '../ComponentsHotel/GuestsHotel';
import HotelCalendar from '../ComponentsHotel/HotelCalendar';
import { searchLocations, getPopularLocations, getHotelsByCity } from '../Services/hotelApi';
import HotelImage1 from '../ImagesHotel/HotelImage1.svg';
import CitiesAndRecommendedHotel from '../ComponentsHotel/CitiesAndRecommendedHotel';

function HomeH() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [roomsGuests, setRoomsGuests] = useState('');
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [sortBy, setSortBy] = useState('Recommended');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    budget: [],
    popular: [],
    facilities: [],
    property: [],
    review: [],
    room: [],
    rating: [],
    location: [],
  });
  const [popularLocations, setPopularLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Location detection states
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [detectedCity, setDetectedCity] = useState({
    area: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loadingCity, setLoadingCity] = useState(false);

  // Custom toast notification (same as e-commerce)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Location detection effect
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          setLoadingLocation(false);
        },
        (error) => {
          let errorMessage = "Location access denied.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
              break;
          }
          setLocationError(errorMessage);
          setLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError("Geolocation not supported");
      setLoadingLocation(false);
    }
  }, []);

  // Reverse geocoding to get city from coordinates
  useEffect(() => {
    if (location && !locationError) {
      setLoadingCity(true);
      fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          const address = data.address;
          const area =
            address.suburb ||
            address.neighbourhood ||
            address.quarter ||
            address.village ||
            address.town ||
            "";
          const cityName =
            address.city ||
            address.town ||
            address.village ||
            address.hamlet ||
            address.county ||
            "";
          const state = address.state || "";
          const pincode = address.postcode || "";
          setDetectedCity({ area, city: cityName, state, pincode });
          setLoadingCity(false);
        })
        .catch(() => {
          setDetectedCity({ area: "", city: "", state: "", pincode: "" });
          setLoadingCity(false);
        });
    }
  }, [location, locationError]);

  const filterOptions = [
    {
      id: 'budget',
      label: 'Budget',
      options: ['₹0 - ₹2,000', '₹2,000 - ₹5,000', '₹5,000 - ₹10,000', '₹10,000 - ₹20,000', '₹20,000+'],
    },
    {
      id: 'popular',
      label: 'Popular',
      options: ['Free WiFi', 'Swimming Pool', 'Breakfast Included', 'Airport Shuttle', 'Parking'],
    },
    {
      id: 'facilities',
      label: 'Facilities',
      options: ['Restaurant', 'Bar', 'Gym', 'Spa', 'Business Center', 'Laundry'],
    },
    {
      id: 'property',
      label: 'Property',
      options: ['Hotel', 'Resort', 'Apartment', 'Villa', 'Guest House', 'Hostel'],
    },
    {
      id: 'review',
      label: 'Review',
      options: ['Excellent (9+)', 'Very Good (8+)', 'Good (7+)', 'Fair (6+)', 'Poor (5+)'],
    },
    {
      id: 'room',
      label: 'Room',
      options: ['Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Ocean View'],
    },
    {
      id: 'rating',
      label: 'Rating',
      options: ['5 Star', '4 Star', '3 Star', '2 Star', '1 Star'],
    },
    {
      id: 'location',
      label: 'Location',
      options: ['City Center', 'Beachfront', 'Airport', 'Downtown', 'Suburbs', 'Business District'],
    },
  ];

  const popularDestinations = [
    {
      id: 1,
      name: 'Mumbai',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Marine Drive
      description: 'The City of Dreams',
    },
    {
      id: 2,
      name: 'Chennai',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', // Marina Beach
      description: 'Gateway to South India',
    },
    {
      id: 3,
      name: 'Delhi',
      image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80', // India Gate
      description: 'Heart of India',
    },
    {
      id: 4,
      name: 'Hyderabad',
      image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80', // Charminar
      description: 'City of Pearls',
    },
    {
      id: 5,
      name: 'Kochi',
      image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80', // Chinese fishing nets
      description: 'Queen of Arabian Sea',
    },
    {
      id: 6,
      name: 'Gujarat',
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80', // Statue of Unity
      description: 'Land of Legends',
    },
  ];

  // Debounced search function to optimize API calls
  const debouncedSearchLocations = debounce(async (value) => {
    try {
      const results = await searchLocations(value);
      setLocationSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  }, 300);

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    if (value.length >= 2) {
      debouncedSearchLocations(value);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleLocationSelect = (location) => {
    setCity(location.name);
    setSelectedLocation(location);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (city.length >= 2) {
      debouncedSearchLocations(city);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleFilterSelect = (filterId, option) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: prev[filterId].includes(option)
        ? prev[filterId].filter((item) => item !== option)
        : [...prev[filterId], option],
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      budget: [],
      popular: [],
      facilities: [],
      property: [],
      review: [],
      room: [],
      rating: [],
      location: [],
    });
  };

  useEffect(() => {
    const loadPopularLocations = async () => {
      try {
        const locations = await getPopularLocations();
        setPopularLocations(locations);
      } catch (error) { }
    };
    loadPopularLocations();
  }, []);

  useEffect(() => {
    async function fetchRecommendedHotels() {
      // Cities to consider for recommendations
      const cities = ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kochi', 'gujarat'];
      let allHotels = [];
      for (const cityName of cities) {
        const hotels = await getHotelsByCity(cityName);
        const hotelsWithCity = hotels.map(hotel => ({ ...hotel, city: cityName }));
        allHotels = allHotels.concat(hotelsWithCity);
      }
      // Sort by reviewScore descending, then by reviews
      allHotels.sort((a, b) => b.reviewScore - a.reviewScore || b.reviews - a.reviews);
      setRecommendedHotels(allHotels.slice(0, 6));
    }
    fetchRecommendedHotels();
  }, []);

  const handleSearch = () => {
    if (!city.trim()) {
      showToast('Please enter a city or location', 'error');
      return;
    }
    navigate('/hotel-search-results', {
      state: {
        city: city.trim(),
        checkInDate,
        checkOutDate,
        roomsGuests
      }
    });
  };

  const handleDetectLocationClick = () => {
    if (detectedCity.city) {
      setCity(detectedCity.city);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Custom Hotel Search Header */}
      <header className="relative w-full z-50 bg-gradient-to-r from-sky-600 to-blue-700 shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Find Your Perfect Stay</h1>
            <p className="text-sky-100 mt-2">Search hotels in your destination</p>
          </div>

          {/* Location display */}
          <div className="w-full flex items-center gap-2 mb-4 bg-white/20 backdrop-blur-sm rounded-lg p-2">
            <MapPin className="w-5 h-5 text-white" />
            {(loadingLocation || loadingCity) && (
              <span className="text-sm text-white">Detecting location...</span>
            )}
            {!loadingLocation && !loadingCity && (detectedCity.area || detectedCity.city || detectedCity.pincode) && (
              <div className="flex flex-col">
                <span className="text-sm text-white font-medium">
                  {detectedCity.area && `${detectedCity.area}, `}
                  {detectedCity.city && `${detectedCity.city}, `}
                  {detectedCity.pincode}
                </span>
                <button
                  onClick={handleDetectLocationClick}
                  className="text-xs text-sky-200 hover:text-white underline"
                >
                  Use current location
                </button>
              </div>
            )}
            {!loadingLocation && !loadingCity && !(detectedCity.area || detectedCity.city || detectedCity.pincode) && (
              <span className="text-sm text-sky-100">Location unavailable</span>
            )}
            {!loadingLocation && locationError && (
              <span className="text-sm text-red-200">{locationError}</span>
            )}
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <div className="relative mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={city}
                  onChange={handleCityChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Where do you want to stay?"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {locationSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        <div className="font-medium">{suggestion.name}</div>
                        <div className="text-sm text-gray-500">{suggestion.fullName}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative">
                <button
                  className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowCheckOutCalendar(false);
                    setShowGuestsModal(false);
                    setShowCheckInCalendar(true);
                  }}
                >
                  <Calendar size={20} className="text-gray-500" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Check-in</div>
                    <div className="text-sm font-medium">
                      {checkInDate || 'Add dates'}
                    </div>
                  </div>
                </button>
                {showCheckInCalendar && (
                  <>
                    <div
                      className="fixed inset-0 bg-black bg-opacity-30 z-40"
                      onClick={() => setShowCheckInCalendar(false)}
                    ></div>
                    <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-auto">
                      <HotelCalendar
                        selectedDate={checkInDate}
                        onSelectDate={(date) => {
                          setCheckInDate(date);
                          setShowCheckInCalendar(false);
                        }}
                        onClose={() => setShowCheckInCalendar(false)}
                        title="Check-in Date"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="relative">
                <button
                  className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    setShowCheckInCalendar(false);
                    setShowGuestsModal(false);
                    setShowCheckOutCalendar(true);
                  }}
                >
                  <Calendar size={20} className="text-gray-500" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Check-out</div>
                    <div className="text-sm font-medium">
                      {checkOutDate || 'Add dates'}
                    </div>
                  </div>
                </button>
                {showCheckOutCalendar && (
                  <>
                    <div
                      className="fixed inset-0 bg-black bg-opacity-30 z-40"
                      onClick={() => setShowCheckOutCalendar(false)}
                    ></div>
                    <div className="absolute top-full right-0 mt-2 z-50 w-full sm:w-auto">
                      <HotelCalendar
                        selectedDate={checkOutDate}
                        onSelectDate={(date) => {
                          setCheckOutDate(date);
                          setShowCheckOutCalendar(false);
                        }}
                        onClose={() => setShowCheckOutCalendar(false)}
                        title="Check-out Date"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="relative mb-4">
              <button
                className="w-full flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setShowCheckInCalendar(false);
                  setShowCheckOutCalendar(false);
                  setShowGuestsModal(true);
                }}
              >
                <Bed size={20} className="text-gray-500" />
                <div className="text-left flex-1">
                  <div className="text-xs text-gray-500">Guests & Rooms</div>
                  <div className="text-sm font-medium">
                    {roomsGuests || 'Add guests'}
                  </div>
                </div>
              </button>
              {showGuestsModal && (
                <>
                  <div
                    className="fixed inset-0 bg-black bg-opacity-30 z-40"
                    onClick={() => setShowGuestsModal(false)}
                  ></div>
                  <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-auto">
                    <GuestsHotel
                      roomsGuests={roomsGuests}
                      setRoomsGuests={setRoomsGuests}
                      onClose={() => setShowGuestsModal(false)}
                    />
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-sky-700 hover:to-blue-800 transition-all shadow-md"
            >
              Search Hotels
            </button>
          </div>
        </div>
      </header>

      {/* Popular Destinations */}
      <section className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Destinations</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {popularDestinations.map((destination) => (
            <div
              key={destination.id}
              className="relative rounded-xl overflow-hidden shadow-md cursor-pointer group"
              onClick={() => {
                setCity(destination.name);
                navigate('/hotel-search-results', {
                  state: {
                    city: destination.name,
                    checkInDate,
                    checkOutDate,
                    roomsGuests
                  }
                });
              }}
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-3 text-white">
                <h3 className="font-bold">{destination.name}</h3>
                <p className="text-xs opacity-90">{destination.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Hotels */}
      <CitiesAndRecommendedHotel
        navigate={navigate}
        handleCityClick={setCity}
        detectedCity={detectedCity}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
          {toast.message}
        </div>
      )}

      <FooterHotel />
    </div>
  );
}

export default HomeH;