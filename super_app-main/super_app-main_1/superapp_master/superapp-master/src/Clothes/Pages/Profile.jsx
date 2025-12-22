import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect, useRef } from 'react';
import ClothesHeader from '../Header/ClothesHeader';
import profilepic from '../Images/profilepic.svg';
import plus from "../../Icons/plus.svg";
import { useNavigate } from 'react-router-dom';
import Footer from '../../Utility/Footer';
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

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [phoneError, setPhoneError] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Custom toast notification (same as e-commerce)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Fetch user basic info
        const userResponse = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AUTH + '/profile'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch profile-specific info
        const profileResponse = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.USER_PROFILE), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const userData = userResponse.data.data;
        const profileData = profileResponse.data.data;

        setProfile({
          name: userData.name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          address_line1: profileData.address_line1 || profileData.address || '',
          address_line2: profileData.address_line2 || '',
          city: profileData.city || '',
          state: profileData.state || '',
          country: profileData.country || '',
          pincode: profileData.pincode || ''
        });

        if (profileData.profile_picture) {
          // Use getImageUrl helper to properly construct the image URL
          const imageUrl = API_CONFIG.getImageUrl(profileData.profile_picture);
          if (imageUrl) {
            setPreviewUrl(imageUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Show error only if it's not a 404 (profile doesn't exist yet)
        if (error.response?.status !== 404) {
          const errorMessage = error.response?.data?.message || error.message || 'Failed to load profile';
          if (errorMessage !== 'Route not found') {
            showToast(errorMessage, 'error');
          }
        }
      }
    }

    fetchProfile();
  }, [token]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone field
    if (name === 'phone') {
      // Only allow digits, max 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setProfile((prev) => ({
        ...prev,
        [name]: digitsOnly
      }));
      
      // Real-time validation
      if (digitsOnly.length > 0) {
        const validationError = validatePhone(digitsOnly);
        setPhoneError(validationError);
      } else {
        setPhoneError('');
      }
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhoneBlur = () => {
    // Validate on blur
    const validationError = validatePhone(profile.phone);
    setPhoneError(validationError);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL and clean up previous one
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate phone number before submission
      const phoneValidationError = validatePhone(profile.phone);
      if (phoneValidationError) {
        setPhoneError(phoneValidationError);
        showToast(phoneValidationError, 'error');
        return;
      }

      // Validate email format if provided
      if (profile.email && profile.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(profile.email.trim())) {
          showToast('Please enter a valid email address', 'error');
          return;
        }
      }

      // First, update user basic info (name, email, phone)
      const trimmedPhone = profile.phone.replace(/\D/g, '');
      const userData = {
        name: profile.name || '',
        phone: trimmedPhone
      };
      
      // Only include email if it's provided (to avoid empty string issues)
      if (profile.email && profile.email.trim()) {
        userData.email = profile.email.trim();
      }
      
      // Update user basic info
      const userResponse = await axios.put(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AUTH + '/profile'), userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!userResponse.data.success) {
        throw new Error(userResponse.data.message || 'Failed to update user info');
      }

      // Then, update profile-specific info (address, city, etc.)
      const profileData = new FormData();
      profileData.append('address_line1', profile.address_line1 || '');
      profileData.append('address_line2', profile.address_line2 || '');
      profileData.append('city', profile.city || '');
      profileData.append('state', profile.state || '');
      profileData.append('country', profile.country || '');
      profileData.append('pincode', profile.pincode || '');
      
      if (selectedFile) {
        profileData.append('profile_picture', selectedFile);
      }

      const profileResponse = await axios.put(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.USER_PROFILE), profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!profileResponse.data.success) {
        throw new Error(profileResponse.data.message || 'Failed to update profile');
      }

      showToast('Profile updated successfully', 'success');
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      console.error('Failed to update profile:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile. Please try again.';
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
      
      <ClothesHeader />
      <div className='pt-20 pb-28 px-4'>
        <div className='font-medium text-base pt-4 flex items-center justify-between'>
          <span>Your Profile</span>
        </div>

        {/* Profile Image and Name */}
        <div className="mt-2 bg-white rounded-full p-2 border border-[#E1E1E1] flex items-center gap-3 justify-between relative">
          <div className="flex items-center gap-3">
            <div className="relative w-[50px] h-[50px]">
              <img
                src={previewUrl || profilepic}
                alt="Profile"
                className="rounded-full w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default profile picture if image fails to load
                  e.target.src = profilepic;
                }}
                style={{ minWidth: '50px', minHeight: '50px' }}
              />
              <label htmlFor="file-upload">
                <img
                  src={plus}
                  alt="Plus"
                  className="absolute bottom-0 right-0 w-4 h-4 rounded-full p-0.5 cursor-pointer"
                  style={{ height: '18px', width: '18px' }}
                />
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div>
              <div className='text-xs font-medium'>Your Account</div>
              <div className='text-base font-semibold'>{profile.name || 'User'}</div>
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Profile menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Scroll to top or focus on first input
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/home');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/home');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    localStorage.clear();
                    navigate('/login');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Input Fields */}
        <label className="mt-4 block text-sm text-gray-600">Full name</label>
        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          className="bg-white w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5C3FFF] mt-1"
        />

        <label className="mt-4 block text-sm text-gray-600">
          Phone number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          inputMode="numeric"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          onBlur={handlePhoneBlur}
          placeholder="10-digit mobile number"
          maxLength={10}
          className={`bg-white w-full p-2 border rounded-full focus:outline-none focus:ring-2 mt-1 ${
            phoneError 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-[#5C3FFF]'
          }`}
        />
        {phoneError && (
          <div className="w-full mt-1 text-red-600 text-xs">{phoneError}</div>
        )}

        <label className="mt-4 block text-sm text-gray-600">Email ID</label>
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          className="bg-white w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5C3FFF] mt-1"
        />

        <label className="mt-4 block text-sm text-gray-600">Address Line 1</label>
        <input
          type="text"
          name="address_line1"
          value={profile.address_line1}
          onChange={handleChange}
          className="bg-white w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5C3FFF] mt-1"
        />

        <label className="mt-4 block text-sm text-gray-600">Address Line 2</label>
        <input
          type="text"
          name="address_line2"
          value={profile.address_line2}
          onChange={handleChange}
          className="bg-white w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5C3FFF] mt-1"
        />

        <div className="flex gap-x-4 mt-4">
          <div className="w-1/2">
            <label className="block text-sm text-gray-600">City</label>
            <input
              type="text"
              name="city"
              value={profile.city}
              onChange={handleChange}
              className="bg-white w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5C3FFF] mt-1"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm text-gray-600">State</label>
            <select
              name="state"
              value={profile.state}
              onChange={handleChange}
              className="bg-white w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5C3FFF] focus:outline-none mt-1 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: '40px'
              }}
            >
              <option value="">Select State</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="mt-4 block text-sm text-gray-600">Country</label>
        <input
          type="text"
          name="country"
          value={profile.country}
          onChange={handleChange}
          className="bg-white w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5C3FFF] mt-1"
        />

        <label className="mt-4 block text-sm text-gray-600">Pincode</label>
        <input
          type="text"
          name="pincode"
          value={profile.pincode}
          onChange={handleChange}
          className="bg-white w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#5C3FFF] mt-1"
        />

        <button
          onClick={handleSubmit}
          className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px] mt-6"
        >
          Submit
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;
