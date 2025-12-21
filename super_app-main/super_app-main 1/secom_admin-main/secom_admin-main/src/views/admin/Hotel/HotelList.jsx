import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaHome, FaTrashAlt, FaEllipsisV } from 'react-icons/fa'; // Changed Fi icons to Fa equivalents
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HotelService from './HotelService';
import API_CONFIG from '../../../config/api.config';

function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_CONFIG.getUrl(path);
}

function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [roomPrices, setRoomPrices] = useState({}); // { hotelId: minPrice }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // Delete confirmation dialog
  const [hotelIdToDelete, setHotelIdToDelete] = useState(null); // Track hotel to delete
  const [isDeleting, setIsDeleting] = useState(false); // Deletion loading state
  const navigate = useNavigate();

  // Fetch hotels and room prices
  useEffect(() => {
    setLoading(true);
    setError(null);
    HotelService.getAllHotels()
      .then(async (data) => {
        setHotels(data);
        const prices = {};
        await Promise.all(
          data.map(async (hotel) => {
            try {
              const rooms = await HotelService.getRoomsForHotel(hotel._id || hotel.id);
              if (rooms && rooms.length > 0) {
                const minPrice = Math.min(...rooms.map((r) => r.price_per_night || 0));
                prices[hotel._id || hotel.id] = minPrice;
              } else {
                prices[hotel._id || hotel.id] = null;
              }
            } catch {
              prices[hotel._id || hotel.id] = null;
            }
          })
        );
        setRoomPrices(prices);
      })
      .catch((err) => {
        setError('Failed to fetch hotels');
        toast.error('Failed to fetch hotels');
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle delete action
  const handleDeleteRow = (hotelId) => {
    setHotelIdToDelete(hotelId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirmation = async () => {
    setIsDeleting(true);
    try {
      await HotelService.deleteHotel(hotelIdToDelete);
      toast.success('Hotel deleted successfully!');
      setHotels((prevHotels) => prevHotels.filter((hotel) => (hotel._id || hotel.id) !== hotelIdToDelete));
      setRoomPrices((prevPrices) => {
        const newPrices = { ...prevPrices };
        delete newPrices[hotelIdToDelete];
        return newPrices;
      });
      setOpenDeleteDialog(false);
      setHotelIdToDelete(null);
    } catch (error) {
      toast.error('Failed to delete hotel. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
    setHotelIdToDelete(null);
  };

  return (
    <div className="p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Hotel Management</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center transition-colors duration-150 dark:bg-blue-500 dark:hover:bg-blue-600"
          onClick={() => navigate('/admin/hotels/new')}
          aria-label="Add new hotel"
        >
          + Add Hotel
        </button>
      </div>
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
        </div>
      )}
      {error && <div className="text-red-600 dark:text-red-400">{error}</div>}
      {!loading && !error && hotels.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No hotels found.</div>}
      {!loading && !error && hotels.length > 0 && (
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
              <th className="py-2 px-4 border-b text-left text-xs font-medium uppercase transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Image</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium uppercase transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Name</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium uppercase transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Address</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium uppercase transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Amenities</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium uppercase transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Policies</th>
              <th className="py-2 px-4 border-b text-left text-xs font-medium uppercase transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Price</th>
              <th className="py-2 px-4 border-b text-center text-xs font-medium uppercase transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => {
              const hotelId = hotel._id || hotel.id;
              const price = roomPrices[hotelId];
              return (
                <tr 
                  key={hotelId} 
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
                    {hotel.main_image ? (
                      <img
                        src={getImageUrl(hotel.main_image)}
                        alt={hotel.name}
                        className="w-16 h-16 object-cover rounded border transition-colors"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>No Image</span>
                    )}
                  </td>
                  <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{hotel.name}</td>
                  <td className="py-2 px-4" style={{ color: 'var(--text-primary)' }}>{hotel.address?.city || hotel.address || '-'}</td>
                  <td className="py-2 px-4">
                    {hotel.amenities && hotel.amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={amenity._id || index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200"
                          >
                            {amenity.name}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded-full dark:bg-gray-700 dark:text-gray-200" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                            +{hotel.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>No amenities</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {hotel.policies && hotel.policies.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {hotel.policies.slice(0, 3).map((policy, index) => (
                          <span
                            key={policy._id || index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900 dark:text-green-200"
                          >
                            {policy.title}
                          </span>
                        ))}
                        {hotel.policies.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded-full dark:bg-gray-700 dark:text-gray-200" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                            +{hotel.policies.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>No policies</span>
                    )}
                  </td>
                  <td className="py-2 px-4 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {price === undefined ? (
                      <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>
                    ) : price === null ? (
                      <span style={{ color: 'var(--text-secondary)' }}>No rooms</span>
                    ) : (
                      <span>From ₹{price}/night</span>
                    )}
                  </td>
                  <td className="py-2 px-11 w-28">
                    <div className="relative inline-block group">
                      <button
                        className="transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                        aria-label={`Actions for ${hotel.name}`}
                      >
                        <FaEllipsisV />
                      </button>
                      <div
                        className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                      >
                        <button
                          onClick={() => navigate(`/admin/hotels/edit/${hotelId}`)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          aria-label={`Edit hotel ${hotel.name}`}
                          title="Edit"
                        >
                          <FaEdit /> 
                        </button>
                        <button
                          onClick={() => navigate(`/admin/hotels/${hotelId}/rooms`)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                          aria-label={`Manage rooms for ${hotel.name}`}
                          title="Manage Rooms"
                        >
                          <FaHome /> 
                        </button>
                        <button
                          onClick={() => handleDeleteRow(hotelId)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          aria-label={`Delete hotel ${hotel.name}`}
                          title="Delete"
                        >
                          <FaTrashAlt /> 
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {openDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div 
            className="rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Confirm Delete</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete this hotel? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancelDelete}
                className="px-6 py-2 border rounded-md transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmation}
                disabled={isDeleting}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors dark:bg-red-500 dark:hover:bg-red-600"
                aria-label="Confirm deletion"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HotelList;