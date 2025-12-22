import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  Navigation,
  CreditCard,
  ShieldCheck,
  Star
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = API_CONFIG.GOOGLE_MAPS_API_KEY;
const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 13.0827, lng: 80.2707 };

const BookService = () => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const { category } = locationState.state || {};

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [customAddress, setCustomAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: '',
    pinCode: '',
    coordinates: { lat: null, lng: null }
  });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM'
  ];

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

  useEffect(() => {
    if (!category) {
      navigate('/urban-services');
      return;
    }
    fetchAddresses();
  }, [category, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SAVED_ADDRESSES), {
        headers: API_CONFIG.getAuthHeaders()
      });

      const addressesData = response.data;
      setAddresses(Array.isArray(addressesData) ? addressesData : (addressesData?.addresses || []));
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || (!selectedAddress && !customAddress.addressLine1)) {
      alert('Please fill in all required details');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        category: category._id,
        service: category._id,
        address: selectedAddress !== 'new' ? selectedAddress : null,
        customAddress: selectedAddress === 'new' ? customAddress : null,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        description,
        pricing: {
          type: category.pricingType,
          basePrice: category.minPrice,
          totalAmount: category.minPrice
        }
      };

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      console.log('BookService: Using token:', token ? 'Token exists' : 'No token found', token);

      if (!token) {
        alert('Authentication error: No login token found. Please login again.');
        navigate('/login');
        return;
      }

      // Use API_CONFIG if available, or fallback to relative path
      // Assuming API_CONFIG is imported or we can use the same logic
      // Ideally we should import API_CONFIG. For now we will rely on axios proxy but add logs.

      console.log('BookService: Sending request to /api/urban-services/bookings');

      console.log('BookService: Submitting booking request...');
      const response = await axios.post(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.URBAN_BOOKINGS), bookingData, {
        headers: API_CONFIG.getAuthHeaders()
      });


      console.log('BookService: Response success:', response.data);

      if (response.data.success) {
        navigate(`/urban-services/booking/${response.data.data._id}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking. Please try again.';

      if (error.response?.status === 401) {
        alert(`${errorMessage} (Session issue)`);
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
        return;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        if (isLoaded && window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const res = results[0];
              const getComp = (type) => res.address_components.find(c => c.types.includes(type))?.long_name || '';
              setCustomAddress({
                addressLine1: res.formatted_address.split(',')[0],
                addressLine2: '',
                landmark: '',
                city: getComp('locality'),
                state: getComp('administrative_area_level_1'),
                pinCode: getComp('postal_code'),
                coordinates: { lat: latitude, lng: longitude }
              });
            }
            setLoading(false);
          });
        } else {
          setCustomAddress(prev => ({ ...prev, coordinates: { lat: latitude, lng: longitude } }));
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
  };

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState(defaultCenter);

  const handleMapConfirm = () => {
    handleMapConfirmInternal(mapCoordinates);
  };

  const handleMapConfirmInternal = async (coords) => {
    setLoading(true);
    setShowMapModal(false);
    if (isLoaded && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const res = results[0];
          const getComp = (type) => res.address_components.find(c => c.types.includes(type))?.long_name || '';
          setCustomAddress({
            addressLine1: getComp('route') || res.formatted_address.split(',')[0],
            addressLine2: '',
            landmark: '',
            city: getComp('locality'),
            state: getComp('administrative_area_level_1'),
            pinCode: getComp('postal_code'),
            coordinates: coords
          });
        }
        setLoading(false);
      });
    } else {
      setCustomAddress(prev => ({ ...prev, coordinates: coords }));
      setLoading(false);
    }
  };

  if (!category) return null;

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans">
      {/* Enhanced Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 h-16 flex items-center">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/urban-services')}
            className="flex items-center gap-2 text-gray-900 font-semibold hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>{category.name}</span>
          </button>
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="pro" />
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-500">4.8 ★ Trusted Pros</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr,400px] gap-8">
            {/* Left Column: Form */}
            <div className="space-y-6">
              {/* Address Section */}
              <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Select service address</h2>
                    <p className="text-sm text-gray-500">Where should the pro reach?</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddress(address._id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${selectedAddress === address._id ? 'border-blue-600 bg-blue-50/30' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddress === address._id ? 'border-blue-600' : 'border-gray-300'}`}>
                        {selectedAddress === address._id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{address.addressLine1}</p>
                        <p className="text-xs text-gray-500">{address.city}, {address.state}</p>
                      </div>
                    </div>
                  ))}
                  <div
                    onClick={() => setSelectedAddress('new')}
                    className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center gap-4 ${selectedAddress === 'new' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                      <Navigation size={20} />
                    </div>
                    <div>
                      <p className="font-bold">Add a new address</p>
                      <p className="text-xs text-gray-500">Use current location or pick from map</p>
                    </div>
                  </div>
                </div>

                {selectedAddress === 'new' && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-3xl space-y-4">
                    <div className="flex gap-3 mb-4">
                      <button type="button" onClick={fetchCurrentLocation} className="flex-1 bg-white border border-gray-200 h-12 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <Navigation size={16} className="text-blue-600" /> Use GPS
                      </button>
                      <button type="button" onClick={() => setShowMapModal(true)} className="flex-1 bg-white border border-gray-200 h-12 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <MapPin size={16} className="text-blue-600" /> Open Map
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="H.No / Floor" className="bg-white border-0 h-12 px-4 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500" value={customAddress.addressLine1} onChange={e => setCustomAddress({ ...customAddress, addressLine1: e.target.value })} />
                        <input placeholder="Road / Locality" className="bg-white border-0 h-12 px-4 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500" value={customAddress.addressLine2} onChange={e => setCustomAddress({ ...customAddress, addressLine2: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input placeholder="City" className="bg-white border-0 h-12 px-4 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500" value={customAddress.city} onChange={e => setCustomAddress({ ...customAddress, city: e.target.value })} />
                        <input placeholder="Zip Code" className="bg-white border-0 h-12 px-4 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-blue-500" value={customAddress.pinCode} onChange={e => setCustomAddress({ ...customAddress, pinCode: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Slot Selection */}
              <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Choose your slot</h2>
                    <p className="text-sm text-gray-500">Pros take usually 2 hrs per booking</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Select Date</p>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="bg-gray-50 border-0 h-12 px-4 rounded-xl text-sm shadow-inner w-full focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Select Time</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlots.map(time => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`h-11 rounded-xl text-xs font-bold transition-all ${selectedTime === time ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Requirements */}
              <section className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                    <Info size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Extra instructions</h2>
                    <p className="text-sm text-gray-500">Optional notes for the professional</p>
                  </div>
                </div>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Please call before arriving, bring extra cleaning supplies..."
                  className="bg-gray-50 border-0 w-full p-4 rounded-2xl text-sm min-h-[120px] shadow-inner focus:ring-2 focus:ring-orange-500"
                />
              </section>
            </div>

            {/* Right Column: Checkout Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-xl lg:sticky lg:top-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
                    {category.icon || '🛠️'}
                  </div>
                  <div>
                    <h3 className="font-black text-xl leading-tight">{category.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">{category.estimatedDuration} mins</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Item total</span>
                    <span className="font-bold text-sm">₹{category.minPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="text-sm flex items-center gap-1.5">
                      <CreditCard size={14} /> Referral discount
                    </span>
                    <span className="font-bold text-sm">-₹0</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="font-black text-lg">Total amount</span>
                    <span className="font-black text-2xl text-blue-600">₹{category.minPrice}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-8 h-14 rounded-2xl bg-black text-white font-black hover:bg-black/90 disabled:bg-gray-300 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-black/20"
                >
                  {loading ? 'Processing...' : 'Book Service'}
                </button>

                <div className="mt-8 space-y-4">
                  <div className="flex gap-3 items-start">
                    <ShieldCheck size={18} className="text-gray-400 shrink-0" />
                    <p className="text-[11px] text-gray-400 leading-relaxed uppercase tracking-wider font-bold">City Bell Insurance Protection included</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 size={18} className="text-gray-400 shrink-0" />
                    <p className="text-[11px] text-gray-400 leading-relaxed uppercase tracking-wider font-bold">Pay after service completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0">
              <h3 className="text-xl font-bold">Pick location on map</h3>
              <button onClick={() => setShowMapModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                <ChevronLeft className="rotate-90" />
              </button>
            </div>
            <div className="flex-1 relative">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCoordinates}
                  zoom={15}
                  onLoad={onMapLoad}
                  onClick={(e) => setMapCoordinates({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                >
                  <Marker position={mapCoordinates} draggable={true} onDragEnd={(e) => setMapCoordinates({ lat: e.latLng.lat(), lng: e.latLng.lng() })} />
                </GoogleMap>
              ) : (
                <div className="h-full flex items-center justify-center">Loading Maps...</div>
              )}
            </div>
            <div className="p-8 bg-white border-t">
              <button
                onClick={handleMapConfirm}
                className="w-full h-14 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
              >
                Confirm this location
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Outfit', sans-serif !important; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
        }
      `}} />
    </div>
  );
};

export default BookService;

