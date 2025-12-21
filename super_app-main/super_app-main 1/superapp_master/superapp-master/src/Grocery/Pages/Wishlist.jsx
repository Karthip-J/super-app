import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from '../SubPages/Header';
import Delete from '../Images/delete.svg';
import Footer from '../SubPages/Footer';
import { FaTrash } from 'react-icons/fa';

function WishList() {

  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔁 Fetch wishlist from backend on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_WISHLIST), { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('Wishlist data received:', data);
          
          // Map backend fields to frontend fields for price
          const formatted = data.map(item => {
            const grocery = item.grocery || {};
            return {
              ...item,
              name: grocery.name || 'Unknown Product',
              category: grocery.category || 'Unknown Category',
              image: grocery.image
                ? grocery.image.startsWith('http')
                  ? grocery.image
                  : API_CONFIG.getUploadUrl(grocery.image)
                : '/placeholder-image.png',
              discountedPrice: parseFloat(grocery.discounted_price || 0),
              originalPrice: parseFloat(grocery.original_price || 0),
            };
          });
          setWishlistItems(formatted);
          console.log('Formatted wishlist items:', formatted);
        } else {
          console.error('Failed to load wishlist:', res.status);
          setWishlistItems([]);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCartItems = async () => {
      try {
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_CART), {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
          }
        });
        if (response.ok) {
          const responseData = await response.json();
          const cartData = responseData.data || [];
          setCartItems(cartData);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Failed to fetch cart:', err);
        setCartItems([]);
      }
    };

    fetchWishlist();
    fetchCartItems();
  }, []);

  // 🔁 DELETE a single item both backend + state
  const handleRemove = async (rowId) => {
    try {
      const res = await fetch(API_CONFIG.getUrl(`/api/gwishlist/${rowId}`), {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
        }
      });
      if (res.ok) {
        setWishlistItems(prev => prev.filter(i => i._id !== rowId));
        console.log('Item removed from wishlist:', rowId);
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Could not delete item');
    }
  };

  // 🔁 CLEAR entire wishlist (loop through current IDs)
  
  const handleClearWishlist = async () => {
    try {
      await Promise.all(
        wishlistItems.map(i =>
          fetch(API_CONFIG.getUrl(`/api/gwishlist/${i._id}`), {
            method: 'DELETE',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
            }
          })
        )
      );
      setWishlistItems([]);
      alert('Your wishlist has been cleared!');
      console.log('Wishlist cleared successfully');
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      alert('Failed to clear wishlist');
    }
  };

  // 🔁 keep "inCart" flag up‑to‑date
  useEffect(() => {
    setWishlistItems(prev =>
      prev.map(w => ({
        ...w,
        inCart: cartItems.some(c => c.grocery_id === w.grocery_id),
        quantity: w.quantity || 1
      }))
    );
  }, [cartItems]);



  // Update handleAddToCart to use backend:
  const handleAddToCart = async (item) => {
    try {
      const cartPayload = {
        grocery_id: item.grocery_id,
        quantity: item.quantity || 1
      };
      const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_CART), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
        },
        body: JSON.stringify(cartPayload)
      });
      if (response.ok) {
        await fetchCartItems();
        alert('Item added to cart!');
        console.log('Item added to cart:', item.name);
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Could not add to cart: ' + err.message);
    }
  };

  return (
    <div className="bg-[#F8F8F8] min-h-screen">
      <Header />
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
            Loading wishlist...
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh] text-center text-[#484848] text-lg">
            Your wishlist is empty
          </div>
        ) : (
          wishlistItems.map((item) => (
            <div
              key={`${item._id}-${item.grocery_id}`}
              className="bg-white border border-[#E1E1E1] rounded-[20px] mt-4 flex row gap-4 p-4"
            >
              <div className="w-[200px] h-[180px]">
                <img src={item.image} alt="product" className="w-full h-full p-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center w-full">
                  <p className="font-medium text-base text-[#484848]">{item.category}</p>
                  <p className="text-[#5C3FFF] font-medium text-base">
                    {item.originalPrice > item.discountedPrice ? 
                      `${Math.round(((item.originalPrice - item.discountedPrice) / item.originalPrice) * 100)}% OFF` : 
                      'No Discount'
                    }
                  </p>
                </div>
                <div className="font-semibold text-base text-[#242424] pt-2">{item.name}</div>
                <p className="font-medium text-sm text-[#484848] mb-2">
                  <span className="mr-2">Quantity:</span>
                  <div className="flex items-center border rounded px-1 py-0.5 bg-white inline-flex">
                    <button
                      type="button"
                      className="px-2 text-lg font-bold text-gray-700 disabled:text-gray-300"
                      onClick={() => setWishlistItems(prev => prev.map(w => w.id === item.id ? { ...w, quantity: Math.max(1, (w.quantity || 1) - 1) } : w))}
                      disabled={(item.quantity || 1) <= 1}
                    >-</button>
                    <span className="mx-2 w-5 text-center select-none">{item.quantity || 1}</span>
                    <button
                      type="button"
                      className="px-2 text-lg font-bold text-gray-700 disabled:text-gray-300"
                      onClick={() => setWishlistItems(prev => prev.map(w => w.id === item.id ? { ...w, quantity: Math.min(5, (w.quantity || 1) + 1) } : w))}
                      disabled={(item.quantity || 1) >= 5}
                    >+</button>
                  </div>
                </p>
                <p className="font-medium text-sm text-[#242424] mb-2">
                  ₹ {parseFloat(item.discountedPrice)} <span className="line-through text-[#C1C1C1]">₹ {parseFloat(item.originalPrice)}</span>
                </p>
                <div className="flex justify-between items-center w-full">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.inCart || cartItems.some(c => c.grocery_id === item.grocery_id)}
                    className={`w-20 py-0.5 px-1 rounded-md text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                      item.inCart || cartItems.some(c => c.grocery_id === item.grocery_id)
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-[#00BB1C] text-white hover:bg-[#009B16]'
                    }`}
                  >
                    {item.inCart || cartItems.some(c => c.grocery_id === item.grocery_id) ? 'Added' : 'Add to Cart'}
                  </button>
                  <button
                    className="p-1 rounded-full text-purple-600 hover:bg-purple-100 transition-colors"
                    onClick={() => handleRemove(item._id)}
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