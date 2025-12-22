import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCamera, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const UrbanServicesSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        profilePicture: '',
        serviceCategories: []
    });
    const fileInputRef = useRef(null);

    const categoryOptions = [
        "AC Service & Repair", "Washing Machine Service", "Water Heater Service",
        "Refrigerator Service", "TV Service", "Home Theatre & Sound System",
        "Mixie & Grinder Repair", "Microwave Oven Repair", "Electrician Services",
        "Light & Fan Repair", "Switchboard & House Wiring", "Computer / Laptop Service",
        "Plumbing Service", "Car Mechanic", "Bike Mechanic", "Three-wheeler Mechanic",
        "Four-wheeler Mechanic", "Lorry Mechanic", "Vehicle Puncture Repair",
        "Home & Office Pest Control", "Water Purifier Service", "Garden Cleaning",
        "Garden Maintenance", "Priest Service", "Family Doctor On-Call",
        "Home Care Nursing", "Car Washing", "CCTV Camera Installation & Repair"
    ];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('urban_partner_token') || localStorage.getItem('token') || localStorage.getItem('authToken');

            if (!token) {
                console.log('No token found, using demo profile data');
                setProfile({
                    fullName: 'Thilocigan',
                    phoneNumber: '+917845235347',
                    email: 'thilocigan@gmail.com',
                    address: '95th StreetVadapalani',
                    city: 'Chennai',
                    state: 'Tamil Nadu',
                    pincode: '600094',
                    serviceCategories: ['AC Service & Repair', 'Plumbing Service', 'Electrician Services']
                });
                return;
            }

            const response = await axios.get('/api/urban-services/partner/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const data = response.data.data;
                const serviceArea = data.serviceAreas && data.serviceAreas[0];
                setProfile({
                    fullName: data.fullName || data.businessName || '',
                    phoneNumber: data.phoneNumber || '',
                    email: data.email || '',
                    address: serviceArea?.areas?.[0] || '',
                    city: serviceArea?.city || '',
                    state: data.state || '',
                    pincode: serviceArea?.pinCodes?.[0] || '',
                    profilePicture: data.profilePicture || '',
                    serviceCategories: data.serviceCategories || []
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleCategoryChange = (category) => {
        const currentCategories = [...profile.serviceCategories];
        if (currentCategories.includes(category)) {
            setProfile({
                ...profile,
                serviceCategories: currentCategories.filter(c => c !== category)
            });
        } else {
            setProfile({
                ...profile,
                serviceCategories: [...currentCategories, category]
            });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('urban_partner_token') || localStorage.getItem('token') || localStorage.getItem('authToken');

            if (!token) {
                toast.error('Session expired. Please log in again.');
                setLoading(false);
                return;
            }

            const response = await axios.put('/api/urban-services/partner/profile', {
                fullName: profile.fullName,
                email: profile.email,
                address: profile.address,
                city: profile.city,
                state: profile.state,
                pincode: profile.pincode,
                phoneNumber: profile.phoneNumber,
                profilePicture: profile.profilePicture,
                serviceCategories: profile.serviceCategories
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Profile updated successfully!');
                fetchProfile(); // Refresh data
            } else {
                toast.error(response.data.message || 'Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
            />

            {/* Header */}
            <div className="bg-white shadow px-6 py-4 flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-900 transition-colors">
                    <FaArrowLeft />
                </button>
                <div className="bg-blue-600 text-white p-2 rounded-lg mr-3 shadow-sm">
                    <span className="font-bold text-xl uppercase tracking-tighter">City Bell</span>
                </div>
                <div className="flex-grow"></div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-4 mb-10">
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">Profile Settings</h2>

                    <form onSubmit={handleSubmit}>
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white shadow-md overflow-hidden transition-all group-hover:shadow-lg">
                                    {profile.profilePicture ? (
                                        <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        profile.fullName?.charAt(0) || '?'
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95 border-2 border-white"
                                >
                                    <FaCamera size={18} />
                                </button>
                            </div>
                            <p className="mt-3 text-sm text-gray-500 font-medium italic">Click the camera to upload a new picture</p>
                        </div>

                        {/* Name & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={profile.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                    placeholder="Enter Phone Number"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                placeholder="Enter email address"
                            />
                        </div>

                        {/* Address */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                            <input
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                placeholder="Enter house number, street name, etc."
                            />
                        </div>

                        {/* City, State, Zip */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                    placeholder="City"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={profile.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                    placeholder="State"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP / Pin Code</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={profile.pincode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                                    placeholder="Pin Code"
                                />
                            </div>
                        </div>

                        {/* Service Categories */}
                        <div className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <span className="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
                                Service Categories
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                {categoryOptions.map((cat) => (
                                    <label key={cat} className="group flex items-center space-x-3 cursor-pointer p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={profile.serviceCategories.includes(cat)}
                                                onChange={() => handleCategoryChange(cat)}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
                                            />
                                        </div>
                                        <span className={`text-sm transition-all ${profile.serviceCategories.includes(cat) ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-6 pt-6 border-t">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-8 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center min-w-[180px]"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        SAVING...
                                    </>
                                ) : 'APPLY CHANGES'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UrbanServicesSettings;
