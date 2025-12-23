import API_CONFIG from "../../config/api.config.js";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MyntraClothesHeader from '../Header/MyntraClothesHeader';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import "swiper/css/navigation";
import banner1 from "../Images/mens_wear_banner.jpg";
import banner2 from "../Images/womens_wear_banner.jpg";
import banner3 from "../Images/cosmetics_banner.jpg";
import banner4 from "../Images/home_appliances_banner.jpeg";
import mensWear from "../Images/mensWear.jpg";
import womensWear from "../Images/womensWear.jpeg";
import cosmetics from '../Images/cosmetics.jpg';
import homeAppliances from '../Images/homeAppliance.jpg';
import Footer from '../../Utility/Footer';
import { fetchAllProducts, transformProductForFrontend } from '../../services/productService';
import { ChevronRight } from 'lucide-react';

const defaultImages = {
    'mens-wear': mensWear,
    'womens-wear': womensWear,
    'women\'s-wear': womensWear,
    'cosmetics': cosmetics,
    'home-appliances': homeAppliances,
    'default': cosmetics
};

const bannerImages = [
    { id: 1, image: banner1 },
    { id: 2, image: banner2 },
    { id: 3, image: banner3 },
    { id: 4, image: banner4 }
];

function HomeC() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const stored = localStorage.getItem('clothesRecentSearches');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');
    const [productsLoaded, setProductsLoaded] = useState(false);
    const [allProducts, setAllProducts] = useState([]);
    const searchContainerRef = useRef(null);
    const allProductsRef = useRef([]);

    // Category Icons with Flipkart-style circles
    const categoryIcons = [
        { name: 'Top Offers', icon: 'https://rukminim2.flixcart.com/fk-p-flap/64/64/image/698ba0ce2c884044.jpg?q=100', slug: 'top-offers' },
        { name: 'Mobiles', icon: 'https://rukminim2.flixcart.com/flap/64/64/image/22fddf3c7da4c4f4.png?q=100', slug: 'mobiles' },
        { name: 'Electronics', icon: 'https://rukminim2.flixcart.com/flap/64/64/image/69cff05553af23a4.png?q=100', slug: 'electronics' },
        { name: 'Fashion', icon: 'https://rukminim2.flixcart.com/flap/64/64/image/82b3ca5fb2301045.png?q=100', slug: 'mens-wear' },
        { name: 'Home', icon: 'https://rukminim2.flixcart.com/flap/64/64/image/ab7e2c021d97a8e2.png?q=100', slug: 'home-appliances' },
        { name: 'Beauty', icon: 'https://rukminim2.flixcart.com/flap/64/64/image/dff3f7adcf3a90c6.png?q=100', slug: 'cosmetics' },
        { name: 'Furniture', icon: 'https://rukminim2.flixcart.com/flap/64/64/image/ee162bad96f476ae.png?q=100', slug: 'furniture' },
        { name: 'Grocery', icon: 'https://rukminim2.flixcart.com/flap/64/64/image/29327f40e9c4d26b.png?q=100', slug: 'grocery' },
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token') || 'demo-token';
                const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PARENT_CATEGORIES), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const responseData = await response.json();
                    const categoriesData = responseData.data || responseData;
                    const activeCategories = Array.isArray(categoriesData) ? categoriesData : [];

                    const transformed = activeCategories.map(cat => ({
                        name: cat.name,
                        slug: cat.slug,
                        image: defaultImages[cat.slug] || defaultImages['default'],
                        route: `/categories/${cat.slug}`
                    }));
                    setCategories(transformed);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
        loadAllProducts();
    }, []);

    const loadAllProducts = async () => {
        try {
            const response = await fetchAllProducts();
            if (response.success) {
                const normalized = (Array.isArray(response.data.data) ? response.data.data : []).map(transformProductForFrontend);
                setAllProducts(normalized);
                allProductsRef.current = normalized;
                setProductsLoaded(true);
            }
        } catch (error) { console.error(error); }
    };

    // Search Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        const timer = setTimeout(() => {
            const filtered = allProductsRef.current.filter(p =>
                `${p.name} ${p.category}`.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(filtered.slice(0, 6));
            setSearchLoading(false);
            setSearchMessage(filtered.length === 0 ? 'No products found' : '');
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleProductNavigate = (product) => {
        navigate(`/product/${product.id}`);
        setSearchQuery('');
        setShowSearchDropdown(false);
    };

    return (
        <div className="min-h-screen bg-white font-[Assistant,sans-serif]">
            <MyntraClothesHeader
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                showSearchDropdown={showSearchDropdown}
                handleSearchFocus={() => setShowSearchDropdown(true)}
                handleProductNavigate={handleProductNavigate}
                searchLoading={searchLoading}
                searchMessage={searchMessage}
                recentSearches={recentSearches}
                handleClearRecentSearches={() => { setRecentSearches([]); localStorage.removeItem('clothesRecentSearches'); }}
                handleRecentSearchClick={(term) => setSearchQuery(term)}
                searchContainerRef={searchContainerRef}
            />

            <main className="pt-20 md:pt-24 pb-8">
                {/* Category Bar */}
                <div className="bg-white shadow-sm mb-2 overflow-x-auto no-scrollbar">
                    <div className="max-w-[1248px] mx-auto flex justify-between items-center py-3 px-4 md:px-10 min-w-max gap-8 md:gap-0">
                        {categoryIcons.map((cat, idx) => (
                            <div
                                key={idx}
                                className="flex flex-col items-center gap-1 group cursor-pointer shrink-0"
                                onClick={() => {
                                    if (cat.slug === 'grocery') {
                                        navigate('/home-grocery');
                                    } else if (cat.slug === 'top-offers') {
                                        navigate('/home-clothes');
                                    } else {
                                        navigate(`/categories/${cat.slug}`);
                                    }
                                }}
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                                    <img
                                        src={cat.icon}
                                        alt={cat.name}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/64?text=' + cat.name;
                                        }}
                                    />
                                </div>
                                <span className="text-[12px] md:text-[14px] font-medium text-gray-800 group-hover:text-[#2874F0]">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-[1248px] mx-auto px-2 md:px-3">
                    {/* Hero Slider */}
                    <div className="mb-4 rounded-sm overflow-hidden shadow-sm">
                        <Swiper
                            modules={[Autoplay, Pagination, Navigation]}
                            autoplay={{ delay: 3500 }}
                            pagination={{ clickable: true }}
                            navigation={true}
                            loop={true}
                            className="h-[150px] md:h-[280px]"
                        >
                            {bannerImages.map((banner) => (
                                <SwiperSlide key={banner.id}>
                                    <img src={banner.image} alt="Promotion" className="w-full h-full object-cover" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Best of Fashion (Horizontal Reel) */}
                    <div className="bg-white mb-8">
                        <div className="flex items-center justify-between py-6 border-b border-gray-100 mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Best of Fashion</h2>
                                <div className="h-1 w-20 bg-pink-500 mt-1"></div>
                            </div>
                            <button className="text-pink-500 border border-gray-200 px-6 py-2 rounded-sm text-sm font-bold hover:bg-gray-50 transition-colors uppercase tracking-widest">
                                VIEW ALL
                            </button>
                        </div>
                        <div className="overflow-x-auto no-scrollbar flex gap-6 pb-4">
                            {allProducts.filter(p => !p.isBestSeller).slice(0, 8).map(product => (
                                <div
                                    key={product.id}
                                    className="min-w-[150px] md:min-w-[190px] flex flex-col group cursor-pointer"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <div className="w-full aspect-[3/4] mb-3 overflow-hidden rounded-sm bg-gray-50">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 truncate mb-1">{product.name}</h3>
                                    <p className="text-pink-500 text-sm font-black italic">Min. 50% Off</p>
                                    <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-wider">Limited Time Only</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Categories Grid */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-8">Shop by Category</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((cat, idx) => (
                                <div
                                    key={idx}
                                    className="relative aspect-[3/4] cursor-pointer group overflow-hidden"
                                    onClick={() => navigate(cat.route)}
                                >
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <div className="absolute bottom-6 left-0 right-0 text-center">
                                        <div className="bg-white/90 backdrop-blur-sm mx-4 py-3 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                            <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">{cat.name}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggested for You */}
                    <div className="bg-white pb-20">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-8">Suggested for You</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {allProducts.slice(0, 10).map(product => (
                                <div
                                    key={product.id}
                                    className="group cursor-pointer flex flex-col"
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <div className="aspect-[3/4] relative bg-[#f9f9f9] overflow-hidden mb-3">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            WISHLIST
                                        </div>
                                    </div>
                                    <div className="">
                                        <h4 className="text-sm font-bold text-gray-800 truncate mb-1">{product.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-gray-900 font-black text-sm">₹{product.discountedPrice}</span>
                                            <span className="text-gray-400 line-through text-[11px]">₹{product.price}</span>
                                            <span className="text-pink-500 text-[11px] font-bold">
                                                ({Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% OFF)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .swiper-button-next, .swiper-button-prev { color: rgba(0,0,0,0.5) !important; background: white; width: 40px !important; height: 80px !important; margin-top: -40px !important; box-shadow: 0 1px 5px rgba(0,0,0,0.2); }
                .swiper-button-next { border-radius: 4px 0 0 4px; right: 0 !important; }
                .swiper-button-prev { border-radius: 0 4px 4px 0; left: 0 !important; }
                .swiper-button-next:after, .swiper-button-prev:after { font-size: 20px !important; font-weight: bold; }
            `}} />
        </div>
    );
}

export default HomeC;