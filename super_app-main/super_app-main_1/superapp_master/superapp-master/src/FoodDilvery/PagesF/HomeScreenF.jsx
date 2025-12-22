import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BsArrowRight, BsFire } from 'react-icons/bs';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Star, TrendingUp, Clock, MapPin } from 'lucide-react';
import HeaderF from '../ComponentsF/HeaderF';
import FooterFood from '../ComponentsF/FooterFood';

// Import our new food delivery service
import { 
  restaurantService, 
  dishService, 
  formatImageUrl, 
  formatCurrency, 
  formatTime 
} from '../../services/foodDeliveryService';

// Keep static banner images for now (can be moved to backend later)
import promoBanner1 from "../ImagesF/indian-banner1.jpg";
import promoBanner2 from "../ImagesF/indian-banner2.jpg";
import promoBanner3 from "../ImagesF/indian-banner3.jpg";
import mainBanner1 from "../ImagesF/main-banner1.jpg";
import mainBanner2 from "../ImagesF/main-banner2.jpg";
import mainBanner3 from "../ImagesF/main-banner3.jpg";

// Promotional banners (static for now)
const promoBanners = [
  { id: 1, imageF: promoBanner1, alt: "Weekend Special Offer" },
  { id: 2, imageF: promoBanner2, alt: "Family Combo Deal" },
  { id: 3, imageF: promoBanner3, alt: "Festival Discount" }
];

// Main banners (static for now)
const mainBanners = [
  { 
    id: 1, 
    title: "BIG",
    subtitle: "Home delivery",
    offers: [
      { type: "Flat", discount: "25% off", description: "No packaging charges" },
      { type: "Flat", discount: "35% off", description: "CakeZone Patisserie" }
    ],
    image: mainBanner1,
    overlay: "rgba(0,0,0,0.3)"
  },
  { 
    id: 2, 
    title: "SPECIAL",
    subtitle: "Weekend offer",
    offers: [
      { type: "Flat", discount: "30% off", description: "On all orders" },
      { type: "Extra", discount: "Free item", description: "With every purchase" }
    ],
    image: mainBanner2,
    overlay: "rgba(0,0,0,0.25)"
  },
  { 
    id: 3, 
    title: "NEW",
    subtitle: "Try our specials",
    offers: [
      { type: "Combo", discount: "40% off", description: "Family meal deal" },
      { type: "Free", discount: "Delivery", description: "On orders above $20" }
    ],
    image: mainBanner3,
    overlay: "rgba(0,0,0,0.35)"
  }
];

