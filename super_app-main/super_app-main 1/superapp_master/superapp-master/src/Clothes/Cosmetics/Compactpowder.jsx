
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, Routes, Route, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaHeart, FaEye, FaChevronDown } from 'react-icons/fa';
import Footer from '../../Utility/Footer';


const compactPowderProducts = [
  {
    id: 1,
    name: 'Absolute Perfect Radiance Compact',
    originalPrice: 450,
    discountedPrice: 400,
    description: 'Lightweight compact for a radiant, even-toned finish.',
    rating: 4.5,
    isBestSeller: true,
    brand: 'Lakmé',
    category: 'Natural',
    shade: 'Fair',
    inStock: true,
    image: 'https://via.placeholder.com/150/F5F5DC/FFFFFF?text=Absolute+Radiance+Compact',
    deliveryInfo: {
      returns: 'No Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [
      { code: 'POWDER5', description: '₹5 off on first order', discount: 5 },
      { code: 'BOGO50', description: 'Buy 1 Get 1 at 50% off', discount: '50% on second item' },
      { code: 'FREESHIP', description: 'Free delivery on orders above ₹500', discount: 'Free Shipping' },
    ],
  },
  {
    id: 2,
    name: 'Fit Me Matte+Poreless Compact',
    originalPrice: 350,
    discountedPrice: 300,
    description: 'Matte finish compact for oil control and poreless look.',
    rating: 4.4,
    isBestSeller: true,
    brand: 'Maybelline India',
    category: 'Matte',
    shade: 'Medium',
    inStock: true,
    image: 'https://via.placeholder.com/150/D2B48C/FFFFFF?text=Fit+Me+Matte+Compact',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 3,
    name: 'Ecostay Vibrant Finish Compact',
    originalPrice: 600,
    discountedPrice: 550,
    description: 'Herbal compact for vibrant, long-lasting coverage.',
    rating: 4.3,
    isBestSeller: false,
    brand: 'Lotus Herbals',
    category: 'Natural',
    shade: 'Deep',
    inStock: true,
    image: 'https://via.placeholder.com/150/8B4513/FFFFFF?text=Ecostay+Vibrant+Compact',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 4,
    name: 'Xpress Glow Compact',
    originalPrice: 250,
    discountedPrice: 200,
    description: 'Affordable compact for a natural, glowing finish.',
    rating: 4.2,
    isBestSeller: true,
    brand: 'Blue Heaven',
    category: 'Dewy',
    shade: 'Fair',
    inStock: true,
    image: 'https://via.placeholder.com/150/FFDAB9/FFFFFF?text=Xpress+Glow+Compact',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 5,
    name: 'All Set To Go Compact',
    originalPrice: 800,
    discountedPrice: 750,
    description: 'Long-wear compact for a flawless, dewy finish.',
    rating: 4.6,
    isBestSeller: true,
    brand: 'Sugar Cosmetics',
    category: 'Dewy',
    shade: 'Medium',
    inStock: true,
    image: 'https://via.placeholder.com/150/FF9999/FFFFFF?text=All+Set+Compact',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 6,
    name: 'Flawless Touch Compact',
    originalPrice: 400,
    discountedPrice: 350,
    description: 'Smooth compact for a matte, even-toned look.',
    rating: 4.3,
    isBestSeller: false,
    brand: 'Swiss Beauty',
    category: 'Matte',
    shade: 'Deep',
    inStock: true,
    image: 'https://via.placeholder.com/150/DEB887/FFFFFF?text=Flawless+Touch+Compact',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 7,
    name: 'Glamour Glow Compact',
    originalPrice: 300,
    discountedPrice: 270,
    description: 'Lightweight compact for a radiant, natural finish.',
    rating: 4.4,
    isBestSeller: true,
    brand: 'Mars',
    category: 'Natural',
    shade: 'Fair',
    inStock: true,
    image: 'https://via.placeholder.com/150/FFFACD/FFFFFF?text=Glamour+Glow+Compact',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 8,
    name: 'HD Matte Compact',
    originalPrice: 500,
    discountedPrice: 450,
    description: 'High-definition matte compact for a flawless finish.',
    rating: 4.5,
    isBestSeller: false,
    brand: 'Renee',
    category: 'Matte',
    shade: 'Medium',
    inStock: false,
    image: 'https://via.placeholder.com/150/D2691E/FFFFFF?text=HD+Matte+Compact',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
];

const CompactPowderHeader = ({ setSelectedCategory, selectedCategory }) => {
  const [isPowderSubmenuOpen, setIsPowderSubmenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const powderCategories = [
    { name: 'All', value: 'all' },
    { name: 'Matte', value: 'Matte' },
    { name: 'Dewy', value: 'Dewy' },
    { name: 'Natural', value: 'Natural' },
  ];

  const powderShades = ['Fair', 'Medium', 'Deep'];

  const togglePowderSubmenu = () => {
    setIsPowderSubmenuOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsPowderSubmenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-black text-white p-4 fixed top-0 left-0 w-full z-10 min-h-[60px]">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="text-xl font-bold">Compact Powder Collection</h1>
          {/* <button
            className="sm:hidden text-white"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button> */}
        </div>
        <nav className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-4 ${isMobileMenuOpen ? 'block' : 'hidden sm:flex'}`}>
          <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 w-full">
            {powderCategories.map((category) => (
              <li key={category.value} className="relative">
                {category.name === 'Matte' ? (
                  <>
                    <button
                      className={`text-sm px-3 py-1 rounded-md ${
                        selectedCategory === category.value || powderShades.includes(selectedCategory)
                          ? 'bg-white text-black'
                          : 'bg-black text-white hover:bg-gray-700'
                      }`}
                      onClick={togglePowderSubmenu}
                      aria-label={`Toggle ${category.name} submenu`}
                    >
                      {category.name}
                      <svg
                        className={`inline-block ml-1 w-4 h-4 transform ${isPowderSubmenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isPowderSubmenuOpen && (
                      <div className="absolute top-8 left-0 bg-white text-black border border-gray-300 rounded-md shadow-lg z-50 w-48">
                        <h4 className="px-4 py-2 text-sm font-medium">Shop by Shade</h4>
                        <ul>
                          {powderShades.map((shade) => (
                            <li key={shade}>
                              <button
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-black hover:text-white ${
                                  selectedCategory === shade ? 'bg-black text-white' : ''
                                }`}
                                onClick={() => handleCategoryClick(shade)}
                                aria-label={`Select ${shade} shade`}
                              >
                                {shade}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    className={`text-sm px-3 py-1 rounded-md ${
                      selectedCategory === category.value ? 'bg-white text-black' : 'bg-black text-white hover:bg-gray-700'
                    }`}
                    onClick={() => handleCategoryClick(category.value)}
                    aria-label={`Select ${category.name} category`}
                  >
                    {category.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

const CompactPowderCard = ({ item, onQuickView, addToCart, addToWishlist, cartItems, wishlistItems }) => {
  const { name, originalPrice, discountedPrice, image, brand, shade, inStock, isBestSeller } = item;
  const navigate = useNavigate();
  const powderShades = ['Fair', 'Medium', 'Deep'];
  const [selectedShade, setSelectedShade] = useState(shade);

  const discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  const isInCart = cartItems.some((cartItem) => cartItem.id === item.id && cartItem.shade === selectedShade);
  const isInWishlist = wishlistItems.some((wishlistItem) => wishlistItem.id === item.id && wishlistItem.shade === selectedShade);

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative flex-shrink-0 bg-white">
        <img
          src={image || '/placeholder-image.png'}
          alt={`Image of ${name}`}
          className="w-full h-[200px] object-contain cursor-pointer"
          loading="lazy"
          // onClick={() => navigate(`/compact-powders/product/${item.id}`)}
        />
       <div className="absolute top-2 right-2 flex space-x-2 sm:opacity-100">
  <button
    className={`p-2 rounded-full text-white ${isInWishlist ? 'bg-pink-500' : 'bg-gray-600 hover:bg-pink-400'}`}
    onClick={() => addToWishlist(item, 1, selectedShade)}
    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    aria-label={isInWishlist ? `Remove ${name} from cosmetics wishlist` : `Add ${name} to cosmetics wishlist`}
  >
    <FaHeart className="w-4 h-4" />
  </button>
  <button
    onClick={() => onQuickView(item)}
    className="p-2 rounded-full bg-gray-600 text-white hover:bg-yellow-500 transition-colors duration-200"
    title="Quick View"
    aria-label={`Quick view for ${name} cosmetic`}
  >
    <FaEye className="w-4 h-4" />
  </button>
</div>
        {isBestSeller && (
          <span className="absolute bottom-4 left-4 bg-black text-white text-xs font-semibold px-2 py-1">BEST SELLER</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 cursor-pointer hover:text-gray-600"
          onClick={() => navigate(`/compact-powders/product/${item.id}`)}
        >
          {name}
        </h3>
        <p className="text-sm text-gray-600 mb-1">Brand: {brand}</p>
        <p className="text-sm text-gray-600 mb-2">Shade: {selectedShade}</p>

        <div className="flex items-baseline space-x-2 mb-3 mt-auto">
          <p className="text-xl font-bold text-envy-900">₹{discountedPrice.toFixed(2)}</p>
          <p className="text-lg text-gray-500 line-through">₹{originalPrice.toFixed(2)}</p>
          <span className="text-sm text-green-600 font-semibold">{discountPercentage}% OFF</span>
        </div>

        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-gray-700 font-medium">Shade:</span>
          <select
            className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
            value={selectedShade}
            onChange={(e) => setSelectedShade(e.target.value)}
            aria-label={`Select shade for ${name}`}
          >
            {powderShades.map((shadeOption) => (
              <option key={shadeOption} value={shadeOption}>
                {shadeOption}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`w-full text-white text-sm font-semibold py-2 rounded-md transition-colors duration-200 ${
            isInCart || !inStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
          }`}
          onClick={() => addToCart(item, 1, selectedShade)}
          disabled={isInCart || !inStock}
          aria-label={isInCart ? `${name} already in cart` : !inStock ? `${name} out of stock` : `Add ${name} to cart`}
        >
          {isInCart ? 'ADDED TO CART' : !inStock ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = compactPowderProducts.find((p) => p.id === parseInt(id));
  const powderShades = ['Fair', 'Medium', 'Deep'];
  const [selectedShade, setSelectedShade] = useState(product ? product.shade : '');
  const [quantity, setQuantity] = useState(1);

  const addToCart = (product, quantity, shade) => {
    if (!shade) {
      alert('Please select a shade.');
      return;
    }
    const currentCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItemIndex = currentCart.findIndex(
      (item) => item.id === product.id && item.shade === shade
    );

    if (existingItemIndex !== -1) {
      const updatedCart = currentCart.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      alert(`${quantity} of ${product.name} (Shade: ${shade}) quantity updated in cart!`);
    } else {
      const updatedCart = [...currentCart, { ...product, quantity: parseInt(quantity), shade }];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      alert(`${parseInt(quantity)} of ${product.name} (Shade: ${shade}) added to cart!`);
    }
  };

  if (!product) {
    return <div className="pt-20 sm:pt-24 px-4 text-center">Product not found</div>;
  }

  return (
    <div className="pt-20 sm:pt-24 px-4">
      <button
        className="p-2 text-gray-600 hover:text-black rounded-full focus:outline-none mb-4"
        onClick={() => navigate(-1)}
        title="Go Back"
        aria-label="Go back"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={product.image}
            alt={`Image of ${product.name}`}
            className="w-full md:w-1/2 h-64 object-contain rounded-md"
            loading="lazy"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-black">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Brand: {product.brand}</p>
            <p className="text-sm text-gray-500 mt-1">Shade: {selectedShade}</p>
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24 .588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00 .951-.69l1.07-3.292z"></path>
              </svg>
              <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
            </div>
            <p className="text-base text-gray-600 mt-2">{product.description}</p>
            <div className="flex items-center space-x-2 mt-4">
              <p className="text-xl font-bold text-black">₹{product.discountedPrice.toFixed(2)}</p>
              <p className="text-base text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</p>
              <span className="text-sm text-green-600">
                {Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)}% OFF
              </span>
            </div>
            <div className="mt-4">
              <label htmlFor="detail-shade-select" className="block text-sm font-medium text-gray-700 mb-1">
                Shade:
              </label>
              <select
                id="detail-shade-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedShade}
                onChange={(e) => setSelectedShade(e.target.value)}
                aria-label={`Select shade for ${product.name}`}
              >
                {powderShades.map((shadeOption) => (
                  <option key={shadeOption} value={shadeOption}>
                    {shadeOption}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label htmlFor="detail-quantity-input" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity:
              </label>
              <input
                type="number"
                id="detail-quantity-input"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setQuantity(value > 0 ? value : 1);
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                aria-label="Select quantity"
              />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-black">Delivery & Payment</h3>
              <p className="text-sm text-gray-600">Returns: {product.deliveryInfo.returns}</p>
              <p className="text-sm text-gray-600">Payment Options: {product.deliveryInfo.paymentOptions}</p>
              <p className="text-sm text-gray-600">Estimated Delivery: {product.deliveryInfo.deliveryDate}</p>
            </div>
            {product.offers.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-black">Offers & Coupons</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {product.offers.map((offer) => (
                    <li key={offer.code}>
                      {offer.description} (Use code: <strong>{offer.code}</strong>)
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              className={`mt-4 w-full text-white text-sm font-medium px-6 py-2 rounded-md ${
                product.inStock ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
              }`}
              onClick={() => product.inStock && addToCart(product, quantity, selectedShade)}
              disabled={!product.inStock}
              aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} out of stock`}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function CompactPowders() {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);
  const [quickViewShade, setQuickViewShade] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('categories');
  const [filterState, setFilterState] = useState({
    discount: [],
    brands: [],
    priceRange: null,
    offers: false,
    inStock: false,
    allBrands: false,
    shades: [],
    categories: [],
  });

  const brands = ['Lakmé', 'Maybelline India', 'Lotus Herbals', 'Blue Heaven', 'Sugar Cosmetics', 'Swiss Beauty', 'Mars', 'Renee'];
  const priceRanges = [
    { label: 'All', min: null, max: null },
    { label: '₹200 - ₹500', min: 200, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
  ];
  const discountRanges = [
    { label: '10% and above', min: 10 },
    { label: '20% and above', min: 20 },
    { label: '30% and above', min: 30 },
  ];
  const powderSubcategories = ['Matte', 'Dewy', 'Natural'];
  const powderShades = ['Fair', 'Medium', 'Deep'];
  const sortOptions = [
    { label: 'Sort By', value: 'default' },
    { label: 'Price: Low to High', value: 'priceLow' },
    { label: 'Price: High to Low', value: 'priceHigh' },
    { label: 'Rating: High to Low', value: 'rating' },
    { label: 'Name: A to Z', value: 'name' },
  ];
  const filterCategories = [
    { id: 'categories', label: 'Categories' },
    { id: 'discount', label: 'Discount' },
    { id: 'brands', label: 'Brand' },
    { id: 'price', label: 'Price' },
    { id: 'shades', label: 'Shade' },
    { id: 'offers', label: 'Offers' },
    { id: 'availability', label: 'Availability' },
  ];

  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
      const storedWishlist = JSON.parse(localStorage.getItem('wishlistItems')) || [];
      setCartItems(storedCart);
      setWishlistItems(storedWishlist);
    } catch (error) {
      console.error('Error parsing localStorage:', error);
      setCartItems([]);
      setWishlistItems([]);
    }
  }, []);

  const addToCart = (product, quantity = 1, shade) => {
    if (!shade) {
      alert('Please select a shade.');
      return;
    }
    const currentCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItemIndex = currentCart.findIndex(
      (item) => item.id === product.id && item.shade === shade
    );

    if (existingItemIndex !== -1) {
      const updatedCart = currentCart.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      alert(`${quantity} of ${product.name} (Shade: ${shade}) quantity updated in cart!`);
    } else {
      const updatedCart = [...currentCart, { ...product, quantity: parseInt(quantity), shade }];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      alert(`${parseInt(quantity)} of ${product.name} (Shade: ${shade}) added to cart!`);
    }
  };

  const addToWishlist = (product, quantity = 1, shade) => {
    if (!shade) {
      alert('Please select a shade.');
      return;
    }
    const currentWishlist = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    const isInWishlist = currentWishlist.some(
      (item) => item.id === product.id && item.shade === shade
    );

    if (isInWishlist) {
      const updatedWishlist = currentWishlist.filter(
        (item) => !(item.id === product.id && item.shade === shade)
      );
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      alert(`${product.name} removed from wishlist!`);
    } else {
      const updatedWishlist = [...currentWishlist, { ...product, quantity: parseInt(quantity), shade }];
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      alert(`${product.name} added to wishlist!`);
    }
  };

  const handleQuickView = (product) => {
    setQuickView(product);
    setQuickViewQuantity(1);
    setQuickViewShade(product.shade);
  };

  const handleFilterChange = (key, value) => {
    setFilterState((prev) => {
      if (key === 'allBrands') {
        const newAllBrands = !prev.allBrands;
        return {
          ...prev,
          allBrands: newAllBrands,
          brands: newAllBrands ? brands : [],
        };
      }
      if (['discount', 'brands', 'shades', 'categories'].includes(key)) {
        const updatedArray = prev[key].includes(value)
          ? prev[key].filter((item) => item !== value)
          : [...prev[key], value];
        return {
          ...prev,
          [key]: updatedArray,
          ...(key === 'brands' && { allBrands: updatedArray.length === brands.length }),
        };
      }
      if (key === 'priceRange') {
        return { ...prev, priceRange: value };
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  const clearFilters = () => {
    setFilterState({
      discount: [],
      brands: [],
      priceRange: null,
      offers: false,
      inStock: false,
      allBrands: false,
      shades: [],
      categories: [],
    });
    setShowFilterPanel(false);
  };

  const applyFilters = () => {
    setShowFilterPanel(false);
  };

  const filteredAndSortedItems = useMemo(() => {
    return compactPowderProducts
      .filter((product) => {
        const discountPercentage = Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
        const matchesDiscount = filterState.discount.length
          ? filterState.discount.some((min) => discountPercentage >= min)
          : true;
        const matchesBrands = filterState.allBrands || !filterState.brands.length
          ? true
          : filterState.brands.includes(product.brand);
        const matchesPrice = filterState.priceRange && filterState.priceRange.min !== null
          ? product.discountedPrice >= filterState.priceRange.min && product.discountedPrice <= filterState.priceRange.max
          : true;
        const matchesOffers = filterState.offers ? product.isBestSeller : true;
        const matchesAvailability = filterState.inStock ? product.inStock : true;
        const matchesShade = filterState.shades.length
          ? filterState.shades.includes(product.shade)
          : true;
        const matchesCategoryFilter = filterState.categories.length
          ? filterState.categories.includes(product.category)
          : true;
        const matchesCategory =
          selectedCategory === 'all'
            ? true
            : powderSubcategories.includes(selectedCategory)
            ? product.category === selectedCategory
            : powderShades.includes(selectedCategory)
            ? product.shade === selectedCategory
            : false;
        return matchesDiscount && matchesBrands && matchesPrice && matchesOffers && matchesAvailability && matchesShade && matchesCategoryFilter && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOption === 'priceLow') return a.discountedPrice - b.discountedPrice;
        if (sortOption === 'priceHigh') return b.discountedPrice - a.discountedPrice;
        if (sortOption === 'rating') return b.rating - a.rating;
        if (sortOption === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [filterState, selectedCategory, sortOption]);

  const renderFilterContent = () => {
    switch (selectedFilterCategory) {
      case 'categories':
        return (
          <div className="space-y-2">
            {powderSubcategories.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={filterState.categories.includes(category)}
                  onChange={() => handleFilterChange('categories', category)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label={`Filter by ${category}`}
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-600">
                  {category}
                </label>
              </div>
            ))}
          </div>
        );
      case 'discount':
        return (
          <div className="space-y-2">
            {discountRanges.map(({ label, min }) => (
              <div className="flex items-center" key={min}>
                <input
                  type="checkbox"
                  id={`discount-${min}`}
                  checked={filterState.discount.includes(min)}
                  onChange={() => handleFilterChange('discount', min)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label={`Filter by ${label}`}
                />
                <label htmlFor={`discount-${min}`} className="ml-2 text-sm text-gray-600">
                  {label}
                </label>
              </div>
            ))}
          </div>
        );
      case 'brands':
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="brand-all"
                checked={filterState.allBrands}
                onChange={() => handleFilterChange('allBrands')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                aria-label="Select all brands"
              />
              <label htmlFor="brand-all" className="ml-2 text-sm text-gray-600">
                All
              </label>
            </div>
            {brands.map((brand) => (
              <div key={brand} className="flex items-center">
                <input
                  type="checkbox"
                  id={`brand-${brand}`}
                  checked={filterState.brands.includes(brand)}
                  onChange={() => handleFilterChange('brands', brand)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label={`Filter by ${brand}`}
                />
                <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-600">
                  {brand}
                </label>
              </div>
            ))}
          </div>
        );
      case 'price':
        return (
          <select
            id="price-range"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => {
              const selected = priceRanges.find((range) => range.label === e.target.value);
              handleFilterChange('priceRange', selected.min !== null ? selected : null);
            }}
            value={filterState.priceRange ? filterState.priceRange.label : 'All'}
            aria-label="Select price range"
          >
            {priceRanges.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
        );
      case 'shades':
        return (
          <div className="space-y-2">
            {powderShades.map((shade) => (
              <div key={shade} className="flex items-center">
                <input
                  type="checkbox"
                  id={`shade-${shade}`}
                  checked={filterState.shades.includes(shade)}
                  onChange={() => handleFilterChange('shades', shade)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label={`Filter by ${shade} shade`}
                />
                <label htmlFor={`shade-${shade}`} className="ml-2 text-sm text-gray-600">
                  {shade}
                </label>
              </div>
            ))}
          </div>
        );
      case 'offers':
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="best-seller"
                checked={filterState.offers}
                onChange={() => handleFilterChange('offers', null)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                aria-label="Filter by best seller"
              />
              <label htmlFor="best-seller" className="ml-2 text-sm text-gray-600">
                Best Seller
              </label>
            </div>
          </div>
        );
      case 'availability':
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="in-stock"
                checked={filterState.inStock}
                onChange={() => handleFilterChange('inStock', null)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                aria-label="Filter by in stock"
              />
              <label htmlFor="in-stock" className="ml-2 text-sm text-gray-600">
                In Stock
              </label>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-gray-600">Select a filter category</p>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <CompactPowderHeader setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />

      <Routes>
        <Route
          path="/"
          element={
            <div className="flex-grow pt-20">
              <div className="max-w-screen-xl mx-auto px-4 py-4 pb-16 relative">
                <div className="text-sm text-gray-600 mb-4">
                  <Link to="/" className="hover:underline">Home</Link> /{' '}
                  <Link to="/categories" className="hover:underline">Categories</Link> /{' '}
                  <Link to="/categories/cosmetics" className="hover:underline">Cosmetics</Link> /{' '}
                  <span className="font-semibold">Compact Powders</span> - {filteredAndSortedItems.length} Items
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-nowrap sm:justify-between sm:items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-800 sm:text-sm">Compact Powders ({filteredAndSortedItems.length} Items)</h2>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-sm text-sm font-medium w-full sm:w-auto hover:bg-gray-50"
                      onClick={() => setShowFilterPanel(true)}
                      aria-label="Open filter panel"
                    >
                      <FaFilter className="text-gray-600 w-4 h-4" />
                      <span>Filter</span>
                    </button>
                    <div className="relative w-full sm:w-auto">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-sm pl-4 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
                        aria-label="Sort options"
                      >
                        {sortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4" />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showFilterPanel && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
                      <motion.aside
                        className="bg-white w-full max-w-[600px] h-full flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                      >
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                          <h2 className="text-lg font-bold text-gray-800">Filters</h2>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
                              onClick={clearFilters}
                              aria-label="Clear all filters"
                            >
                              Clear All
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
                              onClick={applyFilters}
                              aria-label="Apply filters"
                            >
                              Apply Filters
                            </button>
                            <button
                              className="text-gray-600 hover:text-gray-800"
                              onClick={() => setShowFilterPanel(false)}
                              aria-label="Close filter panel"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                          <div className="w-[200px] bg-gray-50 border-r border-gray-200 overflow-y-auto">
                            {filterCategories.map((category) => (
                              <button
                                key={category.id}
                                className={`w-full text-left px-4 py-3 text-sm font-semibold ${
                                  selectedFilterCategory === category.id
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-100'
                                } transition-colors duration-200`}
                                onClick={() => setSelectedFilterCategory(category.id)}
                                aria-label={`Select ${category.label} filter`}
                              >
                                {category.label}
                              </button>
                            ))}
                          </div>

                          <div className="flex-1 p-6 overflow-y-auto">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                              {filterCategories.find((cat) => cat.id === selectedFilterCategory)?.label}
                            </h3>
                            <motion.div
                              key={selectedFilterCategory}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.2 }}
                            >
                              {renderFilterContent()}
                            </motion.div>
                          </div>
                        </div>
                      </motion.aside>
                    </div>
                  )}
                </AnimatePresence>

                <main className="flex-grow">
                  <div className="grid grid-cols-2 gap-2 md:gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {filteredAndSortedItems.map((item) => (
                      <CompactPowderCard
                        key={item.id}
                        item={item}
                        onQuickView={handleQuickView}
                        addToCart={addToCart}
                        addToWishlist={addToWishlist}
                        cartItems={cartItems}
                        wishlistItems={wishlistItems}
                      />
                    ))}
                  </div>

                  {filteredAndSortedItems.length === 0 && (
                    <p className="text-center text-gray-600 mt-8 text-sm">No compact powders found matching your criteria.</p>
                  )}
                </main>
              </div>
            </div>
          }
        />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>

      {quickView && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-lg p-3 w-full max-w-[300px] relative z-50"
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 0, opacity: 0 }}
          >
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setQuickView(null)}
              aria-label="Close quick view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-base font-semibold text-gray-800 mb-2">{quickView.name}</h3>
            <img
              src={quickView.image || '/placeholder-image.png'}
              alt={`Image of ${quickView.name}`}
              className="w-full h-36 object-contain mb-2 rounded"
              loading="lazy"
            />
            <p className="text-xs text-gray-700 mb-1">{quickView.description}</p>
            <p className="text-xs text-gray-500 mb-1">Brand: {quickView.brand}</p>
            <p className="text-xs text-gray-500 mb-2">Shade: {quickViewShade}</p>

            <div className="flex items-center space-x-2 mb-2">
              <p className="text-sm font-semibold text-gray-800">₹{quickView.discountedPrice.toFixed(2)}</p>
              <p className="text-xs text-gray-500 line-through">₹{quickView.originalPrice.toFixed(2)}</p>
              <p className="text-xs text-green-600 font-semibold">
                {Math.round(((quickView.originalPrice - quickView.discountedPrice) / quickView.originalPrice) * 100)}% OFF
              </p>
            </div>
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Shade:</p>
              <select
                id="quick-view-shade-select"
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                value={quickViewShade || ''}
                onChange={(e) => setQuickViewShade(e.target.value)}
                aria-label={`Select shade for ${quickView.name || 'product'}`}
              >
                {powderShades.map((shadeOption) => (
                  <option key={shadeOption} value={shadeOption}>
                    {shadeOption}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center mb-3">
              <p className="text-xs font-semibold text-gray-700 mr-2">Qty:</p>
              <input
                type="number"
                id="quick-view-quantity-input"
                min="1"
                value={quickViewQuantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value > 0) setQuickViewQuantity(value);
                }}
                className="w-16 px-2 py-1 border border-gray-200 rounded text-xs"
                aria-label="Select quantity"
              />
            </div>
            <button
              type="button"
              className="w-full bg-blue-600 text-white rounded-md py-1 text-xs hover:bg-blue-700 transition-colors"
              onClick={() => {
                addToCart(quickView, quickViewQuantity, quickViewShade);
                setQuickView(null);
              }}
              aria-label={`Add ${quickView?.name || 'product'} to cart`}
            >
              Add to Cart
            </button>
          </motion.div>
        </motion.div>
      )}
      <Footer />
    </div>
  );
}

export default CompactPowders;
