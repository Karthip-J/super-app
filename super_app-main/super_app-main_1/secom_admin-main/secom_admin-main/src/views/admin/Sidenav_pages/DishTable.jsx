import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
} from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { dishService } from '../../../services/restaurantService';
import API_CONFIG from '../../../config/api.config';
import { toast } from 'react-toastify';

const DishTable = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, dish: null });
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'inactive'

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const data = await dishService.getAll();
      setDishes(data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      toast.error('Failed to fetch dishes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  const handleDelete = async () => {
    if (!deleteDialog.dish) return;
    try {
      await dishService.delete(deleteDialog.dish.id);
      toast.success('Dish deleted successfully');
      fetchDishes();
      setDeleteDialog({ open: false, dish: null });
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast.error('Failed to delete dish');
    }
  };

  const filteredDishes = (Array.isArray(dishes) ? dishes : [])
    .filter((dish) => {
      if (statusFilter === 'active') return dish.status === true;
      if (statusFilter === 'inactive') return dish.status === false;
      return true;
    })
    .filter((dish) => {
      const match = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return match;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const navigateToForm = (dish = null) => {
    const path = dish ? `/admin/dish/edit/${dish.id}` : '/admin/dish/new';
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Typography variant="h6" style={{ color: 'var(--text-primary)' }}>Loading dishes...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col items-center gap-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Card className="w-full max-w-6xl shadow-lg p-2 transition-colors" style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px 0 var(--shadow-color)' }}>
        <Typography variant="h5" className="text-2xl font-bold p-4" style={{ color: 'var(--text-primary)' }}>
          Dishes
        </Typography>
        <CardBody className="px-0 pt-0 pb-2">
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
                  placeholder="Search dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  labelProps={{ className: "hidden" }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
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
              Add Dish
            </Button>
          </div>

          <div className="rounded-b-lg shadow-inner transition-colors" style={{ backgroundColor: 'var(--bg-card)' }}>
            <table className="w-full min-w-[900px] table-fixed transition-colors" style={{ borderColor: 'var(--border-color)' }}>
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
                  <th className="border-b py-3 px-6 text-left w-48 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Description
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-32 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Price
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-40 transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Restaurant
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
              <table className="w-full min-w-[900px] table-fixed transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                <tbody>
                  {filteredDishes.map((dish, key) => (
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
                        {dish.image ? (
                          <img
                            src={API_CONFIG.getUrl(dish.image)}
                            alt={dish.name}
                            className="h-16 w-16 rounded-lg object-cover border transition-colors"
                            style={{ borderColor: 'var(--border-color)' }}
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
                          {dish.name}
                        </Typography>
                      </td>
                      <td className="py-3 px-6 w-48">
                        <Typography variant="small" className="font-normal" style={{ color: 'var(--text-secondary)' }}>
                          {dish.description ? (dish.description.length > 50 ? `${dish.description.substring(0, 50)}...` : dish.description) : 'No description'}
                        </Typography>
                      </td>
                      <td className="py-3 px-6 w-32">
                        <Typography variant="small" className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          ${dish.price ? parseFloat(dish.price).toFixed(2) : '0.00'}
                        </Typography>
                      </td>
                      <td className="py-3 px-6 w-40">
                        <Typography variant="small" className="font-normal" style={{ color: 'var(--text-secondary)' }}>
                          {dish.restaurant_id?.name || 'No restaurant'}
                        </Typography>
                      </td>
                      <td className="py-3 px-6 w-28 align-middle">
                        <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full
                          ${dish.status === true 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                          leading-tight min-w-[56px] h-6`}>
                          {dish.status === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-12 w-28">
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
                            aria-label={`Actions for ${dish.name}`}
                          >
                            <FaEllipsisV />
                          </button>
                          <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                            <button
                              onClick={() => navigateToForm(dish)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              aria-label={`Edit ${dish.name}`}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => setDeleteDialog({ open: true, dish })}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              aria-label={`Delete ${dish.name}`}
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

      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div 
            className="rounded-xl shadow-lg w-full max-w-sm p-6 flex flex-col items-center transition-colors"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <FaTrashAlt className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
            <div className="text-lg font-semibold mb-2 text-center w-full" style={{ color: 'var(--text-primary)' }}>Delete Dish</div>
            <div className="text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete <span className="font-bold" style={{ color: 'var(--text-primary)' }}>"{deleteDialog.dish?.name}"</span>?<br />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>This action cannot be undone.</span>
            </div>
            <div className="flex w-full justify-center gap-2 mt-2">
              <Button
                variant="text"
                color="gray"
                onClick={() => setDeleteDialog({ open: false, dish: null })}
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
                className="rounded-md px-4 py-2 flex items-center gap-2 transition-colors duration-150"
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

export default DishTable;
