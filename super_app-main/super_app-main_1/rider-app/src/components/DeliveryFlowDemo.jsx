import React, { useState, useEffect } from 'react';
import deliveryService from '../services/deliveries.jsx';

const DeliveryFlowDemo = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({});

  const loadData = () => {
    const allDeliveries = deliveryService.reloadFromStorage();
    const deliveryStats = deliveryService.getDeliveryStats();
    setDeliveries(allDeliveries);
    setStats(deliveryStats);
  };

  useEffect(() => {
    loadData();
    
    const handleDeliveriesChanged = () => {
      loadData();
    };
    
    window.addEventListener('deliveriesDataChanged', handleDeliveriesChanged);
    
    return () => {
      window.removeEventListener('deliveriesDataChanged', handleDeliveriesChanged);
    };
  }, []);

  const createSampleDelivery = () => {
    const newDelivery = deliveryService.createDelivery({
      pickup: 'Pizza Hut, T Nagar',
      dropoff: 'Customer, Anna Nagar',
      customer: 'Demo Customer',
      package: 'Food Delivery',
      payment: 50,
      distance: '3.2 km',
      estimatedTime: '15 mins',
      priority: 'medium'
    });
    console.log('Created delivery:', newDelivery);
  };

  const startDelivery = () => {
    const pendingDelivery = deliveries.find(d => d.status === 'pending');
    if (pendingDelivery) {
      deliveryService.startDelivery(pendingDelivery.id);
      console.log('Started delivery:', pendingDelivery.id);
    } else {
      console.log('No pending delivery found');
    }
  };

  const completeDelivery = () => {
    const activeDelivery = deliveries.find(d => d.status === 'active');
    if (activeDelivery) {
      deliveryService.completeDelivery(activeDelivery.id, {
        rating: 5,
        paymentMethod: 'cash'
      });
      console.log('Completed delivery:', activeDelivery.id);
    } else {
      console.log('No active delivery found');
    }
  };

  const cancelDelivery = () => {
    const activeDelivery = deliveries.find(d => d.status === 'active');
    if (activeDelivery) {
      deliveryService.cancelDelivery(activeDelivery.id, 'Demo cancellation');
      console.log('Cancelled delivery:', activeDelivery.id);
    } else {
      console.log('No active delivery found');
    }
  };

  const resetData = () => {
    deliveryService.resetToInitialState();
    console.log('Reset delivery data');
  };

  const addSampleData = () => {
    deliveryService.addSampleData();
    console.log('Added sample data');
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Delivery Flow Demo</h3>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-xl font-bold">{stats.total || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-xl font-bold text-green-600">{stats.active || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-xl font-bold text-blue-600">{stats.completed || 0}</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded">
          <div className="text-sm text-gray-600">Cancelled</div>
          <div className="text-xl font-bold text-red-600">{stats.cancelled || 0}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 mb-4">
        <button
          onClick={createSampleDelivery}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Create Sample Delivery
        </button>
        <button
          onClick={startDelivery}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
        >
          Start Delivery (Pending → Active)
        </button>
        <button
          onClick={completeDelivery}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Complete Delivery (Active → Completed)
        </button>
        <button
          onClick={cancelDelivery}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Cancel Delivery (Active → Cancelled)
        </button>
        <button
          onClick={addSampleData}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
        >
          Add Sample Data
        </button>
        <button
          onClick={resetData}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
        >
          Reset All Data
        </button>
      </div>

      {/* Current Deliveries */}
      <div className="bg-white dark:bg-gray-700 p-4 rounded">
        <h4 className="font-semibold mb-2">Current Deliveries</h4>
        {deliveries.length === 0 ? (
          <p className="text-gray-500">No deliveries</p>
        ) : (
          <div className="space-y-2">
            {deliveries.slice(0, 5).map((delivery) => (
              <div key={delivery.id} className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">#{delivery.id}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    delivery.status === 'active' ? 'bg-green-100 text-green-800' :
                    delivery.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    delivery.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {delivery.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {delivery.pickup} → {delivery.dropoff}
                </div>
                <div className="text-sm text-gray-500">
                  ₹{delivery.payment || delivery.fare || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryFlowDemo; 