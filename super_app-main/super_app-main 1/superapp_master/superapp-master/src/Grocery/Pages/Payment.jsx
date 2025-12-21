import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import Header from "../SubPages/Header";
import paymentService from "../../services/paymentService";
import step3 from "../Images/step3.svg";
import phonepay from "../Images/phonepay.svg";
import paytm from "../Images/paytm.svg";
import amazon from "../Images/amazonpay.svg";
import mobikwik from "../Images/mobikwik.svg";
import restricted from "../Images/mobikrestricted.svg";
import credit from "../Images/creditdebit.svg";
import hdfc from "../Images/hdfc.svg";
import icici from "../Images/icici.svg";
import sbi from "../Images/sbi.svg";
import axis from "../Images/axis.svg";
import kotak from "../Images/kotak.svg";
import cod from "../Images/COD.svg";
import { useNavigate, useLocation } from 'react-router-dom';

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);

    // Fetch cart items on mount
    useEffect(() => {
        const fetchCartItems = async () => {
            setLoading(true);
            try {
                const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.GROCERY_CART), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer demo-token'
                    }
                });
                if (response.ok) {
                    const responseData = await response.json();
                    setCartItems(responseData.data || []);
                } else {
                    setCartItems([]);
                }
            } catch (err) {
                setCartItems([]);
            }
            setLoading(false);
        };
        
        // Get selected address from location state
        if (location.state && location.state.selectedAddress) {
            setSelectedAddress(location.state.selectedAddress);
        }
        
        fetchCartItems();
    }, [location.state]);

    // Payment methods
    const paymentMethods = [
        { id: 'cod', name: 'Cash on Delivery', icon: cod, type: 'cod' },
        { id: 'phonepay', name: 'PhonePe', icon: phonepay, type: 'upi' },
        { id: 'paytm', name: 'Paytm', icon: paytm, type: 'upi' },
        { id: 'amazonpay', name: 'Amazon Pay', icon: amazon, type: 'upi' },
        { id: 'credit', name: 'Credit/Debit Card', icon: credit, type: 'card' },
        { id: 'hdfc', name: 'HDFC Bank', icon: hdfc, type: 'netbanking' },
        { id: 'icici', name: 'ICICI Bank', icon: icici, type: 'netbanking' },
        { id: 'sbi', name: 'SBI Bank', icon: sbi, type: 'netbanking' },
        { id: 'axis', name: 'AXIS Bank', icon: axis, type: 'netbanking' },
        { id: 'kotak', name: 'Kotak Bank', icon: kotak, type: 'netbanking' }
    ];

    // Calculate total
    const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * (item.discountedPrice || item.originalPrice || item.price || 0)), 0);
    const shipping = 0;
    const total = subtotal + shipping;
    
    // Format address for display (short version)
    const formatAddress = (address) => {
        if (!address) return '';
        const parts = [];
        if (address.fullName) parts.push(address.fullName);
        if (address.houseNo) parts.push(address.houseNo);
        if (address.addressLine2) parts.push(address.addressLine2);
        if (address.roadName) parts.push(address.roadName);
        if (address.city) parts.push(address.city);
        if (address.state) parts.push(address.state);
        if (address.pincode) parts.push(address.pincode);
        return parts.join(', ');
    };

    // Format full address with all details for display
    const formatFullAddress = (address) => {
        if (!address) return '';
        const parts = [];
        
        // Name and Contact
        if (address.fullName) parts.push(`Name: ${address.fullName}`);
        if (address.phoneNumber) parts.push(`Phone: ${address.phoneNumber}`);
        if (address.altPhoneNumber) parts.push(`Alt Phone: ${address.altPhoneNumber}`);
        
        // Address lines
        const addressLines = [];
        if (address.houseNo) addressLines.push(address.houseNo);
        if (address.addressLine2) addressLines.push(address.addressLine2);
        if (address.roadName) addressLines.push(address.roadName);
        if (address.landmark) addressLines.push(`Near ${address.landmark}`);
        if (addressLines.length > 0) parts.push(`Address: ${addressLines.join(', ')}`);
        
        // Location
        const locationParts = [];
        if (address.city) locationParts.push(address.city);
        if (address.state) locationParts.push(address.state);
        if (address.pincode) locationParts.push(address.pincode);
        if (address.country) locationParts.push(address.country);
        if (locationParts.length > 0) parts.push(locationParts.join(', '));
        
        // Additional info
        if (address.companyName) parts.push(`Company: ${address.companyName}`);
        if (address.deliveryInstructions) parts.push(`Instructions: ${address.deliveryInstructions}`);
        
        return parts.join('\n');
    };

    // Place order
    const handleMakePayment = async () => {
        if (!selectedPayment) {
            setError('Please select a payment method');
            return;
        }
        
        if (!selectedAddress) {
            setError('Please select a delivery address');
            return;
        }
        
        setIsProcessing(true);
        setError('');
        try {
            // Prepare payment data for grocery order
            const paymentData = {
                amount: total,
                currency: 'INR',
                order_model: 'GroceryOrder',
                email: selectedAddress?.email || 'user@example.com', // Get from address or use default
                contact: selectedAddress?.phoneNumber || '+91 9876543210', // Get from address
                description: `Grocery Order - ${cartItems.length} items`,
                order_data: {
                    total_amount: total,
                    shipping_address: formatFullAddress(selectedAddress), // Use full address with all details
                    payment_method: selectedPayment.type,
                    items: cartItems.map(item => ({
                        grocery_id: item.grocery_id,
                        quantity: item.quantity,
                        price: (item.discountedPrice ?? item.originalPrice ?? item.grocery?.discounted_price ?? item.grocery?.original_price ?? 0)
                    }))
                }
            };

            console.log('🔍 Grocery Payment - Payment data:', paymentData);

            // Process payment using payment service
            await paymentService.processPayment(paymentData, {
                onSuccess: (successData) => {
                    console.log('✅ Grocery Payment successful:', successData);
                    setIsProcessing(false);
                    // Clear cart
                    fetch(API_CONFIG.getUrl('/api/gcart/clear'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer demo-token'
                        }
                    });
                    // Go to invoice page
                    navigate(`/home-grocery/invoice/${successData.dbOrder._id || successData.dbOrder.id}`);
                },
                onError: (error) => {
                    console.error('❌ Grocery Payment failed:', error);
                    setError(error.message || 'Payment failed. Please try again.');
                    setIsProcessing(false);
                },
                onCancel: () => {
                    console.log('🚫 Grocery Payment cancelled by user');
                    setError('Payment was cancelled.');
                    setIsProcessing(false);
                }
            });

        } catch (error) {
            console.error('❌ Grocery Payment error:', error);
            setError(error.message || 'Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading cart...</div>;
    if (cartItems.length === 0) return <div className="p-8 text-center">Your cart is empty.</div>;

    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <Header />
            <div className='border border-[#E1E1E1] py-4'>
                <img src={step3} alt="" className='w-full mt-20 px-6' />
            </div >
            <div className='px-4 pb-16'>
                {/* Address Display */}
                {selectedAddress && (
                    <div className="bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4">
                        <h3 className="font-medium text-base mb-3">Delivery Address</h3>
                        
                        {/* Full Address Details */}
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
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
                        
                        <button
                            onClick={() => navigate('/home-grocery/edit-all-addresses')}
                            className="text-[#5C3FFF] text-sm underline hover:text-[#4A2FCC]"
                        >
                            Change Address
                        </button>
                    </div>
                )}
                
                <div className="bg-[#F1EDFF] flex justify-between items-center w-full rounded-full px-4 py-3 mt-4 border border-[#E7E7E7]">
                    <p className='font-medium text-base'>Total Amount</p>
                    <p className="font-medium text-base">
                        ₹ {total}
                    </p>
                </div>
                <div className='text-[#242424] text-base font-medium mt-2'>Payment Type</div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                <div className='space-y-3'>
                    <h3 className="font-semibold text-lg">Select Payment Method</h3>
                    {paymentMethods.map((method) => (
                        <div key={method.id}
                            className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors ${selectedPayment?.id === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                            onClick={() => setSelectedPayment(method)}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <img src={method.icon} alt={method.name} className="w-8 h-8" />
                                    <span className="font-medium">{method.name}</span>
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
                <button
                    onClick={handleMakePayment}
                    disabled={!selectedPayment || !selectedAddress || isProcessing || cartItems.length === 0}
                    className={`w-full py-4 text-white rounded-lg mt-6 font-semibold text-lg ${!selectedPayment || !selectedAddress || isProcessing || cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5C3FFF] hover:bg-[#4a32cc]'}`}
                >
                    {isProcessing ? 'Processing...' : `Make Payment - ₹${total}`}
                </button>
            </div>
        </div>
    );
}

export default Payment;