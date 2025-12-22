import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart } = useCart();

    // Calculate total items in cart
    const cartItemCount = cart?.items?.length || 0;

    const navItems = [
        { id: "/home", icon: Home, label: "Home" },
        { id: "/home-clothes/account", icon: User, label: "Profile" },
        { id: "/home-clothes/cart", icon: ShoppingCart, label: "Cart", isCart: true },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-6xl mx-auto">
                {/* Mobile View (below md breakpoint) */}
                <div className="md:hidden flex items-center justify-around py-3 px-4">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.id;

                        return (
                            <div key={item.id} className="relative flex flex-col items-center justify-center w-full">
                                <button
                                    onClick={() => navigate(item.id)}
                                    className={`flex flex-col items-center justify-center relative ${
                                        isActive ? "text-[#5C3FFF]" : "text-gray-500"
                                    }`}
                                >
                                    {/* Cart Badge - positioned relative to the icon */}
                                    {item.isCart && cartItemCount > 0 && (
                                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center font-medium shadow-md z-10 px-1">
                                            {cartItemCount > 9 ? '9+' : cartItemCount}
                                        </div>
                                    )}
                                    
                                    <IconComponent size={24} />
                                    <span className="text-xs mt-1">{item.label}</span>
                                    <div
                                        className={`h-1 w-6 rounded-full mt-1 ${
                                            isActive ? "bg-[#5C3FFF]" : "bg-transparent"
                                        }`}
                                    ></div>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop View (md breakpoint and above) */}
                <div className="hidden md:flex items-center justify-center py-3 space-x-12">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.id;

                        return (
                            <div key={item.id} className="relative">
                                <button
                                    onClick={() => navigate(item.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors relative ${
                                        isActive
                                            ? "text-[#5C3FFF] bg-[#5C3FFF]/10"
                                            : "text-gray-600 hover:text-[#5C3FFF] hover:bg-gray-100"
                                    }`}
                                >
                                    {/* Cart Badge for Desktop */}
                                    {item.isCart && cartItemCount > 0 && (
                                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-medium shadow-md z-10 px-1">
                                            {cartItemCount > 99 ? '99+' : cartItemCount}
                                        </div>
                                    )}
                                    
                                    <IconComponent size={20} />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Footer;