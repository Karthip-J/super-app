import API_CONFIG from '../config/api.config.js';



const getHeaders = () => {
  // Fix: Only check 'token' since that's what OTP.jsx sets
  const token = localStorage.getItem('token');
  console.log('🔐 Using token from localStorage:', token);
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// --- CART ---
export const fetchCart = async () => {
  console.log('🛒 Fetching cart with headers:', getHeaders());
  const res = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.CART), { 
    headers: getHeaders(), 
    credentials: 'include' 
  });
  const result = await res.json();
  console.log('📦 Cart fetch result:', result);
  return result;
};

export const addToCart = async (productData) => {
  try {
    const payload = {
      product_id: productData.productId || productData.id || productData._id,
      quantity: productData.quantity || 1
    };
    
    console.log('➕ Adding to cart:', payload);
    
    const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.CART_ITEMS), {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('✅ Add to cart response:', result);
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add to cart');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  console.log('🔄 Updating cart item:', itemId, 'quantity:', quantity);
  const res = await fetch(API_CONFIG.getUrl(`/api/cart/items/${itemId}`), {
    method: 'PUT',
    headers: getHeaders(),
    credentials: 'include',
    body: JSON.stringify({ quantity })
  });
  const result = await res.json();
  console.log('✏️ Update cart result:', result);
  return result;
};

export const removeCartItem = async (itemId) => {
  console.log('🗑️ Removing cart item:', itemId);
  const res = await fetch(API_CONFIG.getUrl(`/api/cart/items/${itemId}`), {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });
  const result = await res.json();
  console.log('🚮 Remove cart result:', result);
  return result;
};

export const clearCart = async () => {
  console.log('🧹 Clearing entire cart');
  const res = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.CART), {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });
  const result = await res.json();
  console.log('🗑️ Clear cart result:', result);
  return result;
};

// --- WISHLIST ---
export const fetchWishlist = async () => {
  const res = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.WISHLIST), { 
    headers: getHeaders(), 
    credentials: 'include' 
  });
  return res.json();
};

export const addToWishlist = async (productData) => {
  try {
    const payload = {
      product_id: productData.productId || productData.id || productData._id,
      quantity: productData.quantity || 1
    };
    
    const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.WISHLIST), {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add to wishlist');
    }
    
    return result;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (itemId) => {
  const res = await fetch(API_CONFIG.getUrl(`/api/wishlist/items/${itemId}`), {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include'
  });
  return res.json();
};

// Alias for compatibility
export const removeWishlistItem = removeFromWishlist; 