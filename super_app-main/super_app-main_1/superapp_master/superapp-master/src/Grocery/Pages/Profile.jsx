import React, { useState, useEffect, useRef } from 'react';
import Header from '../SubPages/Header';
import profilepic from '../Images/profilepic.svg';
import plus from "../../Icons/plus.svg";
import { useNavigate } from 'react-router-dom';
import Footer from '../SubPages/Footer';

function Profile() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState("Home");
    const buttons = ["Home", "Office", "Others"];
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // State variables for form fields
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailId, setEmailId] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [profileImage, setProfileImage] = useState(null); // New state for profile image

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

    // Load profile data from localStorage on component mount
    useEffect(() => {
        const storedProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (storedProfile) {
            setFullName(storedProfile.fullName || '');
            setPhoneNumber(storedProfile.phoneNumber || '');
            setEmailId(storedProfile.emailId || '');
            setCity(storedProfile.city || '');
            setState(storedProfile.state || '');
            setPincode(storedProfile.pincode || '');
            setProfileImage(storedProfile.profileImage || null); // Load profile image
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const MAX_WIDTH = 200; // Max width/height for the image
                    const MAX_HEIGHT = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert canvas to a compressed JPEG Data URL
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 0.7 is quality (70%)
                    setProfileImage(dataUrl);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        const profileData = {
            fullName,
            phoneNumber,
            emailId,
            city,
            state,
            pincode,
            profileImage, // Include profile image in saved data
        };
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        console.log('Profile saved to local storage:', profileData);
        navigate('/home-grocery/account', { replace: true });
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <Header />
            <div className='pt-20 pb-28 px-4'>
                <div className='font-medium text-base pt-4 flex items-center justify-between'>
                    <span>Your Profile</span>
                </div>
                <div className="mt-2 bg-white rounded-full p-2 border border-[#E1E1E1] flex items-center gap-3 justify-between relative">

                    <div className="flex items-center gap-3">
                        <div className="relative w-[50px] h-[50px]">
                            <img 
                                src={profileImage || profilepic} 
                                alt="Profile" 
                                className="rounded-full w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback to default profile picture if image fails to load
                                    e.target.src = profilepic;
                                }}
                                style={{ minWidth: '50px', minHeight: '50px' }}
                            />
                            <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#5C3FFF] flex items-center justify-center cursor-pointer"
                                style={{ height: '18px', width: '18px' }}>
                                <img src={plus} alt="Plus" className="w-3 h-3" />
                                <input
                                    id="profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div>
                            <div className='text-xs font-medium'>Your Account</div>
                            <div className='text-base font-semibold'>{fullName || 'User'}</div>
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
                                        navigate('/home-grocery/account');
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
                                        navigate('/home-grocery');
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

                <label className="mt-4 block text-sm text-gray-600 w-full">Email ID</label>
                <input
                    type="email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
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
                        <label className="block text-sm text-gray-600">State</label>
                        <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                        />
                    </div>
                </div>
                <label className="mt-4 block text-sm text-gray-600 w-full">Pincode*</label>
                <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                />
                {/* <div className='font-medium text-base  pt-4'>Select Type</div>
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
                </div> */}
                <button
                    onClick={handleSubmit}
                    className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px] mt-6" >
                   Submit
                </button>
            </div>
            <Footer/>
        </div>
    );
}

export default Profile;
