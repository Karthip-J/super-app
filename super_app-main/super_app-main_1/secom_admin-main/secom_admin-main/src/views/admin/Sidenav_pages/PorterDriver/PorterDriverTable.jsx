import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';
import PorterDriverService from '../../../../services/porterDriverService';

const PorterDriverTable = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await PorterDriverService.getAllDrivers();
      if (response.success) {
        setDrivers(response.data);
      } else {
        setError(response.message || 'Failed to fetch drivers');
        toast.error(response.message || 'Failed to fetch drivers');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch drivers';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (driverId, newStatus) => {
    try {
      const response = await PorterDriverService.updateDriverStatus(driverId, { status: newStatus });
      if (response.success) {
        toast.success('Driver status updated successfully');
        fetchDrivers();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (driverId) => {
    if (window.confirm('Are you sure you want to deactivate this driver?')) {
      try {
        const response = await PorterDriverService.deleteDriver(driverId);
        if (response.success) {
          toast.success('Driver deactivated successfully');
          fetchDrivers();
        } else {
          toast.error(response.message || 'Failed to deactivate driver');
        }
      } catch (error) {
        console.error('Error deleting driver:', error);
        toast.error('Failed to deactivate driver');
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
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
          Porter Drivers
        </h2>
        <Link
          to="/admin/porter-drivers/new"
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-150"
        >
          Add Porter Driver
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
                Name
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Phone
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Email
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                License No
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
                Rating
              </th>
              <th 
                className="px-4 py-2 border transition-colors duration-300"
                style={{ 
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Deliveries
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
            {drivers.length === 0 ? (
              <tr>
                <td 
                  colSpan="9" 
                  className="px-4 py-2 text-center transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  No porter drivers found
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr 
                  key={driver._id} 
                  className="border-b transition-colors duration-150 hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {driver.name}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {driver.phone}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {driver.email || 'N/A'}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {driver.license_number}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)} dark:bg-opacity-20`}>
                      {getStatusText(driver.status)}
                    </span>
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    ⭐ {driver.rating || 0}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {driver.total_deliveries || 0}
                  </td>
                  <td 
                    className="px-4 py-2 border transition-colors duration-300"
                    style={{ 
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    {formatDate(driver.createdAt)}
                  </td>
                  <td className="px-11 py-2 w-28">
                    <div className="relative inline-block group">
                      <button 
                        className="transition-colors duration-300 focus:outline-none"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <FaEllipsisV />
                      </button>
                      <div  className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <div className="py-1">
                          <Link
                            to={`/admin/porter-drivers/edit/${driver._id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <FaEdit className="mr-2" />
                            
                          </Link>
                          {/* <button
                            onClick={() => handleDelete(driver._id)}
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

export default PorterDriverTable; 