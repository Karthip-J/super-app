import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../SubPages/Header';
import Footer from '../SubPages/Footer';
import profilepic from '../Images/profilepic.svg';
import { User, Package, Heart, Settings, ShoppingCart  } from "lucide-react";

const tabs = [
    { id: "profile", label: "Your Profile", icon: <User size={16} />, path: "/home-grocery/profile" },
    { id: "order", label: "Your Order", icon: <Package size={16} />, path: "/home-grocery/order-list" },
    { id: "address", label: "Address", icon: <User size={16} />, path: "/home-grocery/edit-all-addresses" },
    { id: "cart", label: "My Cart", icon: <ShoppingCart  size={16} />, path: "/home-grocery/cart" },
    { id: "wishlist", label: "Wishlist", icon: <Heart size={16} />, path: "/home-grocery/wishlist" },
    { id: "settings", label: "Settings", icon: <Settings size={16} />, path: "/home-grocery/settings" },
   
];

function Account() {
    const [activeTab, setActiveTab] = useState("");
    const navigate = useNavigate();
    const [userName, setUserName] = useState("Breeza Quiz"); // Default name
    const [profilePicture, setProfilePicture] = useState(profilepic); // New state for profile picture

    useEffect(() => {
        const storedProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (storedProfile) {
            if (storedProfile.fullName) {
                setUserName(storedProfile.fullName);
            }
            if (storedProfile.profileImage) {
                setProfilePicture(storedProfile.profileImage);
            } else {
                setProfilePicture(profilepic); // Fallback to default if no image in storage
            }
        }
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        navigate(tab.path);
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <Header />
            <div className='pt-20 px-4'>

                <div className="mt-4 bg-white rounded-full p-2 border border-[#E1E1E1] flex items-center gap-3">
                    <img src={profilePicture} alt="Profile" className="rounded-full w-[50px] h-[50px] object-cover" />
                    <div>
                        <div className='text-xs font-medium'>Your Account</div>
                        <div className='text-base font-semibold'>{userName}</div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center">
                    <div className="w-full grid grid-cols-2 gap-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab)}
                                className={`flex items-center px-4 py-2 rounded-full transition-all 
              ${activeTab === tab.id
                                        ? "bg-[#5C3FFF] text-white font-medium text-base"
                                        : "border border-[#E1E1E1] text-[#242424] bg-white font-medium text-base"
                                    }`}
                            >
                                {tab.icon}
                                <span className="ml-2">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Account;
