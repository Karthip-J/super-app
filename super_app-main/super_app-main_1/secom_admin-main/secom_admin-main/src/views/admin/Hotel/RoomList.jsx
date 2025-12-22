import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { Tooltip, IconButton } from '@material-tailwind/react';
import RoomService from './RoomService';
import API_CONFIG from '../../../config/api.config';

function RoomList() {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    RoomService.getRoomsForHotel(hotelId)
      .then(setRooms)
      .catch(() => setError('Failed to fetch rooms'))
      .finally(() => setLoading(false));
  }, [hotelId]);

  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await RoomService.deleteRoom(roomId);
        // Refresh the room list
        const updatedRooms = await RoomService.getRoomsForHotel(hotelId);
        setRooms(updatedRooms);
      } catch (error) {
        console.error('Error deleting room:', error);
        setError('Failed to delete room');
      }
    }
  };

  const renderImageGallery = (images) => {
    if (!images || images.length === 0) {
      return (
        <div 
          className="w-16 h-16 rounded flex items-center justify-center text-xs transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)'
          }}
        >
          No Image
        </div>
      );
    }

    return (
      <div className="flex gap-1">
        {images.slice(0, 3).map((imagePath, index) => (
          <img
            key={index}
            src={API_CONFIG.getUrl(imagePath)}
            alt={`Room ${index + 1}`}
            className="w-12 h-12 object-cover rounded border transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
            title={`Image ${index + 1}`}
          />
        ))}
        {images.length > 3 && (
          <div 
            className="w-12 h-12 rounded border flex items-center justify-center text-xs transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              borderColor: 'var(--border-color)'
            }}
          >
            +{images.length - 3}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Room Management</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={() => navigate(`/admin/hotels/${hotelId}/rooms/new`)}
        >
          + Add Room
        </button>
      </div>
      {loading && <div style={{ color: 'var(--text-primary)' }}>Loading rooms...</div>}
      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
      {!loading && !error && rooms.length === 0 && (
        <div style={{ color: 'var(--text-secondary)' }}>No rooms found for this hotel.</div>
      )}
      {!loading && !error && rooms.length > 0 && (
        <div className="overflow-x-auto">
          <table 
            className="min-w-full border rounded shadow transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: '0 1px 3px 0 var(--shadow-color)'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <th className="py-2 px-4 border-b text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Images</th>
                <th className="py-2 px-4 border-b text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Name</th>
                <th className="py-2 px-4 border-b text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Type</th>
                <th className="py-2 px-4 border-b text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Price</th>
                <th className="py-2 px-4 border-b text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Status</th>
                <th className="py-2 px-4 border-b text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr 
                  key={room._id || room.id} 
                  className="border-b transition-colors duration-150"
                  style={{ borderColor: 'var(--border-color)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  }}
                >
                  <td className="py-2 px-4">
                    {renderImageGallery(room.images)}
                  </td>
                  <td className="py-2 px-4 font-medium" style={{ color: 'var(--text-primary)' }}>{room.name}</td>
                  <td className="py-2 px-4 capitalize" style={{ color: 'var(--text-primary)' }}>{room.type}</td>
                  <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>₹{room.price_per_night}/night</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      room.status === 'available' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      room.status === 'occupied' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex space-x-2">
                      <Tooltip content="Edit Room">
                        <IconButton
                          variant="text"
                          color="blue-gray"
                          onClick={() => navigate(`/admin/hotels/${hotelId}/rooms/edit/${room._id}`)}
                        >
                          <FaEdit className="text-lg" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip content="Delete Room">
                        <IconButton
                          variant="text"
                          color="red"
                          onClick={() => handleDelete(room._id)}
                        >
                          <FaTrashAlt className="text-lg" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RoomList; 