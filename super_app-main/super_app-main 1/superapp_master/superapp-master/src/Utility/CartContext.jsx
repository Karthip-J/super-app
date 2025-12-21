import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  fetchWishlist,
  addToWishlist as apiAddToWishlist,
  removeWishlistItem as apiRemoveWishlistItem
} from '../services/cartWishlistService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load function - moved outside useEffect so it can be called by refreshCart
  const load = async () => {
    setLoading(true);
    // Only fetch if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      setCart(null);
      setWishlist([]);
      setLoading(false);
      return;
    }
    try {
      console.log('🔄 CartContext: Loading cart and wishlist...');
      
      const cartRes = await fetchCart();
      if (cartRes.success) {
        setCart(cartRes.data);
        console.log('✅ CartContext: Cart loaded successfully');
      } else {
        console.log('ℹ️ CartContext: No cart data or error:', cartRes.message);
        setCart(null);
      }
      
      const wishlistRes = await fetchWishlist();
      if (wishlistRes.success) {
        setWishlist(wishlistRes.data);
        console.log('✅ CartContext: Wishlist loaded successfully');
      } else {
        console.log('ℹ️ CartContext: No wishlist data or error:', wishlistRes.message);
        setWishlist([]);
      }
    } catch (e) {
      console.error('❌ CartContext: Error loading data:', e);
      setCart(null);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart and wishlist on mount
  useEffect(() => {
    // Load with delay to prevent conflicts
    const timer = setTimeout(load, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Cart actions with real API calls
  const addToCart = async (product_id, quantity = 1) => {
    try {
      console.log('➕ CartContext: Adding to cart:', product_id, 'quantity:', quantity);
      const productData = { productId: product_id, quantity: quantity };
      const res = await apiAddToCart(productData);
      if (res.success) {
        setCart(res.data);
        console.log('✅ CartContext: Added to cart successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ CartContext: Add to cart failed:', error);
      return { success: false, message: error.message };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      console.log('🔄 CartContext: Updating cart item:', itemId);
      const res = await apiUpdateCartItem(itemId, quantity);
      if (res.success) {
        setCart(res.data);
        console.log('✅ CartContext: Cart item updated successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ CartContext: Update cart item failed:', error);
      return { success: false, message: error.message };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      console.log('🗑️ CartContext: Removing from cart:', itemId);
      const res = await apiRemoveCartItem(itemId);
      if (res.success) {
        setCart(res.data);
        console.log('✅ CartContext: Item removed from cart successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ CartContext: Remove from cart failed:', error);
      return { success: false, message: error.message };
    }
  };

  // Wishlist actions with real API calls
  const addToWishlist = async (product_id, quantity = 1) => {
    try {
      console.log('💖 CartContext: Adding to wishlist:', product_id);
      const res = await apiAddToWishlist(product_id, quantity);
      if (res.success) {
        setWishlist((prev) => [...prev, res.data]);
        console.log('✅ CartContext: Added to wishlist successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ CartContext: Add to wishlist failed:', error);
      return { success: false, message: error.message };
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      console.log('💔 CartContext: Removing from wishlist:', itemId);
      const res = await apiRemoveWishlistItem(itemId);
      if (res.success) {
        setWishlist((prev) => prev.filter(item => item.id !== itemId));
        console.log('✅ CartContext: Item removed from wishlist successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ CartContext: Remove from wishlist failed:', error);
      return { success: false, message: error.message };
    }
  };

  // Refresh cart data from server
  const refreshCart = async () => {
    try {
      console.log('🔄 CartContext: Refreshing cart data...');
      await load();
      console.log('✅ CartContext: Cart data refreshed successfully');
    } catch (error) {
      console.error('❌ CartContext: Failed to refresh cart data:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        loading,
        addToCart,
        updateCartItem,
        removeFromCart,
        addToWishlist,
        removeFromWishlist,
        refreshCart,
        setCart,
        setWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
