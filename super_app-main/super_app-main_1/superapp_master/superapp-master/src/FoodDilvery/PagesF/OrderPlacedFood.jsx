import React, { useEffect, useState } from 'react';
import step4 from "../../Clothes/Images/step4.svg";
import right from "../../Clothes/Images/successful.gif";
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderInsideFood from '../ComponentsF/HeaderInsideFood';
import { foodOrderService, formatImageUrl, formatCurrency } from '../../services/foodDeliveryService';

function OrderPlacedFood() {
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Try to get order data from navigation state
    useEffect(() => {
        const state = location.state;
        if (state && state.orderId) {
            // If we have minimal state, fetch full order details
            setLoading(true);
            foodOrderService.getFoodOrderById(state.orderId)
                .then(res => {
                    if (res.success && res.data) {
                        setOrder(res.data);
                    } else {
                        setError(res.message || 'Could not fetch order details.');
                    }
                })
                .catch(err => setError(err.message || 'Could not fetch order details.'))
                .finally(() => setLoading(false));
        } else if (state && state.orderNumber) {
            // If we have all details in state (legacy), use them
            setOrder(state);
        } else {
            setError('No order details available.');
        }
    }, [location.state]);

    if (loading) {
        return (
            <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center'>
                <HeaderInsideFood />
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center'>
                <HeaderInsideFood />
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button onClick={() => navigate('/home-food')} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">Go Home</button>
                </div>
            </div>
        );
    }

    // Render order details
    return (
        <div className='bg-[#F8F8F8] min-h-screen flex flex-col items-center '>
            <HeaderInsideFood />
            <div className='border border-[#E1E1E1] py-4 w-full flex justify-center'>
                <img src={step4} alt="" className='w-full max-w-md mt-20 px-6' />
            </div>
            {/* Centering the image and text */}
            <div className="flex flex-col justify-center items-center mt-2">
                <img src={right} alt="" className='' />
                <div className='text-lg font-bold mt-0 text-center'>
                    Your order has been placed!
                </div>
                {order && (order.order_number || order.orderNumber) && (
                    <div className="text-sm text-gray-500 mt-1">Order #{order.order_number || order.orderNumber}</div>
                )}
            </div>
            <div className='px-4 w-full max-w-xl'>
                {/* Order Items */}
                {order && order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                        <div key={item._id || idx} className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 flex row gap-4 p-4'>
                            <div className='w-[120px] h-[140px] flex items-center justify-center'>
                                <img src={formatImageUrl(item.dish_id?.image)} alt={item.dish_id?.name || 'Dish'} className='w-full h-full object-contain p-4' />
                            </div>
                            <div>
                                <div className='font-semibold text-base text-[#242424] pt-4'>{item.dish_id?.name || 'Dish'}</div>
                                <p className="font-medium text-sm text-[#242424] mb-2">{formatCurrency(item.price)} x {item.quantity}</p>
                                <div className="text-[#18A20C] font-medium font-base">
                                    {item.status || order.status || 'Preparing'}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 flex row gap-4 p-4'>
                        <div className='w-[120px] h-[140px] flex items-center justify-center'>
                            <span className='text-gray-400'>No items</span>
                        </div>
                        <div>
                            <div className='font-semibold text-base text-[#242424] pt-4'>No items in this order</div>
                        </div>
                    </div>
                )}
                {/* Order Summary */}
                {order && (
                    <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4'>
                        <div className='flex justify-between mb-2'>
                            <span className='font-medium'>Total Amount:</span>
                            <span>{formatCurrency(order.total_amount || order.totalAmount)}</span>
                        </div>
                        <div className='flex justify-between mb-2'>
                            <span className='font-medium'>Order Status:</span>
                            <span>{order.status || 'Preparing'}</span>
                        </div>
                        <div className='flex justify-between mb-2'>
                            <span className='font-medium'>Order Date:</span>
                            <span>{order.createdAt ? new Date(order.createdAt).toLocaleString() : order.orderDate || '-'}</span>
                        </div>
                    </div>
                )}
                <div
                    onClick={() => navigate('/account/orders')}
                    className="mt-4 text-base font-medium text-[#5C3FFF] underline text-center cursor-pointer">
                    Check your order list
                </div>
            </div>
        </div>
    );
}

export default OrderPlacedFood;

