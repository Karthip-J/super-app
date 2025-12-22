import React, { useState } from 'react';
import HotelForm from './HotelForm';
import HotelService from './HotelService';

function Hotel() {
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setSelectedHotel(null);
    setIsEditMode(false);
    setShowForm(true);
  };

  const handleEdit = (hotel) => {
    setSelectedHotel(hotel);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      await HotelService.deleteHotel(id);
      setRefreshKey(k => k + 1);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Handle basic fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'main_image' && value instanceof File) {
          formData.append('main_image', value);
        } else if (key === 'policies' && Array.isArray(value)) {
          value.forEach(v => formData.append('policies[]', v));
        } else if (key === 'locations' && Array.isArray(value)) {
          value.forEach(v => formData.append('locations[]', v));
        } else if (key === 'amenities' && Array.isArray(value)) {
          value.forEach(v => formData.append('amenities[]', v));
        } else if (key !== 'main_image') {
          formData.append(key, value);
        }
      });
      
      if (isEditMode && selectedHotel) {
        await HotelService.updateHotel(selectedHotel.id, formData);
      } else {
        await HotelService.createHotel(formData);
      }
      
      setShowForm(false);
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error submitting hotel form:', error);
      alert('Error saving hotel. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedHotel(null);
    setIsEditMode(false);
  };

  return (
    <div className="p-4">
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4 relative">
            <HotelForm
              initialValues={selectedHotel || {}}
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

export default Hotel; 