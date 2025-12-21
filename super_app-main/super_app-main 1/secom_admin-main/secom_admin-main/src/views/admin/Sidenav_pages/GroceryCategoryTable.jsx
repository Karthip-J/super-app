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
import { groceryCategoryService } from '../../../services/groceryCategoryService';
import API_CONFIG from '../../../config/api.config';
import { toast } from 'react-toastify';

const GroceryCategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null, loading: false });
  const navigate = useNavigate();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching grocery categories...');
      const response = await groceryCategoryService.getAllCategories();
      console.log('Categories fetched successfully:', response);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data || error.message);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
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
      // Add visual feedback that deletion is in progress
      setDeleteDialog(prev => ({ ...prev, loading: true }));
      
      await groceryCategoryService.deleteCategory(deleteDialog.category.id);
      toast.success('Category deleted successfully');
      
      // Add a small delay to show the success state before closing
      setTimeout(() => {
        fetchCategories();
        setDeleteDialog({ open: false, category: null, loading: false });
      }, 1000);
    } catch (error) {
      console.error('Error deleting category:', error);
      setDeleteDialog(prev => ({ ...prev, loading: false }));
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(error.message || 'Failed to delete category');
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
    const path = category ? `/admin/grocerycategory/edit/${category.id}` : '/admin/grocerycategory/new';
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
    <div className="mt-8 mb-8 flex flex-col items-center gap-8">
      <Card className="w-full max-w-5xl shadow-lg p-2">
        <Typography variant="h5" className="text-2xl font-bold text-gray-800 p-4">
          Grocery Categories
        </Typography>
        <CardBody className="px-0 pt-0 pb-2">
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 p-4 border-b border-blue-gray-50 bg-blue-gray-50/30 rounded-t-lg">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-gray-400" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 !border-blue-gray-200 focus:!border-blue-500"
                  labelProps={{ className: "hidden" }}
                  aria-label="Search categories"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-blue-gray-200 rounded-lg bg-white text-blue-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button
                color="blue"
                className="flex items-center gap-2"
                onClick={() => navigateToForm()}
                aria-label="Add new category"
              >
                <PlusIcon className="h-4 w-4" />
                Add Category
              </Button>
            </div>
          </div>

          {/* Scrollable Table Section with Fixed Header */}
          <div className="bg-white rounded-b-lg shadow-inner">
            <table className="w-full min-w-[640px] table-fixed">
              <thead>
                <tr>
                  <th className="border-b border-blue-gray-50 py-3 px-6 text-left w-20" scope="col">
                    <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">
                      Image
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-6 text-left w-40" scope="col">
                    <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">
                      Name
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-6 text-left w-64" scope="col">
                    <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">
                      Description
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-6 text-left w-28" scope="col">
                    <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">
                      Status
                    </Typography>
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-6 text-center w-28" scope="col">
                    <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">
                      Actions
                    </Typography>
                  </th>
                </tr>
              </thead>
            </table>
            <div className="h-[400px] overflow-y-auto">
              <table className="w-full min-w-[640px] table-fixed">
                <tbody>
                  {filteredCategories.map((category, key) => {
                    const categoryId = category.id;
                    if (!categoryId) {
                      console.error('Category ID is missing:', category);
                      return null;
                    }
                    return (
                      <tr key={categoryId} className="hover:bg-blue-gray-50 transition-colors">
                        <td className="py-3 px-6 w-20">
                          {category.image ? (
                            <img
                              src={API_CONFIG.getUrl(category.image)}
                              alt={category.name || 'Category image'}
                              className="h-16 w-16 rounded-lg object-cover border border-blue-gray-100"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="h-16 w-16 rounded-lg bg-blue-gray-100 flex items-center justify-center border border-blue-gray-100" style={{ display: category.image ? 'none' : 'flex' }}>
                            <Typography variant="small" className="text-blue-gray-400">
                              No Image
                            </Typography>
                          </div>
                        </td>
                        <td className="py-3 px-6 w-40">
                          <Typography variant="small" color="blue-gray" className="font-medium">
                            {category.name || 'N/A'}
                          </Typography>
                        </td>
                        <td className="py-3 px-6 w-64">
                          <Typography variant="small" color="blue-gray" className="font-normal">
                            {category.description || 'No description'}
                          </Typography>
                        </td>
                        <td className="py-3 px-6 w-28 align-middle">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${
                              category.status === true ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            } leading-tight min-w-[56px] h-6`}
                          >
                            {category.status === true ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-6 w-28 text-center">
                          <div className="relative inline-block group">
                            <button
                              className="text-gray-600 hover:text-gray-900"
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
                                className="text-blue-600 hover:text-blue-600 font-bold"
                                aria-label={`Edit ${category.name || 'category'}`}
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => setDeleteDialog({ open: true, category })}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200 transform hover:scale-110"
                                aria-label={`Delete ${category.name || 'category'}`}
                                title="Delete"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
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
            <div className="text-center py-12 bg-blue-gray-50 rounded-b-lg">
              <Typography variant="h6" color="blue-gray" className="mb-2">
                No categories found
              </Typography>
              <Typography variant="small" color="blue-gray">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first category'}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Enhanced Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <Dialog open={deleteDialog.open} handler={() => setDeleteDialog({ open: false, category: null, loading: false })} size="sm">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-1">
            <DialogHeader className="flex flex-col items-center justify-center pt-6">
              <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4 ${deleteDialog.loading ? 'animate-pulse' : ''}`}>
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
              <Typography variant="h4" className="font-bold text-gray-800">
                Confirm Deletion
              </Typography>
            </DialogHeader>
            <DialogBody className="text-center px-8 py-4">
              <Typography className="text-gray-700 mb-2">
                Are you sure you want to delete this category?
              </Typography>
              <div className="bg-white rounded-lg p-4 my-4 shadow-sm border border-red-100">
                <Typography variant="h6" className="font-bold text-gray-900 truncate">
                  {deleteDialog.category?.name || 'Unnamed Category'}
                </Typography>
                <Typography className="text-sm text-gray-600 mt-1">
                  {deleteDialog.category?.description || 'No description'}
                </Typography>
              </div>
              <Typography className="text-gray-600 text-sm">
                This action cannot be undone. All products under this category will be affected.
              </Typography>
            </DialogBody>
            <DialogFooter className="flex justify-center gap-4 p-6">
              <Button
                variant="outlined"
                color="gray"
                onClick={() => setDeleteDialog({ open: false, category: null, loading: false })}
                className="rounded-lg px-6 py-2 text-gray-700 border border-gray-300 hover:bg-gray-100 transition-all duration-300"
                aria-label="Cancel deletion"
                disabled={deleteDialog.loading}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                color="red"
                onClick={handleDelete}
                className="rounded-lg px-6 py-2 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                aria-label={`Delete ${deleteDialog.category?.name || 'category'}`}
                disabled={deleteDialog.loading}
              >
                {deleteDialog.loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="h-4 w-4" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default GroceryCategoryTable;