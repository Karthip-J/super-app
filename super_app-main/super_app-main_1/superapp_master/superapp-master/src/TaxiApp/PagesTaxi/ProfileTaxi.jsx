import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileTaxipic from '../../Clothes/Images/profilepic.svg';
import plus from "../../Icons/plus.svg";
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import axios from 'axios';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna',
  'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
  'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Amritsar', 'Allahabad',
  'Howrah', 'Ranchi', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
  'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur',
  'Hubli', 'Tiruchirappalli', 'Mysore', 'Tiruppur', 'Bareilly', 'Aligarh'
];

const COUNTRIES = ['India'];

function ProfileTaxi() {
    const navigate = useNavigate();
    // State for profile fields
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('India');
    const [pincode, setPincode] = useState('');
    const [selected, setSelected] = useState('Home');
    const [apiError, setApiError] = useState('');
    const [apiWarning, setApiWarning] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [phoneError, setPhoneError] = useState('');
    const [loading, setLoading] = useState(true);
    const buttons = ["Home", "Office", "Others"];

    // Custom toast notification (same as e-commerce)
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    };

    // Phone validation function
    const validatePhone = (phoneNumber) => {
        if (!phoneNumber) {
            return 'Mobile number is required';
        }
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        if (digitsOnly.length !== 10) {
            return 'Mobile number must be exactly 10 digits';
        }
        // Indian mobile number validation: should start with 6, 7, 8, or 9
        if (!/^[6-9]/.test(digitsOnly)) {
            return 'Mobile number must start with 6, 7, 8, or 9';
        }
        return '';
    };

    // Load profile from API on mount
    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setApiError('');
            setApiWarning('');
            try {
                const token = localStorage.getItem('token');
                
                // If no token, don't make the API call to avoid demo token issues
                if (!token) {
                    setApiWarning('Not logged in, using localStorage fallback.');
                    const saved = localStorage.getItem('taxiProfile');
                    if (saved) {
                        try {
                            const data = JSON.parse(saved);
                            setFullName(data.fullName || '');
                            setPhone(data.phone || '');
                            setEmail(data.email || '');
                            setAddress(data.address || '');
                            setCity(data.city || '');
                            setState(data.state || '');
                            setCountry(data.country || 'India');
                            setPincode(data.pincode || '');
                            setSelected(data.selected || 'Home');
                        } catch {}
                    }
                    setLoading(false);
                    return;
                }
                
                // Fetch user basic info (name, email, phone)
                const userResponse = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AUTH + '/profile'), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Fetch profile-specific info (address, city, state, etc.)
                const profileResponse = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.USER_PROFILE), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const userData = userResponse.data.data || userResponse.data;
                const profileData = profileResponse.data.data || profileResponse.data;
                
                setFullName(userData.name || '');
                setPhone(userData.phone || '');
                setEmail(userData.email || '');
                // Address can be in address_line1 or address field
                setAddress(profileData.address_line1 || profileData.address || '');
                setCity(profileData.city || '');
                setState(profileData.state || '');
                setCountry(profileData.country || 'India');
                setPincode(profileData.pincode || '');
                setSelected('Home');
            } catch (err) {
                console.error('Error fetching profile:', err);
                setApiWarning('Profile API failed, using localStorage fallback.');
                const saved = localStorage.getItem('taxiProfile');
                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        setFullName(data.fullName || '');
                        setPhone(data.phone || '');
                        setEmail(data.email || '');
                        setAddress(data.address || '');
                        setCity(data.city || '');
                        setState(data.state || '');
                        setCountry(data.country || 'India');
                        setPincode(data.pincode || '');
                        setSelected(data.selected || 'Home');
                    } catch {}
                }
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    // Handle phone change with validation
    const handlePhoneChange = (value) => {
        // Only allow digits, max 10 digits
        const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
        setPhone(digitsOnly);
        
        // Real-time validation
        if (digitsOnly.length > 0) {
            const validationError = validatePhone(digitsOnly);
            setPhoneError(validationError);
        } else {
            setPhoneError('');
        }
    };

    const handlePhoneBlur = () => {
        // Validate on blur
        const validationError = validatePhone(phone);
        setPhoneError(validationError);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError('');
        setApiWarning('');
        setPhoneError('');

        // Validate phone number before submission
        const phoneValidationError = validatePhone(phone);
        if (phoneValidationError) {
            setPhoneError(phoneValidationError);
            showToast(phoneValidationError, 'error');
            return;
        }

        // Validate email format if provided
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
        }

        const profile = { fullName, phone, email, address, city, state, country, pincode, selected };
        try {
            const token = localStorage.getItem('token');
            
            // If no token, don't make the API call to avoid demo token issues
            if (!token) {
                setApiError('Not logged in, saving to localStorage.');
                localStorage.setItem('taxiProfile', JSON.stringify(profile));
                showToast('Profile updated locally (not logged in).', 'success');
                navigate('/home-taxi/account', { replace: true });
                return;
            }
            
            // First, update user basic info (name, email, phone)
            const trimmedPhone = phone.replace(/\D/g, '');
            const userData = {
                name: fullName || '',
                phone: trimmedPhone
            };
            
            if (email && email.trim()) {
                userData.email = email.trim();
            }

            await axios.put(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AUTH + '/profile'), userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Then, update profile-specific info (address, city, etc.)
            const profileData = new FormData();
            profileData.append('address_line1', address || '');
            profileData.append('city', city || '');
            profileData.append('state', state || '');
            profileData.append('country', country || 'India');
            profileData.append('pincode', pincode || '');

            await axios.put(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.USER_PROFILE), profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Save to localStorage as backup
            localStorage.setItem('taxiProfile', JSON.stringify(profile));
            showToast('Profile updated successfully!', 'success');
            navigate('/home-taxi/account', { replace: true });
        } catch (err) {
            console.error('Profile update error:', err);
            setApiError('Profile update failed, saving to localStorage.');
            localStorage.setItem('taxiProfile', JSON.stringify(profile));
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            showToast(errorMessage, 'error');
        }
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            {/* Custom Toast Notification */}
            {toast.show && (
                <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
                    toast.type === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                }`}>
                    <div className="flex items-center space-x-2">
                        <span className="font-medium">{toast.message}</span>
                        <button 
                            onClick={() => setToast({ show: false, message: '', type: 'success' })}
                            className="ml-2 text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
            
            <HeaderInsideTaxi />
            <div className='pt-20 pb-[64px] px-4'>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3FFF] mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading profile...</p>
                        </div>
                    </div>
                ) : (
                    <>
                <div className='font-medium text-base pt-4'>Your Profile</div>
                <div className="mt-2 bg-white rounded-full p-2 border border-[#E1E1E1] flex items-center gap-3">
                    <div className="relative w-[50px] h-[50px]">
                        <img src={profileTaxipic} alt="ProfileTaxi" className="rounded-full w-full h-full" />
                        <img
                            src={plus}
                            alt="Plus"
                            className="absolute bottom-0 right-0 w-4 h-4 rounded-full p-0.5"
                            style={{ height: '18px', width: '18px' }}
                        />
                    </div>
                    <div>
                        <div className='text-xs font-medium'>Your Account</div>
                        <div className='text-base font-semibold'>{fullName || 'Breeza Quiz'}</div>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <label className="mt-4 block text-sm text-gray-600 w-full">Full name</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                        required
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">
                        Phone number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={e => handlePhoneChange(e.target.value)}
                        onBlur={handlePhoneBlur}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className={`bg-white w-full p-2 border rounded-full focus:outline-none focus:ring-2 mt-1 ${
                            phoneError 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:ring-[#5C3FFF]'
                        }`}
                        required
                    />
                    {phoneError && (
                        <div className="w-full mt-1 text-red-600 text-xs">{phoneError}</div>
                    )}

                    <label className="mt-4 block text-sm text-gray-600 w-full">Email ID</label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                        required
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Address</label>
                    <textarea
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                        rows="3"
                        placeholder="Enter your full address"
                    />

                    <div className="flex gap-x-4 mt-4">
                        <div className="w-1/2">
                            <label className="block text-sm text-gray-600">
                                City <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1 appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    paddingRight: '40px'
                                }}
                                required
                            >
                                <option value="">Select City</option>
                                {INDIAN_CITIES.map((cityName) => (
                                    <option key={cityName} value={cityName}>
                                        {cityName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm text-gray-600">
                                State <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={state}
                                onChange={e => setState(e.target.value)}
                                className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1 appearance-none cursor-pointer"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 12px center',
                                    paddingRight: '40px'
                                }}
                                required
                            >
                                <option value="">Select State</option>
                                {INDIAN_STATES.map((stateName) => (
                                    <option key={stateName} value={stateName}>
                                        {stateName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <label className="mt-4 block text-sm text-gray-600 w-full">
                        Country <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1 appearance-none cursor-pointer"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            paddingRight: '40px'
                        }}
                        required
                    >
                        {COUNTRIES.map((countryName) => (
                            <option key={countryName} value={countryName}>
                                {countryName}
                            </option>
                        ))}
                    </select>
                    <label className="mt-4 block text-sm text-gray-600 w-full">Pincode*</label>
                    <input
                        type="text"
                        value={pincode}
                        onChange={e => setPincode(e.target.value)}
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                        required
                    />
                    <div className='font-medium text-base  pt-4'>Select Type</div>
                    <div className="flex space-x-2  pt-2">
                        {buttons.map((btn) => (
                            <button
                                type="button"
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
                    {apiWarning && <div style={{ color: 'orange', fontSize: 12 }}>{apiWarning}</div>}
                    {apiError && <div style={{ color: 'red', fontSize: 12 }}>{apiError}</div>}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px] mt-6" >
                        Submit
                    </button>
                </form>
                    </>
                )}
            </div>
            <FooterTaxi />
        </div>
    );
}

export default ProfileTaxi;
