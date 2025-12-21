import React, { useState, useEffect } from 'react';
import { User, LogOut, Phone, ArrowLeft, Home, HelpCircle, Calendar, Trash2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FooterHotel from '../ComponentsHotel/FooterHotel';

function AccountHotel() {
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [favourites, setFavourites] = useState([]);
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        const storedPhone = localStorage.getItem('hotelUserPhone');
        if (storedPhone) {
            setPhone(storedPhone);
        }
        const storedProfile = localStorage.getItem('hotelUserProfile');
        if (storedProfile) {
            setFormData(JSON.parse(storedProfile));
        }
        // Load favourites from localStorage
        const favs = JSON.parse(localStorage.getItem('hotelFavourites') || '[]');
        setFavourites(favs);
        
        // Load addresses from localStorage
        const savedAddresses = localStorage.getItem('hotelUserAddresses');
        if (savedAddresses) {
            setAddresses(JSON.parse(savedAddresses));
        }
    }, []);

    // State for form inputs
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        localStorage.setItem('hotelUserProfile', JSON.stringify(formData));
        setSaveSuccess(true);
        setShowEdit(false);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem('hotelUserPhone');
        localStorage.removeItem('hotelUserProfile');
        localStorage.removeItem('hotelUserAddresses');
        localStorage.removeItem('hotelFavourites');
        navigate('/home-hotel');
    };

    // Remove favourite handler
    const handleRemoveFavourite = (id) => {
        const updated = favourites.filter(hotel => hotel.id !== id);
        setFavourites(updated);
        localStorage.setItem('hotelFavourites', JSON.stringify(updated));
    };

    // Get default address
    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 p-4">
                <div className="relative flex items-center justify-center max-w-2xl mx-auto px-4">
                    <button onClick={() => navigate(-1)} className="absolute left-0">
                        <ArrowLeft size={24} className="text-gray-700 hover:text-sky-600" />
                    </button>
                    <h1 className="text-lg font-bold text-sky-600">My Account</h1>
                </div>
            </header>

            <div className="pt-20 pb-24 max-w-2xl mx-auto px-2">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center mb-6 relative">
                    <div className="rounded-full h-20 w-20 bg-sky-100 flex items-center justify-center border-2 border-sky-200 mb-2">
                        <User size={40} className="text-sky-600" />
                    </div>
                    <div className="text-lg font-semibold text-gray-800">{(formData.firstName || formData.lastName) ? `${formData.firstName} ${formData.lastName}`.trim() : phone}</div>
                    <div className="text-sm text-gray-500">{formData.email || 'Add your email'}</div>
                    <button
                        onClick={() => setShowEdit(true)}
                        className="absolute top-4 right-4 text-sky-600 text-xs font-semibold border border-sky-200 rounded-full px-3 py-1 hover:bg-sky-50 transition"
                    >
                        Edit
                    </button>
                </div>

                {/* Address Card */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <MapPin size={20} className="text-sky-600" />
                            Default Address
                        </h2>
                        <button 
                            onClick={() => navigate('/hotel-addresses')}
                            className="text-sky-600 text-sm font-medium hover:text-sky-800"
                        >
                            Manage
                        </button>
                    </div>
                    
                    {defaultAddress ? (
                        <div className="text-gray-600">
                            <p>{defaultAddress.street}</p>
                            <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
                            <p>{defaultAddress.country}</p>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-sm">
                            No address added yet
                        </div>
                    )}
                </div>

                {/* Edit Profile Modal */}
                {showEdit && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm mx-auto relative">
                            <h2 className="text-lg font-bold mb-4 text-sky-700">Edit Profile</h2>
                            <form onSubmit={handleSaveChanges} className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="First Name"
                                        className="w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Last Name"
                                        className="w-1/2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email Address"
                                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={phone}
                                        readOnly
                                        className="w-full p-2 pl-10 border rounded-md bg-gray-100 cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowEdit(false)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {saveSuccess && (
                                    <p className="text-green-600 text-sm mt-2 text-center">
                                        Changes saved successfully!
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Favourites Section */}
                <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
                    <div className="flex items-center mb-3 gap-2">
                        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                        <h2 className="text-base font-bold text-gray-800">Favourites</h2>
                    </div>
                    {favourites.length === 0 ? (
                        <div className="text-gray-400 text-sm text-center py-4">You have not added any favourite hotels yet.</div>
                    ) : (
                        <div className="grid gap-3">
                            {favourites.map(hotel => (
                                <div key={hotel.id} className="flex items-center gap-4 border rounded-xl p-3 bg-gray-50">
                                    <img src={hotel.image} alt={hotel.name} className="w-16 h-16 object-cover rounded-lg border" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-700">{hotel.name}</div>
                                        <div className="text-xs text-gray-400">{hotel.location}</div>
                                    </div>
                                    <button onClick={() => handleRemoveFavourite(hotel.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full" title="Remove from favourites">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-2 mb-6">
                    <button
                        onClick={() => navigate('/hotel-addresses')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition"
                    >
                        <Home size={20} className="text-sky-600" />
                        <span className="font-medium text-gray-700">My Addresses</span>
                    </button>
                    <button
                        onClick={() => navigate('/hotel-support')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-sky-50 transition"
                    >
                        <HelpCircle size={20} className="text-sky-600" />
                        <span className="font-medium text-gray-700">Support</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition"
                    >
                        <LogOut size={20} className="text-red-500" />
                        <span className="font-medium text-red-500">Log Out</span>
                    </button>
                </div>
            </div>

            <FooterHotel />
        </div>
    );
}

export default AccountHotel;