import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Home, LayoutGrid, ShoppingCart } from "lucide-react";

function HomeFooter() {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current path

    const navItems = [
        { id: "", icon: Home, label: "Home" },
        { id: "", icon: LayoutGrid, label: "Categories" },
        { id: "", icon: ShoppingCart, label: "Cart" },
        { id: "", icon: User, label: "Profile" },
    ];

    return (
        <div className="fixed bottom-0 w-full bg-white shadow-md flex justify-around items-center py-3 border-t pb-14 rounded-t-[3rem] z-50">
            {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={`flex flex-col items-center transition-all ${isActive ? "text-[#5C3FFF]" : "text-gray-400"}`}
                    >
                        <IconComponent
                            size={24}
                            className={`transition-all ${isActive ? "text-[#5C3FFF]" : "text-gray-400"}`}
                        />
                        <div className={`h-1 w-6 rounded-full mt-1 ${isActive ? "bg-[#5C3FFF]" : "bg-transparent"}`}></div>
                    </button>
                );
            })}
        </div>
    );
}

export default HomeFooter;
