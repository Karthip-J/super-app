import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, MapPin, Search } from 'lucide-react';
import FooterFood from '../ComponentsF/FooterFood';
import { foodOrderService, formatImageUrl, formatCurrency } from '../../services/foodDeliveryService';

function OrdersHistoryFood() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(null); // Track open order index
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [locationAddress, setLocationAddress] = useState('Set your location');

  // Address bar state/logic
  const handleSetLocation = () => {
    const newAddress = prompt('Enter your delivery address:');
    if (newAddress && newAddress.trim()) {
      localStorage.setItem('userAddress', newAddress.trim());
      setLocationAddress(newAddress.trim());
    }
  };

  useEffect(() => {
    const address = localStorage.getItem('userAddress');
    if (address) {
      setLocationAddress(address);
    }
  }, []);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userEmail = localStorage.getItem('userEmail');
        
        // If user is not properly authenticated OR using demo token, show empty orders
        // This ensures brand new users and demo sessions don't see seeded/shared history
        if (!token || !isLoggedIn || !userEmail || token === 'demo-token') {
          setOrders([]);
          setLoading(false);
          return;
        }
        
        const res = await foodOrderService.getUserFoodOrders();
        
        // Handle unauthorized access
        if (res.success === false && (res.message?.includes('Unauthorized') || res.message?.includes('Not logged in'))) {
          // Invalid or expired token - clear it and show empty orders
          localStorage.removeItem('token');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userEmail');
          setOrders([]);
          setLoading(false);
          return;
        }
        
        if (res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setError(res.message || 'Could not fetch orders.');
          setOrders([]);
        }
      } catch (err) {
        console.error('Error fetching food orders:', err);
        setError(err.message || 'Could not fetch orders.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  return (
    <div className='bg-gray-50 min-h-screen flex flex-col'>
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gray-800">Foodie</span>
            </div>
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={handleSetLocation}
                className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors w-full sm:w-auto"
              >
                <MapPin size={16} className="text-green-600" />
                <span className="text-sm font-medium max-w-[120px] sm:max-w-[180px] truncate">
                  {locationAddress}
                </span>
                <ChevronDown size={16} className="text-gray-500" />
              </button>
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/signin')}
            className="text-gray-700 hover:text-green-600 text-sm font-medium"
          >
            Sign in
          </button>
        </div>
      </header>
      <div className='px-4 pt-24 pb-28 max-w-6xl mx-auto'>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className='text-xl font-bold text-gray-800 mb-4 sm:mb-0'>Your Orders</h2>
          <button 
            onClick={() => setIsOpenFilter(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
          >
            <span className="text-sm">Filter</span>
          </button>
        </div>
        {/* Loading/Error States */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <span className="ml-4 text-gray-500">Loading your orders...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No orders found.</div>
        ) : (
          orders.map((order, idx) => (
            <div key={order._id || idx} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-full sm:w-24 h-24 flex-shrink-0">
                  <div className="w-full h-full bg-orange-50 rounded-lg flex items-center justify-center">
                    <img 
                      src={formatImageUrl(order.items?.[0]?.dish_id?.image)} 
                      alt={order.items?.[0]?.dish_id?.name || 'Dish'} 
                      className="w-16 h-16 object-contain" 
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start">
                    <span className="text-green-600 font-medium">{order.order_number || order._id}</span>
                    <span className="text-gray-500 text-xs mt-2 sm:mt-0">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800 mt-1">{order.items?.map(item => item.dish_id?.name).join(', ')}</h3>
                  <p className="text-gray-700 font-medium mt-1">{formatCurrency(order.total_amount)}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status || 'pending'}
                  </span>
                  <button 
                    onClick={() => setIsOpen(isOpen === idx ? null : idx)}
                    className="text-green-600 font-medium mt-2 hover:text-green-700 block"
                  >
                    {isOpen === idx ? 'Hide details' : 'View items'}
                  </button>
                </div>
              </div>
              {/* Order Items Details */}
              {isOpen === idx && (
                <div className="mt-4 border-t pt-4 space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-700">Items</h4>
                    <ul>
                      {order.items?.map((item, i) => (
                        <li key={item._id || i} className="flex items-center gap-3 mb-2">
                          <img src={formatImageUrl(item.dish_id?.image)} alt={item.dish_id?.name || 'Dish'} className="w-10 h-10 object-contain rounded" />
                          <span className="flex-1">{item.dish_id?.name}</span>
                          <span>x{item.quantity}</span>
                          <span>{formatCurrency(item.price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Driver Details - Show only once when order is out for delivery or delivered */}
                  {(order.status === 'out_for_delivery' || order.status === 'delivered') && 
                   order.delivery_partner && 
                   (order.delivery_partner.name || order.delivery_partner.phone || order.delivery_partner.vehicle_number) && (
                    <div key={`driver-${order._id}`} className="border-t pt-4">
                      <h4 className="font-semibold mb-2 text-gray-700">Driver Details</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        {order.delivery_partner.name && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Driver Name:</span>
                            <span className="text-gray-800 font-medium text-sm">{order.delivery_partner.name}</span>
                          </div>
                        )}
                        {order.delivery_partner.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Phone:</span>
                            <span className="text-gray-800 font-medium text-sm">{order.delivery_partner.phone}</span>
                          </div>
                        )}
                        {order.delivery_partner.vehicle_number && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-sm">Vehicle Number:</span>
                            <span className="text-gray-800 font-medium text-sm">{order.delivery_partner.vehicle_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* OTP - Show only once when order is out for delivery */}
                  {order.status === 'out_for_delivery' && 
                   order.delivery_otp && 
                   typeof order.delivery_otp === 'string' && 
                   order.delivery_otp.trim() !== '' && (
                    <div key={`otp-${order._id}`} className="border-t pt-4">
                      <h4 className="font-semibold mb-2 text-gray-700">Delivery OTP</h4>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-sm">OTP:</span>
                          <span className="text-orange-600 font-bold text-lg">{order.delivery_otp}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">Share this OTP with the driver to confirm delivery</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <FooterFood />
      {/* Filter Modal (kept for future use) */}
      {isOpenFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div 
            className="bg-white w-full max-w-sm h-full p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Filters</h3>
              <button onClick={() => setIsOpenFilter(false)}>
                <X className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Order Status</h4>
                <div className="space-y-2">
                  {['Delivered', 'Not yet shipped', 'Cancelled'].map((status) => (
                    <label key={status} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Filter by date</h4>
                <div className="space-y-2">
                  {['Last 30 days', 'Last 3 months', '2023', '2022'].map((date) => (
                    <label key={date} className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-700">{date}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <button 
                onClick={() => setIsOpenFilter(false)}
                className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply Filters
              </button>
              <button 
                onClick={() => setIsOpenFilter(false)}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersHistoryFood;