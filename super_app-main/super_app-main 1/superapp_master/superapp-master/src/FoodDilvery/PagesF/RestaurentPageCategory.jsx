import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  MapPin, 
  Heart, 
  Minus, 
  Plus, 
  ShoppingBag,
  TrendingUp
} from 'lucide-react';
import HeaderF from '../ComponentsF/HeaderF';
import FooterFood from '../ComponentsF/FooterFood';
import { restaurantService, dishService, foodCartService, formatImageUrl, formatCurrency } from '../../services/foodDeliveryService';
import { useFoodCart } from '../../Utility/FoodCartContext';

// Filter and sort options
const filterOptions = [
  { id: 'all', name: 'All' },
  { id: 'veg', name: 'Vegetarian' },
  { id: 'non-veg', name: 'Non-Vegetarian' },
  { id: 'bestseller', name: 'Bestsellers' },
  { id: 'trending', name: 'Trending' }
];

const sortOptions = [
  { id: 'default', name: 'Recommended' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'popular', name: 'Most Popular' }
];

// Dish Item Component
const DishItem = ({ dish, restaurant, onAddToCart, isAddingToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await onAddToCart(dish._id, quantity);
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const effectivePrice = dish.sale_price || dish.price;
  const hasDiscount = dish.price > effectivePrice;

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={formatImageUrl(dish.image)}
          alt={dish.name}
          className="w-full h-48 object-cover"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {dish.is_bestseller && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Bestseller
            </span>
          )}
          {dish.is_trending && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Trending
            </span>
          )}
          {hasDiscount && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              {Math.round(((dish.price - effectivePrice) / dish.price) * 100)}% OFF
            </span>
          )}
        </div>

        {/* Veg/Non-veg indicator */}
        <div className="absolute top-2 right-2">
          <div className={`w-6 h-6 border-2 flex items-center justify-center ${dish.is_veg ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`w-3 h-3 rounded-full ${dish.is_veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>
        </div>

        {/* Heart icon for favorites */}
        <button className="absolute bottom-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
          <Heart size={16} className="text-gray-600" />
        </button>
      </div>

      <div className="p-4">
        {/* Dish name and rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 text-lg truncate flex-1 mr-2">{dish.name}</h3>
          {dish.rating && (
            <div className="flex items-center text-yellow-500 text-sm">
              <Star size={14} className="fill-yellow-400 mr-1" />
              <span>{dish.rating}</span>
            </div>
          )}
        </div>

        {/* Restaurant name */}
        <p className="text-sm text-gray-600 mb-2">{restaurant?.name}</p>

        {/* Description */}
        {dish.description && (
          <div className="mb-3">
            <p className={`text-sm text-gray-600 ${showDescription ? '' : 'line-clamp-2'}`}>
              {dish.description}
            </p>
            {dish.description && dish.description.length > 100 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDescription(!showDescription);
                }}
                className="text-orange-500 text-sm font-medium mt-1 hover:text-orange-600 transition-colors cursor-pointer"
              >
                {showDescription ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-orange-600 text-lg">{formatCurrency(effectivePrice)}</span>
            {hasDiscount && (
              <span className="text-gray-400 text-sm line-through">{formatCurrency(dish.price)}</span>
            )}
          </div>
        </div>

        {/* Cuisines/categories */}
        {dish.cuisines && dish.cuisines.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {dish.cuisines.slice(0, 3).map((cuisine, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {cuisine}
              </span>
            ))}
          </div>
        )}

        {/* Add to cart section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 py-2 font-medium text-center min-w-[50px]">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 hover:bg-gray-50"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || isAddingToCart}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isAdding ? (
              'Adding...'
            ) : (
              <>
                <ShoppingBag size={16} />
                Add {formatCurrency(effectivePrice * quantity)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Restaurant Header Component
const RestaurantHeader = ({ restaurant }) => {
  if (!restaurant) return null;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex gap-4">
        <img
          src={formatImageUrl(restaurant.image)}
          alt={restaurant.name}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{restaurant.name}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            {restaurant.rating && (
              <div className="flex items-center text-green-600">
                <Star size={16} className="fill-green-500 mr-1" />
                <span className="font-medium">{restaurant.rating}</span>
                {restaurant.total_reviews && (
                  <span className="ml-1">({restaurant.total_reviews} reviews)</span>
                )}
              </div>
            )}
            {restaurant.location && (
              <div className="flex items-center">
                <MapPin size={16} className="mr-1" />
                {restaurant.location.area || restaurant.address}
              </div>
            )}
          </div>
          {restaurant.description && (
            <p className="text-gray-600 text-sm">{restaurant.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

function RestaurentPageCategory() {
  const navigate = useNavigate();
  const { restaurentCategoryName, restaurant: restaurantParam } = useParams();
  const location = useLocation();
  
  // State
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToFoodCart } = useFoodCart();
  const [addingToCartId, setAddingToCartId] = useState(null);
  
  // Filters and sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Selected restaurant (when viewing a specific restaurant)
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Memoize the parameters to prevent infinite loops
  const memoizedCategoryName = useMemo(() => restaurentCategoryName, [restaurentCategoryName]);
  const memoizedRestaurantParam = useMemo(() => restaurantParam, [restaurantParam]);

  // Fetch data on component mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setError(null);
        console.log('🍽️ Fetching restaurant page data...', { memoizedCategoryName, memoizedRestaurantParam });

        if (memoizedRestaurantParam) {
          // Fetch specific restaurant and its dishes
          const [restaurantRes, dishesRes, categoriesRes] = await Promise.all([
            restaurantService.getRestaurantById(memoizedRestaurantParam),
            dishService.getDishesByRestaurant(memoizedRestaurantParam),
            restaurantService.getRestaurantCategories()
          ]);

          if (isMounted && restaurantRes.success) {
            setSelectedRestaurant(restaurantRes.data);
            console.log('✅ Restaurant loaded:', restaurantRes.data.name);
          }

          if (isMounted && dishesRes.success) {
            setDishes(dishesRes.data);
            console.log('✅ Dishes loaded:', dishesRes.data.length);
          }

          if (isMounted && categoriesRes.success) {
            setCategories(categoriesRes.data);
          }
      } else {
          // Fetch restaurants by category
          const categoryFilter = memoizedCategoryName && memoizedCategoryName !== ':restaurentCategoryName' 
            ? { category: decodeURIComponent(memoizedCategoryName) } 
            : {};

          const [restaurantsRes, dishesRes, categoriesRes] = await Promise.all([
            restaurantService.getAllRestaurants(categoryFilter),
            dishService.getAllDishes(categoryFilter),
            restaurantService.getRestaurantCategories()
          ]);

          if (isMounted && restaurantsRes.success) {
            setRestaurants(restaurantsRes.data);
            console.log('✅ Restaurants loaded:', restaurantsRes.data.length);
          }

          if (isMounted && dishesRes.success) {
            setDishes(dishesRes.data);
            console.log('✅ Dishes loaded:', dishesRes.data.length);
          }

          if (isMounted && categoriesRes.success) {
            setCategories(categoriesRes.data);
          }
        }

      } catch (err) {
        if (isMounted) {
          console.error('❌ Error fetching data:', err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [memoizedCategoryName, memoizedRestaurantParam]);

  // Filter and sort dishes
  const filteredAndSortedDishes = useMemo(() => {
    let filtered = dishes;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(dish =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
      if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'veg':
          filtered = filtered.filter(dish => dish.is_veg);
          break;
        case 'non-veg':
          filtered = filtered.filter(dish => !dish.is_veg);
          break;
        case 'bestseller':
          filtered = filtered.filter(dish => dish.is_bestseller);
          break;
        case 'trending':
          filtered = filtered.filter(dish => dish.is_trending);
          break;
        default:
          // Custom category filter
          filtered = filtered.filter(dish => 
            dish.cuisines && dish.cuisines.some(cuisine => 
              cuisine.toLowerCase().includes(selectedCategory.toLowerCase())
            )
          );
      }
    }

    // Apply sorting
    switch (selectedSort) {
      case 'price-low':
        filtered.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.order_count || 0) - (a.order_count || 0));
        break;
      default:
        // Default sorting (no change)
        break;
    }

    return filtered;
  }, [dishes, selectedCategory, selectedSort, searchQuery]);

  // Add to cart function
  const handleAddToCart = async (dishId, quantity = 1) => {
    try {
      setAddingToCartId(dishId);
      console.log('🛒 Adding to cart:', { dishId, quantity });

      const response = await addToFoodCart(dishId, quantity);
      
      if (response.success) {
        console.log('✅ Added to cart successfully');
      } else {
        console.error('❌ Failed to add to cart:', response.message);
        alert(response.message);
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCartId(null);
    }
  };

  // Create dynamic categories from available data
  const dynamicCategories = useMemo(() => {
    const baseCategories = [...filterOptions];
    
    // Add categories from backend data
    if (categories.length > 0) {
      categories.forEach(category => {
        if (!baseCategories.find(c => c.id === category.slug)) {
          baseCategories.push({
            id: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
            name: category.name
          });
        }
      });
    }

    return baseCategories;
  }, [categories]);

  if (loading) {
  return (
      <div className="min-h-screen bg-gray-50">
      <HeaderF />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading delicious dishes...</p>
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
            <p className="text-red-600 mb-4">Error loading data: {error}</p>
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back Navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            ← Back
          </button>

          {/* Restaurant Header (if viewing specific restaurant) */}
          {selectedRestaurant && <RestaurantHeader restaurant={selectedRestaurant} />}

          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedRestaurant 
                ? `Menu - ${selectedRestaurant.name}`
                : memoizedCategoryName && memoizedCategoryName !== ':restaurentCategoryName'
                  ? `${decodeURIComponent(memoizedCategoryName)} Restaurants`
                  : 'All Restaurants'
              }
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedDishes.length} dishes available
            </p>
        </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                </div>

              {/* Filter Toggle */}
                      <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Filter size={16} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

              {/* Sort */}
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
                    </div>

            {/* Filter Categories */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {dynamicCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                    </div>
                  </div>
                )}
        </div>

          {/* Dishes Grid */}
          {filteredAndSortedDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedDishes.map((dish) => (
                <DishItem
                  key={dish._id}
                  dish={dish}
                  restaurant={selectedRestaurant || restaurants.find(r => r._id === dish.restaurant_id)}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addingToCartId === dish._id}
                />
              ))}
                </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No dishes found</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery ? 'Try adjusting your search or filters' : 'No dishes available for the selected criteria'}
                </p>
              <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedSort('default');
                  }}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                >
                  Clear Filters
              </button>
            </div>
          </div>
        )}
            </div>
          </div>

      <FooterFood />
    </div>
  );
}

export default RestaurentPageCategory;