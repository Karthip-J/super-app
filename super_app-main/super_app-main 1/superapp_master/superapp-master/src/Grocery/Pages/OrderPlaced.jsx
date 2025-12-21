import React from 'react';
import step4 from "../Images/step4.svg";
import Header from "../SubPages/Header";
import right from "../Images/successful.gif";
import shirt from "../Images/shirt.svg";
import { useNavigate, useLocation } from 'react-router-dom';

function OrderPlaced() {
    const navigate = useNavigate();
    const location = useLocation();
    const order = location.state?.order || location.state;
    
    // Get order data from state or use defaults
    const orderNumber = order?.order_number || order?.id || 'OD-XXXX';
    const firstItem = order?.items?.[0];
    const productImage = firstItem?.product?.image || firstItem?.image || shirt;
    const productName = firstItem?.product?.name || firstItem?.name || 'Grocery Item';
    const price = firstItem?.price || 0;
    const totalPrice = order?.total_amount || price;
    const status = order?.status || 'confirmed';
    
    // Get address from order or localStorage
    const orderAddress = order?.address || order?.shipping_address;
    const storedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
    const defaultAddress = Array.isArray(storedAddresses) && storedAddresses.length > 0 ? storedAddresses[0] : null;
    const address = orderAddress || defaultAddress;
    
    return (
        <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center '>
           <Header />

            <div className='border border-[#E1E1E1] py-4 w-full flex justify-center'>
                <img src={step4} alt="" className='w-full max-w-md mt-20 px-6' />
            </div>
            {/* Centering the image and text */}
            <div className="flex flex-col justify-center items-center mt-2">
                <img src={right} alt="" className='' />
                <div className='text-lg font-bold mt-0 text-center'>
                    Your order has been placed!
                </div>
            </div>
            <div className='px-4 w-full max-w-md'>
                <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 flex row gap-4 p-4'>
                    <div className='w-[120px] h-[140px]'>
                        <img src={productImage} alt="product" className='w-full h-full p-4' />
                    </div>
                    <div className='flex-1'>
                        <div className="flex justify-between items-center w-full">
                            <p className="text-[#5C3FFF] font-medium text-base">{orderNumber}</p>
                            <p className="font-medium text-base text-[#5C3FFF]">Invoice</p>
                        </div>
                        <div className='font-semibold text-base text-[#242424] pt-2'>{productName}</div>
                        <p className="font-medium text-sm text-[#242424] mb-2">₹ {totalPrice}</p>
                        <div className="text-[#18A20C] font-medium font-base capitalize">
                            {status}
                        </div>
                    </div>
                </div>
                
                {/* Shipping Address Section */}
                {address && (
                    <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4'>
                        <h3 className="font-semibold text-base text-[#242424] mb-2">Shipping Address</h3>
                        {(() => {
                            // If address is a string (formatted), display as-is
                            if (typeof address === 'string') {
                                return (
                                    <div className="text-sm text-[#242424] whitespace-pre-line">
                                        {address}
                                    </div>
                                );
                            }
                            // If address is an object, format it properly
                            if (typeof address === 'object') {
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
                    className="mt-2 text-base font-medium text-[#5C3FFF] underline text-center cursor-pointer">
                    Check your order list
                </div>

            </div>
        </div>
    )
}

export default OrderPlaced;
