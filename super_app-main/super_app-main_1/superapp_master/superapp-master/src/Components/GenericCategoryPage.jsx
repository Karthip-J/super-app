import API_CONFIG from "../config/api.config.js";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaFilter } from 'react-icons/fa';
import { useCart } from '../Utility/CartContext';
import EcommerceGroceryHeader from './EcommerceGroceryHeader';
import Footer from '../Utility/Footer';
import search from '../Icons/search.svg';
import cross from '../Icons/close-circle.svg';
import mic from '../Icons/Mic.svg';

const GenericCategoryPage = () => {
  const { categorySlug, subcategorySlug, parentSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Convert slug to display name
  const getCategoryDisplayName = (slug) => {
    if (!slug || typeof slug !== 'string') {
      return 'Unknown Category';
    }
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Custom toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // Get token
            let token = localStorage.getItem('token') || 
                       localStorage.getItem('authToken') || 
                       localStorage.getItem('adminToken') ||
                       'demo-token';
            
            console.log('🚀 === ENHANCED DEBUG - GenericCategoryPage ===');
            console.log('📍 Current URL:', window.location.pathname);
            console.log('📊 URL Params:', { parentSlug, categorySlug, subcategorySlug });
            console.log('🔑 Token:', token ? 'Present' : 'Missing');
            
            const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.PRODUCTS), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            
            // Extract products array
            let products = [];
            if (Array.isArray(data)) {
                products = data;
            } else if (data.data && Array.isArray(data.data)) {
                products = data.data;
            } else if (data.products && Array.isArray(data.products)) {
                products = data.products;
            }
            
            console.log('📦 Total Products Fetched:', products.length);
            
            // Show sample product structure
            if (products.length > 0) {
                console.log('📋 Sample Product Structure:', {
                    name: products[0].name,
                    category_id: products[0].category_id,
                    sub_category_id: products[0].sub_category_id
                });
            }

            // ✅ ENHANCED FILTERING LOGIC
            console.log('🔍 === FILTERING PRODUCTS ===');
            
            let filteredProducts = [];
            
            // Check what we're filtering by
            if (subcategorySlug) {
                console.log('🎯 FILTERING BY SUBCATEGORY:', subcategorySlug);
                
                filteredProducts = products.filter(product => {
                    console.log(`\n🔍 Checking Product: ${product.name}`);
                    
                    if (!product.sub_category_id) {
                        console.log('❌ No sub_category_id');
                        return false;
                    }
                    
                    const subCatData = product.sub_category_id;
                    console.log('📂 Product subcategory data:', subCatData);
                    
                    // Get subcategory slug from product
                    let productSubSlug = null;
                    if (typeof subCatData === 'object' && subCatData.slug) {
                        productSubSlug = subCatData.slug;
                    } else if (typeof subCatData === 'object' && subCatData.name) {
                        productSubSlug = subCatData.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
                    }
                    
                    console.log('🏷️ Product subcategory slug:', productSubSlug);
                    console.log('🎯 Looking for slug:', subcategorySlug);
                    
                    const matches = productSubSlug && productSubSlug.toLowerCase() === subcategorySlug.toLowerCase();
                    console.log('✅ Matches:', matches);
                    
                    return matches;
                });
                
            } else if (categorySlug) {
                console.log('🎯 FILTERING BY MAIN CATEGORY:', categorySlug);
                
                filteredProducts = products.filter(product => {
                    if (!product.category_id) return false;
                    
                    const catData = product.category_id;
                    let productCatSlug = null;
                    
                    if (typeof catData === 'object' && catData.slug) {
                        productCatSlug = catData.slug;
                    } else if (typeof catData === 'object' && catData.name) {
                        productCatSlug = catData.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
                    }
                    
                    return productCatSlug && productCatSlug.toLowerCase() === categorySlug.toLowerCase();
                });
            }

            console.log('📊 === FILTERING RESULTS ===');
            console.log('📦 Total products:', products.length);
            console.log('✅ Filtered products:', filteredProducts.length);
            console.log('📋 Filtered product names:', filteredProducts.map(p => p.name));
            
            setProducts(filteredProducts);
            setAllProducts(filteredProducts); // Store for filtering
            setFilteredProducts(filteredProducts); // Initialize filtered products
            setError(null);
            
        } catch (error) {
            console.error('🚨 Error fetching products:', error);
            setError(error.message);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    fetchProducts();
}, [categorySlug, subcategorySlug, parentSlug]);

  const handleAddToCart = async (product) => {
    try {
      const productId = product._id || product.id;
      const quantity = 1;

      await addToCart(productId, quantity);
      showToast(`${product.name} added to cart!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast(`Failed to add ${product.name} to cart`, 'error');
    }
  };

  // Filter and search products
  useEffect(() => {
    let filtered = [...allProducts];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand_id?.name && product.brand_id.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply selected filters
    if (selectedFilters.length > 0) {
      // Filter by price ranges
      const priceFilters = selectedFilters.filter(f => f.includes('₹') || f.includes('Under'));
      if (priceFilters.length > 0) {
        filtered = filtered.filter(product => {
          const price = product.sale_price || product.price || 0;
          return priceFilters.some(filter => {
            if (filter.includes('Under')) {
              const max = parseInt(filter.match(/\d+/)?.[0] || '0');
              return price <= max;
            }
            if (filter.includes('-')) {
              const [min, max] = filter.match(/\d+/g) || [];
              return price >= parseInt(min) && price <= parseInt(max);
            }
            return true;
          });
        });
      }

      // Filter by discount/offers
      const discountFilters = selectedFilters.filter(f => f.includes('%'));
      if (discountFilters.length > 0) {
        filtered = filtered.filter(product => {
          if (product.sale_price && product.price) {
            const discount = ((product.price - product.sale_price) / product.price) * 100;
            return discountFilters.some(filter => {
              const minDiscount = parseInt(filter.match(/\d+/)?.[0] || '0');
              return discount >= minDiscount;
            });
          }
          return false;
        });
      }
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedFilters, allProducts]);

  const toggleFilters = () => setShowFilters(!showFilters);

  const applyFilters = (filters) => {
    setSelectedFilters(filters);
    setShowFilters(false);
  };

  const removeFilter = (filterToRemove) => {
    setSelectedFilters(selectedFilters.filter(filter => filter !== filterToRemove));
  };

  // Default filter options
  const filterOptions = {
    price: ["Under ₹500", "₹500 - ₹1000", "₹1000 - ₹2000", "₹2000 - ₹3000", "₹3000 - ₹5000", "Above ₹5000"],
    discount: ["10% and above", "20% and above", "30% and above", "40% and above", "50% and above"],
    offers: ["Best Seller", "New Arrival", "On Sale"]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EcommerceGroceryHeader />
        <div className="pt-24 px-4">
          <div className="text-center py-8">
            <div className="text-lg text-gray-600">Loading products...</div>
            <div className="text-sm text-gray-500 mt-2">
              Subcategory: {subcategorySlug || 'None'} | Category: {categorySlug || 'None'}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EcommerceGroceryHeader />
        <div className="pt-24 px-4">
          <div className="text-center py-8">
            <div className="text-lg text-red-600 mb-4">Error: {error}</div>
            <div className="text-sm text-gray-500 mb-4">
              URL: {window.location.pathname}<br/>
              Params: parent={parentSlug}, category={categorySlug}, sub={subcategorySlug}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = subcategorySlug 
    ? getCategoryDisplayName(subcategorySlug)
    : getCategoryDisplayName(categorySlug || parentSlug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Custom Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' 
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
      
      <EcommerceGroceryHeader />
      
      <div className="pt-24 px-4">
        {/* Debug Info */}
        {/* <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-4 text-xs">
          <strong>Debug Info:</strong><br/>
          URL: {window.location.pathname}<br/>
          Parent: {parentSlug || 'none'} | Category: {categorySlug || 'none'} | Subcategory: {subcategorySlug || 'none'}<br/>
          Showing: {displayName} ({products.length} products)
        </div> */}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-full"
              title="Go Back"
            >
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-600">
                {subcategorySlug ? 'Subcategory' : 'Category'} • {filteredProducts.length} of {allProducts.length} products
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar with Filter Button - Fixed Inside Input - Responsive */}
        <div className="flex justify-center mb-4 items-center bg-white px-2 sm:px-0">
          <div className="relative w-full max-w-md">
            {/* Search Input - Fixed with proper padding for icons */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 sm:pl-12 md:pl-14 pr-14 sm:pr-16 md:pr-16 py-2.5 sm:py-3 md:py-3.5 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500 focus:shadow-md bg-white shadow-sm transition-all text-sm sm:text-base"
            />
            
            {/* Search Icon - Fixed Inside Left Side of Input */}
            <img
              src={search}
              alt="search"
              className="absolute left-3.5 sm:left-4 md:left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none opacity-60"
            />
            
            {/* Filter Button - Fixed at Right End, Vertically Centered Inside Input - Medium Size */}
            <button 
              onClick={toggleFilters} 
              className="absolute right-1.5 sm:right-2 md:right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center"
              title="Filters"
            >
              <FaFilter className="w-5 h-5 text-blue-600 flex-shrink-0" />
              {selectedFilters.length > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                  {selectedFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Selected Filters Display */}
        {selectedFilters.length > 0 && (
          <div className="overflow-x-auto whitespace-nowrap mb-4">
            <div className="flex gap-2">
              {selectedFilters.map((filter, index) => (
                <span
                  key={index}
                  className="text-gray-700 text-xs px-3 py-2 bg-blue-50 border border-blue-300 rounded-full cursor-pointer inline-block"
                  onClick={() => removeFilter(filter)}
                >
                  {filter} ✕
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
            {filteredProducts.map((product) => (
              <div key={product._id || product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-100">
                  <img
                    src={product.photo || product.featured_image || product.image || '/placeholder-image.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-xs text-gray-500 mb-2">
                    {product.brand_id?.name || 'Unknown Brand'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-gray-900 text-sm">
                        ₹{product.sale_price || product.price}
                      </span>
                      {product.sale_price && product.sale_price < product.price && (
                        <span className="text-xs text-gray-500 line-through">
                          ₹{product.price}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {searchQuery || selectedFilters.length > 0 
                ? "No products match your search or filters." 
                : `No products found in ${displayName}`}
            </div>
            <p className="text-gray-400 text-sm mb-6">
              {searchQuery || selectedFilters.length > 0 
                ? "Try adjusting your search or filters." 
                : "Try browsing other categories or check the console for debug info."}
            </p>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <FilterModal 
          onClose={toggleFilters} 
          onApply={applyFilters} 
          filterOptions={filterOptions}
          selectedFilters={selectedFilters}
        />
      )}

      <Footer />
    </div>
  );
};

// Filter Modal Component
function FilterModal({ onClose, onApply, filterOptions, selectedFilters: initialFilters }) {
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end">
      <div className="bg-gray-50 w-full p-6 rounded-t-[30px] max-h-[75vh] flex flex-col relative">
        {/* Fixed Header */}
        <div className="sticky top-0 left-0 right-0 bg-gray-50 z-10 flex justify-between items-center pb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <img 
            onClick={onClose} 
            src={cross} 
            alt="Close" 
            className="cursor-pointer w-6 h-6" 
          />
        </div>

        {/* Scrollable Filter Options */}
        <div className="flex-1 overflow-auto mt-4 mb-12">
          {Object.entries(filterOptions).map(([category, options]) => (
            <div key={category} className="mb-6">
              <h3 className="font-medium text-base mb-3 text-gray-800">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option}
                    className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                      selectedFilters.includes(option) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                    onClick={() => toggleFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Fixed Bottom Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 flex flex-col gap-2">
          <button
            onClick={() => onApply(selectedFilters)}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setSelectedFilters([]);
              onApply([]);
            }}
            className="text-gray-700 w-full px-4 py-3 border border-gray-300 rounded-full bg-white hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenericCategoryPage; 