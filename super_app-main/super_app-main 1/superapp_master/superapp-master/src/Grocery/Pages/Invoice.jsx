import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../SubPages/Header';
import step4 from "../../Clothes/Images/step4.svg";
import right from "../../Clothes/Images/successful.gif";
import shirt from "../Images/shirt.svg";

function Invoice() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndPrepareData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch Order Details from API
                const response = await fetch(API_CONFIG.getUrl(`/api/gorders/${orderId}`), {
                    headers: {
                        'Authorization': 'Bearer demo-token',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch order details: ${response.statusText}`);
                }

                const result = await response.json();
                const order = result.data; // Adjust based on actual API response structure

                // Validate order data
                if (!order || !order.items || !Array.isArray(order.items)) {
                    throw new Error('Invalid order data or no items found.');
                }

                // Get Profile and Address from localStorage
                const storedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
                const storedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
                const defaultAddress = Array.isArray(storedAddresses) && storedAddresses.length > 0
                    ? storedAddresses[0]
                    : null;

                setOrderData({
                    order,
                    profile: storedProfile,
                    address: defaultAddress
                });

            } catch (err) {
                console.error('Error fetching order data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchAndPrepareData();
        } else {
            setError('Invalid order ID.');
            setLoading(false);
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center'>
                <Header />
                <div className="flex flex-col justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C3FFF] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Invoice...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center'>
                <Header />
                <div className="flex flex-col justify-center items-center min-h-[60vh]">
                    <p className="text-red-500 mb-4">Error: {error}</p>
                    <button
                        onClick={() => navigate('/home-grocery/order-list')}
                        className="bg-[#5C3FFF] text-white px-6 py-2 rounded-lg hover:bg-[#4a32cc] transition-colors"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    if (!orderData || !orderData.order || !orderData.order.items) {
        return (
            <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center'>
                <Header />
                <div className="flex flex-col justify-center items-center min-h-[60vh]">
                    <p className="text-gray-600 mb-4">No order data available.</p>
                    <button
                        onClick={() => navigate('/home-grocery/order-list')}
                        className="bg-[#5C3FFF] text-white px-6 py-2 rounded-lg hover:bg-[#4a32cc] transition-colors"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const { order, profile, address } = orderData;

    // Calculate total price and list all items
    const totalPrice = order.items.reduce((sum, item) => sum + (item.price || 0), 0);
    const orderNumber = order.order_number || 'GORD-XXXX';
    const status = order.status || 'pending';

    return (
        <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center'>
            <Header />
            <div className='border border-[#E1E1E1] py-4 w-full flex justify-center'>
                <img src={step4} alt="Order Progress" className='w-full max-w-md mt-20 px-6' />
            </div>
            <div className="flex flex-col justify-center items-center mt-2">
                <img src={right} alt="Success" className='' />
                <div className='text-lg font-bold mt-0 text-center'>
                    Your order has been placed!
                </div>
            </div>
            <div className='px-4'>
                {/* Order Summary */}
                <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4'>
                    <div className="flex justify-between items-center w-full mb-4">
                        <p className="text-[#5C3FFF] font-medium text-base">{orderNumber}</p>
                        <p className="font-medium text-base text-[#5C3FFF]">Invoice</p>
                    </div>
                    {/* Display all items */}
                    {order.items.map((item, index) => {
                        const productImage = item.product?.image || item.image || shirt;
                        const productName = item.product?.name || item.name || 'Grocery Item';
                        const price = item.price || 0;

                        return (
                            <div key={index} className='flex gap-4 mb-4'>
                                <div className='w-[120px] h-[140px]'>
                                    <img src={productImage} alt="product" className='w-full h-full p-4' />
                                </div>
                                <div>
                                    <div className='font-semibold text-base text-[#242424]'>{productName}</div>
                                    <p className="font-medium text-sm text-[#242424] mb-2">₹ {price}</p>
                                </div>
                            </div>
                        );
                    })}
                    <div className="text-[#18A20C] font-medium font-base">
                        Status: {status}
                    </div>
                    <div className="font-semibold text-base text-[#242424] mt-2">
                        Total: ₹ {totalPrice}
                    </div>
                </div>
                {/* Display Profile and Address if available */}
                {profile?.name && (
                    <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4'>
                        <h3 className="font-semibold text-base text-[#242424] mb-2">Customer Details</h3>
                        <p className="text-sm text-[#242424]">Name: {profile.name}</p>
                        {profile.email && <p className="text-sm text-[#242424]">Email: {profile.email}</p>}
                    </div>
                )}
                {/* Display Shipping Address - Check order data first, then localStorage */}
                {(order.address || order.shipping_address || address) && (
                    <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4'>
                        <h3 className="font-semibold text-base text-[#242424] mb-2">Shipping Address</h3>
                        {(() => {
                            // Priority 1: Use address from order (could be string or object)
                            const orderAddress = order.address || order.shipping_address;
                            
                            if (orderAddress) {
                                // If it's a string (formatted address), display as-is
                                if (typeof orderAddress === 'string') {
                                    return (
                                        <div className="text-sm text-[#242424] whitespace-pre-line">
                                            {orderAddress}
                                        </div>
                                    );
                                }
                                // If it's an object, format it properly
                                if (typeof orderAddress === 'object') {
                                    const parts = [];
                                    if (orderAddress.fullName) parts.push(`Name: ${orderAddress.fullName}`);
                                    if (orderAddress.phoneNumber) parts.push(`Phone: ${orderAddress.phoneNumber}`);
                                    if (orderAddress.altPhoneNumber) parts.push(`Alt Phone: ${orderAddress.altPhoneNumber}`);
                                    
                                    const addressLines = [];
                                    if (orderAddress.houseNo) addressLines.push(orderAddress.houseNo);
                                    if (orderAddress.addressLine2) addressLines.push(orderAddress.addressLine2);
                                    if (orderAddress.roadName) addressLines.push(orderAddress.roadName);
                                    if (orderAddress.landmark) addressLines.push(`Near ${orderAddress.landmark}`);
                                    if (addressLines.length > 0) parts.push(`Address: ${addressLines.join(', ')}`);
                                    
                                    const locationParts = [];
                                    if (orderAddress.city) locationParts.push(orderAddress.city);
                                    if (orderAddress.state) locationParts.push(orderAddress.state);
                                    if (orderAddress.pincode) locationParts.push(orderAddress.pincode);
                                    if (orderAddress.country) locationParts.push(orderAddress.country);
                                    if (locationParts.length > 0) parts.push(locationParts.join(', '));
                                    
                                    if (orderAddress.companyName) parts.push(`Company: ${orderAddress.companyName}`);
                                    if (orderAddress.deliveryInstructions) parts.push(`Instructions: ${orderAddress.deliveryInstructions}`);
                                    
                                    return (
                                        <div className="text-sm text-[#242424] whitespace-pre-line">
                                            {parts.join('\n')}
                                        </div>
                                    );
                                }
                            }
                            
                            // Priority 2: Use address from localStorage (fallback)
                            if (address) {
                                const parts = [];
                                if (address.fullName) parts.push(`Name: ${address.fullName}`);
                                if (address.phoneNumber) parts.push(`Phone: ${address.phoneNumber}`);
                                if (address.altPhoneNumber) parts.push(`Alt Phone: ${address.altPhoneNumber}`);
                                
                                const addressLines = [];
                                if (address.houseNo) addressLines.push(address.houseNo);
                                if (address.addressLine2) addressLines.push(address.addressLine2);
                                if (address.roadName) addressLines.push(address.roadName);
                                if (address.landmark) addressLines.push(`Near ${address.landmark}`);
                                if (addressLines.length > 0) parts.push(`Address: ${addressLines.join(', ')}`);
                                
                                const locationParts = [];
                                if (address.city) locationParts.push(address.city);
                                if (address.state) locationParts.push(address.state);
                                if (address.pincode) locationParts.push(address.pincode);
                                if (address.country) locationParts.push(address.country);
                                if (locationParts.length > 0) parts.push(locationParts.join(', '));
                                
                                if (address.companyName) parts.push(`Company: ${address.companyName}`);
                                if (address.deliveryInstructions) parts.push(`Instructions: ${address.deliveryInstructions}`);
                                
                                return (
                                    <div className="text-sm text-[#242424] whitespace-pre-line">
                                        {parts.join('\n')}
                                    </div>
                                );
                            }
                            
                            return null;
                        })()}
                    </div>
                )}
                <div
                    onClick={() => navigate('/home-grocery/order-list')}
                    className="mt-2 text-base font-medium text-[#5C3FFF] underline text-center cursor-pointer"
                >
                    Check your order list
                </div>
            </div>
        </div>
    );
}

export default Invoice;