import React, { useState, useEffect } from 'react';
import deliveryService from '../services/deliveries.jsx';

const DeliveryDebug = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);

  const loadData = () => {
    const allDeliveries = deliveryService.reloadFromStorage();
    const active = deliveryService.getActiveDelivery();
    setDeliveries(allDeliveries);
    setActiveDelivery(active);
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

  const createTestDelivery = () => {
    const newDelivery = deliveryService.createDelivery({
      pickup: 'Test Pickup Location',
      dropoff: 'Test Dropoff Location',
      customer: 'Test Customer',
      package: 'Test Package',
      payment: 100,
      distance: '5 km',
      estimatedTime: '20 mins'
    });
    console.log('Created test delivery:', newDelivery);
  };

  const startTestDelivery = () => {
    const pendingDelivery = deliveries.find(d => d.status === 'pending');
    if (pendingDelivery) {
      const result = deliveryService.startDelivery(pendingDelivery.id);
      console.log('Started test delivery:', result);
    } else {
      console.log('No pending delivery found');
    }
  };

  const completeTestDelivery = () => {
    const activeDelivery = deliveries.find(d => d.status === 'active');
    if (activeDelivery) {
      const result = deliveryService.completeDelivery(activeDelivery.id, {
        rating: 5,
        paymentMethod: 'cash'
      });
      console.log('Completed test delivery:', result);
    } else {
      console.log('No active delivery found');
    }
  };

  const cancelTestDelivery = () => {
    const activeDelivery = deliveries.find(d => d.status === 'active');
    if (activeDelivery) {
      const result = deliveryService.cancelDelivery(activeDelivery.id, 'Test cancellation');
      console.log('Cancelled test delivery:', result);
    } else {
      console.log('No active delivery found');
    }
  };

  const resetData = () => {
    deliveryService.resetToInitialState();
    console.log('Reset delivery data');
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-4">Delivery Debug Panel</h3>
      
      {/* Current State */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Current State:</h4>
        <div className="text-sm space-y-1">
          <div>Total Deliveries: {deliveries.length}</div>
          <div>Active Deliveries: {deliveries.filter(d => d.status === 'active').length}</div>
          <div>Pending Deliveries: {deliveries.filter(d => d.status === 'pending').length}</div>
          <div>Completed Deliveries: {deliveries.filter(d => d.status === 'completed').length}</div>
          <div>Cancelled Deliveries: {deliveries.filter(d => d.status === 'cancelled').length}</div>
          <div>Active Delivery ID: {activeDelivery?.id || 'None'}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 mb-4">
        <button
          onClick={createTestDelivery}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
        >
          Create Test Delivery
        </button>
        <button
          onClick={startTestDelivery}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded text-sm"
        >
          Start Test Delivery
        </button>
        <button
          onClick={completeTestDelivery}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm"
        >
          Complete Test Delivery
        </button>
        <button
          onClick={cancelTestDelivery}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded text-sm"
        >
          Cancel Test Delivery
        </button>
        <button
          onClick={resetData}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-sm"
        >
          Reset All Data
        </button>
      </div>

      {/* Recent Deliveries */}
      <div>
        <h4 className="font-medium mb-2">Recent Deliveries:</h4>
        <div className="space-y-2">
          {deliveries.slice(0, 3).map((delivery) => (
            <div key={delivery.id} className="text-xs bg-white dark:bg-gray-700 p-2 rounded">
              <div className="flex justify-between">
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
              <div className="text-gray-600">
                {delivery.pickup} → {delivery.dropoff}
              </div>
              <div className="text-gray-500">
                ₹{delivery.payment || delivery.fare || 0}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeliveryDebug; 