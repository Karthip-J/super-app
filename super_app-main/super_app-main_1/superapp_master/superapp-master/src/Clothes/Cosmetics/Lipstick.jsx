import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, Routes, Route, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaHeart, FaEye, FaChevronDown } from 'react-icons/fa';
import Footer from '../../Utility/Footer';
import lipsticklakmeImage from '../Images/lipsticklakme.jpg';


const lipstickColors = [
  'Pinks', 'Nudes', 'Reds', 'Browns', 'Corals', 'Maroon', 'Plums',
  'Berries', 'Mauves', 'Peaches', 'Oranges', 'Wines', 'Fuchsias', 'Rose', 'Cherry',
  'Violets', 'Bronzes', 'Rubies', 'Tangerines', 'Blushes', 
];


const cosmeticsProducts = [
  {
    id: 1,
    name: 'Moisturizing Lipstick',
    originalPrice: 1200,
    discountedPrice: 900,
    description: 'Long-lasting hydrating lipstick with vibrant color.',
    rating: 4.5,
    isBestSeller: true,
    brand: 'Lakmé',
    category: 'Lipstick',
    colors: ['Reds', 'Pinks', 'Nudes', 'Corals', 'Violets'],
    inStock: true,
    image: lipsticklakmeImage,
    deliveryInfo: {
      returns: 'No Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [
      { code: 'LIP5', description: '₹5 off on first order', discount: 5 },
      { code: 'BOGO50', description: 'Buy 1 Get 1 at 50% off', discount: '50% on second item' },
      { code: 'FREESHIP', description: 'Free delivery on orders above ₹500', discount: 'Free Shipping' },
    ],
  },
  {
    id: 22,
    name: 'Satin Lipstick',
    originalPrice: 1300,
    discountedPrice: 1000,
    description: 'Smooth satin finish lipstick with rich pigmentation.',
    rating: 4.6,
    isBestSeller: true,
    brand: "L'Oréal",
    category: 'Lipstick',
    colors: ['Berries', 'Mauves', 'Wines', 'Rose', 'Rubies'],
    inStock: true,
    image: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=Satin+Lipstick',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 23,
    name: 'Matte Lipstick',
    originalPrice: 1100,
    discountedPrice: 850,
    description: 'Bold matte lipstick with all-day wear.',
    rating: 4.4,
    isBestSeller: false,
    brand: 'Maybelline',
    category: 'Lipstick',
    colors: ['Mauves', 'Plums', 'Maroon', 'Tangerines'],
    inStock: true,
    image: 'https://via.placeholder.com/150/BA55D3/FFFFFF?text=Matte+Lipstick',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 24,
    name: 'Velvet Lipstick',
    originalPrice: 1400,
    discountedPrice: 1100,
    description: 'Luxurious velvet finish lipstick with intense color.',
    rating: 4.7,
    isBestSeller: true,
    brand: 'Lakmé',
    category: 'Lipstick',
    colors: ['Wines', 'Nudes', 'Pinks', 'Bronzes'],
    inStock: true,
    image: 'https://via.placeholder.com/150/8B0000/FFFFFF?text=Velvet+Lipstick',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 17,
    name: 'Liquid Lipstick',
    originalPrice: 1000,
    discountedPrice: 800,
    description: 'Matte finish liquid lipstick with long wear.',
    rating: 4.4,
    isBestSeller: false,
    brand: 'Maybelline',
    category: 'Liquid Lipstick',
    colors: ['Pinks', 'Fuchsias', 'Corals', 'Blushes'],
    inStock: true,
    image: 'https://via.placeholder.com/150/FF1493/FFFFFF?text=Liquid+Lipstick',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 25,
    name: 'Velvet Liquid Lipstick',
    originalPrice: 1200,
    discountedPrice: 950,
    description: 'Velvet texture liquid lipstick with smooth application.',
    rating: 4.5,
    isBestSeller: true,
    brand: "L'Oréal",
    category: 'Liquid Lipstick',
    colors: ['Fuchsias', 'Reds', 'Peaches', 'Violets'],
    inStock: true,
    image: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Velvet+Liquid+Lipstick',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 18,
    name: 'Lip Tint',
    originalPrice: 700,
    discountedPrice: 550,
    description: 'Lightweight lip tint for a natural look.',
    rating: 4.3,
    isBestSeller: true,
    brand: "L'Oréal",
    category: 'Lip Tints',
    colors: ['Corals', 'Pinks', 'Peaches', 'Tangerines'],
    inStock: true,
    image: 'https://via.placeholder.com/150/FF7F50/FFFFFF?text=Lip+Tint',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 26,
    name: 'Hydrating Lip Tint',
    originalPrice: 800,
    discountedPrice: 600,
    description: 'Moisturizing lip tint with a subtle sheen.',
    rating: 4.4,
    isBestSeller: false,
    brand: 'Lakmé',
    category: 'Lip Tints',
    colors: ['Peaches', 'Rose', 'Nudes', 'Blushes'],
    inStock: true,
    image: 'https://via.placeholder.com/150/FFDAB9/FFFFFF?text=Hydrating+Lip+Tint',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 19,
    name: 'Lip Gloss',
    originalPrice: 900,
    discountedPrice: 700,
    description: 'Shiny lip gloss with moisturizing formula.',
    rating: 4.6,
    isBestSeller: false,
    brand: 'Lakmé',
    category: 'Lip Gloss/Oil',
    colors: ['Nudes', 'Pinks', 'Oranges', 'Cherry'],
    inStock: true,
    image: 'https://via.placeholder.com/150/F5F5DC/FFFFFF?text=Lip+Gloss',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 27,
    name: 'Plumping Lip Gloss',
    originalPrice: 1000,
    discountedPrice: 800,
    description: 'Volumizing lip gloss with a glossy finish.',
    rating: 4.5,
    isBestSeller: true,
    brand: 'Maybelline',
    category: 'Lip Gloss/Oil',
    colors: ['Rose', 'Fuchsias', 'Reds', 'Bronzes'],
    inStock: true,
    image: 'https://via.placeholder.com/150/FFC1CC/FFFFFF?text=Plumping+Lip+Gloss',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 28,
    name: 'Lip Oil',
    originalPrice: 950,
    discountedPrice: 750,
    description: 'Nourishing lip oil with a non-sticky shine.',
    rating: 4.7,
    isBestSeller: false,
    brand: "L'Oréal",
    category: 'Lip Gloss/Oil',
    colors: ['Cherry', 'Peaches', 'Pinks', 'Tangerines'],
    inStock: true,
    image: 'https://via.placeholder.com/150/DC143C/FFFFFF?text=Lip+Oil',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 29,
    name: 'Sparkle Lip Gloss',
    originalPrice: 1100,
    discountedPrice: 850,
    description: 'Glitter-infused lip gloss for a dazzling look.',
    rating: 4.4,
    isBestSeller: true,
    brand: 'Lakmé',
    category: 'Lip Gloss/Oil',
    colors: ['Oranges', 'Nudes', 'Rose', 'Violets'],
    inStock: true,
    image: 'https://via.placeholder.com/150/FFA500/FFFFFF?text=Sparkle+Lip+Gloss',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 20,
    name: 'Lip Crayon',
    originalPrice: 1100,
    discountedPrice: 850,
    description: 'Creamy lip crayon with bold color.',
    rating: 4.5,
    isBestSeller: true,
    brand: 'Maybelline',
    category: 'Lip Crayons',
    colors: ['Maroon', 'Pinks', 'Plums', 'Rubies'],
    inStock: true,
    image: 'https://via.placeholder.com/150/800000/FFFFFF?text=Lip+Crayon',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
  {
    id: 30,
    name: 'Matte Lip Crayon',
    originalPrice: 1200,
    discountedPrice: 900,
    description: 'Matte finish lip crayon with easy application.',
    rating: 4.6,
    isBestSeller: false,
    brand: "L'Oréal",
    category: 'Lip Crayons',
    colors: ['Plums', 'Browns', 'Berries', 'Blushes'],
    inStock: true,
    image: 'https://via.placeholder.com/150/800080/FFFFFF?text=Matte+Lip+Crayon',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 21,
    name: 'Lip Liner',
    originalPrice: 600,
    discountedPrice: 450,
    description: 'Precise lip liner for defined lips.',
    rating: 4.4,
    isBestSeller: false,
    brand: "L'Oréal",
    category: 'Lip Liners',
    colors: ['Plums', 'Reds', 'Nudes', 'Bronzes'],
    inStock: true,
    image: 'https://via.placeholder.com/150/800080/FFFFFF?text=Lip+Liner',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 21st June 2025',
    },
    offers: [],
  },
  {
    id: 31,
    name: 'Creamy Lip Liner',
    originalPrice: 700,
    discountedPrice: 550,
    description: 'Creamy lip liner for smooth outlining.',
    rating: 4.5,
    isBestSeller: true,
    brand: 'Lakmé',
    category: 'Lip Liners',
    colors: ['Browns', 'Plums', 'Reds', 'Pinks'],
    inStock: false,
    image: 'https://via.placeholder.com/150/8B4513/FFFFFF?text=Creamy+Lip+Liner',
    deliveryInfo: {
      returns: '30-day Returns',
      paymentOptions: 'Cash on Delivery, UPI, Credit/Debit Card',
      deliveryDate: 'By 20th June 2025',
    },
    offers: [],
  },
];

