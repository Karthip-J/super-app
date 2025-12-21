import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, MapPin, Clock, Star } from 'lucide-react';
import HeaderF from '../ComponentsF/HeaderF';
import FooterFood from '../ComponentsF/FooterFood';

// Import our food delivery service
import { 
  foodCartService, 
  formatImageUrl, 
  formatCurrency, 
  formatTime 
} from '../../services/foodDeliveryService';

import { useFoodCart } from '../../Utility/FoodCartContext';

// Cart Item Component
const CartItem = ({ item, onUpdateQuantity, onRemoveItem, updating }) => {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }

    setIsUpdating(true);
    setLocalQuantity(newQuantity);
    
    try {
      await onUpdateQuantity(item._id, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      setLocalQuantity(item.quantity); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemoveItem(item._id);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const dishPrice = item.dish_id?.price || 0;
  const itemTotal = dishPrice * localQuantity;

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 ${isUpdating ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Image with CSS fallback */}
        <div className="w-20 h-20 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
          {item.dish_id?.image ? (
            <img
              src={formatImageUrl(item.dish_id.image)}
              alt={item.dish_id.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
            {item.dish_id?.name?.charAt(0) || 'D'}
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-800 truncate">{item.dish_id?.name}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <span className={`px-2 py-1 rounded text-xs mr-2 ${item.dish_id?.is_veg ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {item.dish_id?.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}
                </span>
                {item.dish_id?.rating && (
                  <div className="flex items-center text-yellow-500">
                    <Star size={12} className="fill-yellow-400 mr-1" />
                    <span className="text-xs">{item.dish_id.rating}</span>
                  </div>
                )}
              </div>
              {item.dish_id?.preparation_time && (
                <div className="flex items-center text-gray-500 text-xs mt-1">
                  <Clock size={12} className="mr-1" />
                  {formatTime(item.dish_id.preparation_time)}
                </div>
              )}
            </div>
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
              title="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Special Instructions */}
          {item.special_instructions && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Note:</span> {item.special_instructions}
            </div>
          )}

          {/* Customizations */}
          {item.customizations && item.customizations.length > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Customizations:</span> {item.customizations.join(', ')}
            </div>
          )}

          {/* Price and Quantity Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-bold text-orange-600">{formatCurrency(dishPrice)}</span>
              <span className="text-gray-500 text-sm ml-1">each</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(localQuantity - 1)}
                  disabled={isUpdating || localQuantity <= 1}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-medium text-center min-w-[50px]">
                  {localQuantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(localQuantity + 1)}
                  disabled={isUpdating}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Item Total */}
          <div className="text-right mt-2">
            <span className="font-bold text-gray-800">{formatCurrency(itemTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bill Summary Component
const BillSummary = ({ cartData, onProceedToPayment, isProcessing }) => {
  const subtotal = cartData.subtotal || 0;
  const deliveryFee = cartData.delivery_fee || 0;
  const taxes = cartData.taxes || 0;
  const total = cartData.total_amount || (subtotal + deliveryFee + taxes);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 sticky top-4">
      <h3 className="font-semibold text-gray-800 mb-4">Bill Summary</h3>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({cartData.total_items || 0} items)</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
            {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
          </span>
        </div>
        
        {taxes > 0 && (
          <div className="flex justify-between text-sm">
            <span>Taxes & Charges</span>
            <span>{formatCurrency(taxes)}</span>
          </div>
        )}
        
        <hr className="my-3" />
        
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-orange-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Restaurant Info */}
      {cartData.restaurant && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={14} className="mr-1" />
            <span className="font-medium">{cartData.restaurant.name}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {cartData.restaurant.address}
          </div>
          {/* Minimum order validation removed - any order value is allowed */}
        </div>
      )}

      <button
        onClick={onProceedToPayment}
        disabled={isProcessing || cartData.total_items === 0}
        className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing...' : `Proceed to Payment • ${formatCurrency(total)}`}
      </button>

      <p className="text-xs text-gray-500 text-center mt-2">
        You will be able to review the order before payment
      </p>
    </div>
  );
};

function CartFood() {
  const navigate = useNavigate();
  const { foodCart, loading, updateFoodCartItem, removeFromFoodCart } = useFoodCart();
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Use foodCart from context instead of local state
  const cartData = foodCart || {
    items: [],
    total_items: 0,
    total_amount: 0,
    subtotal: 0,
    delivery_fee: 0,
    taxes: 0,
    restaurant: null
  };

  // Fetch cart data on component mount
  useEffect(() => {
    // fetchCartData(); // This function is no longer needed as foodCart is managed by context
  }, []);

  // const fetchCartData = async () => { // This function is no longer needed
  //   try {
  //     setLoading(true);
  //     console.log('🛒 Fetching food cart data...');

  //     const response = await foodCartService.getFoodCart();
      
  //     if (response.success) {
  //       setCartData(response.data);
  //       console.log('✅ Cart data loaded:', response.data);
  //     } else {
  //       console.error('❌ Failed to load cart:', response.message);
  //       setError(response.message);
  //     }
  //   } catch (err) {
  //     console.error('❌ Error fetching cart:', err);
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUpdateQuantity = async (itemId, quantity) => {
    try {
      setUpdating(true);
      console.log('🔄 Updating cart item quantity:', { itemId, quantity });

      const response = await updateFoodCartItem(itemId, quantity);
      
      if (response.success) {
        console.log('✅ Cart item updated successfully');
      } else {
        console.error('❌ Failed to update cart item:', response.message);
        setError(response.message);
      }
    } catch (err) {
      console.error('❌ Error updating cart item:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating(true);
      console.log('🗑️ Removing cart item:', itemId);

      const response = await removeFromFoodCart(itemId);
      
      if (response.success) {
        console.log('✅ Cart item removed successfully');
      } else {
        console.error('❌ Failed to remove cart item:', response.message);
        setError(response.message);
      }
    } catch (err) {
      console.error('❌ Error removing cart item:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      setUpdating(true);
      console.log('🧹 Clearing cart...');

      const response = await foodCartService.clearFoodCart();
      
      if (response.success) {
        // setCartData(response.data); // This line is no longer needed
        console.log('✅ Cart cleared successfully');
      } else {
        console.error('❌ Failed to clear cart:', response.message);
        setError(response.message);
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleProceedToPayment = () => {
    if (cartData.total_items === 0) {
      alert('Your cart is empty! Please add items before proceeding.');
      return;
    }
    navigate('/checkout/payment', { 
      state: { 
        cartData,
        orderType: 'food_delivery'
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderF />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
        <FooterFood />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HeaderF />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading cart: {error}</p>
            <button 
              // onClick={fetchCartData} // This function is no longer needed
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
            >
              Try Again
            </button>
          </div>
        </div>
        <FooterFood />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderF />
      
      <div className="pt-16 pb-20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <ShoppingCart className="mr-3 text-orange-500" />
                Your Cart
              </h1>
            </div>
            
            {cartData.items.length > 0 && (
              <button
                onClick={handleClearCart}
                disabled={updating}
                className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Empty Cart State */}
          {cartData.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet</p>
                <button
                  onClick={() => navigate('/home-food')}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Browse Restaurants
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <h2 className="font-semibold text-gray-800 mb-4">
                    Items in Cart ({cartData.total_items})
                  </h2>
                </div>

                {cartData.items.map((item) => (
                  <CartItem
                    key={item._id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    updating={updating}
                  />
                ))}

                {/* Continue Shopping */}
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <button
                    onClick={() => navigate('/home-food')}
                    className="text-orange-600 hover:text-orange-700 font-medium flex items-center"
                  >
                    ← Continue Shopping
                  </button>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="lg:col-span-1">
                <BillSummary
                  cartData={cartData}
                  onProceedToPayment={handleProceedToPayment}
                  isProcessing={updating}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <FooterFood />
    </div>
  );
}

export default CartFood;