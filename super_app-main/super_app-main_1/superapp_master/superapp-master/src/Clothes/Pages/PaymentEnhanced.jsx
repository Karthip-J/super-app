import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MyntraClothesHeader from '../Header/MyntraClothesHeader';
import Footer from '../../Utility/Footer';
import { useCart } from '../../Utility/CartContext';
import PaymentButton from '../../Components/PaymentButton';
import PaymentSuccess from '../../Components/PaymentSuccess';
import paymentService from '../../services/paymentService';

// Payment method icons
import phonepay from '../Images/phonepay.svg';
import paytm from '../Images/paytm.svg';
import amazonpay from '../Images/amazonpay.svg';
import cod from '../Images/COD.svg';
import credit from '../Images/creditdebit.svg';
import hdfc from '../Images/hdfc.svg';
import icici from '../Images/icici.svg';
import sbi from '../Images/sbi.svg';
import axis from '../Images/axis.svg';
import kotak from '../Images/kotak.svg';

function PaymentEnhanced() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, setCart } = useCart();
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [error, setError] = useState('');

    // Order data
    const cartItems = cart?.items || [];
    const subtotal = cartItems.reduce((sum, item) => {
        return sum + (item.quantity * (item.product_id?.sale_price || item.product_id?.price || 0));
    }, 0);
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    // Payment methods
    const paymentMethods = [
        {
            id: 'googlepay',
            name: 'Google Pay',
            icon: phonepay, // Use phonepay as placeholder or generic if gpay missing
            type: 'razorpay',
            description: 'Pay securely via Google Pay'
        },
        {
            id: 'phonepay',
            name: 'PhonePe',
            icon: phonepay,
            type: 'razorpay',
            description: 'Pay securely via PhonePe'
        },
        {
            id: 'paytm',
            name: 'Paytm',
            icon: paytm,
            type: 'razorpay',
            description: 'Pay securely via Paytm'
        },
        {
            id: 'amazonpay',
            name: 'Amazon Pay',
            icon: amazonpay,
            type: 'razorpay',
            description: 'Pay securely via Amazon Pay'
        },
        {
            id: 'creditdebit',
            name: 'Credit/Debit Card',
            icon: credit,
            type: 'razorpay',
            description: 'Pay securely with your card'
        },
        {
            id: 'hdfc',
            name: 'HDFC Bank',
            icon: hdfc,
            type: 'razorpay',
            description: 'Pay via HDFC Net Banking'
        },
        {
            id: 'icici',
            name: 'ICICI Bank',
            icon: icici,
            type: 'razorpay',
            description: 'Pay via ICICI Net Banking'
        },
        {
            id: 'sbi',
            name: 'SBI Bank',
            icon: sbi,
            type: 'razorpay',
            description: 'Pay via SBI Net Banking'
        },
        {
            id: 'axis',
            name: 'AXIS Bank',
            icon: axis,
            type: 'razorpay',
            description: 'Pay via AXIS Net Banking'
        },
        {
            id: 'kotak',
            name: 'Kotak Bank',
            icon: kotak,
            type: 'razorpay',
            description: 'Pay via Kotak Net Banking'
        },
        {
            id: 'cod',
            name: 'Cash on Delivery',
            icon: cod,
            type: 'cod',
            description: 'Pay when you receive your order'
        }
    ];

    // Check if cart is empty
    useEffect(() => {
        if (cartItems.length === 0 && location.pathname !== '/home-clothes/order') {
            navigate('/home-clothes/cart');
        }
    }, [cartItems, navigate, location.pathname]);

    // Handle payment success
    const handlePaymentSuccess = (data) => {
        setPaymentStatus('success');
        setPaymentData(data);
        setError(null);

        // Clear cart after successful payment
        setCart({ items: [] });

        // Navigate to order confirmation
        setTimeout(() => {
            navigate('/home-clothes/order', {
                state: {
                    order: {
                        id: orderData.order_id,
                        total: total,
                        payment_method: 'Razorpay',
                        status: 'confirmed'
                    },
                    paymentMethod: 'Razorpay',
                    total: total
                }
            });
        }, 2000);
    };

    // Handle payment error
    const handlePaymentError = (error) => {
        setPaymentStatus('error');
        setError(error.message);
    };

    // Handle payment cancel
    const handlePaymentCancel = () => {
        setPaymentStatus('cancelled');
        setError('Payment was cancelled');
    };

    // Handle COD order
    const handleCODOrder = async () => {
        try {
            // Get token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to place order');
            }

            // Create order for COD
            const orderData = {
                shipping_address: {
                    address_line1: '123 Main Street', // TODO: Add address form
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    pincode: '400001',
                    phone: '+91 9876543210'
                },
                payment_method: 'cod',
                notes: 'Cash on Delivery'
            };

            // Navigate to order confirmation
            navigate('/home-clothes/order', {
                state: {
                    order: {
                        id: `COD_${Date.now()}`,
                        total: total,
                        payment_method: 'Cash on Delivery',
                        status: 'pending'
                    },
                    paymentMethod: 'Cash on Delivery',
                    total: total
                }
            });

        } catch (error) {
            setError(error.message);
        }
    };

    // Create order data for Razorpay
    const createRazorpayOrderData = () => {
        return {
            amount: total, // Send amount in rupees, backend will convert to paise
            currency: 'INR',
            order_id: `ORDER_${Date.now()}`,
            order_model: 'Order',
            description: `E-commerce order - ${cartItems.length} items`,
            email: 'customer@example.com', // TODO: Get from user profile
            contact: '+91 9876543210', // TODO: Get from user profile
            customerName: 'Customer Name', // TODO: Get from user profile
            payment_method: selectedPayment?.id || 'razorpay',
            payment_notes: `Payment via ${selectedPayment?.name || 'Razorpay'}`
        };
    };

    if (paymentStatus === 'success') {
        return (
            <div className="bg-white min-h-screen">
                <MyntraClothesHeader />
                <div className="pt-24 px-4 pb-20 max-w-[1248px] mx-auto">
                    <PaymentSuccess
                        paymentData={paymentData}
                        orderData={orderData}
                        showDetails={true}
                    />
                </div>
                <Footer />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="bg-white min-h-screen">
                <MyntraClothesHeader />
                <div className="pt-24 px-4 text-center">
                    <p>Your cart is empty. Redirecting...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <MyntraClothesHeader />
            <div className="pt-24 px-4 pb-20 max-w-[1248px] mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Payment</h1>
                    <p className="text-gray-600">Choose your payment method</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Order Summary */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Items ({cartItems.length})</span>
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
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Select Payment Method</h3>

                    {paymentMethods.map((method) => (
                        <div key={method.id}
                            className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment?.id === method.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => {
                                console.log('🔍 DEBUG: Payment method clicked:', method);
                                setSelectedPayment(method);
                            }}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <img src={method.icon} alt={method.name} className="w-8 h-8" />
                                    <div>
                                        <span className="font-medium">{method.name}</span>
                                        <p className="text-sm text-gray-600">{method.description}</p>
                                    </div>
                                </div>
                                <input
                                    type="radio"
                                    checked={selectedPayment?.id === method.id}
                                    onChange={() => setSelectedPayment(method)}
                                    className="w-4 h-4 text-blue-600"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Button */}
                {console.log('🔍 DEBUG: selectedPayment:', selectedPayment)}
                {console.log('🔍 DEBUG: selectedPayment?.type:', selectedPayment?.type)}
                {console.log('🔍 DEBUG: Should show PaymentButton:', selectedPayment?.type === 'razorpay')}
                {selectedPayment?.type === 'razorpay' && (
                    <div className="mt-6">
                        <PaymentButton
                            orderData={createRazorpayOrderData()}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                            onCancel={handlePaymentCancel}
                            className="w-full"
                            theme="primary"
                        >
                            Pay ₹{total.toFixed(2)} via {selectedPayment.name}
                        </PaymentButton>
                    </div>
                )}

                {/* COD Button */}
                {selectedPayment?.type === 'cod' && (
                    <button
                        onClick={handleCODOrder}
                        className="w-full py-4 text-white rounded-lg mt-6 font-semibold text-lg bg-green-600 hover:bg-green-700 transition-colors duration-200"
                    >
                        Place Order - Cash on Delivery
                    </button>
                )}

                {/* Place Order Button (when no payment method selected) */}
                {!selectedPayment && (
                    <button
                        disabled={true}
                        className="w-full py-4 text-white rounded-lg mt-6 font-semibold text-lg bg-gray-400 cursor-not-allowed"
                    >
                        Select Payment Method
                    </button>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default PaymentEnhanced; 