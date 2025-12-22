import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';
import PorterVehicleService from '../../../../services/porterVehicleService';

const PorterVehicleTable = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await PorterVehicleService.getAllVehicles();
      if (response.success) {
        setVehicles(response.data);
      } else {
        setError(response.message || 'Failed to fetch vehicles');
        toast.error(response.message || 'Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch vehicles';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (vehicleId, newStatus) => {
    try {
      const response = await PorterVehicleService.updateVehicleStatus(vehicleId, { status: newStatus });
      if (response.success) {
        toast.success('Vehicle status updated successfully');
        fetchVehicles();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const response = await PorterVehicleService.deleteVehicle(vehicleId);
        if (response.success) {
          toast.success('Vehicle deleted successfully');
          fetchVehicles();
        } else {
          toast.error(response.message || 'Failed to delete vehicle');
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Bike': return 'bg-blue-100 text-blue-800';
      case 'Auto': return 'bg-orange-100 text-orange-800';
      case 'Mini-Truck': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  };

  if (loading) return (
    <div 
      className="flex justify-center items-center h-full transition-colors duration-300"
      style={{ color: 'var(--text-primary)' }}
    >
      Loading...
    </div>
  );
  if (error) return (
    <div 
      className="text-red-500 dark:text-red-400 text-center transition-colors duration-300"
    >
      {error}
    </div>
  );

  return (
    <div 
      className="p-4 transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 
          className="text-2xl font-bold transition-colors duration-300"
          style={{ color: 'var(--text-primary)' }}
        >
          Porter Vehicles
        </h2>
        <Link
          to="/admin/porter-vehicles/new"
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
        >
          Add Porter Vehicle
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table 
          className="min-w-full border transition-colors duration-300"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <thead>
            <tr 
              className="transition-colors duration-300"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Driver
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Vehicle Number
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Make
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Model
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Type
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Capacity
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Status
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Created At
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td 
                  colSpan="9" 
                  className="px-4 py-2 text-center transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  No porter vehicles found
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr 
                  key={vehicle._id} 
                  className="border-b transition-colors duration-150 hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <div>
                      <div 
                        className="font-medium transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {vehicle.driver_id?.name || 'Unassigned'}
                      </div>
                      <div 
                        className="text-sm transition-colors duration-300"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {vehicle.driver_id?.phone || ''}
                      </div>
                    </div>
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {vehicle.vehicle_number}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {vehicle.make}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {vehicle.model}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(vehicle.vehicle_type)} dark:bg-opacity-20`}>
                      {vehicle.vehicle_type}
                    </span>
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {vehicle.capacity} persons
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)} dark:bg-opacity-20`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {formatDate(vehicle.createdAt)}
                  </td>
                  <td className="px-11 py-2 w-28">
                    <div className="relative inline-block group">
                      <button 
                        className="transition-colors duration-300 focus:outline-none"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <FaEllipsisV />
                      </button>
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <div className="py-1">
                          <Link
                            to={`/admin/porter-vehicles/edit/${vehicle._id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <FaEdit className="mr-2" />
                          
                          </Link>
                          {/* <button
                            onClick={() => handleDelete(vehicle._id)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <FaTrashAlt className="mr-2" />
                            Delete
                          </button> */}
                        </div>
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

export default PorterVehicleTable; 