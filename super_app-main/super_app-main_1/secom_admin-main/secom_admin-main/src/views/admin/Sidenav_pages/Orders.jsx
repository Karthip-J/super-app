import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OrderTable from './Orders/OrderTable';
import OrderDetailsModal from './Orders/OrderDetailsModal';
import OrderDetailsViewModal from './Orders/OrderDetailsViewModal';

const Orders = () => {
  const location = useLocation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [highlightOrderId, setHighlightOrderId] = useState(null);
  const tableRef = useRef(null);

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

  const handleOrderUpdate = (updatedOrder) => {
    // Update the selected order with new data
    if (updatedOrder) {
      setSelectedOrder(updatedOrder);
    }
    // Trigger table refresh if table has a refresh method
    if (tableRef.current && typeof tableRef.current.refresh === 'function') {
      tableRef.current.refresh();
    }
    // Force re-render by updating a key or state
    // The OrderTable should handle its own refresh via useEffect or similar
  };

  return (
    <div>
      <OrderTable 
        ref={tableRef}
        onViewOrder={handleViewOrder} 
        onEditOrder={handleEditOrder}
        highlightOrderId={highlightOrderId}
      />
      <OrderDetailsViewModal
        order={selectedOrder}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUpdate={handleOrderUpdate}
      />
    </div>
  );
};

export default Orders; 