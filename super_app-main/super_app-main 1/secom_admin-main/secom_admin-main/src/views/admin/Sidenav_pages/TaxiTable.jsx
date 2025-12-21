import React, { useEffect, useState } from 'react';
import taxiService from '../../../services/taxiService';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';

const TaxiTable = () => {
  const [taxiRides, setTaxiRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refactored fetch logic
  const fetchTaxiRides = async () => {
    setLoading(true);
    try {
      const response = await taxiService.getAllTaxiRides();
      if (response.success) {
        setTaxiRides(response.data);
      } else {
        setError(response.message || 'Failed to fetch taxi rides');
        toast.error(response.message || 'Failed to fetch taxi rides');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch taxi rides';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxiRides();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this taxi ride? This will mark it as cancelled but preserve the record.')) {
      try {
        const response = await taxiService.deleteTaxiRide(id);
        if (response.success) {
          setTaxiRides(taxiRides.map((ride) =>
            ride._id === id ? { ...ride, status: 'cancelled' } : ride
          ));
          toast.success('Taxi ride cancelled successfully');
        } else {
          toast.error(response.message || 'Failed to cancel taxi ride');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to cancel taxi ride');
      }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Requested';
      case 'accepted':
        return 'Accepted';
      case 'started':
        return 'Started';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'started':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Taxi Rides</h2>
        <div className="flex gap-2">
          <button
            onClick={fetchTaxiRides}
            className="px-4 py-2 rounded font-semibold disabled:opacity-50 transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--bg-input)';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link
            to="/admin/taxi-rides/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Add Taxi Ride
          </Link>
        </div>
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
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Vehicle</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Pickup Location</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Dropoff Location</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Fare</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Status</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Requested At</th>
              <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {taxiRides.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-2 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No taxi rides found
                </td>
              </tr>
            ) : (
              taxiRides.map((ride) => (
                <tr 
                  key={ride._id} 
                  className="border-b transition-colors duration-150"
                  style={{ borderColor: 'var(--border-color)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  }}
                >
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {ride.driver_id?.name || ride.driver?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {ride.vehicle_id
                      ? `${ride.vehicle_id.make || ''} ${ride.vehicle_id.model || ''}`.trim()
                      : ride.vehicle
                      ? `${ride.vehicle.make || ''} ${ride.vehicle.model || ''}`.trim()
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    {ride.pickup_location?.address || 'N/A'}
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                    {ride.dropoff_location?.address || 'N/A'}
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>${ride.fare || 'N/A'}</td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ride.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        ride.status === 'accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        ride.status === 'started' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        ride.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                        ride.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {ride.status ? getStatusText(ride.status) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>{formatDate(ride.createdAt)}</td>
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
                        aria-label={`Actions for ride ${ride._id}`}
                      >
                        <FaEllipsisV />
                      </button>
                      <div
                        className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                      >
                        <Link
                          to={`/admin/taxi-rides/edit/${ride._id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          aria-label={`Edit ride ${ride._id}`}
                        >
                          <FaEdit />
                        </Link>
                        {/* <button
                          onClick={() => handleDelete(ride._id)}
                          className={`transition-colors ${
                            ride.status === 'cancelled'
                              ? 'text-gray-400 cursor-not-allowed dark:text-gray-500'
                              : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                          }`}
                          disabled={ride.status === 'cancelled'}
                          aria-label={`Cancel ride ${ride._id}`}
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

export default TaxiTable;