// Category Item Component - Mobile responsive
const CategoryItem = ({ category }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex flex-col items-center cursor-pointer px-1"
      onClick={() => navigate(`/home-food/restaurent-list-based-on-category/${encodeURIComponent(category.name)}`)}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 flex items-center justify-center rounded-full mb-2 border border-orange-200 overflow-hidden">
        {category.image ? (
          <img
            src={formatImageUrl(category.image)}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-orange-600 font-bold text-sm sm:text-lg">
            {category.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-xs text-center font-medium text-gray-700 truncate w-full max-w-[60px] sm:max-w-none">
        {category.name}
      </p>
    </div>
  );
};

// Restaurant Item Component - Mobile responsive
const RestaurantItem = ({ restaurant, categoryName }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => navigate(`/home-food/restaurent-list-based-on-category/${encodeURIComponent(categoryName)}/restaurant/${restaurant._id}`)}
    >
      <div className="relative h-40">
        <img
          src={formatImageUrl(restaurant.image)}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* ✅ FIX: Handle offers object properly */}
        {restaurant.offers && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            {typeof restaurant.offers === 'string' 
              ? restaurant.offers 
              : restaurant.offers.title || restaurant.offers.discount_percentage + '% OFF'
            }
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 truncate">{restaurant.name}</h3>
          <div className="flex items-center">
            <Star size={16} className="text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">{restaurant.rating || 4.0}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-600 text-sm mb-2">
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{restaurant.delivery_time || '30-40 min'}</span>
          </div>
          <div className="flex items-center">
            <MapPin size={14} className="mr-1" />
            <span>{restaurant.location?.area || 'Nearby'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {restaurant.cuisines?.slice(0, 2).map((cuisine, index) => (
            <span key={index} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              {cuisine}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Bestseller Item Component - Remove onError handler, use CSS placeholders
const BestsellerItem = ({ dish }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="flex-shrink-0 w-52 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/home-food/product-details`, { state: { dish } })}
    >
      <div className="relative">
        {dish.image ? (
          <img
            src={formatImageUrl(dish.image)}
            alt={dish.name}
            className="w-full h-24 object-cover"
          />
        ) : (
          <div className="w-full h-24 bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-lg">
              {dish.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        {dish.is_trending && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <TrendingUp size={10} className="mr-1" />
            #{dish.trending_rank}
          </div>
        )}
        {dish.discount_percentage > 0 && (
          <div className="absolute bottom-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
            {dish.discount_percentage}% OFF
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 truncate text-sm">{dish.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <div>
            <span className="text-orange-600 font-bold text-sm">{formatCurrency(dish.price)}</span>
            {dish.original_price && dish.original_price > dish.price && (
              <span className="text-gray-400 text-xs line-through ml-1">{formatCurrency(dish.original_price)}</span>
            )}
          </div>
          <div className="flex items-center text-yellow-500 text-xs">
            <Star size={12} className="fill-yellow-400 mr-1" />
            {dish.rating || 0}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{formatTime(dish.preparation_time)}</span>
          <span className={`px-2 py-1 rounded text-xs ${dish.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}`}>
            {dish.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
          </span>
        </div>
      </div>
    </div>
  );
};

function HomeScreenF() {
  const navigate = useNavigate();
  const location = useLocation();
  const categorySwiperRef = useRef(null);
  
  // State for dynamic data
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cuisine filter state
  const [selectedCuisine, setSelectedCuisine] = useState(null);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🍽️ HomeScreenF: Starting to fetch food delivery data...');

        // Add individual try-catch for each API call
        let restaurantsRes, categoriesRes, bestSellersRes;

        try {
          console.log('🍽️ HomeScreenF: Calling restaurantService.getAllRestaurants()...');
          restaurantsRes = await restaurantService.getAllRestaurants();
          console.log('✅ Restaurants API response:', restaurantsRes);
        } catch (err) {
          console.error('❌ Restaurant API failed:', err);
          restaurantsRes = { success: false, message: err.message };
        }

        try {
          console.log('🍽️ HomeScreenF: Calling restaurantService.getRestaurantCategories()...');
          categoriesRes = await restaurantService.getRestaurantCategories();
          console.log('✅ Categories API response:', categoriesRes);
        } catch (err) {
          console.error('❌ Categories API failed:', err);
          categoriesRes = { success: false, message: err.message };
        }

        try {
          console.log('📞 HomeScreenF: Calling dishService.getBestsellerDishes()...');
          bestSellersRes = await dishService.getBestsellerDishes();
          console.log('✅ Bestsellers API response:', bestSellersRes);
        } catch (err) {
          console.error('❌ Bestsellers API failed:', err);
          bestSellersRes = { success: false, message: err.message };
        }

        // Set data even if some APIs fail
        if (restaurantsRes.success) {
          setRestaurants(restaurantsRes.data);
          console.log('✅ Restaurants loaded:', restaurantsRes.data.length);
        } else {
          setRestaurants([]);
          console.error('❌ Failed to load restaurants:', restaurantsRes.message);
        }

        if (categoriesRes.success) {
          setCategories(categoriesRes.data);
          console.log('✅ Categories loaded:', categoriesRes.data.length);
        } else {
          setCategories([]);
          console.error('❌ Failed to load categories:', categoriesRes.message);
        }

        if (bestSellersRes.success) {
          setBestSellers(bestSellersRes.data);
          console.log('✅ Bestsellers loaded:', bestSellersRes.data.length);
        } else {
          setBestSellers([]);
          console.error('❌ Failed to load bestsellers:', bestSellersRes.message);
        }

      } catch (err) {
        console.error('❌ Error in fetchData:', err);
        setError(err.message);
        // Set empty arrays to prevent infinite loops
        setRestaurants([]);
        setCategories([]);
        setBestSellers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check for cuisine in URL on mount
  useEffect(() => {
    const match = location.pathname.match(/restaurent-list-based-on-category\/(.+)$/);
    if (match && match[1]) {
      setSelectedCuisine(decodeURIComponent(match[1]));
    } else {
      setSelectedCuisine(null);
    }
  }, [location.pathname]);

  // Filter restaurants by selected cuisine
  const filteredRestaurants = selectedCuisine
    ? restaurants.filter(r => r.cuisines && r.cuisines.some(c => c.toLowerCase().includes(selectedCuisine.toLowerCase())))
    : restaurants;

  // Updated slider settings for better mobile responsiveness
  const categorySettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
      { breakpoint: 320, settings: { slidesToShow: 2 } }
    ]
  };

  const restaurantSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1.2,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2.5 } },
      { breakpoint: 768, settings: { slidesToShow: 1.8 } },
      { breakpoint: 480, settings: { slidesToShow: 1.2 } },
      { breakpoint: 320, settings: { slidesToShow: 1.1 } }
    ]
  };

  const handleCategoryClick = (category) => {
    navigate(`/home-food/restaurent-list-based-on-category/${encodeURIComponent(category.name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderF />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delicious food options...</p>
          </div>
        </div>
        <FooterFood />
      </div>
    );
        }

  if (error) {
  return (
      <div className="min-h-screen bg-gray-50">
        <HeaderF />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading food delivery data: {error}</p>
            <button
              onClick={() => window.location.reload()} 
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
        <FooterFood />
      </div>
    );
  }
      
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderF />
      
      <div className="pt-16 pb-20">
        {/* Main Banner Section */}
        <div className="px-4 mt-4">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            className="rounded-lg overflow-hidden"
          >
            {mainBanners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <div className="relative h-40 bg-gradient-to-r from-orange-400 to-red-500">
                  <img 
                    src={banner.image} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center px-6" style={{backgroundColor: banner.overlay}}>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold">{banner.title}</h2>
                      <p className="text-lg mb-2">{banner.subtitle}</p>
                      <div className="space-y-1">
                      {banner.offers.map((offer, index) => (
                          <p key={index} className="text-sm">
                            {offer.type} {offer.discount} - {offer.description}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">What's on your mind?</h2>
            <button 
              onClick={() => navigate('/home-food/categories')}
                className="text-orange-600 text-sm flex items-center"
            >
                See all <BsArrowRight className="ml-1" />
            </button>
          </div>
            <Slider {...categorySettings}>
              {categories.map((category) => (
                <div key={category._id} className="px-2">
                  <div onClick={() => handleCategoryClick(category)}>
                    <CategoryItem category={category} />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        )}

        {/* Top Restaurants Section */}
        {filteredRestaurants.length > 0 && (
          <div className="mt-8 px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {selectedCuisine ? `${selectedCuisine} Restaurants` : 'Top Restaurants'}
              </h2>
              <button 
                onClick={() => navigate('/home-food/restaurant-details')}
                className="text-orange-600 text-sm flex items-center"
              >
                See all <BsArrowRight className="ml-1" />
              </button>
                    </div>
            <Slider {...restaurantSettings}>
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant._id} className="px-2">
                  <RestaurantItem restaurant={restaurant} categoryName={selectedCuisine || 'All Restaurants'} />
                  </div>
              ))}
            </Slider>
          </div>
        )}

        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <div className="mt-8 px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <BsFire className="text-red-500 mr-2" />
                Best Sellers
              </h2>
            <button 
                onClick={() => navigate('/home-food/categories')}
                className="text-orange-600 text-sm flex items-center"
            >
                See all <BsArrowRight className="ml-1" />
            </button>
          </div>
            <Slider {...restaurantSettings}>
              {bestSellers.map((dish) => (
                <div key={dish._id} className="px-2">
                  <BestsellerItem dish={dish} />
                </div>
              ))}
            </Slider>
          </div>
        )}

        {/* Promotional Banners */}
        <div className="mt-8 px-4">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            className="rounded-lg overflow-hidden"
          >
            {promoBanners.map((banner) => (
              <SwiperSlide key={banner.id}>
                  <img
                    src={banner.imageF}
                    alt={banner.alt}
                  className="w-full h-32 object-cover"
                  />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Empty state when no data */}
        {restaurants.length === 0 && categories.length === 0 && bestSellers.length === 0 && !loading && (
          <div className="mt-8 px-4 text-center">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No restaurants available</h3>
              <p className="text-gray-600 mb-4">We're working hard to bring delicious food to your area soon!</p>
            <button 
                onClick={() => window.location.reload()}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
            >
                Refresh
            </button>
          </div>
          </div>
        )}
        </div>

      <FooterFood />
    </div>
  );
}

export default HomeScreenF;