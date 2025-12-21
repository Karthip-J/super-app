import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Home, Building2 } from "lucide-react";
import back from "../../Icons/backiconhome.svg";

function FooterHotel() {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: "/home", icon: Home, label: "Home" },
        { id: "/home-hotel/bookings", icon: Building2, label: "Dashboard" },
        { id: "/home-hotel/profile", icon: User, label: "Profile" },
    ];

    return (
        <div className="fixed bottom-0 w-full bg-white shadow-md flex items-center py-0.5 border-t pb-[env(safe-area-inset-bottom)] rounded-t-lg z-50 min-h-[48px]">
            {/* Back Button */}
            <button onClick={() => navigate("/home")} className="flex items-center justify-center w-8 h-8 ml-1">
                <img src={back} alt="Back" style={{ width: "18px", height: "18px" }} />
            </button>
           
            {/* Divider */}
            <div className="w-[1px] h-5 bg-gray-300 ml-2"></div>

            {/* Navigation Items */}
            <div className="flex justify-around flex-1">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = location.pathname === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.id)}
                            className={`flex flex-col items-center transition-all px-1 ${isActive ? "text-[#5C3FFF]" : "text-gray-400"}`}
                        >
                            <IconComponent
                                size={18}
                                className={`transition-all ${isActive ? "text-[#5C3FFF]" : "text-gray-400"}`}
                            />
                            <div className={`h-0.5 w-4 rounded-full mt-0.5 ${isActive ? "bg-[#5C3FFF]" : "bg-transparent"}`}></div>
                        </button>
                    );
                })}
            </div>
        
        </div>
    );
}

export default FooterHotel;
