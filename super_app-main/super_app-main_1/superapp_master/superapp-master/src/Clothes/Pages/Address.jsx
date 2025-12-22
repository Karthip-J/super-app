import React, { useState, useRef, useCallback } from 'react';
import ClothesHeader from "../Header/ClothesHeader";
import step1 from "../Images/step1.svg";
import gps from "../Images/gps.svg";
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin, Navigation, ChevronLeft, Loader2 } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = "AIzaSyB_IWKJcJhkGzpCDB-ml6vlZmQzd-4F-gg";
const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 13.0827, lng: 80.2707 };

const CLOTHES_ADDRESS_KEY = 'clothesUserAddresses';

function Address() {
    const [selected, setSelected] = useState("Home");
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        altPhoneNumber: '',
        houseNo: '',
        roadName: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        customLabel: ''
    });

    const buttons = ["Home", "Office", "Others"];
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapCoordinates, setMapCoordinates] = useState(defaultCenter);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const mapRef = useRef();
    const onMapLoad = useCallback((map) => { mapRef.current = map; }, []);

    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const coords = { lat: latitude, lng: longitude };
                setMapCoordinates(coords);
                await updateAddressFromCoords(coords);
            },
            () => {
                setLoading(false);
                alert('Failed to get your location. Please check your browser permissions.');
            }
        );
    };

    const updateAddressFromCoords = async (coords) => {
        if (isLoaded && window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: coords }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const res = results[0];
                    const getComp = (type) => res.address_components.find(c => c.types.includes(type))?.long_name || '';

                    setFormData(prev => ({
                        ...prev,
                        houseNo: getComp('subpremise') || getComp('premise') || res.formatted_address.split(',')[0],
                        roadName: getComp('route') || getComp('sublocality_level_1') || getComp('neighborhood'),
                        landmark: getComp('sublocality_level_2') || '',
                        city: getComp('locality') || getComp('postal_town'),
                        state: getComp('administrative_area_level_1'),
                        pincode: getComp('postal_code')
                    }));
                }
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    };

    const handleMapConfirm = async () => {
        setShowMapModal(false);
        setLoading(true);
        await updateAddressFromCoords(mapCoordinates);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        const requiredFields = ['fullName', 'phoneNumber', 'houseNo', 'roadName', 'landmark', 'city', 'state', 'pincode'];
        const missingField = requiredFields.find(field => !formData[field]?.trim());
        if (missingField) {
            alert('Please fill in all required fields.');
            return;
        }

        const addressTypeLabel = selected === 'Others' ? (formData.customLabel?.trim() || 'Others') : selected;

        const formattedAddress = {
            ...formData,
            selectedAddressType: addressTypeLabel,
            id: Date.now()
        };

        const existingAddresses = JSON.parse(localStorage.getItem(CLOTHES_ADDRESS_KEY)) || [];
        const updatedAddresses = [...existingAddresses, formattedAddress];
        localStorage.setItem(CLOTHES_ADDRESS_KEY, JSON.stringify(updatedAddresses));

        navigate('/home-clothes/all-addresses', { replace: true });
    };

    return (
        <div className='bg-[#FDFDFD] min-h-screen font-sans'>
            <ClothesHeader />
            <div className='border-b border-gray-100 py-4'>
                <img src={step1} alt="" className='w-full mt-20 px-6' />
            </div>

            <div className="px-4 pt-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 leading-tight">Add delivery address</h2>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-bold">Where should we deliver?</p>
                    </div>
                    {loading && <Loader2 className="animate-spin text-[#5C3FFF]" size={24} />}
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={fetchCurrentLocation}
                        className="flex-1 bg-white border-2 border-gray-50 h-14 rounded-2xl text-sm font-bold shadow-sm hover:border-[#5C3FFF]/30 hover:bg-[#5C3FFF]/5 transition-all flex items-center justify-center gap-2 text-gray-900 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[#5C3FFF]/10 flex items-center justify-center text-[#5C3FFF] group-hover:scale-110 transition-transform">
                            <Navigation size={18} />
                        </div>
                        Use GPS
                    </button>
                    <button
                        type="button"
                        onClick={() => setShowMapModal(true)}
                        className="flex-1 bg-white border-2 border-gray-50 h-14 rounded-2xl text-sm font-bold shadow-sm hover:border-[#5C3FFF]/30 hover:bg-[#5C3FFF]/5 transition-all flex items-center justify-center gap-2 text-gray-900 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[#5C3FFF]/10 flex items-center justify-center text-[#5C3FFF] group-hover:scale-110 transition-transform">
                            <MapPin size={18} />
                        </div>
                        Open Map
                    </button>
                </div>

                <div className='space-y-4 pb-16'>
                    <div className='space-y-5'>
                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Full name</label>
                            <input
                                name="fullName"
                                type="text"
                                placeholder="Receiver's name"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Phone number</label>
                                <input
                                    name="phoneNumber"
                                    type="number"
                                    placeholder="Primary number"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Alt number</label>
                                <input
                                    name="altPhoneNumber"
                                    type="number"
                                    placeholder="Optional"
                                    value={formData.altPhoneNumber}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">House no, Building name*</label>
                            <input
                                name="houseNo"
                                type="text"
                                placeholder="Step, Floor, Apartment name"
                                value={formData.houseNo}
                                onChange={handleInputChange}
                                className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Road name, Area, Colony*</label>
                            <input
                                name="roadName"
                                type="text"
                                placeholder="Street, Sector, Locality"
                                value={formData.roadName}
                                onChange={handleInputChange}
                                className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Near by landmark*</label>
                            <input
                                name="landmark"
                                type="text"
                                placeholder="Famous place nearby"
                                value={formData.landmark}
                                onChange={handleInputChange}
                                className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">City*</label>
                                <input
                                    name="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">State*</label>
                                <input
                                    name="state"
                                    type="text"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Pincode*</label>
                            <input
                                name="pincode"
                                type="text"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                            />
                        </div>
                    </div>

                    <div className='pt-4'>
                        <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">Address Type</div>
                        <div className="flex flex-wrap gap-2">
                            {buttons.map((btn) => (
                                <button
                                    key={btn}
                                    onClick={() => setSelected(btn)}
                                    className={`h-11 px-6 rounded-xl font-bold text-xs transition-all ${selected === btn
                                        ? "bg-[#5C3FFF] text-white shadow-lg shadow-[#5C3FFF]/20"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                                        }`}
                                >
                                    {btn}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selected === 'Others' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Address Label*</label>
                            <input
                                name="customLabel"
                                value={formData.customLabel}
                                onChange={handleInputChange}
                                type="text"
                                placeholder="e.g. Friends Home, Shop"
                                className="bg-gray-50 border-0 w-full h-12 px-4 rounded-xl text-sm shadow-inner focus:ring-2 focus:ring-[#5C3FFF] transition-all"
                            />
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        className="w-full h-14 bg-black text-white rounded-2xl mt-8 font-black text-base hover:bg-black/90 transition-all shadow-xl hover:shadow-black/20"
                    >
                        Save & Continue
                    </button>
                </div>
            </div>

            {/* Map Modal Picker */}
            {showMapModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 antialiased">
                    <div className="bg-white rounded-[40px] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Select Location</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Move marker to your doorstep</p>
                            </div>
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
                                    <Marker
                                        position={mapCoordinates}
                                        draggable={true}
                                        onDragEnd={(e) => setMapCoordinates({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                                    />
                                </GoogleMap>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm font-bold text-gray-400">Loading Google Maps...</div>
                            )}
                        </div>
                        <div className="p-8 bg-white border-t">
                            <button
                                onClick={handleMapConfirm}
                                className="w-full h-14 rounded-2xl bg-[#5C3FFF] text-white font-black hover:bg-[#5C3FFF]/90 transition-all shadow-lg shadow-[#5C3FFF]/20"
                            >
                                Confirm this location
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Address;