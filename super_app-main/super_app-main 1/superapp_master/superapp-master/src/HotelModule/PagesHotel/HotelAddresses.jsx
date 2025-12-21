import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Save, X, MapPin, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HotelAddresses() {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [newAddress, setNewAddress] = useState({
        id: Date.now(),
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        isDefault: false
    });
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    // Load addresses from localStorage on component mount
    useEffect(() => {
        const savedAddresses = localStorage.getItem('hotelUserAddresses');
        if (savedAddresses) {
            setAddresses(JSON.parse(savedAddresses));
        }
    }, []);

    // Save addresses to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('hotelUserAddresses', JSON.stringify(addresses));
    }, [addresses]);

    const handleAddNewAddress = () => {
        setIsEditing(true);
        setEditingIndex(-1);
        setLocationError('');
        setNewAddress({
            id: Date.now(),
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            isDefault: addresses.length === 0 // First address is default
        });
    };

    const handleEditAddress = (index) => {
        setIsEditing(true);
        setEditingIndex(index);
        setLocationError('');
        setNewAddress({...addresses[index]});
    };

    const handleSaveAddress = () => {
        if (editingIndex === -1) {
            // Adding new address
            setAddresses([...addresses, newAddress]);
        } else {
            // Updating existing address
            const updatedAddresses = [...addresses];
            updatedAddresses[editingIndex] = newAddress;
            setAddresses(updatedAddresses);
        }
        setIsEditing(false);
        setEditingIndex(-1);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingIndex(-1);
    };

    const handleDeleteAddress = (index) => {
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(updatedAddresses);
    };

    const handleSetDefault = (index) => {
        const updatedAddresses = addresses.map((addr, i) => ({
            ...addr,
            isDefault: i === index
        }));
        setAddresses(updatedAddresses);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Improved location detection with better reverse geocoding
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            return;
        }

        setIsDetectingLocation(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    // Use Nominatim with better parameters for accurate reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`
                    );
                    
                    if (!response.ok) {
                        throw new Error('Failed to fetch location data');
                    }

                    const data = await response.json();
                    const address = data.address || {};

                    // Improved address parsing logic
                    // Street address - try multiple fields in order of preference
                    const streetParts = [];
                    if (address.house_number) streetParts.push(address.house_number);
                    if (address.road) streetParts.push(address.road);
                    if (address.street) streetParts.push(address.street);
                    if (address.pedestrian) streetParts.push(address.pedestrian);
                    const street = streetParts.length > 0 
                        ? streetParts.join(' ') 
                        : address.suburb || address.neighbourhood || address.quarter || address.village || '';

                    // City - try multiple fields
                    const city = address.city || 
                                 address.town || 
                                 address.municipality || 
                                 address.village || 
                                 address.county || 
                                 address.district || 
                                 '';

                    // State - try multiple fields
                    const state = address.state || 
                                 address.region || 
                                 address.province || 
                                 '';

                    // Postal code
                    const postalCode = address.postcode || 
                                     address.postal_code || 
                                     '';

                    // Country - normalize to proper name
                    let country = address.country || 'India';
                    // Normalize country names
                    if (country === 'IN' || country.toLowerCase() === 'india') {
                        country = 'India';
                    }

                    // Update the form with detected location
                    setNewAddress(prev => ({
                        ...prev,
                        street: street,
                        city: city,
                        state: state,
                        country: country,
                        postalCode: postalCode
                    }));

                    setIsDetectingLocation(false);
                } catch (error) {
                    console.error('Location detection error:', error);
                    setLocationError('Failed to detect location. Please enter address manually.');
                    setIsDetectingLocation(false);
                }
            },
            (error) => {
                let errorMessage = 'Location access denied.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied. Please enable location services in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again.';
                        break;
                    default:
                        errorMessage = 'An unknown error occurred while detecting location.';
                        break;
                }
                setLocationError(errorMessage);
                setIsDetectingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0 // Always get fresh location
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 p-4">
                <div className="relative flex items-center justify-center max-w-2xl mx-auto px-4">
                    <button onClick={() => navigate(-1)} className="absolute left-0">
                        <ArrowLeft size={24} className="text-gray-700 hover:text-sky-600" />
                    </button>
                    <h1 className="text-lg font-bold text-sky-600">My Addresses</h1>
                </div>
            </header>
            
            <div className="pt-20 pb-24 max-w-2xl mx-auto px-4">
                {addresses.length === 0 && !isEditing ? (
                    <div className="bg-white rounded-2xl shadow-md p-8 mt-10 text-center">
                        <p className="text-gray-500 text-lg">No addresses added yet.</p>
                        <p className="text-gray-400 text-sm mt-2">You can add and manage your hotel booking addresses here.</p>
                        <button 
                            onClick={handleAddNewAddress}
                            className="mt-6 bg-sky-600 text-white px-6 py-2 rounded-full flex items-center gap-2 mx-auto hover:bg-sky-700 transition"
                        >
                            <Plus size={20} />
                            Add New Address
                        </button>
                    </div>
                ) : (
                    <>
                        {!isEditing ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Saved Addresses</h2>
                                    <button 
                                        onClick={handleAddNewAddress}
                                        className="bg-sky-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-sky-700 transition"
                                    >
                                        <Plus size={18} />
                                        Add New
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {addresses.map((address, index) => (
                                        <div key={address.id} className="bg-white rounded-2xl shadow-md p-4 relative">
                                            {address.isDefault && (
                                                <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                    Default
                                                </span>
                                            )}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{address.street}</p>
                                                    <p className="text-gray-600">{address.city}, {address.state}</p>
                                                    <p className="text-gray-600">{address.postalCode}, {address.country}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleEditAddress(index)}
                                                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    {!address.isDefault && (
                                                        <button 
                                                            onClick={() => handleDeleteAddress(index)}
                                                            className="p-2 rounded-full hover:bg-red-50 text-red-500"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                {!address.isDefault && (
                                                    <button 
                                                        onClick={() => handleSetDefault(index)}
                                                        className="text-xs text-sky-600 hover:text-sky-800"
                                                    >
                                                        Set as Default
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-md p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {editingIndex === -1 ? 'Add New Address' : 'Edit Address'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        disabled={isDetectingLocation}
                                        className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                        {isDetectingLocation ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                Detecting...
                                            </>
                                        ) : (
                                            <>
                                                <MapPin size={16} />
                                                Use Current Location
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {locationError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {locationError}
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                        <input
                                            type="text"
                                            name="street"
                                            value={newAddress.street}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                            placeholder="Enter street address"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={newAddress.city}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                placeholder="Enter city"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={newAddress.state}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                placeholder="Enter state"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={newAddress.postalCode}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                placeholder="Enter postal code"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={newAddress.country}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                placeholder="Enter country"
                                            />
                                        </div>
                                    </div>
                                    
                                    {addresses.length > 0 && (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="isDefault"
                                                checked={newAddress.isDefault}
                                                onChange={(e) => setNewAddress(prev => ({...prev, isDefault: e.target.checked}))}
                                                className="h-4 w-4 text-sky-600 rounded focus:ring-sky-500"
                                            />
                                            <label className="ml-2 block text-sm text-gray-700">
                                                Set as default address
                                            </label>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={handleSaveAddress}
                                        className="flex-1 bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Save Address
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default HotelAddresses;