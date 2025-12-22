import API_CONFIG from "../../config/api.config.js";
import React from 'react';
import step4 from "../Images/step4.svg";
import ClothesHeader from "../Header/ClothesHeader";
import right from "../Images/successful.gif";
import shirt from "../Images/shirt.svg";
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../Utility/CartContext';
import { useEffect } from 'react';

function OrderPlaced() {
    const navigate = useNavigate(); 
    const location = useLocation();
    const { cart, setCart } = useCart();
    const order = location.state?.order;
    const paymentMethod = location.state?.paymentMethod;
    const total = location.state?.total;

    useEffect(() => {
        if (cart && cart.items && cart.items.length > 0) {
            setCart(null); // Clear cart in background
        }
    }, [cart, setCart]);

    // Fallbacks for static display if no order data
    const firstItem = order?.items?.[0];
    const product = firstItem?.product_id || {};
    const productImage = product?.photo ? (product.photo.startsWith('http') ? product.photo : API_CONFIG.getUrl(product.photo.startsWith('/') ? product.photo : `/${product.photo}`)) : (product?.featured_image ? (product.featured_image.startsWith('http') ? product.featured_image : API_CONFIG.getUrl(product.featured_image.startsWith('/') ? product.featured_image : `/${product.featured_image}`)) : shirt);
    const orderNumber = order?.order_number || 'OD-XXXX';
    const productName = product?.name || 'Product';
    const discountedPrice = firstItem?.price || 0;
    const originalPrice = product?.price || discountedPrice;
    const status = order?.status || 'Process';

    return (
        <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center '>
           <ClothesHeader />
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
            <div className='px-4'>
                <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 flex row gap-4 p-4'>
                    <div className='w-[120px] h-[140px]'>
                        <img src={productImage} alt="product" className='w-full h-full p-4' />
                    </div>
                    <div>
                        <div className="flex justify-between items-center  w-full">
                        <p className="text-[#5C3FFF] font-medium text-base">{orderNumber}</p>
                        <p className="font-medium text-base text-[#5C3FFF]">Invoice</p>
                        </div>
                        <div className='font-semibold text-base text-[#242424] pt-2'>{productName}</div>
                        <p className="font-medium text-sm text-[#242424] mb-2">₹ {discountedPrice} {originalPrice > discountedPrice && (<span className="line-through text-[#C1C1C1]">₹ {originalPrice}</span>)}</p>
                        <div className="text-[#18A20C] font-medium font-base">
                            {status}
                        </div>
                    </div>
                </div>
                <div 
                onClick={() => navigate('/home-clothes/order-list')}   
                className="mt-2 text-base font-medium text-[#5C3FFF] underline text-center">
                    Check your order list
                </div>
            </div>
        </div>
    )
}

export default OrderPlaced;
