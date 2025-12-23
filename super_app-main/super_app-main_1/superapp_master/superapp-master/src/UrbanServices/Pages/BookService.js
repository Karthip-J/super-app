import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  Info,
  CheckCircle2,
  Navigation,
  CreditCard,
  ShieldCheck,
  Star,
  X,
  Plus
} from 'lucide-react';

const GOOGLE_MAPS_API_KEY = API_CONFIG.GOOGLE_MAPS_API_KEY;
const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 13.0827, lng: 80.2707 };
const API_BASE_URL = 'http://localhost:3000';

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

  const { isLoaded } = useJsApiLoader({
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
    window.scrollTo(0, 0);
  }, [category, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.SAVED_ADDRESSES), {
        headers: API_CONFIG.getAuthHeaders()
      });

      const addressesData = response.data;
      const fetchedAddresses = Array.isArray(addressesData) ? addressesData : (addressesData?.addresses || []);
      setAddresses(fetchedAddresses);

      // If there are saved addresses, select the first one by default
      if (fetchedAddresses.length > 0) {
        setSelectedAddress(fetchedAddresses[0]._id);
      } else {
        setSelectedAddress('new');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
      setSelectedAddress('new');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || (selectedAddress === 'new' && !customAddress.addressLine1)) {
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
      if (!token) {
        alert('Authentication error. Please login again.');
        navigate('/login');
        return;
      }

      const response = await axios.post(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.URBAN_BOOKINGS), bookingData, {
        headers: API_CONFIG.getAuthHeaders()
      });

      if (response.data.success) {
        navigate(`/urban-services/booking/${response.data.data._id}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking.';
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
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-32 md:pb-12 text-gray-900">
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 h-16 md:h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 md:gap-3 group"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <ChevronLeft size={20} />
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-black tracking-tight">{category.name}</h1>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Step 1 of 2: Details</p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Safe & Hygienic</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Star size={16} className="fill-blue-600 text-blue-600" />
              <span className="text-sm font-black text-gray-900">4.8</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 md:pt-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr,420px] gap-8 md:gap-12">

            {/* Left Column: Selection Sections */}
            <div className="space-y-8 md:space-y-12">

              {/* 1. Address Section */}
              <section className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6 md:mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Where should we come?</h2>
                    <p className="text-sm font-medium text-gray-400">Select a saved address or add a new one</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <motion.div
                      whileHover={{ y: -4 }}
                      key={address._id}
                      onClick={() => setSelectedAddress(address._id)}
                      className={`relative p-5 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${selectedAddress === address._id
                        ? 'border-blue-600 bg-blue-50/30'
                        : 'border-gray-100 bg-white hover:border-blue-200'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAddress === address._id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                          <MapPin size={20} />
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddress === address._id ? 'border-blue-600' : 'border-gray-200'}`}>
                          {selectedAddress === address._id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 truncate">{address.addressLine1}</p>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{address.city}</p>
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedAddress('new')}
                    className={`p-5 rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-[140px] text-center gap-3 ${selectedAddress === 'new'
                      ? 'border-blue-600 bg-blue-50/30'
                      : 'border-gray-200 bg-white hover:border-blue-200'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Plus size={24} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900">Add New</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom Address</p>
                    </div>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {selectedAddress === 'new' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 md:p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                          <button
                            type="button"
                            onClick={fetchCurrentLocation}
                            className="flex-1 bg-white border border-gray-200 h-14 rounded-2xl text-sm font-black shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
                          >
                            <Navigation size={18} className="text-blue-600" />
                            <span>Use Current Location</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowMapModal(true)}
                            className="flex-1 bg-white border border-gray-200 h-14 rounded-2xl text-sm font-black shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
                          >
                            <MapPin size={18} className="text-blue-600" />
                            <span>Pick from Map</span>
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">House / Flat No.</label>
                              <input
                                placeholder="e.g. 402, 4th Floor"
                                className="w-full bg-white border border-gray-100 h-14 px-6 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none"
                                value={customAddress.addressLine1}
                                onChange={e => setCustomAddress({ ...customAddress, addressLine1: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Street / Area</label>
                              <input
                                placeholder="e.g. Green Park Main"
                                className="w-full bg-white border border-gray-100 h-14 px-6 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none"
                                value={customAddress.addressLine2}
                                onChange={e => setCustomAddress({ ...customAddress, addressLine2: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="col-span-1 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">City</label>
                              <input
                                placeholder="New Delhi"
                                className="w-full bg-white border border-gray-100 h-14 px-6 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none"
                                value={customAddress.city}
                                onChange={e => setCustomAddress({ ...customAddress, city: e.target.value })}
                              />
                            </div>
                            <div className="col-span-1 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Pin Code</label>
                              <input
                                placeholder="110016"
                                className="w-full bg-white border border-gray-100 h-14 px-6 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none"
                                value={customAddress.pinCode}
                                onChange={e => setCustomAddress({ ...customAddress, pinCode: e.target.value })}
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-4">Landmark</label>
                              <input
                                placeholder="Near Axis Bank"
                                className="w-full bg-white border border-gray-100 h-14 px-6 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none"
                                value={customAddress.landmark}
                                onChange={e => setCustomAddress({ ...customAddress, landmark: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* 2. Slot Selection Section */}
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">When should we arrive?</h2>
                    <p className="text-sm font-medium text-gray-400">Select your preferred date and time slot</p>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 ml-1">Arrival Date</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Modern Date Selection (First 4 days) */}
                      {[0, 1, 2, 3].map(offset => {
                        const date = new Date();
                        date.setDate(date.getDate() + offset);
                        const dateStr = date.toISOString().split('T')[0];
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const month = date.toLocaleDateString('en-US', { month: 'short' });

                        return (
                          <motion.button
                            key={dateStr}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedDate(dateStr)}
                            className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-1 ${selectedDate === dateStr
                              ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-md'
                              : 'border-gray-100 bg-white hover:border-purple-200'
                              }`}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{dayName}</span>
                            <span className="text-xl font-black">{dayNum}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{month}</span>
                          </motion.button>
                        );
                      })}

                      {/* Custom Date Picker fallback for further dates */}
                      <div className="relative col-span-2 sm:col-span-4">
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          className="w-full h-14 bg-gray-50 border border-gray-100 px-6 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-purple-50 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4 ml-1">Available Slots</p>
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3">
                      {timeSlots.map(time => (
                        <motion.button
                          key={time}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedTime(time)}
                          className={`h-12 rounded-xl text-xs font-black transition-all border-2 ${selectedTime === time
                            ? 'bg-purple-600 text-white border-purple-600 shadow-lg'
                            : 'bg-white text-gray-600 border-gray-100 hover:border-purple-200'
                            }`}
                        >
                          {time}
                        </motion.button>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <Clock size={16} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Selected slot: <span className="text-black">{selectedTime || 'Not selected'}</span></p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. Notes Section */}
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                    <Info size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Anything else?</h2>
                    <p className="text-sm font-medium text-gray-400">Additional instructions for the professional</p>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. The doorbell doesn't work, please call. Or bring a tall ladder..."
                    className="w-full bg-gray-50 border border-gray-100 p-6 rounded-[2.5rem] text-sm font-medium min-h-[160px] focus:ring-4 focus:ring-amber-50 focus:border-amber-200 transition-all outline-none resize-none"
                  />
                  <div className="absolute bottom-6 right-8 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    {description.length}/500 chars
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="relative">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div className="bg-white rounded-[3rem] border border-gray-100 p-8 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                  {/* Decorative Gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>

                  <div className="relative">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-3xl border border-gray-100 shadow-sm overflow-hidden">
                        {category.image ? (
                          <img
                            src={category.image.startsWith('http') ? category.image : `${API_BASE_URL}${category.image}`}
                            className="w-full h-full object-cover"
                            alt={category.name}
                          />
                        ) : (
                          category.icon || '🏠'
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-xl leading-tight text-gray-900">{category.name}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md">
                            <Star size={10} className="fill-blue-600 text-blue-600" />
                            <span className="text-[10px] font-black text-blue-600">4.8</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Service</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex justify-between items-center px-1">
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Base Price</span>
                        <span className="font-black text-lg">₹{category.minPrice}</span>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Service Fee</span>
                        <span className="font-bold text-sm text-green-600 uppercase">Free</span>
                      </div>
                      <div className="h-px bg-gray-100 my-4"></div>
                      <div className="flex justify-between items-baseline px-1">
                        <span className="font-black text-xl tracking-tight">Total</span>
                        <div className="text-right">
                          <p className="font-black text-3xl text-blue-600 tracking-tighter leading-none">₹{category.minPrice}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Inc. all taxes</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 space-y-4">
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-16 rounded-[1.5rem] bg-black text-white font-black hover:bg-neutral-800 disabled:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-black/20 group"
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>Confirm Booking</span>
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                      <p className="text-center text-[10px] font-bold text-green-600 uppercase tracking-widest">No payment required now</p>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-50 grid grid-cols-2 gap-6">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                          <ShieldCheck size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Trusted Professionals</p>
                      </div>
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <CreditCard size={20} />
                        </div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Secure Payment</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy Snippet */}
                <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-6 text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Free cancellation until 4 hrs before service</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Map Modal */}
      <AnimatePresence>
        {showMapModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowMapModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 md:p-8 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight">Set Location</h3>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Drag the pin to your exact door</p>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-900 hover:bg-black hover:text-white transition-all"
                >
                  <X size={24} />
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
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      styles: [
                        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                      ]
                    }}
                  >
                    <Marker
                      position={mapCoordinates}
                      draggable={true}
                      onDragEnd={(e) => setMapCoordinates({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                      animation={window.google?.maps?.Animation?.DROP}
                    />
                  </GoogleMap>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-4 bg-gray-50">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Google Maps...</p>
                  </div>
                )}

                {/* Floating Map Controls Indicator */}
                <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-gray-100 inline-flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <p className="text-xs font-black tracking-tight text-gray-900">Pin is set at: {mapCoordinates.lat.toFixed(4)}, {mapCoordinates.lng.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-gray-50">
                <button
                  onClick={handleMapConfirm}
                  className="w-full h-16 rounded-[1.5rem] bg-black text-white font-black hover:bg-neutral-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
                >
                  Confirm this location <CheckCircle2 size={20} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        
        :root {
          --font-outfit: 'Outfit', sans-serif;
        }

        body {
          font-family: var(--font-outfit) !important;
          background-color: #FDFDFD;
          -webkit-font-smoothing: antialiased;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.2);
          padding: 8px;
          border-radius: 8px;
          transition: background 0.3s;
        }
        
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          background: rgba(0,0,0,0.05);
        }

        /* Responsive Grid fixes */
        @media (max-width: 400px) {
          .xs\\:grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Hide Scrollbars */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default BookService;
