import React, { createContext, useContext, useState, useEffect } from 'react';
import { foodCartService } from '../services/foodDeliveryService';

const FoodCartContext = createContext();

export const FoodCartProvider = ({ children }) => {
  const [foodCart, setFoodCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch food cart on mount
  useEffect(() => {
    const loadFoodCart = async () => {
      setLoading(true);
      try {
        console.log('🔄 FoodCartContext: Loading food cart...');
        
        const cartRes = await foodCartService.getFoodCart();
        if (cartRes.success) {
          setFoodCart(cartRes.data);
          console.log('✅ FoodCartContext: Food cart loaded successfully');
        } else {
          console.log('ℹ️ FoodCartContext: No food cart data or error:', cartRes.message);
          setFoodCart(null);
        }
      } catch (e) {
        console.error('❌ FoodCartContext: Error loading food cart:', e);
        setFoodCart(null);
      } finally {
        setLoading(false);
      }
    };

    // Load with delay to prevent conflicts
    const timer = setTimeout(loadFoodCart, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Food cart actions with real API calls
  const addToFoodCart = async (dishId, quantity = 1) => {
    try {
      console.log('➕ FoodCartContext: Adding to food cart:', dishId);
      const res = await foodCartService.addToFoodCart({ dish_id: dishId, quantity });
      if (res.success) {
        setFoodCart(res.data);
        console.log('✅ FoodCartContext: Added to food cart successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ FoodCartContext: Add to food cart failed:', error);
      return { success: false, message: error.message };
    }
  };

  const updateFoodCartItem = async (itemId, quantity) => {
    try {
      console.log('🔄 FoodCartContext: Updating food cart item:', itemId);
      const res = await foodCartService.updateFoodCartItem(itemId, quantity);
      if (res.success) {
        setFoodCart(res.data);
        console.log('✅ FoodCartContext: Food cart item updated successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ FoodCartContext: Update food cart item failed:', error);
      return { success: false, message: error.message };
    }
  };

  const removeFromFoodCart = async (itemId) => {
    try {
      console.log('🗑️ FoodCartContext: Removing from food cart:', itemId);
      const res = await foodCartService.removeFoodCartItem(itemId);
      if (res.success) {
        setFoodCart(res.data);
        console.log('✅ FoodCartContext: Item removed from food cart successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ FoodCartContext: Remove from food cart failed:', error);
      return { success: false, message: error.message };
    }
  };

  const clearFoodCart = async () => {
    try {
      console.log('🧹 FoodCartContext: Clearing food cart');
      const res = await foodCartService.clearFoodCart();
      if (res.success) {
        // Immediately fetch the latest cart from backend to ensure sync
        const cartRes = await foodCartService.getFoodCart();
        if (cartRes.success) {
          setFoodCart(cartRes.data);
        } else {
          setFoodCart(null);
        }
        console.log('✅ FoodCartContext: Food cart cleared and refreshed successfully');
      }
      return res;
    } catch (error) {
      console.error('❌ FoodCartContext: Clear food cart failed:', error);
      setFoodCart(null);
      return { success: false, message: error.message };
    }
  };

  // Calculate cart item count
  const cartItemCount = foodCart?.items?.length || 0;

  return (
    <FoodCartContext.Provider
      value={{
        foodCart,
        loading,
        cartItemCount,
        addToFoodCart,
        updateFoodCartItem,
        removeFromFoodCart,
        clearFoodCart,
        setFoodCart,
      }}
    >
      {children}
    </FoodCartContext.Provider>
  );
};

export const useFoodCart = () => {
  const context = useContext(FoodCartContext);
  if (context === undefined) {
    throw new Error('useFoodCart must be used within a FoodCartProvider');
  }
  return context;
}; 