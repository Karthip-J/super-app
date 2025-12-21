import React, { useState, useEffect } from 'react';
import taxiService from '../../../services/taxiService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEllipsisV, FaEdit } from 'react-icons/fa';

const TaxiDriverTable = () => {
  const [taxiDrivers, setTaxiDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaxiDrivers = async () => {
      try {
        const response = await taxiService.getAllTaxiDrivers();
        if (response.success) {
          setTaxiDrivers(response.data);
        } else {
          setError(response.message || 'Failed to fetch taxi drivers');
          toast.error(response.message || 'Failed to fetch taxi drivers');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch taxi drivers';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchTaxiDrivers();
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case 'inactive': return 'Inactive';
      case 'active': return 'Active';
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

  if (loading) return <div className="flex justify-center items-center h-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 text-center" style={{ backgroundColor: 'var(--bg-primary)' }}>{error}</div>;

  return (
    <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Taxi Drivers</h2>
        <Link
          to="/admin/taxi-drivers/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-150 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add Taxi Driver
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
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Name</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Phone</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>License No</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Status</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Created At</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxiDrivers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-2 text-center" style={{ color: 'var(--text-secondary)' }}>No taxi drivers found</td>
              </tr>
            ) : (
              taxiDrivers.map((driver) => (
                <tr 
                  key={driver.id} 
                  className="border-b transition-colors duration-150"
                  style={{ borderColor: 'var(--border-color)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  }}
                >
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{driver.name}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{driver.phone}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{driver.license_number}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      driver.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                      driver.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      driver.status === 'offline' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {getStatusText(driver.status)}
                    </span>
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>{formatDate(driver.createdAt || driver.created_at)}</td>
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
                        aria-label={`Actions for ${driver.name}`}
                      >
                        <FaEllipsisV />
                      </button>
                      <div
                        className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                      >
                        <Link
                          to={`/admin/taxi-drivers/edit/${driver.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          aria-label={`Edit ${driver.name}`}
                        >
                          <FaEdit />
                        </Link>
                        {/* Uncomment to enable delete:
                        <button
                          onClick={() => handleDelete(driver.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          aria-label={`Delete ${driver.name}`}
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

export default TaxiDriverTable;
