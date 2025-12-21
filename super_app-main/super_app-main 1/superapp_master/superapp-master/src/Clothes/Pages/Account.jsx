import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MyntraClothesHeader from '../Header/MyntraClothesHeader';
import Footer from '../../Utility/Footer';
import profilepic from '../Images/profilepic.svg';
import { User, Package, Heart, Settings, ShoppingCart } from "lucide-react";

const tabs = [
    { id: "profile", label: "Your Profile", icon: <User size={16} />, path: "/home-clothes/profile" },
    { id: "order", label: "Your Order", icon: <Package size={16} />, path: "/home-clothes/order-list" },
    { id: "address", label: "Address", icon: <User size={16} />, path: "/home-clothes/edit-all-addresses" },
    { id: "cart", label: "My Cart", icon: <ShoppingCart size={16} />, path: "/home-clothes/cart" },
    { id: "wishlist", label: "Wishlist", icon: <Heart size={16} />, path: "/home-clothes/wishlist" },
    { id: "settings", label: "Settings", icon: <Settings size={16} />, path: "/home-clothes/settings" },

];

function Account() {
    const [activeTab, setActiveTab] = useState("");
    const navigate = useNavigate();

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        navigate(tab.path);
    };

    return (
        <div className='bg-white min-h-screen'>
            <MyntraClothesHeader />
            <div className='pt-24 px-4 max-w-[1248px] mx-auto'>

                <div className="mt-4 bg-white rounded-full p-2 border border-[#E1E1E1] flex items-center gap-3">
                    <img src={profilepic} alt="Profile" className="rounded-full" style={{ width: "50px", height: "50px" }} />
                    <div>
                        <div className='text-xs font-medium'>Your Account</div>
                        <div className='text-base font-semibold'>Breeza Quiz</div>
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
