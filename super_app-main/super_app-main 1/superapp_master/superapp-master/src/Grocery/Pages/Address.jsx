import React, { useState } from "react";
import Header from "../SubPages/Header";
import step1 from "../Images/step1.svg";
import gps from "../Images/gps.svg";
import { useNavigate } from 'react-router-dom';
import AddressService from "../../services/addressService";

function Address() {
    const [selected, setSelected] = useState("Home");
    const [loading, setLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const buttons = ["Home", "Office", "Others"];
    const navigate = useNavigate();

    // State variables for form fields
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [altPhoneNumber, setAltPhoneNumber] = useState('');
    const [houseNo, setHouseNo] = useState('');
    const [roadName, setRoadName] = useState('');
    const [landmark, setLandmark] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    // Additional address fields
    const [country, setCountry] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [deliveryInstructions, setDeliveryInstructions] = useState('');

    const handleSubmit = async () => {
        // Validate required fields
        if (!fullName || !phoneNumber || !houseNo || !roadName || !city || !state || !pincode) {
            alert('Please fill in all required fields marked with *');
            return;
        }

        setLoading(true);
        
        const newAddress = {
            fullName,
            phoneNumber,
            altPhoneNumber,
            houseNo,
            addressLine2,
            roadName,
            landmark,
            city,
            state,
            pincode,
            country,
            companyName,
            deliveryInstructions,
            selectedAddressType: selected
        };

        try {
            await AddressService.saveAddress(newAddress);
            console.log('Address saved successfully');
            navigate('/home-grocery/edit-all-addresses', { replace: true });
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle getting current location
    const handleGetCurrentLocation = async () => {
        setLocationLoading(true);
        try {
            const locationData = await AddressService.getCurrentLocation();
            
            // Extract address components from Google Maps result
            const components = locationData.addressComponents;
            let addressData = {
                roadName: '',
                city: '',
                state: '',
                pincode: '',
                country: ''
            };

            components.forEach(component => {
                const types = component.types;
                if (types.includes('route')) {
                    addressData.roadName = component.long_name;
                } else if (types.includes('locality')) {
                    addressData.city = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                    addressData.state = component.long_name;
                } else if (types.includes('postal_code')) {
                    addressData.pincode = component.long_name;
                } else if (types.includes('country')) {
                    addressData.country = component.long_name;
                }
            });

            // Update form fields with location data
            setRoadName(addressData.roadName);
            setCity(addressData.city);
            setState(addressData.state);
            setPincode(addressData.pincode);
            setCountry(addressData.country);
            
            console.log('Location fetched successfully:', locationData);
        } catch (error) {
            console.error('Error getting location:', error);
            alert('Failed to get current location. Please enable location access and try again.');
        } finally {
            setLocationLoading(false);
        }
    };

    // Handle place search
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            const results = await AddressService.searchPlaces(query);
            setSearchResults(results);
            setShowSearchResults(true);
        } catch (error) {
            console.error('Error searching places:', error);
            setSearchResults([]);
        }
    };

    // Handle selecting a place from search results
    const handleSelectPlace = (place) => {
        const addressComponents = place.address_components || [];
        let addressData = {
            houseNo: '',
            roadName: '',
            city: '',
            state: '',
            pincode: '',
            country: ''
        };

        addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) {
                addressData.houseNo = component.long_name;
            } else if (types.includes('route')) {
                addressData.roadName = component.long_name;
            } else if (types.includes('locality')) {
                addressData.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
                addressData.state = component.long_name;
            } else if (types.includes('postal_code')) {
                addressData.pincode = component.long_name;
            } else if (types.includes('country')) {
                addressData.country = component.long_name;
            }
        });

        // Update form fields
        setHouseNo(addressData.houseNo);
        setRoadName(addressData.roadName);
        setCity(addressData.city);
        setState(addressData.state);
        setPincode(addressData.pincode);
        setCountry(addressData.country);
        
        // Clear search
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <Header />
            <div className='border border-[#E1E1E1] py-4'>
                <img src={step1} alt="" className='w-full mt-20 px-6' />
            </div >
            <div className="flex justify-between items-center px-4 pt-2">
                <h2 className="text-base font-medium">Add delivery address</h2>
                <div className="flex items-center gap-2">
                    <span className='text-[#888888] text-xs font-normal'>Use Current Location</span>
                    <button
                        onClick={handleGetCurrentLocation}
                        disabled={locationLoading}
                        className="cursor-pointer w-8 h-8 disabled:opacity-50"
                    >
                        <img src={gps} alt="GPS" className={`w-full h-full ${locationLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>
            <div className='px-4 pb-16'>
                {/* Search Bar */}
                <div className='mb-4'>
                    <label className="block text-sm text-gray-600 mb-2">Search for a location</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Type to search for address..."
                            className="bg-white w-full p-3 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF]"
                        />
                        <div className="absolute right-3 top-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                        <div className="absolute z-10 w-full max-w-md mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((place, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectPlace(place)}
                                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="text-sm font-medium text-gray-800">{place.name}</div>
                                    <div className="text-xs text-gray-600">{place.formatted_address}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className='border-t border-gray-200 pt-4'>
                <div className='pt-2'>
                    <label className="mt-4 block text-sm text-gray-600 w-full">Full name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Phone number</label>
                    <input
                        type="number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Alternative phone number</label>
                    <input
                        type="number"
                        value={altPhoneNumber}
                        onChange={(e) => setAltPhoneNumber(e.target.value)}
                        className=" bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">House no, Building name*</label>
                    <input
                        type="text"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Address Line 2 (Apartment, Suite, etc.)</label>
                    <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Road name, Area, Colony*</label>
                    <input
                        type="text"
                        value={roadName}
                        onChange={(e) => setRoadName(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Near by landmark*</label>
                    <input
                        type="text"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <div className="flex gap-x-4 mt-4">
                        <div className="w-1/2">
                            <label className="block text-sm text-gray-600">City*</label>
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm text-gray-600">State*</label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                            />
                        </div>
                    </div>

                    <div className="flex gap-x-4 mt-4">
                        <div className="w-1/2">
                            <label className="block text-sm text-gray-600">Pincode*</label>
                            <input
                                type="text"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                            />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm text-gray-600">Country</label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                            />
                        </div>
                    </div>

                    <label className="mt-4 block text-sm text-gray-600 w-full">Company Name (Optional)</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Delivery Instructions (Optional)</label>
                    <textarea
                        value={deliveryInstructions}
                        onChange={(e) => setDeliveryInstructions(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                        rows="3"
                    />
                </div>

                <div className='font-medium text-base  pt-4'>Select Type</div>

                <div className="flex space-x-2  pt-2">
                    {buttons.map((btn) => (
                        <button
                            key={btn}
                            onClick={() => setSelected(btn)}
                            className={`px-4 py-1 rounded-full border ${selected === btn
                                ? "bg-[#5C3FFF] text-white"
                                : "bg-white text-black border-gray-300"
                                }`}
                        >
                            {btn}
                        </button>
                    ))}
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px] mt-6 disabled:opacity-50 disabled:cursor-not-allowed" >
                    {loading ? 'Saving...' : 'Save Address'}
                </button>
                </div>
            </div>
        </div>
    )
}

export default Address;