import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bellIcon from "../../Images/HomeScreen/bellIcon.svg";
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../Utility/CartContext';

const MyntraClothesHeader = ({
    searchQuery,
    setSearchQuery,
    handleSearchKeyDown,
    handleSearchFocus,
    showSearchDropdown,
    searchResults,
    searchLoading,
    searchMessage,
    handleProductNavigate,
    recentSearches,
    handleClearRecentSearches,
    handleRecentSearchClick,
    searchContainerRef
}) => {
    const navigate = useNavigate();
    const { cart } = useCart();

    // Calculate total items in cart
    const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    const navLinks = [
        { name: 'MEN', route: '/categories/mens-wear' },
        { name: 'WOMEN', route: '/categories/womens-wear' },
        { name: 'KIDS', route: '/categories/kids' },
        { name: 'HOME & LIVING', route: '/categories/home-living' },
        { name: 'BEAUTY', route: '/categories/cosmetics' },
        { name: 'STUDIO', route: '/studio', isNew: true }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-[100] h-20 flex items-center px-4 md:px-10 font-[Assistant,sans-serif]">
            <div className="flex items-center w-full max-w-[1440px] mx-auto gap-4 md:gap-8">
                {/* Logo Section */}
                <div className="shrink-0 cursor-pointer flex items-center" onClick={() => navigate('/home-clothes')}>
                    <img src={bellIcon} alt="CityBell" className="h-10 md:h-12 w-auto" />
                    <span className="hidden md:block ml-2 text-xl font-black tracking-tighter text-gray-900">CityBell</span>
                </div>

                {/* Desktop Navigation Links */}
                <nav className="hidden lg:flex items-center h-full gap-6 xl:gap-8 ml-4">
                    {navLinks.map((link) => (
                        <div
                            key={link.name}
                            className="relative h-full flex items-center cursor-pointer group pt-1"
                            onClick={() => navigate(link.route)}
                        >
                            <span className="text-[12px] xl:text-[14px] font-bold text-gray-800 tracking-tight group-hover:text-pink-600 transition-colors uppercase">
                                {link.name}
                            </span>
                            {link.isNew && (
                                <span className="absolute -top-1 -right-4 text-[8px] font-bold text-pink-500">NEW</span>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                        </div>
                    ))}
                </nav>

                {/* Search Bar - Myntra Style */}
                <div className="flex-1 max-w-[500px] relative hidden sm:block ml-auto" ref={searchContainerRef}>
                    <div className="bg-[#f5f5f6] flex items-center h-10 rounded-md border border-transparent focus-within:bg-white focus-within:border-[#eaeaec] px-4 transition-all overflow-hidden group">
                        <Search className="text-gray-500 group-focus-within:text-gray-800 mr-3" size={18} />
                        <input
                            type="text"
                            placeholder="Search for products, brands and more"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={handleSearchFocus}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full bg-transparent text-sm font-normal focus:outline-none placeholder-gray-500 text-gray-800"
                        />
                    </div>

                    {/* Search Dropdown */}
                    {showSearchDropdown && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-sm shadow-2xl z-30 max-h-96 overflow-y-auto p-4">
                            {searchQuery.trim() ? (
                                <>
                                    {searchLoading && (
                                        <div className="text-center text-sm text-gray-400 py-4">Searching stores...</div>
                                    )}
                                    <div className="space-y-1">
                                        {!searchLoading && searchResults.map(product => (
                                            <button
                                                key={product.id || product._id}
                                                onClick={() => handleProductNavigate(product)}
                                                className="w-full flex items-center gap-4 p-2 hover:bg-[#f5f5f6] rounded-md transition-colors text-left"
                                            >
                                                <div className="w-12 h-14 bg-gray-50 flex items-center justify-center overflow-hidden rounded">
                                                    {product.image ? (
                                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400">IMG</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                                                    <p className="text-xs text-pink-500 font-medium mt-0.5">₹{product.discountedPrice || product.price}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    {!searchLoading && searchMessage && (
                                        <div className="text-center text-sm text-gray-500 py-4 font-medium">{searchMessage}</div>
                                    )}
                                </>
                            ) : (
                                <div className="">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent Searches</span>
                                        {recentSearches.length > 0 && (
                                            <button onClick={handleClearRecentSearches} className="text-[11px] text-pink-500 font-bold hover:underline">CLEAR ALL</button>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {recentSearches.map((term, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleRecentSearchClick(term)}
                                                className="text-sm text-gray-600 py-2 hover:text-pink-500 text-left flex items-center gap-2"
                                            >
                                                <Search size={14} className="text-gray-300" /> {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Icons Section */}
                <div className="flex items-center gap-4 md:gap-8 ml-auto shrink-0">
                    <div className="flex flex-col items-center group cursor-pointer" onClick={() => navigate('/home-clothes/account')}>
                        <User size={20} className="text-gray-700 group-hover:text-pink-500 transition-colors" />
                        <span className="text-[10px] font-bold mt-1 text-gray-800 group-hover:text-pink-500">Profile</span>
                    </div>
                    <div className="hidden md:flex flex-col items-center group cursor-pointer" onClick={() => navigate('/home-clothes/wishlist')}>
                        <Heart size={20} className="text-gray-700 group-hover:text-pink-500 transition-colors" />
                        <span className="text-[10px] font-bold mt-1 text-gray-800 group-hover:text-pink-500">Wishlist</span>
                    </div>
                    <div className="flex flex-col items-center group cursor-pointer relative" onClick={() => navigate('/home-clothes/cart')}>
                        <ShoppingBag size={20} className="text-gray-700 group-hover:text-pink-500 transition-colors" />
                        <span className="text-[10px] font-bold mt-1 text-gray-800 group-hover:text-pink-500">Bag</span>
                        {cartCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                {cartCount}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Search Trigger */}
                <div className="sm:hidden text-gray-700" onClick={() => handleSearchFocus()}>
                    <Search size={22} />
                </div>
            </div>
        </header>
    );
};

export default MyntraClothesHeader;
