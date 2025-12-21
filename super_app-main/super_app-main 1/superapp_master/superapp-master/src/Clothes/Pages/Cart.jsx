import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MyntraClothesHeader from '../Header/MyntraClothesHeader';
import Footer from '../../Utility/Footer';
import { FaTrash } from 'react-icons/fa';
import { useCart } from '../../Utility/CartContext'; // ✅ USE UNIFIED CART CONTEXT

const CLOTHES_ADDRESS_KEY = 'clothesUserAddresses';

function Cart() {
  // ✅ REPLACE: Remove local cart state, use global CartContext
  const { cart, loading, removeFromCart, updateCartItem } = useCart();
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const navigate = useNavigate();

  // ✅ TRANSFORM: Convert cart data to display format
  const cartItems = cart?.items?.map(item => {
    const product = item.product_id || item.product || {};

    // Handle product image
    let productImage = '/placeholder-image.png';

    if (product?.photo) {
      const photo = product.photo;
      if (photo.startsWith('http')) {
        productImage = photo;
      } else {
        productImage = API_CONFIG.getUrl(photo.startsWith('/') ? photo : `/${photo}`);
      }
    } else if (product?.featured_image) {
      const featuredImage = product.featured_image;
      if (featuredImage.startsWith('http')) {
        productImage = featuredImage;
      } else {
        productImage = API_CONFIG.getUrl(featuredImage.startsWith('/') ? featuredImage : `/${featuredImage}`);
      }
    }

    return {
      id: item.id || item._id,
      product_id: item.product_id,
      name: product?.name || 'Product',
      image: productImage,
      category: product?.category_id?.name || product?.category?.name || 'Category',
      originalPrice: parseFloat(product?.price || 0),
      discountedPrice: parseFloat(product?.sale_price || product?.price || 0),
      quantity: item.quantity,
      size: item.variation?.attributes?.size || 'N/A',
      price: parseFloat(item.price || 0),
      total_price: parseFloat(item.total_price || 0)
    };
  }) || [];

  // ✅ UNIFIED: Delete function using CartContext
  const handleDeleteItem = async (itemId) => {
    console.log('🗑️ Deleting item:', itemId);
    try {
      const result = await removeFromCart(itemId);
      if (result.success) {
        console.log('✅ Item deleted successfully');
      } else {
        console.error('❌ Delete failed:', result.message);
        setError('Failed to delete item');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      setError('Failed to delete item');
    }
  };

  // ✅ UNIFIED: Update quantity function using CartContext
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleDeleteItem(itemId);
      return;
    }

    console.log('🔄 Updating quantity:', itemId, newQuantity);
    try {
      const result = await updateCartItem(itemId, newQuantity);
      if (result.success) {
        console.log('✅ Quantity updated successfully');
      } else {
        console.error('❌ Update failed:', result.message);
        setError('Failed to update quantity');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      setError('Failed to update quantity');
    }
  };

  // Calculate totals - FIX: Calculate manually instead of relying on backend total_price
  const subtotal = cartItems.reduce((sum, item) => {
    const itemTotal = item.quantity * item.discountedPrice;
    console.log(`💰 Item: ${item.name}, Qty: ${item.quantity}, Price: ${item.discountedPrice}, Total: ${itemTotal}`);
    return sum + itemTotal;
  }, 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  console.log(`💰 Cart Summary - Subtotal: ₹${subtotal}, Total: ₹${total}`);

  // Load addresses from localStorage
  useEffect(() => {
    const loadAddresses = () => {
      try {
        const storedAddresses = JSON.parse(localStorage.getItem(CLOTHES_ADDRESS_KEY)) || [];
        setAddresses(storedAddresses);
        // Set the first address as default if available
        if (storedAddresses.length > 0) {
          setSelectedAddress(prev => {
            // Only set if no address is currently selected
            if (!prev) {
              return storedAddresses[0];
            }
            // If selected address exists, try to find it in the new list
            const found = storedAddresses.find(addr =>
              JSON.stringify(addr) === JSON.stringify(prev)
            );
            return found || storedAddresses[0];
          });
        } else {
          setSelectedAddress(null);
        }
      } catch (err) {
        console.error('Error loading addresses:', err);
        setAddresses([]);
        setSelectedAddress(null);
      }
    };

    loadAddresses();
    // Reload addresses when window regains focus (in case addresses were updated in another tab/page)
    window.addEventListener('focus', loadAddresses);
    return () => {
      window.removeEventListener('focus', loadAddresses);
    };
  }, []);

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    const parts = [];
    if (address.houseNo) parts.push(address.houseNo);
    if (address.addressLine2) parts.push(address.addressLine2);
    if (address.roadName) parts.push(address.roadName);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    return parts.join(', ');
  };

  const handleProceedToPay = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Please add items before proceeding.');
      return;
    }

    if (!selectedAddress) {
      alert('Please select a delivery address before proceeding.');
      return;
    }

    // Pass the selected address to the payment page
    navigate('/home-clothes/payment', { state: { selectedAddress } });
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <MyntraClothesHeader />
        <div className="pt-24 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <MyntraClothesHeader />
      <div className="pt-24 px-4 pb-20 max-w-[1248px] mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold">My Cart</h1>
          {cartItems.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
              {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Address Selection */}
        {cartItems.length > 0 && addresses.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
            <h3 className="font-medium text-base mb-3 text-gray-800">Select Delivery Address</h3>
            <select
              value={(() => {
                if (!selectedAddress) return 0;
                const index = addresses.findIndex(addr =>
                  JSON.stringify(addr) === JSON.stringify(selectedAddress)
                );
                return index >= 0 ? index : 0;
              })()}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                if (index >= 0 && index < addresses.length) {
                  setSelectedAddress(addresses[index]);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {addresses.map((address, index) => (
                <option key={index} value={index}>
                  {formatAddress(address)} {address.selectedAddressType ? `(${address.selectedAddressType})` : ''}
                </option>
              ))}
            </select>
            {selectedAddress && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Selected Address:</p>
                <p className="text-sm text-gray-600">{formatAddress(selectedAddress)}</p>
                {selectedAddress.selectedAddressType && (
                  <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {selectedAddress.selectedAddressType}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={() => navigate('/home-clothes/all-addresses')}
              className="mt-3 text-blue-600 text-sm underline hover:text-blue-800"
            >
              Manage Addresses
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add items from any category!</p>
            <button
              onClick={() => navigate('/home-clothes')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm">{item.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-green-600 font-semibold">
                        ₹{item.discountedPrice}
                      </span>
                      {item.originalPrice > item.discountedPrice && (
                        <span className="text-gray-500 line-through text-sm">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border rounded-full"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border rounded-full"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            {/* Cart Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleProceedToPay}
                className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!selectedAddress && addresses.length > 0}
              >
                Proceed to Pay
              </button>
              {addresses.length === 0 && (
                <button
                  onClick={() => navigate('/home-clothes/all-addresses')}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mt-2 hover:bg-gray-300 text-sm"
                >
                  Add Delivery Address
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Cart;