import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Home, Heart, ShoppingCart } from "lucide-react";
import back from "../../Icons/backiconhome.svg";

function Footer() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartItemCount, setCartItemCount] = useState(0);

    // Fetch cart items count on mount and when component updates
    useEffect(() => {
        const fetchCartCount = async () => {
            try {
                const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_CART), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer demo-token'
                    }
                });
                
                if (response.ok) {
                    const responseData = await response.json();
                    const cartData = responseData.data || [];
                    setCartItemCount(cartData.length);
                } else {
                    setCartItemCount(0);
                }
            } catch (err) {
                console.error('Error loading cart count:', err);
                setCartItemCount(0);
            }
        };

        fetchCartCount();

        // Set up interval to refresh cart count every 2 seconds
        const interval = setInterval(fetchCartCount, 2000);

        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { id: "/home", icon: Home, label: "Home" },
        { id: "/home-grocery/cart", icon: ShoppingCart, label: "Cart", isCart: true },
        { id: "/home-grocery/wishlist", icon: Heart, label: "WishList" },
        { id: "/home-grocery/account", icon: User, label: "Profile" },
    ];

    return (
        <div className="fixed bottom-0 w-full bg-white shadow-md flex items-center py-1 border-t pb-12 rounded-t-[3rem] z-50">
            {/* Back Button */}
            <button onClick={() => navigate("/home")} className="flex items-center justify-center w-12 h-12 ml-2">
                <img src={back} alt="Back" style={{ width: "24px", height: "24px" }} />
            </button>
           
            {/* Divider */}
            <div className="w-[1px] h-6 bg-gray-300 ml-3"></div>

            {/* Navigation Items */}
            <div className="flex justify-around flex-1">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = location.pathname === item.id;

                    return (
                        <div key={item.id} className="relative flex flex-col items-center">
                            <button
                                onClick={() => navigate(item.id)}
                                className={`flex flex-col items-center transition-all relative ${isActive ? "text-[#5C3FFF]" : "text-gray-400"}`}
                            >
                                {/* Cart Badge */}
                                {item.isCart && cartItemCount > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center font-medium shadow-md z-10 px-1">
                                        {cartItemCount > 9 ? '9+' : cartItemCount}
                                    </div>
                                )}
                                
                                <IconComponent
                                    size={24}
                                    className={`transition-all ${isActive ? "text-[#5C3FFF]" : "text-gray-400"}`}
                                />
                                <div className={`h-1 w-6 rounded-full mt-1 ${isActive ? "bg-[#5C3FFF]" : "bg-transparent"}`}></div>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Footer;