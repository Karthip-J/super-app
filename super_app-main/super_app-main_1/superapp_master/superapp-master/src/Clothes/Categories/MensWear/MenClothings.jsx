import API_CONFIG from "../../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import Footer from '../../../Utility/Footer';
import ClothesHeader from '../../Header/ClothesHeader';
import { useNavigate, Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

// Import specific images for categories - using existing images and placeholders
import Tops from '../../Images/TShirt.png';
import Suits from '../../Images/NavyBlueBlazer.png';
import Footwear from '../../Images/RunningShoes.png';
import Outerwear from '../../Images/NavyBlueBlazer.png';
import Loungewear from '../../Images/TrackPants.png';
import SeasonalCollections from '../../Images/SportsTShirt.png';
import Bottom from '../../Images/TrackPants.png';
import NewArrivals from '../../Images/WhiteFormalShirt.jpg';

// Add banner images - using existing banner images from HomeScreen
import Banner1 from '../../../Images/HomeScreen/banner1.svg';
import Banner2 from '../../../Images/HomeScreen/banner2.svg';
import Banner3 from '../../../Images/HomeScreen/banner3.svg';

const banners = [
  {
    id: 1,
    image: Banner1
  },
  {
    id: 2,
    image: Banner2
  },
  {
    id: 3,
    image: Banner3
  }
];

const menClothingSubCategories = [
  {
    id: 1,
    name: 'NEW ARRIVALS',
    image: NewArrivals,
    route: '/categories/mens-wear/new-arrivals'
  },
  {
    id: 2,
    name: 'TOPS',
    image: Tops,
    route: '/categories/mens-wear/tops' 
  },
  {
    id: 3,
    name: 'BOTTOMS',
    image: Bottom,
    route: '/categories/mens-wear/bottoms'
  },
  {
    id: 4,
    name: 'OUTERWEAR',
    image: Outerwear,
    route: '/categories/mens-wear/outerwear'
  },
  {
    id: 5,
    name: 'SUITS & FORMALS',
    image: Suits,
    route: '/categories/mens-wear/suits-formals'
  },
  {
    id: 6,
    name: 'UNDERWEAR & LOUNGEWEAR',
    image: Loungewear,
    route: '/categories/mens-wear/underwear-loungewear'
  },
  {
    id: 7,
    name: 'FOOTWEAR',
    image: Footwear,
    route: '/categories/mens-wear/footwear'
  },
  {
    id: 8,
    name: 'ACCESSORIES',
    image: 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400', // Placeholder for Accessories
    route: '/categories/mens-wear/accessories'
  },
  {
    id: 9,
    name: 'SEASONAL COLLECTIONS',
    image: SeasonalCollections,
    route: '/categories/mens-wear/seasonal-collections'
  },
  
];

const CategoryCard = ({ category, onClick }) => {
  return (
    <div 
      className="relative rounded-md overflow-hidden cursor-pointer group shadow-sm hover:shadow-lg transition-all duration-300"
      onClick={onClick}
    >
      <div className="aspect-square relative">
        <img 
          src={category.image} 
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
        {/* Overlay text: centered on mobile, top-left on sm+ */}
        <div className="absolute inset-0 flex items-center justify-center sm:items-start sm:justify-start">
          <span className="bg-black bg-opacity-60 text-white text-xs sm:text-sm font-bold uppercase tracking-wide px-1.5 py-0.5 sm:px-2 sm:py-1 rounded sm:bg-opacity-40 sm:mt-4 sm:ml-4 text-center w-full sm:w-auto break-words">
            {category.name}
          </span>
        </div>
      </div>
    </div>
  );
};

function MenClothings() {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(timer);
  }, []);

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      const cartRes = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.cart), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (cartRes.data && cartRes.data.data && cartRes.data.data.items) {
        setCartItems(cartRes.data.data.items.map(item => ({
          ...item.product,
          quantity: item.quantity,
          id: item.product_id,
          cartItemId: item.id
        })));
      } else {
        setCartItems([]);
      }
    } catch (e) {
      setCartItems([]);
    }
  };
  useEffect(() => {
    fetchCart();
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ClothesHeader />
      
      <div className="pt-20 px-4 md:px-8 pb-32"> {/* Adjust pt based on your header height */}
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-600 mb-4">
          <Link to="/home-clothes" className="hover:underline">Home</Link> / <Link to="/home-clothes/categories" className="hover:underline">Categories</Link> / <span className="font-semibold">Men's Wear</span>
        </div>

        {/* Main Categories Section */}
        <div className="mb-12 text-center">
          <h4 className="text-2xl font-extrabold mb-10 text-gray-800 tracking-tight">MEN'S WEAR CATEGORIES</h4>
          
          {/* Sliding Banner Section */}
          <div className="relative mb-6 overflow-hidden rounded-lg shadow-lg max-w-md mx-auto">
            <div 
              className="flex transition-transform duration-500 ease-in-out w-full"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {banners.map((banner) => (
                <div key={banner.id} className="min-w-full flex-shrink-0">
                  <div className="relative h-[110px] sm:h-[140px] md:h-[170px] w-full">
                    <img 
                      src={banner.image} 
                      alt="Banner"
                      className="w-full h-full object-cover bg-gray-100"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={prevBanner}
              className="absolute left-0.5 sm:left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-lg transition-all duration-300"
            >
              <FaChevronLeft className="w-2.5 h-2.5 sm:w-3 h-3" />
            </button>
            <button 
              onClick={nextBanner}
              className="absolute right-0.5 sm:right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full shadow-lg transition-all duration-300"
            >
              <FaChevronRight className="w-2.5 h-2.5 sm:w-3 h-3" />
            </button>

            {/* Navigation Dots */}
            <div className="absolute bottom-0.5 sm:bottom-1 left-1/2 -translate-x-1/2 flex space-x-1">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 ${
                    currentBanner === index ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-3 gap-6">
            {menClothingSubCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => navigate(category.route)}
              />
            ))}
          </div>
        </div>
      </div>
                                                              
      <Footer />
    </div>
  );
}

export default MenClothings;