import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@material-tailwind/react';
import { MagnifyingGlassIcon, PlusIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { FaEdit } from 'react-icons/fa';
import { FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { restaurantCategoryService } from '../../../services/restaurantService';
import API_CONFIG from '../../../config/api.config';
import { toast } from 'react-toastify';

const RestoCategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  const navigate = useNavigate();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching restaurant categories...');
      const data = await restaurantCategoryService.getAll();
      console.log('Categories fetched successfully:', data);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        // Optionally redirect to login page
        // navigate('/login');
      } else {
        toast.error('Failed to fetch categories');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteDialog.category) return;
    try {
      await restaurantCategoryService.delete(deleteDialog.category.id);
      toast.success('Category deleted successfully');
      fetchCategories();
      setDeleteDialog({ open: false, category: null });
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
        // navigate('/login');
      } else {
        toast.error('Failed to delete category');
      }
    }
  };

  // Filter categories with safety check
  const filteredCategories = (Array.isArray(categories) ? categories : []).filter((category) => {
    const matchesSearch =
      (category.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && category.status) ||
      (statusFilter === 'inactive' && !category.status);
    return matchesSearch && matchesStatus;
  });

  // Navigate to add/edit form
  const navigateToForm = (category = null) => {
    const path = category ? `/admin/restocategory/edit/${category.id}` : '/admin/restocategory/new';
    navigate(path);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col items-center gap-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Card className="w-full max-w-5xl shadow-lg p-2 transition-colors" style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px 0 var(--shadow-color)' }}>
        <Typography variant="h5" className="text-2xl font-bold p-4" style={{ color: 'var(--text-primary)' }}>
          Restaurant Categories
        </Typography>
        <CardBody className="px-0 pt-0 pb-2">
          {/* Search and Filter Section */}
          <div 
            className="flex flex-col md:flex-row gap-4 p-4 border-b rounded-t-lg transition-colors"
            style={{ 
              borderColor: 'var(--border-color)',
              backgroundColor: 'var(--bg-secondary)'
            }}
          >
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors" style={{ color: 'var(--text-secondary)' }} />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  labelProps={{ className: "hidden" }}
                  aria-label="Search categories"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
                aria-label="Filter by status"
              >
                <option value="all" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All Status</option>
                <option value="active" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Active</option>
                <option value="inactive" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Inactive</option>
              </select>
              <Button
                color="blue"
                className="flex items-center gap-2 dark:bg-blue-600 dark:hover:bg-blue-700"
                onClick={() => navigateToForm()}
                aria-label="Add new category"
              >
                <PlusIcon className="h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>

          {/* Scrollable Table Section with Fixed Header */}
          <div className="rounded-b-lg shadow-inner transition-colors" style={{ backgroundColor: 'var(--bg-card)' }}>
            <table className="w-full min-w-[640px] table-fixed transition-colors" style={{ borderColor: 'var(--border-color)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="border-b py-3 px-6 text-left w-20 transition-colors" scope="col" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Image
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-40 transition-colors" scope="col" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Name
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-64 transition-colors" scope="col" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Description
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-left w-28 transition-colors" scope="col" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Status
                    </Typography>
                  </th>
                  <th className="border-b py-3 px-6 text-center w-28 transition-colors" scope="col" style={{ borderColor: 'var(--border-color)' }}>
                    <Typography variant="small" className="text-[11px] font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                      Actions
                    </Typography>
                  </th>
                </tr>
              </thead>
            </table>
            <div className="h-[400px] overflow-y-auto">
              <table className="w-full min-w-[640px] table-fixed transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                <tbody>
                  {filteredCategories.map((category, key) => {
                    const categoryId = category.id; // Fixed the error here
                    if (!categoryId) {
                      console.error('Category ID is missing:', category);
                      return null;
                    }
                    return (
                      <tr 
                        key={categoryId} 
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
                          {category.image ? (
                            <img
                              src={API_CONFIG.getUrl(category.image)}
                              alt={category.name || 'Category image'}
                              className="h-16 w-16 rounded-lg object-cover border transition-colors"
                              style={{ borderColor: 'var(--border-color)' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="h-16 w-16 rounded-lg flex items-center justify-center border transition-colors" 
                            style={{ 
                              display: category.image ? 'none' : 'flex',
                              backgroundColor: 'var(--bg-secondary)',
                              borderColor: 'var(--border-color)'
                            }}
                          >
                            <Typography variant="small" style={{ color: 'var(--text-muted)' }}>
                              No Image
                            </Typography>
                          </div>
                        </td>
                        <td className="py-3 px-6 w-40">
                          <Typography variant="small" className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {category.name || 'N/A'}
                          </Typography>
                        </td>
                        <td className="py-3 px-6 w-64">
                          <Typography variant="small" className="font-normal" style={{ color: 'var(--text-secondary)' }}>
                            {category.description || 'No description'}
                          </Typography>
                        </td>
                        <td className="py-3 px-6 w-28 align-middle">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${
                              category.status === true 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            } leading-tight min-w-[56px] h-6`}
                          >
                            {category.status === true ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-6 w-28 text-center">
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
                              aria-label={`More actions for ${category.name || 'category'}`}
                              aria-haspopup="true"
                            >
                              <FiMoreVertical />
                            </button>
                            <div
                              className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                            >
                              <button
                                onClick={() => navigateToForm(category)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-bold"
                                aria-label={`Edit ${category.name || 'category'}`}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              {/* <button
                                onClick={() => setDeleteDialog({ open: true, category })}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                aria-label={`Delete ${category.name || 'category'}`}
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button> */}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {filteredCategories.length === 0 && (
            <div className="text-center py-12 rounded-b-lg transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <Typography variant="h6" className="mb-2" style={{ color: 'var(--text-primary)' }}>
                No categories found
              </Typography>
              <Typography variant="small" style={{ color: 'var(--text-secondary)' }}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first category'}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <Dialog 
          open={deleteDialog.open} 
          handler={() => setDeleteDialog({ open: false, category: null })}
          className="transition-colors"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <DialogHeader className="flex items-center justify-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
          </DialogHeader>
          <DialogBody className="text-center">
            <Typography variant="h6" className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Delete Category
            </Typography>
            <Typography style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete <span className="font-bold" style={{ color: 'var(--text-primary)' }}>"{deleteDialog.category?.name || 'category'}"</span>?
              <br />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>This action cannot be undone.</span>
            </Typography>
          </DialogBody>
          <DialogFooter className="flex justify-center gap-2">
            <Button
              variant="text"
              color="gray"
              onClick={() => setDeleteDialog({ open: false, category: null })}
              className="rounded-md px-4 py-2 border transition-colors"
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
            </Button>
            <Button
              variant="text"
              color="red"
              onClick={handleDelete}
              className="rounded-md px-4 py-2 flex items-center gap-2 dark:bg-red-600 dark:hover:bg-red-700"
              aria-label={`Delete ${deleteDialog.category?.name || 'category'}`}
            >
              <FiTrash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
};

export default RestoCategoryTable;