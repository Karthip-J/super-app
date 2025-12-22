import React, { useState, useEffect } from 'react';
import taxiService from '../../../services/taxiService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';

const TaxiVehicleTable = () => {
  const [taxiVehicles, setTaxiVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaxiVehicles = async () => {
      try {
        const response = await taxiService.getAllTaxiVehicles();
        if (response.success) {
          setTaxiVehicles(response.data);
        } else {
          setError(response.message || 'Failed to fetch taxi vehicles');
          toast.error(response.message || 'Failed to fetch taxi vehicles');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch taxi vehicles';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchTaxiVehicles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this taxi vehicle?')) {
      try {
        const response = await taxiService.deleteTaxiVehicle(id);
        if (response.success) {
          setTaxiVehicles(taxiVehicles.filter((vehicle) => vehicle.id !== id));
          toast.success('Taxi vehicle deleted successfully');
        } else {
          toast.error(response.message || 'Failed to delete taxi vehicle');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete taxi vehicle');
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'inactive':
        return 'Inactive';
      case 'active':
        return 'Active';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  };

  if (loading) return <div className="flex justify-center items-center h-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>{error}</div>;

  return (
    <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Taxi Vehicles</h2>
        <Link
          to="/admin/taxi-vehicles/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add Taxi Vehicle
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table 
          className="min-w-full border transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Driver</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Make</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Model</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Plate Number</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Color</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Status</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Created At</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxiVehicles.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-2 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No taxi vehicles found
                </td>
              </tr>
            ) : (
              taxiVehicles.map((vehicle) => (
                <tr 
                  key={vehicle.id} 
                  className="border-b transition-colors duration-150"
                  style={{ borderColor: 'var(--border-color)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  }}
                >
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{vehicle.driver_id?.name || 'N/A'}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{vehicle.make}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{vehicle.model}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{vehicle.vehicle_number}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{vehicle.color}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vehicle.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                        vehicle.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {getStatusText(vehicle.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>{formatDate(vehicle.createdAt || vehicle.created_at)}</td>
                  <td className="px-11 py-2 w-28">
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
                        aria-label={`Actions for ${vehicle.vehicle_number}`}
                      >
                        <FaEllipsisV />
                      </button>
                      <div
                        className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                      >
                        <Link
                          to={`/admin/taxi-vehicles/edit/${vehicle.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          aria-label={`Edit ${vehicle.vehicle_number}`}
                        >
                          <FaEdit />
                        </Link>
                        {/* <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          aria-label={`Delete ${vehicle.vehicle_number}`}
                        >
                          <FaTrashAlt />
                        </button> */}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxiVehicleTable;