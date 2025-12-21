import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import FooterFood from '../ComponentsF/FooterFood';
import { foodOrderService } from '../../services/foodDeliveryService';
import { useFoodCart } from '../../Utility/FoodCartContext';
import paymentService from '../../services/paymentService';

// Import payment method icons
import step3 from "../../Clothes/Images/step3.svg";
import phonepay from "../../Clothes/Images/phonepay.svg";
import paytm from "../../Clothes/Images/paytm.svg";
import amazon from "../../Clothes/Images/amazonpay.svg";
import mobikwik from "../../Clothes/Images/mobikwik.svg";
import restricted from "../../Clothes/Images/mobikrestricted.svg";
import credit from "../../Clothes/Images/creditdebit.svg";
import hdfc from "../../Clothes/Images/hdfc.svg";
import icici from "../../Clothes/Images/icici.svg";
import sbi from "../../Clothes/Images/sbi.svg";
import axis from "../../Clothes/Images/axis.svg";
import kotak from "../../Clothes/Images/kotak.svg";
import cod from "../../Clothes/Images/COD.svg";

function PaymentFood() {
    const location = useLocation();
    const navigate = useNavigate();
    const { foodCart, loading, refreshFoodCart, clearFoodCart } = useFoodCart();
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPlaceOrderView, setShowPlaceOrderView] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    
    // Get cart data from FoodCartContext instead of location state
    const cartData = foodCart || { items: [], total_amount: 0, restaurant: null };
    
    // Format cart data for payment component
    const cartItems = cartData?.items || [];
    const subtotal = cartData?.total_amount || 0;
    const deliveryFee = 0; // Free delivery for now
    const total = subtotal + deliveryFee;
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Get restaurant info from cart data
    const restaurant = cartData?.restaurant || cartItems[0]?.restaurant_id || null;

    // Show loading if cart is still loading
    if (loading) {
        return (
            <div className='bg-gray-50 min-h-screen pb-20'>
                <div className="pt-16 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading payment details...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show error if no cart data
    if (!cartData || cartData.items.length === 0) {
        return (
            <div className='bg-gray-50 min-h-screen pb-20'>
                <div className="pt-16 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-red-600 mb-4">No items in cart</p>
                        <button 
                            onClick={() => navigate('/home-food/cart')}
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                        >
                            Go to Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const paymentMethods = [
        {
            id: 'wallet',
            name: 'Wallet',
            options: [
                { id: 'phonepay', name: 'PhonePe', icon: phonepay, available: true },
                { id: 'paytm', name: 'Paytm', icon: paytm, available: true },
                { id: 'amazon', name: 'Amazon Pay', icon: amazon, available: true },
                { id: 'mobikwik', name: 'Mobikwik', icon: mobikwik, available: false }
            ]
        },
        {
            id: 'cards',
            name: 'Cards',
            options: [
                { id: 'credit', name: 'Credit/Debit Card', icon: credit, available: true }
            ]
        },
        {
            id: 'netbanking',
            name: 'Net Banking',
            options: [
                { id: 'hdfc', name: 'HDFC Bank', icon: hdfc, available: true },
                { id: 'icici', name: 'ICICI Bank', icon: icici, available: true },
                { id: 'sbi', name: 'SBI Bank', icon: sbi, available: true },
                { id: 'axis', name: 'AXIS Bank', icon: axis, available: true },
                { id: 'kotak', name: 'Kotak Bank', icon: kotak, available: true }
            ]
        },
        {
            id: 'cod',
            name: 'Pay on Delivery',
            options: [
                { id: 'cash', name: 'Cash on Delivery', icon: cod, available: true }
            ]
        }
    ];

    const handlePaymentSelection = (paymentId) => {
        console.log('🎯 Payment option selected:', paymentId);
        setSelectedPayment(paymentId);
        setShowPlaceOrderView(true);
    };

    const processPayment = async () => {
        if (!selectedPayment) {
            console.error('❌ No payment method selected');
            return;
        }

        setIsProcessing(true);
        try {
            console.log('🔄 Processing food order payment...');
            
            // Get cart data from context
            const cartData = foodCart;
            console.log('🛒 Cart data:', cartData);
            
            if (!cartData || !cartData.items || cartData.items.length === 0) {
                console.error('❌ Cart is empty');
                return;
            }

            // Map payment method to backend enum
            const getPaymentMethod = (paymentId) => {
                switch (paymentId) {
                    case 'cash':
                        return 'cod'; // Cash on Delivery
                    case 'phonepay':
                        return 'razorpay'; // Use Razorpay for PhonePe
                    case 'paytm':
                        return 'razorpay'; // Use Razorpay for Paytm
                    case 'amazon':
                        return 'razorpay'; // Use Razorpay for Amazon Pay
                    case 'credit':
                        return 'razorpay'; // Use Razorpay for cards
                    case 'hdfc':
                    case 'icici':
                    case 'sbi':
                    case 'axis':
                    case 'kotak':
                        return 'razorpay'; // Use Razorpay for netbanking
                    default:
                        return 'cod'; // Default to COD
                }
            };

            const paymentMethod = getPaymentMethod(selectedPayment);
            console.log('🔍 Selected payment ID:', selectedPayment);
            console.log('🔍 Mapped payment method:', paymentMethod);
            
            if (paymentMethod === 'cod') {
                console.log('💵 Processing COD payment...');
                // Handle Cash on Delivery
                const orderData = {
                    restaurant_id: cartData.restaurant_id,
                    items: cartData.items.map(item => ({
                        dish_id: item.dish_id,
                        quantity: item.quantity,
                        price: item.price,
                        special_instructions: item.special_instructions || ''
                    })),
                    subtotal: cartData.subtotal,
                    delivery_fee: cartData.delivery_fee || 0,
                    total_amount: cartData.total_amount,
                    payment_method: 'cod',
                    delivery_address: {
                        address_line1: '123 Main Street',
                        city: 'Food City',
                        state: 'State',
                        country: 'India',
                        pincode: '123456',
                        phone: '+91 9876543210'
                    },
                    delivery_instructions: 'Please deliver at the main gate',
                    special_instructions: 'Handle with care'
                };

                console.log('📦 Creating COD food order:', orderData);
                const response = await foodOrderService.createFoodOrder(orderData);
                
                if (response.success) {
                    console.log('✅ COD order created successfully:', response.data);
                    await clearFoodCart();
                    setOrderPlaced(true);
                    
                    navigate('/order/success', {
                        state: {
                            orderNumber: response.data.order_number,
                            orderId: response.data._id,
                            totalAmount: response.data.total_amount,
                            itemCount: response.data.items?.length || 0,
                            estimatedDelivery: '30-40 min',
                            deliveryAddress: '123 Main Street, Food City',
                            customerName: 'John Doe',
                            customerContact: '+91 9876543210',
                            orderDate: new Date().toLocaleString(),
                            paymentStatus: 'Pending (COD)',
                            restaurantContact: restaurant?.contact || '+91 9123456789'
                        } 
                    });
                } else {
                    console.error('❌ COD order creation failed:', response.message);
                    // Handle error gracefully without alert
                }
            } else {
                console.log('💳 Processing online payment via Razorpay...');
                // Handle online payment via Razorpay
                const paymentData = {
                    amount: cartData.total_amount,
                    currency: 'INR',
                    order_model: 'FoodOrder',
                    email: 'test@example.com', // TODO: Get from user profile
                    contact: '+91 9876543210', // TODO: Get from user profile
                    order_data: {
                        restaurant_id: cartData.restaurant_id,
                        items: cartData.items.map(item => ({
                            dish_id: item.dish_id,
                            quantity: item.quantity,
                            price: item.price,
                            special_instructions: item.special_instructions || ''
                        })),
                        subtotal: cartData.subtotal,
                        delivery_fee: cartData.delivery_fee || 0,
                        total_amount: cartData.total_amount,
                        payment_method: 'razorpay',
                        delivery_address: {
                            address_line1: '123 Main Street',
                            city: 'Food City',
                            state: 'State',
                            country: 'India',
                            pincode: '123456',
                            phone: '+91 9876543210'
                        },
                        delivery_instructions: 'Please deliver at the main gate',
                        special_instructions: 'Handle with care'
                    }
                };

                console.log('💳 Processing online payment for food order:', paymentData);
                
                const result = await paymentService.processPayment(paymentData, {
                    onSuccess: async (successData) => {
                        console.log('✅ Payment successful! Clearing cart and navigating...');
                        await clearFoodCart();
                        setOrderPlaced(true);
                        
                        navigate('/order/success', {
                            state: {
                                orderNumber: successData.dbOrder.order_number,
                                orderId: successData.dbOrder._id,
                                totalAmount: successData.dbOrder.total_amount,
                                itemCount: successData.dbOrder.items?.length || 0,
                                estimatedDelivery: '30-40 min',
                                deliveryAddress: '123 Main Street, Food City',
                                customerName: 'John Doe',
                                customerContact: '+91 9876543210',
                                orderDate: new Date().toLocaleString(),
                                paymentStatus: 'Paid',
                                restaurantContact: restaurant?.contact || '+91 9123456789'
                            } 
                        });
                    },
                    onError: (error) => {
                        console.error('❌ Payment failed:', error);
                        // Handle error gracefully without alert
                    },
                    onCancel: () => {
                        console.log('❌ Payment cancelled by user');
                        // Handle cancellation gracefully
                    }
                });
                
                if (!result.success) {
                    console.error('❌ Online payment failed:', result.message);
                    // Handle error gracefully without alert
                }
            }
        } catch (error) {
            console.error('❌ Payment processing error:', error);
            // Handle error gracefully without alert
        } finally {
            setIsProcessing(false);
        }
    };

    const goBackToCart = () => {
        navigate('/home-food/cart');
    };

    const PaymentOption = ({ option }) => (
        <div 
            className={`flex justify-between items-center w-full py-4 px-4 rounded-lg transition-colors
                ${option.available ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
            `}
            onClick={() => option.available && handlePaymentSelection(option.id)}
        >
            <div className="flex items-center gap-4">
                <img src={option.icon} alt={option.name} className="h-6 w-6 object-contain" />
                <span className="text-gray-800 font-medium">{option.name}</span>
            </div>
            {option.available ? (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${selectedPayment === option.id ? 
                        'border-green-500 bg-green-500' : 
                        'border-gray-300'}
                `}>
                    {selectedPayment === option.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                </div>
            ) : (
                <img src={restricted} alt="Not available" className="h-4" />
            )}
        </div>
    );

    const PaymentSection = ({ method }) => (
        <div className='bg-white rounded-xl shadow-sm overflow-hidden mb-4'>
            <div className='px-5 py-4 border-b border-gray-100'>
                <h3 className='font-semibold text-gray-800'>{method.name}</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {method.options.map(option => (
                    <PaymentOption key={option.id} option={option} />
                ))}
            </div>
        </div>
    );

    const getPaymentMethodName = () => {
        for (const method of paymentMethods) {
            const option = method.options.find(opt => opt.id === selectedPayment);
            if (option) return option.name;
        }
        return '';
    };

    return (
        <div className='bg-gray-50 min-h-screen pb-20'>
            
            {/* Progress indicator */}
            <div className='bg-white shadow-sm py-4 sticky top-0 z-10 mt-16'>
                <div className='max-w-md mx-auto px-6'>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-full"></div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-2">Step 3 of 3: Payment</p>
                </div>
            </div>
            
            <div className='px-5 max-w-md mx-auto'>
                {/* Back button */}
                <button 
                    onClick={goBackToCart}
                    className="flex items-center text-green-600 mb-4 hover:text-green-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Cart
                </button>

                {/* Order summary */}
                <div className="bg-white flex justify-between items-center w-full rounded-xl shadow-sm px-6 py-4 my-4">
                    <div>
                        <p className='font-medium text-gray-700'>Order Total</p>
                        <p className="text-xs text-gray-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-green-600">₹{total.toLocaleString()}</p>
                        {deliveryFee === 0 ? (
                            <p className="text-xs text-green-500">Free delivery</p>
                        ) : (
                            <p className="text-xs text-gray-500">Includes ₹{deliveryFee} delivery fee</p>
                        )}
                    </div>
                </div>
                
                {!showPlaceOrderView ? (
                    <>
                        <h2 className='text-xl font-bold text-gray-800 mb-4'>Select Payment Method</h2>
                        {paymentMethods.map(method => (
                            <PaymentSection key={method.id} method={method} />
                        ))}
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
                            <button 
                                onClick={() => setShowPlaceOrderView(false)}
                                className="text-green-600 hover:text-green-800"
                            >
                                Change
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                            <img 
                                src={paymentMethods.flatMap(m => m.options).find(o => o.id === selectedPayment)?.icon} 
                                alt="Payment method" 
                                className="h-8 w-8 object-contain" 
                            />
                            <div>
                                <p className="font-medium text-gray-800">{getPaymentMethodName()}</p>
                                <p className="text-sm text-gray-500">Selected payment method</p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-800 mb-2">Order Summary</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="font-medium">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                                    <span className="font-medium">Total</span>
                                    <span className="font-bold text-green-600">₹{total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Add Place Order button in the page flow */}
                <div className="mt-6 mb-20">
                    <button
                        onClick={processPayment}
                        disabled={isProcessing || !selectedPayment}
                        className={`w-full py-4 text-white rounded-xl font-semibold transition-colors
                            ${isProcessing || !selectedPayment ? 
                                'bg-gray-400 cursor-not-allowed' : 
                                'bg-green-600 hover:bg-green-700'}
                        `}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : !selectedPayment ? (
                            'Please select a payment method'
                        ) : (
                            `Place Order - ₹${total.toLocaleString()}`
                        )}
                    </button>
                </div>
            </div>

            <FooterFood />
        </div>
    );
}

export default PaymentFood;