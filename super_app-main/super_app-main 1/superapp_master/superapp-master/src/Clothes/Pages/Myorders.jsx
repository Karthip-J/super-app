import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from 'react';
import ClothesHeader from "../Header/ClothesHeader";
import Footer from '../../Utility/Footer';
import filter from "../Images/filterbutton.svg";
import { useNavigate } from 'react-router-dom';
import filterColor from "../Images/filtertcolorButton.svg";

function Myorders() {
    const navigate = useNavigate();
    const steps = ["Process", "Packaged", "Out of delivered", "Received"];
    const currentStep = 0;
    //const [isOpen, setIsOpen] = useState(false);
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [orders, setOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]); // Store all orders
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('New'); // New, Pending, Completed

    // Filter orders based on active tab
    const filterOrdersByTab = (ordersList, tab) => {
        if (!ordersList || ordersList.length === 0) {
            setOrders([]);
            return;
        }
        
        let filtered = [];
        switch(tab) {
            case 'New':
                // New orders: Show all orders that are NOT completed/delivered
                // This includes: pending, processing, confirmed, out_for_delivery, etc.
                filtered = ordersList.filter(order => {
                    const status = (order.status || '').toLowerCase().trim();
                    const completedStatuses = ['delivered', 'completed', 'cancelled'];
                    return !completedStatuses.includes(status);
                });
                break;
            case 'Pending':
                // Pending orders: pending, processing, confirmed, out_for_delivery
                filtered = ordersList.filter(order => {
                    const status = (order.status || '').toLowerCase().trim();
                    const pendingStatuses = ['pending', 'processing', 'confirmed', 'out_for_delivery', 'out for delivery'];
                    return pendingStatuses.includes(status);
                });
                break;
            case 'Completed':
                // Completed orders: delivered, completed
                filtered = ordersList.filter(order => {
                    const status = (order.status || '').toLowerCase().trim();
                    return status === 'delivered' || status === 'completed';
                });
                break;
            default:
                filtered = ordersList;
        }
        setOrders(filtered);
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        filterOrdersByTab(allOrders, tab);
    };

    useEffect(() => {
        const fetchOrders = async () => {
            // Check if user is authenticated
            const token = localStorage.getItem('token');
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const userEmail = localStorage.getItem('userEmail');
            
            // If user is not properly authenticated OR using demo token, show empty orders
            // This ensures brand new users and demo sessions don't see seeded/shared history
            if (!token || !isLoggedIn || !userEmail || token === 'demo-token') {
                setAllOrders([]);
                setOrders([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.ORDERS), {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Handle unauthorized access
                if (response.status === 401 || response.status === 403) {
                    // Invalid or expired token - clear it and show empty orders
                    localStorage.removeItem('token');
                    localStorage.removeItem('isLoggedIn');
                    setAllOrders([]);
                    setOrders([]);
                    setLoading(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                
                // Ensure we only process orders if the response is successful and contains valid data
                if (data.success && Array.isArray(data.data)) {
                    const fetchedOrders = data.data || [];
                    // Only set orders if we have a valid array (even if empty)
                    setAllOrders(fetchedOrders);
                    // Filter based on active tab
                    filterOrdersByTab(fetchedOrders, activeTab);
                } else {
                    // No orders or invalid response - show empty
                    setAllOrders([]);
                    setOrders([]);
                }
            } catch (e) {
                console.error('Error fetching orders:', e);
                // For any error, show empty orders (don't show error message for new users)
                setAllOrders([]);
                setOrders([]);
            }
            setLoading(false);
        };
        fetchOrders();
    }, []);

    // Update filtered orders when activeTab or allOrders changes
    useEffect(() => {
        if (allOrders.length > 0) {
            filterOrdersByTab(allOrders, activeTab);
        }
    }, [activeTab, allOrders.length]);

    return (
        <div>
            <div className='bg-[#F8F8F8] min-h-screen'>
                <ClothesHeader />
                <div className='px-4 pt-24 pb-28 bg-[#F8F8F8]'>
                    <div className="flex justify-between items-center w-full bg-[#F8F8F8] mb-4">
                        <p className='font-medium text-base text-[#484848]'>Your Orders</p>
                        <img src={filter} alt="filter" className="w-[60px] h-[30px]" onClick={() => setIsOpenFilter(true)} />
                    </div>
                    
                    {/* Order History Tabs */}
                    <div className="flex gap-2 mb-4 bg-white p-1 rounded-full border border-[#E1E1E1]">
                        <button
                            onClick={() => handleTabChange('New')}
                            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeTab === 'New'
                                    ? 'bg-[#5C3FFF] text-white'
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                        >
                            New
                        </button>
                        <button
                            onClick={() => handleTabChange('Pending')}
                            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeTab === 'Pending'
                                    ? 'bg-[#5C3FFF] text-white'
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => handleTabChange('Completed')}
                            className={`flex-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeTab === 'Completed'
                                    ? 'bg-[#5C3FFF] text-white'
                                    : 'text-[#484848] hover:bg-gray-100'
                            }`}
                        >
                            Completed
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-[50vh] text-center text-[#484848] text-lg">Loading orders...</div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-[50vh] text-center text-[#484848] text-lg">{error}</div>
                    ) : orders.length === 0 ? (
                        <div className="flex items-center justify-center h-[50vh] text-center text-[#484848] text-lg">
                            {activeTab === 'New' && 'No new orders.'}
                            {activeTab === 'Pending' && 'No pending orders.'}
                            {activeTab === 'Completed' && 'No completed orders.'}
                            {!activeTab && 'No orders yet.'}
                        </div>
                    ) : (
                        orders.map((order) => {
                            // Safely extract first item and product
                            const firstItem = order.items?.[0] || {};
                            const product = firstItem.product_id || {};
                            // Robust image extraction
                            let productImage = '';
                            if (product.photo) {
                                productImage = product.photo.startsWith('http') ? product.photo : API_CONFIG.getUploadUrl(product.photo);
                            } else if (product.featured_image) {
                                productImage = product.featured_image.startsWith('http') ? product.featured_image : API_CONFIG.getUploadUrl(product.featured_image);
                            }
                            // Robust price extraction
                            const discountedPrice = typeof firstItem.price === 'number' && !isNaN(firstItem.price) ? firstItem.price : (typeof product.sale_price === 'number' && !isNaN(product.sale_price) ? product.sale_price : (typeof product.price === 'number' && !isNaN(product.price) ? product.price : 'N/A'));
                            const orderId = order._id || order.id || order.order_number;
                            return (
                                <div key={orderId} className="bg-white border border-[#E1E1E1] rounded-[20px] mt-4 p-4 cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === orderId ? null : orderId)}>
                                    <div className="flex row gap-4">
                                        <div className="w-[120px] h-[140px] bg-gray-100 rounded-lg flex items-center justify-center">
                                            {productImage ? (
                                                <img 
                                                    src={productImage} 
                                                    alt={product.name || 'product'} 
                                                    className="w-full h-full p-4 object-cover" 
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="hidden items-center justify-center text-gray-400 text-sm">
                                                <span>No Image</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center w-full">
                                                <p className="text-[#5C3FFF] font-medium text-base">{order.order_number || order._id || order.id}</p>
                                                <p className="font-medium text-base text-[#5C3FFF]">Invoice</p>
                                            </div>
                                            <div className="font-semibold text-base text-[#242424] pt-2">{product.name || 'Product'} {order.items && order.items.length > 1 ? `+${order.items.length - 1} more` : ''}</div>
                                            <p className="font-medium text-sm text-[#242424] mb-2">
                                                ₹ {discountedPrice !== 'N/A' ? discountedPrice : 'N/A'}
                                            </p>
                                            <div className="text-[#F3A91F] font-medium font-base">{order.status || 'Pending'}</div>
                                        </div>
                                    </div>
                                    {expandedOrderId === orderId && (
                                        <div className="mt-4 flex flex-col relative gap-2">
                                            <div className="mb-2 font-semibold text-sm text-[#484848]">Order Items:</div>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 border-b py-2">
                                                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                                        {item.image ? (
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name} 
                                                                className="w-full h-full object-cover rounded"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div className="hidden items-center justify-center text-gray-400 text-xs">
                                                            <span>No Image</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-sm">{item.name}</div>
                                                        <div className="text-xs text-[#797979]">Size: {item.size}</div>
                                                        <div className="text-xs text-[#797979]">Qty: {item.quantity}</div>
                                                    </div>
                                                    <div className="font-medium text-sm">₹ {parseFloat(item.discountedPrice) * item.quantity}</div>
                                                </div>
                                            ))}
                                            <div className="mt-2 text-xs text-[#797979]">Order Date: {new Date(order.date).toLocaleString()}</div>
                                            {/* Steps */}
                                            <div className="mt-4 flex flex-col relative gap-2">
                                                {steps.map((step, index) => (
                                                    <div key={index} className="flex items-start gap-3 relative">
                                                        {/* Vertical Line (Behind Dots) */}
                                                        {index !== steps.length - 1 && (
                                                            <div
                                                                className={`absolute left-[5px] top-3 w-0.5 h-full 
                                         ${index < currentStep ? "bg-[#5C3FFF]" : "bg-gray-300"}`}
                                                            ></div>
                                                        )}

                                                        {/* Step Icon */}
                                                        <div className="relative z-10">
                                                            <div
                                                                className={`w-3 h-3 rounded-full border-2 
                                         ${index <= currentStep
                                                                    ? "bg-[#5C3FFF] border-[#5C3FFF]"
                                                                    : "bg-gray-300 border-gray-300"
                                                                }`}
                                                            ></div>
                                                        </div>

                                                        {/* Step Text */}
                                                        <span
                                                            className={`text-sm ${index <= currentStep ? "text-black font-medium" : "text-gray-500"
                                                                }`}
                                                        >
                                                            {step}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                <Footer />
            </div>
            {isOpenFilter && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex justify-center items-center z-50"
                    onClick={() => setIsOpenFilter(false)} // Close when clicking outside
                >
                    <div
                        className="bg-[#F8F8F8] w-[80%] h-full flex flex-col p-5 shadow-xl ml-auto"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <div className="flex">
                            <img src={filterColor} alt="" style={{ width: "70px", height: "40px" }} className='ml-auto' />
                        </div>

                        <div className="flex-1 pt-8 px-2 overflow-auto">
                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
                                />
                                <div className="text-sm font-semibold">Delivered</div>
                            </div>
                            <div className="pt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
                                />
                                <div className="text-sm font-semibold">Not yet shipped</div>
                            </div>
                            <div className="pt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
                                />
                                <div className="text-sm font-semibold">Cancelled</div>
                            </div>

                            <div className="text-[#797979] text-sm font-medium mt-8">
                                Filtered by date
                            </div>
                            <div className="mt-4 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
                                />
                                <div className="text-sm font-semibold">Last 30 days</div>
                            </div>
                            <div className="pt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
                                />
                                <div className="text-sm font-semibold">Last 3 months</div>
                            </div>
                            <div className="pt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
                                />
                                <div className="text-sm font-semibold">2023</div>
                            </div>
                            <div className="pt-2 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
                                />
                                <div className="text-sm font-semibold">2022</div>
                            </div>
                        </div>

                        {/* Buttons aligned at bottom */}
                        <div className="px-2 py-4">
                            <button className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px]" onClick={() => setIsOpenFilter(false)}>Apply</button>
                            <button className="text-[#242424] w-full px-4 py-2 border rounded-[50px] bg-[#EEEAFF] mt-2" onClick={() => setIsOpenFilter(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
export default Myorders;
