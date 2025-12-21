import React, { useState, useRef, useEffect } from 'react';
import { Package, Heart, Settings, ShoppingCart, MapPin, CreditCard, Bell, HelpCircle, LogOut, Edit2, Camera, Check, X, ChevronLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import FooterFood from '../ComponentsF/FooterFood';

const AccountFood = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Mock user data
  const [originalUserData, setOriginalUserData] = useState({ 
    name: "John Doe", 
    email: "john.doe@example.com", 
    phone: "+91 98765 43210", 
    avatar: "/profilepic.svg" 
  });
  
  const [formData, setFormData] = useState({ 
    name: "John Doe", 
    email: "john.doe@example.com", 
    phone: "+91 98765 43210", 
    avatar: "/profilepic.svg" 
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setFormData(originalUserData);
  }, []);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleLogout = async () => {
    try {
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setStatusMessage({ type: 'error', text: 'Logout failed. Please try again.' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFormData(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
    }
  };

  const handleSave = async () => {
    setStatusMessage({ type: 'loading', text: 'Saving profile...' });
    
    try {
      let newPhotoURL = formData.avatar;
      
      // Simulate image upload (no actual upload since no auth)
      if (imageFile) {
        newPhotoURL = URL.createObjectURL(imageFile); // Local URL for preview
      }
      
      // Update original data
      setOriginalUserData({
        ...formData,
        avatar: newPhotoURL
      });
      
      setStatusMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setImageFile(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setStatusMessage({ type: 'error', text: `Error saving profile: ${error.message}` });
    }
  };

  const handleCancel = () => {
    setFormData(originalUserData);
    setImageFile(null);
    setIsEditing(false);
    setStatusMessage({ type: '', text: '' });
  };

  const menuItems = [
    { 
      icon: <Package size={20} />, 
      text: 'My Orders', 
      tab: 'orders',
      path: '/home-food/orders-history' 
    },
    { 
      icon: <Heart size={20} />, 
      text: 'Wishlist', 
      tab: 'wishlist',
      path: '/wishlist' 
    },
    { 
      icon: <MapPin size={20} />, 
      text: 'My Addresses', 
      tab: 'addresses',
      path: '/home-food/add-address' 
    },
    { 
      icon: <CreditCard size={20} />, 
      text: 'Payment Methods', 
      tab: 'payment',
      path: '/home-food/payment-type' 
    },
    { 
      icon: <Bell size={20} />, 
      text: 'Notifications', 
      tab: 'notifications',
      path: '/home-food/notification' 
    },
    { 
      icon: <HelpCircle size={20} />, 
      text: 'Help & Support', 
      tab: 'help',
      path: '/help' 
    },
    { 
      icon: <Settings size={20} />, 
      text: 'Settings', 
      tab: 'settings',
      path: '/home-food/settings' 
    },
  ];

  const handleNavigation = (path, tab) => {
    setActiveTab(tab);
    navigate(path);
  };

   return (
    <>
      <div className="bg-gray-50 min-h-screen p-4 max-w-4xl mx-auto">
        {/* Back button header */}
        <div className="flex items-center mb-4">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ChevronLeft size={24} className="mr-1" />
          </button>
          <h1 className="text-xl font-semibold">My Account</h1>
        </div>

        {statusMessage.text && (
          <div className={`p-3 mb-4 rounded-lg text-center text-sm ${
            statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 
            statusMessage.type === 'error' ? 'bg-red-100 text-red-800' : 
            statusMessage.type === 'loading' ? 'bg-blue-100 text-blue-800' : ''
          }`}>
            {statusMessage.text}
          </div>
        )}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={formData.avatar} 
              className="w-16 h-16 rounded-full border-2 border-green-500 object-cover"
              alt="Profile"
            />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
            {isEditing ? (
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full"
              >
                <Camera size={14} />
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="flex-1 space-y-2">
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Full Name"
              />
              <input
                name="email"
                value={formData.email}
                disabled
                className="w-full p-2 border rounded-lg bg-gray-100"
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Phone Number"
              />
            </div>
          ) : (
            <div>
              <h2 className="font-medium text-lg">{formData.name}</h2>
              <p className="text-sm text-gray-600">{formData.email}</p>
              <p className="text-sm text-gray-600">{formData.phone}</p>
            </div>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 justify-end mt-4">
            <button 
              onClick={handleCancel}
              className="flex items-center px-3 py-1 text-sm border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <X size={16} className="mr-1" /> Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Check size={16} className="mr-1" /> Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <h3 className="font-bold text-lg">12</h3>
          <p className="text-xs text-gray-500">Orders</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <h3 className="font-bold text-lg">2</h3>
          <p className="text-xs text-gray-500">Wishlisted</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm text-center">
          <h3 className="font-bold text-lg">5</h3>
          <p className="text-xs text-gray-500">Coupons</p>
        </div>
      </div>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => handleNavigation(item.path, item.tab)}
            className={`w-full flex items-center gap-4 p-3 rounded-lg text-left ${
              activeTab === item.tab ? 'bg-green-100 text-green-700' : 'bg-white hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span className="flex-1">{item.text}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-3 rounded-lg text-left bg-white text-red-500 hover:bg-red-50"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
      <FooterFood />
    </>
  );
};

export default AccountFood;