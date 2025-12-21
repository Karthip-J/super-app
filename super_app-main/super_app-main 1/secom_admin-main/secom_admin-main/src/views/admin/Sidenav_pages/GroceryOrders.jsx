import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GroceryOrderTable from './GroceryOrders/GroceryOrderTable';
import GroceryOrderDetailsModal from './GroceryOrders/GroceryOrderDetailsModal';
import GroceryOrderDetailsViewModal from './GroceryOrders/GroceryOrderDetailsViewModal';

const GroceryOrders = () => {
  const location = useLocation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [highlightOrderId, setHighlightOrderId] = useState(null);

  // Check if we came from order search
  useEffect(() => {
    if (location.state?.searchedOrder) {
      const { searchedOrder, highlightOrderId, orderNumber } = location.state;
      setHighlightOrderId(highlightOrderId);
      setSelectedOrder(searchedOrder);
      // Auto-open the view modal for the searched order
      setIsViewModalOpen(true);
      // Clear the location state to prevent re-triggering on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
      <GroceryOrderTable 
        onViewOrder={handleViewOrder} 
        onEditOrder={handleEditOrder}
        highlightOrderId={highlightOrderId}
      />
      <GroceryOrderDetailsViewModal
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />
      <GroceryOrderDetailsModal
        order={selectedOrder}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handleOrderUpdate}
      />
    </div>
  );
};

export default GroceryOrders; 