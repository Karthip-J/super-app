import React, { useState } from 'react';
import AmenityTable from './AmenityTable';
import AmenityForm from './AmenityForm';
import amenityService from './amenityService';

function Amenity() {
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setSelectedAmenity(null);
    setIsEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (amenity) => {
    setSelectedAmenity(amenity);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    if (isEditMode && selectedAmenity) {
      await amenityService.updateAmenity(selectedAmenity.id, data);
    } else {
      await amenityService.createAmenity(data);
    }
    setShowForm(false);
    setRefreshKey(k => k + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedAmenity(null);
    setIsEditMode(false);
  };

  return (
    <div className="p-4">
      <AmenityTable
        key={refreshKey}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-4 relative">
            <AmenityForm
              initialValues={selectedAmenity || { status: true }}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isEditMode={isEditMode}
            />
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={handleCancel}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Amenity; 