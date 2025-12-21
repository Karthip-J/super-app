import React, { useEffect, useState } from 'react';
import amenityService from './amenityService';

function AmenityTable({ onAdd, onEdit }) {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const response = await amenityService.getAllAmenities();
      setAmenities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this amenity?')) {
      await amenityService.deleteAmenity(id);
      fetchAmenities();
    }
  };

  const handleToggleStatus = async (id) => {
    await amenityService.toggleStatus(id);
    fetchAmenities();
  };

  const filteredAmenities = amenities.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search amenities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-2 py-1 rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onAdd}>
          Add Amenity
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Status</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAmenities.map(amenity => (
              <tr key={amenity.id}>
                <td className="border px-2 py-1">{amenity.name}</td>
                <td className="border px-2 py-1">
                  <button
                    className={amenity.status ? 'text-green-600' : 'text-gray-400'}
                    onClick={() => handleToggleStatus(amenity.id)}
                  >
                    {amenity.status ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="border px-2 py-1">
                  <button className="text-blue-600 mr-2" onClick={() => onEdit(amenity)}>Edit</button>
                  <button className="text-red-600" onClick={() => handleDelete(amenity.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AmenityTable; 