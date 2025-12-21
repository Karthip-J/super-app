import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DeliveryHeader from '../components/DeliveryHeader.jsx';
import DeliveryBottomNav from '../components/DeliveryBottomNav.jsx';
import deliveryService from '../services/deliveries.jsx';

const DeliveryCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, dropoff, pkg, payment, customer, customerPhone, packageDetails, groceryItems } = location.state || {};
  const deliveryId = location.state?.id;
  
  const [completedDelivery, setCompletedDelivery] = useState(null);

  // Update delivery status to completed when component mounts
  useEffect(() => {
    console.log('DeliveryCompleted component mounted with pickup:', pickup, 'dropoff:', dropoff, 'deliveryId:', deliveryId);
    
    if (pickup && dropoff) {
      // Find the delivery by matching pickup and dropoff locations
      const allDeliveries = deliveryService.getDeliveries();
      console.log('All deliveries:', allDeliveries);
      
      let deliveryToComplete = null;
      
      // First try to find by ID (most reliable)
      if (deliveryId) {
        deliveryToComplete = allDeliveries.find(d => d.id === deliveryId);
        console.log('Found delivery by ID:', deliveryToComplete);
      }
      
      // If not found by ID, try to find by pickup/dropoff and active status
      if (!deliveryToComplete) {
        deliveryToComplete = allDeliveries.find(d => 
          d.pickup === pickup && d.dropoff === dropoff && d.status === 'active'
        );
        console.log('Found delivery with matching locations (active status):', deliveryToComplete);
      }
      
      // If still not found, try to find any delivery with matching locations
      if (!deliveryToComplete) {
        deliveryToComplete = allDeliveries.find(d => 
          d.pickup === pickup && d.dropoff === dropoff
        );
        console.log('Found delivery with matching locations (any status):', deliveryToComplete);
      }
      
      // If still not found, try partial matching
      if (!deliveryToComplete) {
        deliveryToComplete = allDeliveries.find(d => 
          d.pickup.includes(pickup) || pickup.includes(d.pickup) ||
          d.dropoff.includes(dropoff) || dropoff.includes(d.dropoff)
        );
        console.log('Found delivery with partial matching:', deliveryToComplete);
      }
      
      console.log('Delivery to complete:', deliveryToComplete);
      
      if (deliveryToComplete) {
        // Check if delivery is already completed
        if (deliveryToComplete.status === 'completed') {
          console.log('Delivery already completed, skipping completion');
          setCompletedDelivery(deliveryToComplete);
        } else {
          // Use the enhanced completeDelivery method
          console.log('Completing delivery:', deliveryToComplete.id);
          const result = deliveryService.completeDelivery(deliveryToComplete.id, {
            endTime: new Date().toISOString(),
            fare: payment || deliveryToComplete.fare || deliveryToComplete.payment || 0
          });
          console.log('Completion result:', result);
          window.dispatchEvent(new Event('deliveriesDataChanged'));
          setCompletedDelivery(result || deliveryToComplete);
        }
      } else {
        console.log('No matching delivery found to complete');
        console.log('Available deliveries:', allDeliveries.map(d => ({
          id: d.id,
          pickup: d.pickup,
          dropoff: d.dropoff,
          status: d.status
        })));
      }
    }
  }, [pickup, dropoff, deliveryId, payment]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount?.toLocaleString('en-IN') || '0'}`;
  };

  // Render grocery items if available
  const renderGroceryItems = () => {
    if (!groceryItems || !Array.isArray(groceryItems) || groceryItems.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">Order Items</h3>
        <div className="space-y-2">
          {groceryItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <div>
                <span className="font-medium">{item.name}</span>
                {item.quantity && item.price && (
                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                    ({item.quantity} × {formatCurrency(item.price)})
                  </span>
                )}
              </div>
              {item.total && (
                <span className="font-medium">{formatCurrency(item.total)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-yellow-50 dark:bg-gray-900 flex flex-col">
      <DeliveryHeader />
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-center p-4 overflow-y-auto" style={{ minHeight: 0, paddingBottom: '5.5rem' }}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-full max-w-md text-center mt-8" style={{ maxWidth: 340 }}>
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-lg font-bold text-yellow-700 dark:text-yellow-300 mb-2">Delivery Completed!</h2>
          
          <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm text-left">Pickup: <span className="font-medium">{pickup}</span></div>
          <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm text-left">Dropoff: <span className="font-medium">{dropoff}</span></div>
          <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm text-left">Package: <span className="font-medium">{pkg}</span></div>
          <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm text-left">Customer: <span className="font-medium">{customer}</span></div>
          {customerPhone && (
            <div className="mb-1 text-gray-700 dark:text-gray-200 text-sm text-left">Phone: <span className="font-medium">{customerPhone}</span></div>
          )}
          <div className="mb-3 text-green-700 dark:text-green-300 font-semibold text-sm text-left">Payment Received: ₹{payment}</div>
          
          {renderGroceryItems()}
          
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm mt-4"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      <DeliveryBottomNav />
    </div>
  );};

export default DeliveryCompleted; 