// LipstickHeader Component
const LipstickHeader = ({ setSelectedCategory, selectedCategory }) => {
  const [isLipstickSubmenuOpen, setIsLipstickSubmenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const lipstickCategories = [
    { name: 'All', value: 'all' },
    { name: 'Lipstick', value: 'Lipstick' },
    { name: 'Liquid Lipstick', value: 'Liquid Lipstick' },
    { name: 'Lip Tints', value: 'Lip Tints' },
    { name: 'Lip Gloss/Oil', value: 'Lip Gloss/Oil' },
    { name: 'Lip Crayons', value: 'Lip Crayons' },
    { name: 'Lip Liners', value: 'Lip Liners' },
  ];

  const toggleLipstickSubmenu = () => {
    setIsLipstickSubmenuOpen((prev) => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsLipstickSubmenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-black text-white p-4 fixed top-0 left-0 w-full z-10 min-h-[60px]">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="text-xl font-bold">Lipstick Collection</h1>
        </div>
        <nav className={`flex flex-col sm:flex-row items-center gap-2 sm:gap-4 ${isMobileMenuOpen ? 'block' : 'hidden sm:flex'}`}>
          <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 w-full">
            {lipstickCategories.map((category) => (
              <li key={category.value} className="relative">
                {category.name === 'Lipstick' ? (
                  <>
                    <button
                      className={`text-sm px-3 py-1 rounded-md ${
                        selectedCategory === category.value || lipstickColors.includes(selectedCategory)
                          ? 'bg-white text-black'
                          : 'bg-black text-white hover:bg-gray-700'
                      }`}
                      onClick={toggleLipstickSubmenu}
                      aria-label={`Toggle ${category.name} submenu`}
                    >
                      {category.name}
                      <svg
                        className={`inline-block ml-1 w-4 h-4 transform ${isLipstickSubmenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isLipstickSubmenuOpen && (
                      <div className="absolute top-8 left-0 bg-white text-black border border-gray-300 rounded-md shadow-lg z-50 w-48">
                        <h4 className="px-4 py-2 text-sm font-medium">Shop by Color</h4>
                        <ul>
                          {lipstickColors.map((color) => (
                            <li key={color}>
                              <button
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-black hover:text-white ${
                                  selectedCategory === color ? 'bg-black text-white' : ''
                                }`}
                                onClick={() => handleCategoryClick(color)}
                                aria-label={`Select ${color} color`}
                              >
                                {color}
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

// CosmeticCard Component
const CosmeticCard = ({ item, onQuickView, addToCart, addToWishlist, cartItems, wishlistItems }) => {
  const { name, originalPrice, discountedPrice, image, brand, colors, inStock, isBestSeller } = item;
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');

  const discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  const isInCart = cartItems.some((cartItem) => cartItem.id === item.id && cartItem.color === selectedColor);
  const isInWishlist = wishlistItems.some((wishlistItem) => wishlistItem.id === item.id && wishlistItem.color === selectedColor);

  return (
    <div className="group bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="relative flex-shrink-0 bg-white">
        <img
          src={image || 'https://via.placeholder.com/150'}
          alt={`Image of ${name}`}
          className="w-full h-[200px] object-contain cursor-pointer"
          loading="lazy"
        />
        <div className="absolute top-2 right-2 flex space-x-2 sm:opacity-100">
          <button
            className={`p-2 rounded-full text-white transition-colors duration-200 ${isInWishlist ? 'bg-red-500' : 'bg-gray-700 hover:bg-red-500'}`}
            onClick={() => addToWishlist(item, 1, selectedColor)}
            title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={isInWishlist ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          >
            <FaHeart className="w-5 h-5" />
          </button>
          <button
            onClick={() => onQuickView(item)}
            className="p-2 rounded-full bg-gray-700 text-white hover:bg-blue-500 transition-colors duration-200"
            title="Quick View"
            aria-label={`Quick view for ${name}`}
          >
            <FaEye className="w-5 h-5" />
          </button>
        </div>
        {isBestSeller && (
          <span className="absolute bottom-4 left-4 bg-black text-white text-xs font-semibold px-2 py-1">BEST SELLER</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3
          className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 cursor-pointer hover:text-gray-600"
          // onClick={() => navigate(`/lipsticks/product/${item.id}`)}
        >
          {name}
        </h3>
        <p className="text-sm text-gray-600 mb-1">Brand: {brand}</p>
        <p className="text-sm text-gray-600 mb-2">Color: {selectedColor}</p>

        <div className="flex items-baseline space-x-2 mb-3 mt-auto">
          <p className="text-xl font-bold text-envy-900">₹{discountedPrice.toFixed(2)}</p>
          <p className="text-lg text-gray-500 line-through">₹{originalPrice.toFixed(2)}</p>
          <span className="text-sm text-green-600 font-semibold">{discountPercentage}% OFF</span>
        </div>

        <div className="flex items-center space-x-1 mb-3">
          <span className="text-xs text-gray-700 font-medium">Color:</span>
          <select
            className="w-full px-1 py-0.5 border border-gray-300 rounded text-xs"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            aria-label={`Select color for ${name}`}
          >
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        <button
          className={`w-full text-white text-sm font-semibold py-2 rounded-md transition-colors duration-200 ${
            isInCart || !inStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
          }`}
          onClick={() => addToCart(item, 1, selectedColor)}
          disabled={isInCart || !inStock}
          aria-label={isInCart ? `${name} already in cart` : !inStock ? `${name} out of stock` : `Add ${name} to cart`}
        >
          {isInCart ? 'ADDED TO CART' : !inStock ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
      </div>
    </div>
  );
};

// ProductDetail Component
const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = cosmeticsProducts.find((p) => p.id === parseInt(id));
  const [selectedColor, setSelectedColor] = useState(product ? product.colors[0] : '');
  const [quantity, setQuantity] = useState(1);

  const addToCart = (product, quantity, color) => {
    if (!color) {
      alert('Please select a color.');
      return;
    }
    const currentCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItemIndex = currentCart.findIndex(
      (item) => item.id === product.id && item.color === color
    );

    if (existingItemIndex !== -1) {
      const updatedCart = currentCart.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      alert(`${quantity} of ${product.name} (Color: ${color}) quantity updated in cart!`);
    } else {
      const updatedCart = [...currentCart, { ...product, quantity: parseInt(quantity), color }];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      alert(`${parseInt(quantity)} of ${product.name} (Color: ${color}) added to cart!`);
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
              <label htmlFor="detail-color-select" className="block text-sm font-medium text-gray-700 mb-1">
                Color:
              </label>
              <select
                id="detail-color-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                aria-label={`Select color for ${product.name}`}
              >
                {product.colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
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
              onClick={() => product.inStock && addToCart(product, quantity, selectedColor)}
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

// Main Lipsticks Component
function Lipsticks() {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);
  const [quickViewColor, setQuickViewColor] = useState(null);
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
    colors: [],
    categories: [],
  });

  const brands = ['Lakmé', 'Maybelline', "L'Oréal"];
  const priceRanges = [
    { label: 'All', min: null, max: null },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹1500', min: 1000, max: 1500 },
  ];
  const discountRanges = [
    { label: '10% and above', min: 10 },
    { label: '20% and above', min: 20 },
    { label: '30% and above', min: 30 },
    { label: '40% and above', min: 40 },
  ];
  const lipstickSubcategories = [
    'Lipstick',
    'Liquid Lipstick',
    'Lip Tints',
    'Lip Gloss/Oil',
    'Lip Crayons',
    'Lip Liners',
  ];
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
    { id: 'colors', label: 'Color' },
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

  const addToCart = (product, quantity = 1, color) => {
    if (!color) {
      alert('Please select a color.');
      return;
    }
    const currentCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const existingItemIndex = currentCart.findIndex(
      (item) => item.id === product.id && item.color === color
    );

    if (existingItemIndex !== -1) {
      const updatedCart = currentCart.map((item, index) =>
        index === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      alert(`${quantity} of ${product.name} (Color: ${color}) quantity updated in cart!`);
    } else {
      const updatedCart = [...currentCart, { ...product, quantity: parseInt(quantity), color }];
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      alert(`${parseInt(quantity)} of ${product.name} (Color: ${color}) added to cart!`);
    }
  };

  const addToWishlist = (product, quantity = 1, color) => {
    if (!color) {
      alert('Please select a color.');
      return;
    }
    const currentWishlist = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    const isInWishlist = currentWishlist.some(
      (item) => item.id === product.id && item.color === color
    );

    if (isInWishlist) {
      const updatedWishlist = currentWishlist.filter(
        (item) => !(item.id === product.id && item.color === color)
      );
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      alert(`${product.name} removed from wishlist!`);
    } else {
      const updatedWishlist = [...currentWishlist, { ...product, quantity: parseInt(quantity), color }];
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
      setWishlistItems(updatedWishlist);
      alert(`${product.name} added to wishlist!`);
    }
  };

  const handleQuickView = (product) => {
    setQuickView(product);
    setQuickViewQuantity(1);
    setQuickViewColor(product.colors[0] || '');
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
      if (['discount', 'brands', 'colors', 'categories'].includes(key)) {
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
      colors: [],
      categories: [],
    });
    setShowFilterPanel(false);
  };

  const applyFilters = () => {
    setShowFilterPanel(false);
  };

  const filteredAndSortedItems = useMemo(() => {
    return cosmeticsProducts
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
        const matchesColor = filterState.colors.length
          ? product.colors.some((color) => filterState.colors.includes(color))
          : true;
        const matchesCategoryFilter = filterState.categories.length
          ? filterState.categories.includes(product.category)
          : true;
        const matchesCategory =
          selectedCategory === 'all'
            ? true
            : lipstickSubcategories.includes(selectedCategory)
            ? product.category === selectedCategory
            : lipstickColors.includes(selectedCategory)
            ? product.colors.includes(selectedCategory)
            : false;
        return matchesDiscount && matchesBrands && matchesPrice && matchesOffers && matchesAvailability && matchesColor && matchesCategoryFilter && matchesCategory;
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
            {lipstickSubcategories.map((category) => (
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
              <div key={min} className="flex items-center">
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
      case 'colors':
        return (
          <div className="space-y-2">
            {lipstickColors.map((color) => (
              <div key={color} className="flex items-center">
                <input
                  type="checkbox"
                  id={`color-${color}`}
                  checked={filterState.colors.includes(color)}
                  onChange={() => handleFilterChange('colors', color)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  aria-label={`Filter by ${color} color`}
                />
                <label htmlFor={`color-${color}`} className="ml-2 text-sm text-gray-600">
                  {color}
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
      <LipstickHeader setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />

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
                  <span className="font-semibold">Lipsticks</span> - {filteredAndSortedItems.length} Items
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-nowrap sm:justify-between sm:items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-gray-800 sm:text-sm">Lipsticks ({filteredAndSortedItems.length} Items)</h2>
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
                      <CosmeticCard
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
                    <p className="text-center text-gray-600 mt-8 text-sm">No lipsticks found matching your criteria.</p>
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
              src={quickView.image || 'https://via.placeholder.com/150'}
              alt={`Image of ${quickView.name}`}
              className="w-full h-36 object-contain mb-2 rounded"
              loading="lazy"
            />
            <p className="text-xs text-gray-700 mb-1">{quickView.description}</p>
            <p className="text-xs text-gray-500 mb-1">Brand: {quickView.brand}</p>
            <p className="text-xs text-gray-500 mb-2">Color: {quickViewColor}</p>

            <div className="flex items-center space-x-2 mb-2">
              <p className="text-sm font-semibold text-gray-800">₹{quickView.discountedPrice.toFixed(2)}</p>
              <p className="text-xs text-gray-500 line-through">₹{quickView.originalPrice.toFixed(2)}</p>
              <p className="text-xs text-green-600 font-semibold">
                {Math.round(((quickView.originalPrice - quickView.discountedPrice) / quickView.originalPrice) * 100)}% OFF
              </p>
            </div>
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1">Color:</p>
              <select
                id="quick-view-color-select"
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                value={quickViewColor || ''}
                onChange={(e) => setQuickViewColor(e.target.value)}
                aria-label={`Select color for ${quickView.name || 'product'}`}
              >
                {quickView.colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
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
                addToCart(quickView, quickViewQuantity, quickViewColor);
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

export default Lipsticks;