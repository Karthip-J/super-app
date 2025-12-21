import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RoomService from './RoomService';
import API_CONFIG from '../../../config/api.config';

const initialState = {
  name: '',
  type: 'single',
  price_per_night: '',
  status: 'available',
  description: '',
  capacity: 1,
};

function RoomForm() {
  const { hotelId, roomId } = useParams();
  const [room, setRoom] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const navigate = useNavigate();
  const isEdit = Boolean(roomId);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      RoomService.getRoomById(roomId)
        .then((data) => {
          setRoom({
            name: data.name || '',
            type: data.type || 'single',
            price_per_night: data.price_per_night || '',
            status: data.status || 'available',
            description: data.description || '',
            capacity: data.capacity || '',
          });
          // Set existing images if they exist
          if (data.images && Array.isArray(data.images)) {
            setExistingImages(data.images);
          }
        })
        .catch(() => setError('Failed to load room'))
        .finally(() => setLoading(false));
    }
  }, [roomId, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoom((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imagePath) => {
    setImagesToDelete(prev => [...prev, imagePath]);
    setExistingImages(prev => prev.filter(img => img !== imagePath));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Validate capacity
    const cap = Number(room.capacity);
    if (!cap || cap < 1) {
      setError('Capacity must be at least 1');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', room.name);
      formData.append('type', room.type);
      formData.append('price_per_night', room.price_per_night);
      formData.append('status', room.status);
      formData.append('description', room.description);
      formData.append('capacity', cap);
      
      // Append new images
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Append images to delete (for edit mode)
      if (isEdit && imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      if (isEdit) {
        await RoomService.updateRoom(roomId, formData);
      } else {
        await RoomService.createRoom(hotelId, formData);
      }
      navigate(`/admin/hotels/${hotelId}/rooms`);
    } catch (err) {
      setError('Failed to save room');
    } finally {
      setLoading(false);
    }
  };

  const renderImagePreview = (file, index) => (
    <div key={index} className="relative group">
      <img
        src={URL.createObjectURL(file)}
        alt={`Preview ${index + 1}`}
        className="w-20 h-20 object-cover rounded border transition-colors"
        style={{ borderColor: 'var(--border-color)' }}
      />
      <button
        type="button"
        onClick={() => removeSelectedFile(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
      >
        ×
      </button>
    </div>
  );

  const renderExistingImage = (imagePath, index) => (
    <div key={index} className="relative group">
      <img
        src={API_CONFIG.getUrl(imagePath)}
        alt={`Room ${index + 1}`}
        className="w-20 h-20 object-cover rounded border transition-colors"
        style={{ borderColor: 'var(--border-color)' }}
      />
      <button
        type="button"
        onClick={() => removeExistingImage(imagePath)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
      >
        ×
      </button>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Edit Room' : 'Add Room'}</h1>
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4 p-6 rounded shadow transition-colors" 
        style={{ 
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 1px 3px 0 var(--shadow-color)'
        }}
        encType="multipart/form-data"
      >
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Name *</label>
          <input
            type="text"
            name="name"
            value={room.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Type *</label>
          <select
            name="type"
            value={room.type}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <option value="single" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Single</option>
            <option value="double" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Double</option>
            <option value="triple" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Triple</option>
            <option value="suite" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Suite</option>
            <option value="deluxe" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Deluxe</option>
            <option value="presidential" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Presidential</option>
          </select>
        </div>
        {/* Capacity Field */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Capacity (number of guests) *</label>
          <input
            type="number"
            name="capacity"
            value={room.capacity || ''}
            onChange={handleChange}
            required
            min="1"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Price per Night *</label>
          <input
            type="number"
            name="price_per_night"
            value={room.price_per_night}
            onChange={handleChange}
            required
            min="0"
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          />
        </div>
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Status</label>
          <select
            name="status"
            value={room.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <option value="available" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Available</option>
            <option value="occupied" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Occupied</option>
            <option value="maintenance" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Maintenance</option>
            <option value="reserved" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Reserved</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</label>
          <textarea
            name="description"
            value={room.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
            rows="3"
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Room Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          />
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Select multiple images for the room</p>
        </div>

        {/* Image Previews */}
        {(selectedFiles.length > 0 || existingImages.length > 0) && (
          <div>
            <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Image Gallery</label>
            <div className="flex flex-wrap gap-2">
              {/* Existing Images */}
              {existingImages.map((imagePath, index) => renderExistingImage(imagePath, index))}
              {/* New Selected Images */}
              {selectedFiles.map((file, index) => renderImagePreview(file, index))}
            </div>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              Click the × button to remove images. {isEdit && "Removed images will be deleted from the server."}
            </p>
          </div>
        )}

        {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Room' : 'Add Room'}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-input)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onClick={() => navigate(`/admin/hotels/${hotelId}/rooms`)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default RoomForm; 