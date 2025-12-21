import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../SubPages/Header';
import AddressService from "../../services/addressService";

import Delete from '../Images/delete.svg';
import Footer from '../SubPages/Footer';
import { FaTrash } from 'react-icons/fa';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const navigate = useNavigate();

  // Helper to check auth and redirect
  const handleAuthError = (err) => {
    if (err.message === 'Unauthorized' || err.status === 401) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return true;
    }
    return false;
  };

  // Fetch cart items from backend on mount
  useEffect(() => {
    const fetchCartItems = async () => {
      setLoading(true);
      setError(null);
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

          // Map backend fields to frontend expectations
          const formatted = cartData.map(item => {
            // Get grocery data from populated field
            const grocery = item.grocery || {};

            return {
              ...item,
              // Use grocery data for display fields
              name: grocery.name || 'Unknown Product',
              category: grocery.category || 'Unknown Category',
              image: grocery.image
                ? grocery.image.startsWith('http')
                  ? grocery.image
                  : API_CONFIG.getUploadUrl(grocery.image)
                : '/placeholder-image.png',
              originalPrice: parseFloat(grocery.original_price || 0),
              discountedPrice: parseFloat(grocery.discounted_price || 0),
              size: 'N/A' // Grocery items don't have sizes
            };
          });

          setCartItems(formatted);
          console.log('Cart items loaded from database:', formatted);
        } else {
          setCartItems([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading cart from database:', err);
        setCartItems([]);
        setLoading(false);
      }
    };

    // Load addresses from AddressService
    const loadAddresses = async () => {
      try {
        const fetchedAddresses = await AddressService.getUserAddresses();
        setAddresses(fetchedAddresses);
        // Set the first address as default if available
        if (fetchedAddresses.length > 0) {
          setSelectedAddress(fetchedAddresses[0]);
        }
      } catch (err) {
        console.error('Error loading addresses:', err);
        setAddresses([]);
      }
    };

    fetchCartItems();
    loadAddresses();
  }, []);

  // Delete item from cart (backend)
  const handleDelete = async (cartItemId) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`/api/gcart/${cartItemId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
        }
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));
        console.log('Item deleted from cart:', cartItemId);
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (err) {
      console.error('Error deleting item from cart:', err);
      alert('Could not delete item: ' + err.message);
    }
  };

  // Update quantity in cart (backend)
  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      const response = await fetch(API_CONFIG.getUrl(`/api/gcart/${itemId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        setCartItems(prev => prev.map(item =>
          item._id === itemId
            ? { ...item, quantity: newQuantity }
            : item
        ));
        console.log('Quantity updated for item:', itemId, 'New quantity:', newQuantity);
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Could not update quantity: ' + err.message);
    }
  };

  // Clear cart (backend)
  const handleClearCart = async () => {
    try {
      const response = await fetch(API_CONFIG.getUrl('/api/gcart/clear'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token' // Demo token for bypassing auth
        }
      });

      if (response.ok) {
        setCartItems([]);
        alert('Your cart has been cleared!');
        console.log('Cart cleared successfully');
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      alert('Could not clear cart: ' + err.message);
    }
  };

  // Proceed to buy (navigate to payment)
  const handleProceedToBuy = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Please add items before proceeding.');
      return;
    }

    if (!selectedAddress) {
      alert('Please select a delivery address before proceeding.');
      return;
    }

    // Pass the selected address to the payment page
    navigate('/home-grocery/payment', { state: { selectedAddress } });
  };

  // Format address for display (short version for dropdown)
  const formatAddress = (address) => {
    return AddressService.formatAddress(address);
  };

  // Format full address with all details for display
  const formatFullAddress = (address) => {
    return AddressService.formatFullAddress(address);
  };

  return (
    <div className="bg-[#F8F8F8] min-h-screen">
      <Header />
      <div className="px-4 pt-24 pb-40">
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium text-base">My Carts</div>
          <button
            onClick={handleClearCart}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-sm"
          >
            Clear Cart
          </button></div>

        {/* Address Selection */}
        {addresses.length > 0 ? (
          <div className="bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4">
            <h3 className="font-medium text-base mb-2">Select Delivery Address</h3>
            <select
              value={selectedAddress ? addresses.findIndex(addr =>
                JSON.stringify(addr) === JSON.stringify(selectedAddress)
              ) : ''}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                if (index >= 0 && index < addresses.length) {
                  setSelectedAddress(addresses[index]);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3FFF]"
            >
              {addresses.map((address, index) => (
                <option key={index} value={index}>
                  {address.fullName || 'Unnamed'} - {formatAddress(address)} ({address.selectedAddressType || 'Home'})
                </option>
              ))}
            </select>

            {/* Selected Address Details */}
            {selectedAddress && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  Selected Delivery Address:
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {formatFullAddress(selectedAddress)}
                </div>
                {selectedAddress.selectedAddressType && (
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-[#5C3FFF] text-white text-xs rounded-full">
                      {selectedAddress.selectedAddressType}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate('/home-grocery/edit-all-addresses')}
              className="mt-3 text-[#5C3FFF] text-sm underline hover:text-[#4A2FCC]"
            >
              Manage Addresses
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4">
            <div className="text-center py-4">
              <div className="text-gray-600 mb-4">No delivery addresses found</div>
              <button
                onClick={() => navigate('/home-grocery/address')}
                className="px-4 py-2 bg-[#5C3FFF] text-white rounded-full hover:bg-[#4A2FCC] transition-colors"
              >
                Add New Address
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[50vh] text-center text-[#484848] text-lg">Loading cart...</div>
        ) : error ? (
          <div className="flex items-center justify-center h-[50vh] text-center text-red-500 text-lg">{error}</div>
        ) : cartItems.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh] text-center text-[#484848] text-lg">Your cart is empty</div>
        ) : (
          cartItems.slice().reverse().map((item) => (
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
                <p className="font-medium text-sm text-[#242424] mb-2">
                  ₹ {parseFloat(item.discountedPrice) * item.quantity} <span className="line-through text-[#C1C1C1]">₹ {parseFloat(item.originalPrice) * item.quantity}</span>
                </p>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center border rounded px-1 py-0.5 bg-white">
                    <button
                      type="button"
                      className="px-2 text-lg font-bold text-gray-700 disabled:text-gray-300"
                      onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >-</button>
                    <span className="mx-2 w-5 text-center select-none">{item.quantity}</span>
                    <button
                      type="button"
                      className="px-2 text-lg font-bold text-gray-700 disabled:text-gray-300"
                      onClick={() => handleQuantityChange(item._id, Math.min(10, item.quantity + 1))}
                      disabled={item.quantity >= 10}
                    >+</button>
                  </div>
                  <button
                    className="p-1 rounded-full text-purple-600 hover:bg-purple-100 transition-colors"
                    onClick={() => handleDelete(item._id)}
                    aria-label="Delete item"
                  >
                    <FaTrash className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="fixed bottom-24 left-0 w-full px-4 py-4">
        <button
          onClick={handleProceedToBuy}
          className={`w-full px-4 py-2 rounded-[50px] text-white ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5C3FFF]'
            }`}
          disabled={cartItems.length === 0}
        >
          Proceed to Buy
        </button>
      </div>
      <Footer />
    </div>
  );
}

export default Cart;