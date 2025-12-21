import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, User, ShoppingCart } from "lucide-react";
import { useFoodCart } from "../../Utility/FoodCartContext";

function FooterFood() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItemCount } = useFoodCart();

    const navItems = [
        { id: "/home", icon: Home, label: "Home" },
        { id: "/home-food/account", icon: User, label: "Profile" },
        { id: "/home-food/cart", icon: ShoppingCart, label: "Cart" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-sm z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    {navItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname.startsWith(item.id);
                        const isCart = item.id === "/home-food/cart";

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.id)}
                                className={`flex flex-col items-center px-4 py-1 relative ${isActive ? "text-[#FF6B00]" : "text-gray-500"}`}
                            >
                                {/* Dynamic Cart badge */}
                                {isCart && cartItemCount > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center font-medium shadow-md z-10 px-1">
                                        {cartItemCount > 99 ? '99+' : cartItemCount}
                                    </div>
                                )}
                                
                                <IconComponent
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={isActive ? "text-[#FF6B00]" : "text-gray-500"}
                                />
                                <span className={`text-xs mt-1 ${isActive ? "text-[#FF6B00] font-medium" : "text-gray-500 font-normal"}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default FooterFood;