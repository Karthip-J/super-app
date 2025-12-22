import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RestaurantOrderTable from './RestaurantOrders/RestaurantOrderTable';
import RestaurantOrderDetailsModal from './RestaurantOrders/RestaurantOrderDetailsModal';
import RestaurantOrderDetailsViewModal from './RestaurantOrders/RestaurantOrderDetailsViewModal';

const RestaurantOrders = () => {
  const location = useLocation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [highlightOrderId, setHighlightOrderId] = useState(null);

  // Get highlight order ID from navigation state
  useEffect(() => {
    if (location.state?.highlightOrderId) {
      setHighlightOrderId(location.state.highlightOrderId);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    } else if (location.state?.orderNumber) {
      // If only orderNumber is provided, use it as highlightOrderId
      setHighlightOrderId(location.state.orderNumber);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Clear highlight after 5 seconds
  useEffect(() => {
    if (highlightOrderId) {
      const timer = setTimeout(() => {
        setHighlightOrderId(null);
      }, 10000); // Clear after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [highlightOrderId]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdate = () => {
    // Refresh the table data
    window.location.reload();
  };

  return (
    <div>
      <RestaurantOrderTable 
        onViewOrder={handleViewOrder} 
        onEditOrder={handleEditOrder}
        highlightOrderId={highlightOrderId}
      />
      <RestaurantOrderDetailsViewModal
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />
      <RestaurantOrderDetailsModal
        order={selectedOrder}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handleOrderUpdate}
      />
    </div>
  );
};

export default RestaurantOrders; 