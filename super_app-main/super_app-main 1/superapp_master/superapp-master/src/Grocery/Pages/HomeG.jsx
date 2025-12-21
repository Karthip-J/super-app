import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect, useRef } from 'react';
import Footer from '../SubPages/Footer';
import Header from '../SubPages/Header';
import { FaFilter, FaHeart, FaEye, FaStar, FaSearch, FaChevronUp, FaChevronDown, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import banner1 from '../Images/banner1.png';
import banner2 from '../Images/baner2.png';
import banner3 from '../Images/banner3.png';
import banner4 from '../Images/banner4.png';
import banner5 from '../Images/banner5.png';
import catFruits from '../Images/cat_fruits.png';
import catMasala from '../Images/cat_masala.png';
import catInstant from '../Images/cat_instant.png';
import catDairy from '../Images/cat_dairy.png';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

// -------------------------------------
// Image Imports for Grocery Categories

import eggImage from '../Images/egg.png';

import chipsImage from '../Images/potato_chips.png';

import cerealImage from '../Images/cereal.png';

import riceImage from '../Images/rice.png';

import coffeeImage from '../Images/coffee.png';

import chocolateBarsImage from '../Images/chocolate_bars.png';

// Default placeholder image for items without specific images
const defaultImage = '/placeholder-image.png';

const GroceryCard = ({ item, addToCart, addToWishlist, cartItems, wishlistItems, updateCartQuantity, removeFromCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage);
      }
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    } else {
      // Remove alert and just log the error
      console.error('Invalid image file. Please upload a valid image file (max 5MB).');
    }
  };

  useEffect(() => {
    return () => {
      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const discountPercentage = Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100);

  // Updated cart matching logic
  const cartItem = cartItems.find(
    cartItem =>
      ((cartItem.grocery_id === item.id || cartItem.groceryId === item.id)) &&
      cartItem.category === item.category
  );
  const isInCart = !!cartItem;

  // Handlers for cart operations
  const handleIncrement = () => {
    if (isInCart) {
      updateCartQuantity(cartItem._id || cartItem.id, quantity + 1);
    } else {
      addToCart(item, 1);
    }
  };

  const handleDecrement = () => {
    if (isInCart) {
      if (quantity > 1) {
        updateCartQuantity(cartItem._id || cartItem.id, quantity - 1);
      } else {
        removeFromCart(cartItem._id || cartItem.id);
      }
    }
  };

  // Check if item is in wishlist
  const wishlistItem = wishlistItems.find(
    wishlistItem => wishlistItem.grocery_id === item.id && wishlistItem.category === item.category
  );
  const isInWishlist = !!wishlistItem;

  // Set initial quantity based on cart or wishlist
  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
    } else if (wishlistItem) {
      setQuantity(wishlistItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [cartItem, wishlistItem]);

  const openQuickView = () => setShowQuickViewModal(true);
  const closeQuickView = () => setShowQuickViewModal(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-[200px] mx-auto"
    >
      <div className="relative">
        <img
          src={item.image}
          alt={`${item.name} - ${item.description}`}
          className="w-full h-[120px] object-contain p-2 bg-white"
          onError={(e) => {
            console.error('Failed to load image:', item.image);
            e.target.onerror = null; // Prevent infinite loop
            if (e.target.src !== defaultImage) {
              e.target.src = defaultImage;
              e.target.alt = `${item.name} - Image not available`;
            }
          }}
          onLoad={(e) => {
            // Optional: You can add any onLoad handling here if needed
          }}
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            className={`p-1 rounded-full shadow-md ${isInWishlist
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => addToWishlist(item, quantity)}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <FaHeart className="w-5 h-5" />
          </button>
          <button
            className="p-1 rounded-full shadow-md bg-white text-gray-500 hover:text-gray-700"
            onClick={openQuickView}
            title="Quick View"
          >
            <FaEye className="w-5 h-5" />
          </button>
        </div>

        {item.isBestSeller && (
          <span className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Best Seller
          </span>
        )}
      </div>

      <div className="p-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <FaStar className="text-yellow-400 w-3 h-3" />
              <span className="text-xs text-gray-600 ml-0.5">{item.rating}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-1 line-clamp-1">{item.description}</p>

        <div className="flex items-center space-x-2 mb-1">
          <p className="text-base font-bold text-[#00BB1C]">
            ₹{typeof item.discountedPrice === 'number' ? item.discountedPrice.toFixed(2) : '0.00'}
          </p>
          {item.originalPrice > item.discountedPrice && (
            <p className="text-xs text-gray-400 line-through">
              ₹{typeof item.originalPrice === 'number' ? item.originalPrice.toFixed(2) : '0.00'}
            </p>
          )}
          {discountPercentage > 0 && (
            <span className="text-xs text-green-600">{discountPercentage}% off</span>
          )}
        </div>

        <div className="flex justify-between items-center flex-wrap gap-y-1 mt-2">
          <div className="flex flex-row items-center w-full gap-1">
            {!isInCart ? (
              <button
                className="bg-[#00BB1C] hover:bg-[#009B16] text-white text-sm font-bold py-1.5 px-4 rounded-lg w-full transition-colors shadow-sm"
                onClick={() => addToCart(item, 1)}
              >
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center justify-between w-full bg-white border border-[#00BB1C] rounded-lg overflow-hidden">
                <button
                  className="w-8 h-8 flex items-center justify-center text-[#00BB1C] hover:bg-green-50 transition-colors font-bold text-lg"
                  onClick={handleDecrement}
                >
                  -
                </button>
                <span className="flex-1 text-center font-bold text-gray-800 text-sm">{quantity}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center text-[#00BB1C] hover:bg-green-50 transition-colors font-bold text-lg"
                  onClick={handleIncrement}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickViewModal && (
        <QuickViewModal item={item} onClose={closeQuickView} addToCart={addToCart} cartItems={cartItems} />
      )}
    </motion.div>
  );
};

// Quick View Modal Component
const QuickViewModal = ({ item, onClose, addToCart, cartItems }) => {
  const [quantity, setQuantity] = useState(1);
  const [localInCart, setLocalInCart] = useState(false);
  const [wasJustAdded, setWasJustAdded] = useState(false);

  const isInCart = cartItems.some(
    cartItem =>
      (cartItem.grocery_id === item.id || cartItem.groceryId === item.id || cartItem.id === item.id) &&
      cartItem.category === item.category
  );

  // Sync quantity with cart if item is already in cart
  useEffect(() => {
    const cartItem = cartItems.find(ci =>
      (ci.id === item.id || ci.grocery_id === item.id || ci.groceryId === item.id) &&
      ci.category === item.category
    );
    if (cartItem) {
      setQuantity(cartItem.quantity);
      // Only reset localInCart if it wasn't just added (to preserve button state)
      if (!wasJustAdded) {
        setLocalInCart(false);
      }
    } else {
      setQuantity(1);
      // Reset states if item is removed from cart
      if (wasJustAdded && !isInCart) {
        setLocalInCart(false);
        setWasJustAdded(false);
      }
    }
  }, [cartItems, item, wasJustAdded, isInCart]);

  const handleAddToCart = async () => {
    await addToCart(item, quantity);
    setLocalInCart(true);
    setWasJustAdded(true);
    // Reset wasJustAdded after a delay to allow cart to update
    setTimeout(() => {
      setWasJustAdded(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-2 pt-8 z-[9999] md:items-center md:pt-0">
      <div className="bg-white rounded-lg shadow-xl max-w-xs md:max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all sm:scale-100 sm:w-full sm:mx-auto relative z-[10000]">
        <div className="p-3 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Quick View</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/2 flex-shrink-0">
              <img src={item.image || defaultImage} alt={`${item.name} - ${item.description}`} className="w-full h-auto rounded-md object-cover aspect-square" />
            </div>
            <div className="md:w-1/2">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
              <div className="flex items-center mb-1">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-sm text-gray-600">{item.rating}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2 text-justify">{item.description}</p>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xl font-bold text-[#00BB1C]">₹{item.discountedPrice.toFixed(2)}</p>
                <p className="text-sm text-gray-400 line-through">₹{item.originalPrice.toFixed(2)}</p>
                <span className="text-sm text-green-600">{Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100)}% off</span>
              </div>
              <div className="w-full">
                <div className="flex flex-row items-center gap-1 w-full justify-between">
                  <button
                    className={`text-white font-medium py-0.5 px-1 rounded-md text-xs w-24 flex-shrink-0 ${localInCart || isInCart ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00BB1C] hover:bg-[#009B16]'}`}
                    onClick={handleAddToCart}
                    disabled={localInCart || isInCart}
                  >
                    {localInCart || isInCart ? 'View Cart' : 'Add to Cart'}
                  </button>
                  <div className="flex items-center space-x-0.5 flex-shrink-0 justify-end">
                    <span className="text-xs font-medium text-gray-700">Qty:</span>
                    <div className="flex items-center border rounded px-0.5 py-0.5 bg-white">
                      <button
                        type="button"
                        className="px-1 text-xs font-bold text-gray-700 disabled:text-gray-300"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || isInCart}
                      >-</button>
                      <span className="mx-0.5 w-4 text-center select-none text-xs">{quantity}</span>
                      <button
                        type="button"
                        className="px-1 text-xs font-bold text-gray-700 disabled:text-gray-300"
                        onClick={() => setQuantity(q => Math.min(5, q + 1))}
                        disabled={quantity >= 5 || isInCart}
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Groceries() {
  const [randomizedItems, setRandomizedItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterMinimized, setIsFilterMinimized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [minRating, setMinRating] = useState(0);
  const [showBestSellersOnly, setShowBestSellersOnly] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    priceRange: { min: 0, max: 1000 },
    minRating: 0,
    showBestSellersOnly: false
  });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const filterBarRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [forceRerender, setForceRerender] = useState(0); // for debug/test only
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  // Custom toast notification (same as e-commerce)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch items from backend on mount
  useEffect(() => {
    const fetchGroceries = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERIES));
        if (!response.ok) throw new Error('Failed to fetch groceries');
        const data = await response.json();

        // Log raw data for debugging
        console.log('Raw data from API:', data);

        // Format backend fields to match frontend expectations
        const formattedData = data.data.map(item => {
          // Convert string prices to numbers
          const originalPrice = typeof item.original_price === 'string'
            ? parseFloat(item.original_price)
            : item.original_price;

          const discountedPrice = typeof item.discounted_price === 'string'
            ? parseFloat(item.discounted_price)
            : item.discounted_price;

          console.log(`Item: ${item.name}, Original: ${originalPrice}, Discounted: ${discountedPrice}`);

          return {
            ...item,
            id: item._id || item.id, // Ensure id is available for frontend logic
            discountedPrice: discountedPrice,
            originalPrice: originalPrice,
            isBestSeller: item.is_best_seller,
            image: item.image?.startsWith('http')
              ? item.image
              : item.image?.startsWith('/uploads/')
                ? API_CONFIG.getUrl(item.image)
                : API_CONFIG.getUploadUrl(item.image)
          };
        });

        // Log formatted data for debugging
        console.log('Formatted data:', formattedData);

        // Shuffle items
        const shuffled = [...formattedData].sort(() => Math.random() - 0.5);
        setRandomizedItems(shuffled);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching groceries:', error);
        setFetchError(error.message);
        setLoading(false);
      }
    };
    fetchGroceries();
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      showToast('Speech recognition is not supported in your browser.', 'error');
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsRecording(false);
      }
    }
  };

  // Update tempFilters when filter panel is opened
  useEffect(() => {
    if (showFilters) {
      setTempFilters({
        priceRange: { ...priceRange },
        minRating,
        showBestSellersOnly
      });
    }
  }, [showFilters, priceRange, minRating, showBestSellersOnly]);

  // Apply filters function
  const applyFilters = () => {
    setPriceRange(tempFilters.priceRange);
    setMinRating(tempFilters.minRating);
    setShowBestSellersOnly(tempFilters.showBestSellersOnly);
    // Close the filter panel after applying
    setShowFilters(false);
  };

  // Clear all filters function
  const clearAllFilters = () => {
    const defaultFilters = {
      priceRange: { min: 0, max: 1000 },
      minRating: 0,
      showBestSellersOnly: false
    };
    setTempFilters(defaultFilters);
    setPriceRange(defaultFilters.priceRange);
    setMinRating(defaultFilters.minRating);
    setShowBestSellersOnly(defaultFilters.showBestSellersOnly);
  };

  // Filter items based on all criteria
  const filteredItems = randomizedItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = item.discountedPrice >= priceRange.min && item.discountedPrice <= priceRange.max;
    const matchesRating = item.rating >= minRating;
    const matchesBestSeller = !showBestSellersOnly || item.isBestSeller;
    return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesBestSeller;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOption === 'price-low') return a.discountedPrice - b.discountedPrice;
    if (sortOption === 'price-high') return b.discountedPrice - a.discountedPrice;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0;
  });

  // Helper to check auth and redirect
  const handleAuthError = (err) => {
    if (err.message === 'Unauthorized' || err.status === 401 || err.message === 'Session expired. Please log in again.') {
      // Clear authentication data
      authService.logout();

      // Save current URL for redirect after login
      sessionStorage.setItem('redirectUrl', window.location.pathname);

      showToast('Session expired. Please log in again.', 'error');
      navigate('/login');
      return true;
    }
    return false;
  };

  // Fetch cart items from database
  const fetchCartItems = async () => {
    try {
      // Use a default user ID (1) for demo purposes since login is disabled
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_CART), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
        }
      });

      if (response.ok) {
        const responseData = await response.json();
        const cartData = responseData.data || [];
        const formatted = cartData.map(item => ({
          ...item,
          originalPrice: parseFloat(item.original_price ?? item.originalPrice ?? 0),
          discountedPrice: parseFloat(item.discounted_price ?? item.discountedPrice ?? 0),
          image: item.image
            ? item.image.startsWith('http')
              ? item.image
              : API_CONFIG.getUploadUrl(item.image)
            : '/placeholder-image.png',
          size: item.size || 'N/A'
        }));
        setCartItems(formatted);
        console.log('Cart items loaded from database:', formatted);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error loading cart from database:', err);
      setCartItems([]);
    }
  };

  // Fetch cart items on mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  const addToCart = async (item, quantity) => {
    try {
      // Prepare cart payload for database - only send what the backend expects
      const cartPayload = {
        grocery_id: item._id || item.id,
        quantity: quantity
      };

      console.log('Adding to cart:', cartPayload);

      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_CART), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
        },
        body: JSON.stringify(cartPayload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Item added to cart:', item.name, 'Quantity:', quantity);
        showToast(`Added ${quantity} ${item.name} to cart!`, 'success');

        // Refresh cart items from database
        await fetchCartItems();
      } else {
        const errorData = await response.json();
        console.error('Add to cart failed:', errorData);
        throw new Error(errorData.message || errorData.error || 'Failed to add to cart');
      }

    } catch (err) {
      console.error('Error adding item to cart:', err);
      showToast('Error adding item to cart. Please try again.', 'error');
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.GROCERY_CART}/${cartItemId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({ quantity })
      });

      if (response.ok) {
        // showToast('Cart updated', 'success'); // Optional: reduce toast spam
        await fetchCartItems();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to update cart', 'error');
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      showToast('Error updating cart', 'error');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`${API_CONFIG.ENDPOINTS.GROCERY_CART}/${cartItemId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        }
      });

      if (response.ok) {
        showToast('Item removed from cart', 'success');
        await fetchCartItems();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Failed to remove item', 'error');
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      showToast('Error removing item from cart', 'error');
    }
  };


  const fetchWishlist = async () => {
    try {
      // Use a default user ID (1) for demo purposes since login is disabled
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_WISHLIST), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formatted = data.map(item => ({
          ...item,
          originalPrice: parseFloat(item.original_price ?? item.originalPrice ?? 0),
          discountedPrice: parseFloat(item.discounted_price ?? item.discountedPrice ?? 0),
          image: item.image
            ? item.image.startsWith('http')
              ? item.image
              : API_CONFIG.getUploadUrl(item.image)
            : '/placeholder-image.png'
        }));
        setWishlistItems(formatted);
        console.log('Wishlist items loaded from database:', formatted);
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error('Error loading wishlist from database:', err);
      setWishlistItems([]);
    }
  };
  const addToWishlist = async (item, quantity = 1) => {
    try {
      // Check if item already exists in wishlist
      const existingItem = wishlistItems.find(wishlistItem =>
        wishlistItem.grocery_id === item.id && wishlistItem.category === item.category
      );

      if (existingItem) {
        // Remove from wishlist (DELETE)
        const response = await fetch(API_CONFIG.getUrl(`/api/gwishlist/${existingItem.id}`), {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
          }
        });

        if (response.ok) {
          showToast(`Removed ${item.name} from wishlist!`, 'success');
          await fetchWishlist(); // Refresh wishlist
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        // Add to wishlist (POST)
        const payload = {
          grocery_id: item._id || item.id,
          name: item.name,
          image: item.image,
          category: item.category,
          original_price: item.originalPrice,
          discounted_price: item.discountedPrice,
          quantity: quantity
        };

        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_WISHLIST), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          showToast(`Added ${item.name} to wishlist!`, 'success');
          await fetchWishlist(); // Refresh wishlist
        } else {
          throw new Error('Failed to add to wishlist');
        }
      }

    } catch (err) {
      console.error('Error updating wishlist:', err);
      showToast('Error updating wishlist. Please try again.', 'error');
    }
  };

  // Banner carousel state
  const bannerImages = [banner1, banner2, banner3, banner4, banner5];
  const [currentBanner, setCurrentBanner] = useState(0);
  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 6000); // Increased from 3500ms to 6000ms
    return () => clearInterval(interval);
  }, [bannerImages.length]);
  // Manual navigation
  const goToBanner = (idx) => setCurrentBanner(idx);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % bannerImages.length);

  // Category data for 'Shop by category' section
  const categoryList = [
    { name: 'Fruits & Vegetables', image: catFruits, label: 'Fruits & Vegetables' },
    { name: 'Bakery, Cakes & Dairy', image: catDairy, label: 'Bakery, Cakes & Dairy' },
    { name: 'Breakfast & More', image: cerealImage, label: 'Breakfast & More' },
    { name: 'Eggs, Meat & Fish', image: eggImage, label: 'Eggs, Meat & Fish' },
    { name: 'Masalas, Oils & Dry Fruits', image: catMasala, label: 'Masalas, Oils & Dry Fruits' },
    { name: 'Atta, Rice, Dals & Sugar', image: riceImage, label: 'Atta, Rice, Dals & Sugar' },
    { name: 'Chips, Biscuits & Namkeen', image: chipsImage, label: 'Chips, Biscuits & Namkeen' },
    { name: 'Hot & Cold Beverages', image: coffeeImage, label: 'Hot & Cold Beverages' },
    { name: 'Instant & Frozen Foods', image: catInstant, label: 'Instant & Frozen Foods' },
    { name: 'Chocolates & Ice Creams', image: chocolateBarsImage, label: 'Chocolates & Ice Creams' },
  ];

  useEffect(() => {
    fetchWishlist();
  }, []);

  console.log("🟢 LATEST BUILD: 2025-07-31T19:00:00 - VERCEL STATIC ROUTES FIX");
  console.log("🟢 PLACEHOLDER IMAGE: ADDED TO PUBLIC FOLDER");
  console.log("🟢 VERCEL.JSON: ADDED STATIC FILE ROUTES");
  console.log("🟢 API ENDPOINTS: FIXED gcart -> GROCERY_CART");
  console.log("🟢 ERROR HANDLING: PREVENTED INFINITE LOOPS");
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-[10001] px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${toast.type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
          }`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Header />
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-32">
        {/* Shop by category section */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Shop by category</h2>
            <button
              className="text-[#00BB1C] font-semibold text-sm hover:underline focus:outline-none"
              onClick={() => setShowAllCategories((prev) => !prev)}
            >
              {showAllCategories ? 'Show less' : 'Show more'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(showAllCategories ? categoryList : categoryList.slice(0, 3)).map((cat, idx) => (
              <button
                key={cat.name}
                className="flex flex-col items-center bg-white rounded-lg shadow p-1 hover:bg-gray-100 focus:outline-none transition"
                onClick={() => {
                  setSelectedCategory(cat.label);
                  setTimeout(() => {
                    filterBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                type="button"
              >
                <img src={cat.image} alt={cat.label} className="w-20 h-20 object-contain mb-1" />
                <span className="text-xs font-medium text-center text-gray-700">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Banner Carousel */}
        <div className="max-w-4xl mx-auto mb-6 relative">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
              if (info.offset.x < -50) {
                nextBanner();
              } else if (info.offset.x > 50) {
                prevBanner();
              }
            }}
            className="w-full h-56 md:h-80 object-cover rounded-xl shadow-md transition-all duration-500 cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'pan-y' }}
          >
            <img
              src={bannerImages[currentBanner]}
              alt={`Banner ${currentBanner + 1}`}
              className="w-full h-56 md:h-80 object-cover rounded-xl"
              draggable="false"
            />
          </motion.div>
          {/* Left Arrow */}
          <button
            onClick={prevBanner}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10"
            aria-label="Previous banner"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          {/* Right Arrow */}
          <button
            onClick={nextBanner}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 shadow-md z-10"
            aria-label="Next banner"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {bannerImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToBanner(idx)}
                className={`w-2.5 h-2.5 rounded-full ${currentBanner === idx ? 'bg-[#00BB1C]' : 'bg-white border border-gray-300'} transition-all`}
                aria-label={`Go to banner ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Search and Filter Bar */}
          <div ref={filterBarRef} className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                {/* Search Icon - Light Purple */}
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9B7EDE] text-lg z-10 pointer-events-none" />

                {/* Search Input Field - Clean Design Matching Image */}
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-14 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]/20 focus:border-[#9B7EDE] transition-all duration-200 text-gray-800 placeholder:text-gray-400 text-base"
                />

                {/* Filter Button - Blue, Integrated Design */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md transition-all duration-200 ${showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  title="Filters"
                >
                  <FaFilter className="text-base" />
                  {/* Active filter indicator */}
                  {(priceRange.min > 0 || priceRange.max < 1000 || minRating > 0 || showBestSellersOnly) && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              </div>
              <div className="flex gap-4">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BB1C]/30 focus:border-[#00BB1C] bg-white shadow-sm text-gray-700 cursor-pointer"
                >
                  <option value="">Sort by</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'all'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                All Items
              </button>
              <button
                onClick={() => setSelectedCategory('Fruits & Vegetables')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Fruits & Vegetables'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Fruits & Vegetables
              </button>
              <button
                onClick={() => setSelectedCategory('Bakery, Cakes & Dairy')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Bakery, Cakes & Dairy'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Bakery, Cakes & Dairy
              </button>
              <button
                onClick={() => setSelectedCategory('Breakfast & More')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Breakfast & More'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Breakfast & More
              </button>
              <button
                onClick={() => setSelectedCategory('Eggs, Meat & Fish')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Eggs, Meat & Fish'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Eggs, Meat & Fish
              </button>
              <button
                onClick={() => setSelectedCategory('Masalas, Oils & Dry Fruits')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Masalas, Oils & Dry Fruits'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Masalas, Oils & Dry Fruits
              </button>
              <button
                onClick={() => setSelectedCategory('Atta, Rice, Dals & Sugar')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Atta, Rice, Dals & Sugar'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Atta, Rice, Dals & Sugar
              </button>
              <button
                onClick={() => setSelectedCategory('Chips, Biscuits & Namkeen')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Chips, Biscuits & Namkeen'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Chips, Biscuits & Namkeen
              </button>
              <button
                onClick={() => setSelectedCategory('Hot & Cold Beverages')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Hot & Cold Beverages'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Hot & Cold Beverages
              </button>
              <button
                onClick={() => setSelectedCategory('Instant & Frozen Foods')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Instant & Frozen Foods'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Instant & Frozen Foods
              </button>
              <button
                onClick={() => setSelectedCategory('Chocolates & Ice Creams')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === 'Chocolates & Ice Creams'
                  ? 'bg-[#00BB1C] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Chocolates & Ice Creams
              </button>
            </div>

            {/* Filter Panel - Modern UI */}
            {showFilters && (
              <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300">
                {/* Filter Header */}
                <div className="bg-gradient-to-r from-[#00BB1C] to-[#00D91F] px-6 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FaFilter className="text-white text-xl" />
                    <h2 className="text-xl font-bold text-white">Filters</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFilterMinimized(!isFilterMinimized)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      title={isFilterMinimized ? 'Expand Filters' : 'Collapse Filters'}
                    >
                      {isFilterMinimized ? (
                        <FaChevronDown className="text-white" />
                      ) : (
                        <FaChevronUp className="text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {!isFilterMinimized && (
                  <div className="p-6 space-y-6">
                    {/* Price Range Filter - Enhanced */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-semibold text-gray-800">Price Range</span>
                        <span className="text-sm text-gray-500">(₹)</span>
                      </div>
                      <div className="space-y-4">
                        {/* Price Input Fields */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
                            <input
                              type="number"
                              value={tempFilters.priceRange.min}
                              onChange={(e) => {
                                const value = Math.max(0, Number(e.target.value));
                                setTempFilters(prev => ({
                                  ...prev,
                                  priceRange: { ...prev.priceRange, min: value }
                                }));
                              }}
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#00BB1C] focus:ring-2 focus:ring-[#00BB1C]/20 transition-all"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                          <div className="pt-6">
                            <span className="text-gray-400 font-medium">—</span>
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
                            <input
                              type="number"
                              value={tempFilters.priceRange.max}
                              onChange={(e) => {
                                const value = Math.max(0, Number(e.target.value));
                                setTempFilters(prev => ({
                                  ...prev,
                                  priceRange: { ...prev.priceRange, max: value }
                                }));
                              }}
                              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#00BB1C] focus:ring-2 focus:ring-[#00BB1C]/20 transition-all"
                              placeholder="1000"
                              min="0"
                            />
                          </div>
                        </div>
                        {/* Price Display */}
                        <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Selected Range:</span>
                            <span className="text-base font-semibold text-[#00BB1C]">
                              ₹{tempFilters.priceRange.min} - ₹{tempFilters.priceRange.max}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rating Filter - Enhanced */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <FaStar className="text-yellow-500" />
                        <span className="text-lg font-semibold text-gray-800">Minimum Rating</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setTempFilters(prev => ({ ...prev, minRating: rating }))}
                            className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${tempFilters.minRating === rating
                              ? 'border-[#00BB1C] bg-[#00BB1C]/10 text-[#00BB1C] font-semibold'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-[#00BB1C]/50 hover:bg-[#00BB1C]/5'
                              }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              {rating === 0 ? (
                                <span className="text-sm">Any Rating</span>
                              ) : (
                                <>
                                  <span className="text-yellow-500 font-bold">{rating}</span>
                                  <FaStar className="text-yellow-500 text-xs" />
                                  <span className="text-xs ml-1">& above</span>
                                </>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Best Sellers Filter - Enhanced */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg font-semibold text-gray-800">Best Sellers</span>
                      </div>
                      <label className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-[#00BB1C]/50 cursor-pointer transition-all duration-200 group">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${tempFilters.showBestSellersOnly
                            ? 'bg-[#00BB1C] border-[#00BB1C]'
                            : 'bg-white border-gray-300 group-hover:border-[#00BB1C]'
                            }`}>
                            {tempFilters.showBestSellersOnly && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-gray-700 font-medium">Show Best Sellers Only</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={tempFilters.showBestSellersOnly}
                          onChange={(e) => setTempFilters(prev => ({
                            ...prev,
                            showBestSellersOnly: e.target.checked
                          }))}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Filter Actions - Enhanced */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button
                        onClick={clearAllFilters}
                        className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 border-2 border-transparent hover:border-gray-300"
                      >
                        Clear All Filters
                      </button>
                      <button
                        onClick={applyFilters}
                        className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#00BB1C] to-[#00D91F] rounded-lg hover:from-[#009B16] hover:to-[#00BB1C] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">Loading items...</div>
          ) : fetchError ? (
            <div className="text-center py-12 text-red-500">{fetchError}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-items-center">
              {sortedItems.map((item) => (
                <GroceryCard
                  key={`${item.category}-${item.id}`}
                  item={item}
                  addToCart={addToCart}
                  addToWishlist={addToWishlist}
                  cartItems={cartItems}
                  wishlistItems={wishlistItems}
                  updateCartQuantity={updateCartQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}
            </div>
          )}
          {sortedItems.length === 0 && !loading && !fetchError && (
            <div className="text-center py-12">
              <p className="text-gray-500">No items found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {/* Build marker for deployment verification */}
      <div style={{ textAlign: 'center', fontSize: '10px', color: '#bbb', marginTop: 8 }}>
        🟢 LATEST BUILD: 2025-07-31T19:00:00 - VERCEL STATIC ROUTES FIX
      </div>
    </div>
  );
}

export default Groceries; "// FORCE DEPLOY: $(date)" 
