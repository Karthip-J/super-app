import React, { useState } from 'react';
import DeliveryHeader from '../components/DeliveryHeader.jsx';
import DeliveryBottomNav from '../components/DeliveryBottomNav.jsx';
import { useNavigate } from 'react-router-dom';
import deliveryService from '../services/deliveries.jsx';

const GoOnline = () => {
  // Dummy delivery requests
  const [requests, setRequests] = useState([
    {
      id: 1,
      package: 'Food Delivery',
      pickup: 'Pizza Hut, T Nagar',
      pickupType: 'restaurant',
      dropoff: 'Ramesh, Anna Nagar',
      dropoffType: 'customer',
      payment: 45,
      customer: 'Ramesh',
      customerPhone: '+91 98765 43210',
    },
    {
      id: 2,
      package: 'Grocery',
      pickup: 'Big Bazaar, Velachery',
      pickupType: 'merchant',
      dropoff: 'Priya, Adyar',
      dropoffType: 'customer',
      payment: 60,
      customer: 'Priya',
      customerPhone: '+91 98765 43211',
    },
    {
      id: 3,
      package: 'Parcel',
      pickup: 'DTDC, Nungambakkam',
      pickupType: 'merchant',
      dropoff: 'Swiggy, Mylapore',
      dropoffType: 'customer',
      payment: 35,
      customer: 'Swiggy',
      customerPhone: '+91 98765 43212',
    },
    {
      id: 4,
      package: 'Food Delivery',
      pickup: 'KFC, T Nagar',
      pickupType: 'restaurant',
      dropoff: 'Arun, Anna Nagar',
      dropoffType: 'customer',
      payment: 55,
      customer: 'Arun',
      customerPhone: '+91 98765 43213',
    },
    {
      id: 5,
      package: 'Grocery',
      pickup: 'Reliance Fresh, Velachery',
      pickupType: 'merchant',
      dropoff: 'Meera, Adyar',
      dropoffType: 'customer',
      payment: 70,
      customer: 'Meera',
      customerPhone: '+91 98765 43214',
    },
    {
      id: 6,
      package: 'Medicine',
      pickup: 'Apollo Pharmacy, Mylapore',
      pickupType: 'merchant',
      dropoff: 'Rajesh, Besant Nagar',
      dropoffType: 'customer',
      payment: 40,
      customer: 'Rajesh',
      customerPhone: '+91 98765 43215',
    },
    {
      id: 7,
      package: 'Food Delivery',
      pickup: 'Domino\'s, Nungambakkam',
      pickupType: 'restaurant',
      dropoff: 'Sita, Teynampet',
      dropoffType: 'customer',
      payment: 50,
      customer: 'Sita',
      customerPhone: '+91 98765 43216',
    },
    {
      id: 8,
      package: 'Electronics',
      pickup: 'Croma, Phoenix MarketCity',
      pickupType: 'merchant',
      dropoff: 'Vikram, OMR',
      dropoffType: 'customer',
      payment: 85,
      customer: 'Vikram',
      customerPhone: '+91 98765 43217',
    },
    {
      id: 9,
      package: 'Food Delivery',
      pickup: 'Subway, Marina Beach',
      pickupType: 'restaurant',
      dropoff: 'Lakshmi, Triplicane',
      dropoffType: 'customer',
      payment: 45,
      customer: 'Lakshmi',
      customerPhone: '+91 98765 43218',
    },
    {
      id: 10,
      package: 'Grocery',
      pickup: 'Spencer\'s, Express Avenue',
      pickupType: 'merchant',
      dropoff: 'Kumar, Royapettah',
      dropoffType: 'customer',
      payment: 65,
      customer: 'Kumar',
      customerPhone: '+91 98765 43219',
    },
    {
      id: 11,
      package: 'Parcel',
      pickup: 'Blue Dart, Guindy',
      pickupType: 'merchant',
      dropoff: 'Deepa, Saidapet',
      dropoffType: 'customer',
      payment: 30,
      customer: 'Deepa',
      customerPhone: '+91 98765 43220',
    },
    {
      id: 12,
      package: 'Food Delivery',
      pickup: 'McDonald\'s, Chromepet',
      pickupType: 'restaurant',
      dropoff: 'Ganesh, Tambaram',
      dropoffType: 'customer',
      payment: 55,
      customer: 'Ganesh',
      customerPhone: '+91 98765 43221',
    },
    {
      id: 13,
      package: 'Medicine',
      pickup: 'MedPlus, Kilpauk',
      pickupType: 'merchant',
      dropoff: 'Radha, Perambur',
      dropoffType: 'customer',
      payment: 35,
      customer: 'Radha',
      customerPhone: '+91 98765 43222',
    },
    {
      id: 14,
      package: 'Food Delivery',
      pickup: 'Burger King, Vadapalani',
      pickupType: 'restaurant',
      dropoff: 'Mohan, Ashok Nagar',
      dropoffType: 'customer',
      payment: 50,
      customer: 'Mohan',
      customerPhone: '+91 98765 43223',
    },
    {
      id: 15,
      package: 'Grocery',
      pickup: 'Nilgiris, Alandur',
      pickupType: 'merchant',
      dropoff: 'Anita, St. Thomas Mount',
      dropoffType: 'customer',
      payment: 60,
      customer: 'Anita',
      customerPhone: '+91 98765 43224',
    }
  ]);
  const [acceptedId, setAcceptedId] = useState(null);
  const navigate = useNavigate();

  const handleAccept = (id) => {
    setAcceptedId(id);
    const req = requests.find(r => r.id === id);
    if (req) {
      // Add sample grocery items for grocery orders
      const groceryItems = req.package === 'Grocery' ? [
        { name: 'Apples', quantity: 2, price: 25, total: 50 },
        { name: 'Bananas', quantity: 1, price: 30, total: 30 },
        { name: 'Oranges', quantity: 3, price: 20, total: 60 }
      ] : [];
      
      // Create a pending delivery in the service
      const newDelivery = deliveryService.createDelivery({
        pickup: req.pickup,
        dropoff: req.dropoff,
        package: req.package,
        payment: req.payment,
        customer: req.customer,
        customerPhone: req.customerPhone,
        pickupType: req.pickupType,
        dropoffType: req.dropoffType,
        groceryItems: groceryItems,
        status: 'pending',
      });
      // Navigate to pickup page with the new delivery's ID
      navigate('/delivery-navigate-to-pickup', { 
        state: { 
          id: newDelivery.id,
          pickup: newDelivery.pickup, 
          dropoff: newDelivery.dropoff, 
          package: newDelivery.package, 
          payment: newDelivery.payment, 
          customer: newDelivery.customer,
          customerPhone: newDelivery.customerPhone,
          pickupType: newDelivery.pickupType,
          dropoffType: newDelivery.dropoffType,
          groceryItems: groceryItems,
          otp: newDelivery.otp // Pass OTP to the next screen
        } 
      });
    }
  };
  return (
    <div className="min-h-screen bg-yellow-50 dark:bg-gray-900 flex flex-col">
      <DeliveryHeader />
      <main className="flex-1 pt-4 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-2">Delivery Map</h2>
            <p className="text-gray-700 dark:text-gray-200">You are now online and ready to accept delivery requests!</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-200 mb-4">Available Delivery Requests</h3>
            {requests.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-sm">No delivery requests yet. Waiting for new delivery orders...</div>
            )}
            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className="border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex flex-col gap-2 bg-yellow-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">{req.package}</span>
                    <span className="ml-auto text-green-700 dark:text-green-300 font-semibold">₹{req.payment}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Pickup: <span className="font-medium">{req.pickup}</span></div>
                  <div className="text-sm text-gray-700 dark:text-gray-200">Dropoff: <span className="font-medium">{req.dropoff}</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Customer: {req.customer}</div>
                  <button
                    className={`mt-2 px-4 py-2 rounded-lg font-semibold transition-colors w-full ${acceptedId === req.id ? 'bg-green-500 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'}`}
                    onClick={() => handleAccept(req.id)}
                    disabled={acceptedId !== null}
                  >
                    {acceptedId === req.id ? 'Accepted' : 'Accept'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <DeliveryBottomNav />
    </div>
  );
};

export default GoOnline; 