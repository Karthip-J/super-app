import React, { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
} from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { restaurantService } from '../../../services/restaurantService';
import API_CONFIG from '../../../config/api.config';
import { toast } from 'react-toastify';

const RestaurantTable = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, restaurant: null });
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'inactive'

  // Debounced search
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value) => setSearchTerm(value), 300),
    []
  );

  // Fetch restaurants
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getAll();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.restaurant) return;
    try {
      await restaurantService.delete(deleteDialog.restaurant.id);
      toast.success('Restaurant deleted successfully');
      fetchRestaurants();
      setDeleteDialog({ open: false, restaurant: null });
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
    }
  };

  // Filter and sort restaurants
  const filteredRestaurants = useMemo(() => {
    return (Array.isArray(restaurants) ? restaurants : [])
      .filter((restaurant) => {
        if (statusFilter === 'active') return restaurant.status === true;
        if (statusFilter === 'inactive') return restaurant.status === false;
        return true; // 'all'
      })
      .filter((restaurant) => {
        return (
          restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          restaurant.category_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [restaurants, searchTerm, statusFilter]);

  // Navigate to add/edit form
  const navigateToForm = (restaurant = null) => {
    const path = restaurant ? `/admin/restaurant/edit/${restaurant.id}` : '/admin/restaurant/new';
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography variant="h6">Loading restaurants...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col items-center gap-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Card className="w-full max-w-5xl shadow-lg p-2 transition-colors" style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px 0 var(--shadow-color)' }}>
        <Typography variant="h5" className="text-2xl font-bold p-4" style={{ color: 'var(--text-primary)' }}>
          Restaurants
        </Typography>
        <CardBody className="px-0 pt-0 pb-2">
          {/* Search and Add Button */}
          <div 
            className="flex flex-col md:flex-row gap-4 p-4 border-b rounded-t-lg transition-colors"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <div className="flex-1 flex gap-2 items-center">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors" style={{ color: 'var(--text-secondary)' }} />
                <Input
                  type="text"
                  placeholder="Search restaurants..."
                  onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                  className="pl-10 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  labelProps={{ className: 'hidden' }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <option value="all" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All</option>
                <option value="active" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Active</option>
                <option value="inactive" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Inactive</option>
              </select>
            </div>
            <Button
              color="blue"
              className="flex items-center gap-2 transition-colors duration-150 dark:bg-blue-600 dark:hover:bg-blue-700"
              onClick={() => navigateToForm()}
            >
              <PlusIcon className="h-4 w-4" />
              Add Restaurant
            </Button>
          </div>

          {/* Table with fixed header and scrollable tbody */}
          <div className="rounded-b-lg shadow-inner transition-colors" style={{ backgroundColor: 'var(--bg-card)' }}>
            <table className="w-full min-w-[800px] table-fixed transition-colors" style={{ borderColor: 'var(--border-color)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="border-b py-3 px-6 text-left w-20 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Image
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-40 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Name
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-56 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Address
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-40 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Category
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-28 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Status
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-28 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Actions
                    </Typography>
                  </th>
                </tr>
              </thead>
            </table>
            <div className="h-[400px] overflow-y-auto">
              <table className="w-full min-w-[800px] table-fixed transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                <tbody>
                  {filteredRestaurants.map((restaurant, key) => (
                    <tr 
                      key={key} 
                      className="transition-colors duration-150"
                      style={{ borderColor: 'var(--border-color)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                      }}
                    >
                      <td className="py-3 px-6 w-20">
                        {restaurant.image ? (
                          <img
                            src={API_CONFIG.getUrl(restaurant.image)}
                            alt={restaurant.name}
                            className="h-16 w-16 rounded-lg object-cover border transition-colors"
                            style={{ borderColor: 'var(--border-color)' }}
                            onError={(e) => {
                              e.target.src = '/path/to/fallback-image.png'; // Fallback image
                            }}
                          />
                        ) : (
                          <div 
                            className="h-16 w-16 rounded-lg flex items-center justify-center border transition-colors"
                            style={{ 
                              backgroundColor: 'var(--bg-secondary)',
                              borderColor: 'var(--border-color)'
                            }}
                          >
                            <Typography variant="small" style={{ color: 'var(--text-muted)' }}>
                              No Image
                            </Typography>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-6 w-40">
                        <Typography variant="small" className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {restaurant.name}
                        </Typography>
                      </td>
                      <td className="py-3 px-6 w-56">
                        <Typography variant="small" className="font-normal" style={{ color: 'var(--text-secondary)' }}>
                          {restaurant.address || 'No address'}
                        </Typography>
                      </td>
                      <td className="py-3 px-6 w-40">
                        <Typography variant="small" className="font-normal" style={{ color: 'var(--text-secondary)' }}>
                          {restaurant.category_id?.name || 'No category'}
                        </Typography>
                      </td>
                      <td className="py-3 px-6 w-28 align-middle">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${
                            restaurant.status === true 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          } leading-tight min-w-[56px] h-6`}
                        >
                          {restaurant.status === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    <td className="py-3 px-6 w-28">
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
                          aria-label={`Actions for ${restaurant.name}`}
                        >
                          <FaEllipsisV />
                        </button>
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                          <button
                            onClick={() => navigateToForm(restaurant)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            aria-label={`Edit ${restaurant.name}`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setDeleteDialog({ open: true, restaurant })}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            aria-label={`Delete ${restaurant.name}`}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </td>
    


                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardBody>
      </Card>
      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div 
            className="rounded-xl shadow-lg w-full max-w-sm p-6 flex flex-col items-center transition-colors"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <FaTrashAlt className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
            <div className="text-lg font-semibold mb-2 text-center w-full" style={{ color: 'var(--text-primary)' }}>Delete Restaurant</div>
            <div className="text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete{' '}
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>"{deleteDialog.restaurant?.name}"</span>?<br />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>This action cannot be undone.</span>
            </div>
            <div className="flex w-full justify-center gap-2 mt-2">
              <Button
                variant="text"
                color="gray"
                onClick={() => setDeleteDialog({ open: false, restaurant: null })}
                className="rounded-md px-4 py-2 border transition-colors duration-150"
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
              >
                Cancel
              </Button>
              <Button
                variant="text"
                color="red"
                onClick={handleDelete}
                className="rounded-md px-4 py-2 flex items-center gap-2 transition-colors duration-150 dark:bg-red-600 dark:hover:bg-red-700"
              >
                <FaTrashAlt className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantTable;