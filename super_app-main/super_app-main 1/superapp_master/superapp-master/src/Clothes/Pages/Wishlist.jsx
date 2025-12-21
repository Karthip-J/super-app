import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClothesHeader from '../Header/ClothesHeader';
import Footer from '../../Utility/Footer';
import { FaTrash } from 'react-icons/fa';

function WishList() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Custom toast notification (same as e-commerce)
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Fetch wishlist from backend
  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.wishlist), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data && data.data) {
        setWishlistItems(data.data);
        // Initialize qtyMap for each item
        const newQtyMap = {};
        data.data.forEach(item => {
          newQtyMap[item.id] = item.quantity || 1;
        });
        setQtyMap(newQtyMap);
      } else {
        setWishlistItems([]);
        setQtyMap({});
      }
    } catch (e) {
      setWishlistItems([]);
      setQtyMap({});
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line
  }, []);

  const handleRemove = async (wishlistItemId) => {
    try {
      await fetch(API_CONFIG.getUrl(`/api/wishlist/${wishlistItemId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItemId));
      setQtyMap(prev => { const copy = { ...prev }; delete copy[wishlistItemId]; return copy; });
    } catch (e) {
      showToast('Failed to remove item from wishlist', 'error');
    }
  };

  const handleClearWishlist = async () => {
    try {
      await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.wishlist), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistItems([]);
      setQtyMap({});
      showToast('Your wishlist has been cleared!', 'success');
    } catch (e) {
      showToast('Failed to clear wishlist', 'error');
    }
  };

  const handleQtyChange = (id, delta) => {
    setQtyMap(prev => {
      const newQty = Math.max(1, (prev[id] || 1) + delta);
      return { ...prev, [id]: newQty };
    });
  };

  const handleAddToCart = async (item) => {
    const quantity = qtyMap[item.id] || 1;
    try {
      const response = await fetch(API_CONFIG.getUrl('/api/cart/items'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: item.product_id,
          quantity
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to add to cart');
      showToast('Added to cart successfully!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to add to cart', 'error');
    }
  };

  return (
    <div className="bg-[#F8F8F8] min-h-screen">
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
      
      <ClothesHeader />
      <div className="px-4 pt-24 pb-40">
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium text-base">My Wishlist</div>
          <button
            onClick={handleClearWishlist}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-sm"
          >
            Clear Wishlist
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[50vh] text-center text-[#484848] text-lg">
            Loading...
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh] text-center text-[#484848] text-lg">
            Your wishlist is empty
          </div>
        ) : (
          wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E1E1E1] rounded-[20px] mt-4 flex row gap-4 p-4"
            >
              <div className="w-[200px] h-[180px]">
                <img src={item.product?.photo ? API_CONFIG.getUploadUrl(item.product.photo) : 'fallback.jpg'} alt="product" className="w-full h-full p-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center w-full">
                  <p className="font-medium text-base text-[#484848]">{item.product?.category?.name || ''}</p>
                </div>
                <div className="font-semibold text-base text-[#242424] pt-2">{item.product?.name}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm text-[#484848]">Qty:</span>
                  <button className="border px-2 rounded text-xs" onClick={() => handleQtyChange(item.id, -1)}>-</button>
                  <span className="text-xs w-4 text-center">{qtyMap[item.id] || 1}</span>
                  <button className="border px-2 rounded text-xs" onClick={() => handleQtyChange(item.id, 1)}>+</button>
                </div>
                <p className="font-medium text-sm text-[#242424] mb-2">
                  ₹ {parseFloat(item.product?.discountedPrice || item.product?.price || 0)}{' '}
                  {item.product?.originalPrice && (
                    <span className="line-through text-[#C1C1C1]">₹ {parseFloat(item.product.originalPrice)}</span>
                  )}
                </p>
                <div className="flex justify-between items-center w-full">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="px-4 py-2 rounded-full text-sm bg-[#5C3FFF] text-white hover:bg-[#4a32cc]"
                  >
                    Add to Cart
                  </button>
                  <button
                    className="p-1 rounded-full text-purple-600 hover:bg-purple-100 transition-colors"
                    onClick={() => handleRemove(item.id)}
                    aria-label="Remove from wishlist"
                  >
                    <FaTrash className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
}

export default WishList;