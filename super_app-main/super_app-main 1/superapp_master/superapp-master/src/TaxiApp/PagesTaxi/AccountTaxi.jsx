import React, { useState, useEffect } from 'react';
import profilepic from '../../Clothes/Images/profilepic.svg';
import { User, Package, Heart, Settings, ShoppingCart } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import HomeHeaderTaxi from '../ComponentsTaxi/HomeHeaderTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";

const tabs = [
    { id: "profile", label: "Your Profile", icon: <User size={16} />, path: "/home-taxi/profile" },
    { id: "rides", label: "My Rides", icon: <Package size={16} />, path: "/home-taxi/my-rides" },
    // { id: "address", label: "Address", icon: <User size={16} />, path: "" },
    // { id: "cart", label: "My Cart", icon: <ShoppingCart  size={16} />, path: "/home-food/cart" },
    { id: "support", label: "Support", icon: <Heart size={16} />, path: "" },
    { id: "settings", label: "Settings", icon: <Settings size={16} />, path: "/home-taxi/settings" },

];

function AccountTaxi() {
    const [activeTab, setActiveTab] = useState("");
    const [profileName, setProfileName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const saved = localStorage.getItem('taxiProfile');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setProfileName(data.fullName || '');
            } catch {}
        }
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab.id);
        navigate(tab.path);
    };

    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <HomeHeaderTaxi />
            <div className='pt-20 px-4 pb-[64px]'>

                <div className="mt-4 bg-white rounded-full p-2 border border-[#E1E1E1] flex items-center gap-3">
                    <img src={profilepic} alt="Profile" className="rounded-full" style={{ width: "50px", height: "50px" }} />
                    <div>
                        <div className='text-xs font-medium'>Your Account</div>
                        <div className='text-base font-semibold'>{profileName || 'Breeza Quiz'}</div>
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
            <FooterTaxi />
        </div>
    );
}

export default AccountTaxi;
