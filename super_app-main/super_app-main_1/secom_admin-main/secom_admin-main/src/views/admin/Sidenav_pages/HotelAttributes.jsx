import React, { useState, useEffect } from 'react';
import Card from 'components/card';
import { FiSearch, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { FaEdit, FaPlus } from 'react-icons/fa'; // Changed FiEdit to FaEdit
import { useForm, Controller } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import axios from 'axios';
import API_CONFIG from '../../../config/api.config';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function HotelAttributes() {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [rowIdToDelete, setRowIdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [brandImage, setBrandImage] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const { control, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      icon: null,
    },
  });

  const fetchBrandData = async () => {
    try {
      const response = await api.get('/api/amenities');
      let data = response.data.data || response.data;
      data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTableData(data);
      setFilteredData(data);
      setTotalItems(data.length);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      toast.error('Failed to fetch amenities');
    }
  };

  useEffect(() => {
    fetchBrandData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(tableData);
      setTotalItems(tableData.length);
    } else {
      const filtered = tableData.filter((brand) =>
        brand.name && brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
      setTotalItems(filtered.length);
      setCurrentPage(1);
    }
  }, [searchQuery, tableData]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage, searchQuery]);

  const getPaginatedData = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  };

  const handleImageSaveChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setValue('icon', file);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setValue('icon', file);
    } else {
      setImagePreview(selectedBrand?.icon || null);
      setValue('icon', null);
    }
  };

  const [error, setError] = useState(null);

  const handleAddBrand = () => {
    toast.dismiss();
    setSelectedBrand(null);
    setImagePreview(null);
    setValue('icon', '');
    reset({
      name: '',
      icon: null,
    });
    setOpenAddModal(true);
  };

  const handleFormSubmit = async (data) => {
    const name = data.name;
    const existingBrand = getPaginatedData().find(
      (brand) => brand.name && brand.name.toLowerCase() === name.toLowerCase()
    );

    if (!data.icon || !(data.icon instanceof File)) {
      setError('Icon is required');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('icon', data.icon);
    setLoading(true);

    try {
      await api.post('/api/amenities', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Amenity added successfully!');
      fetchBrandData();
      setOpenAddModal(false);
      setBrandImage(null);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to add amenity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRow = (brand) => {
    setSelectedBrand(brand);
    setValue('name', brand.name);
    setImagePreview(brand.icon || null);
    setOpenEditModal(true);
  };

  const handleFormUpdate = async (data) => {
    setLoading(true);

    const existingBrand = getPaginatedData().find(
      (brand) => brand.name && brand.name.toLowerCase() === data.name.trim().toLowerCase()
    );

    const formData = new FormData();
    formData.append('name', data.name.trim() || selectedBrand.name);
    if (data.icon instanceof File) {
      formData.append('icon', data.icon);
    }

    try {
      await api.put(`/api/amenities/${selectedBrand.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Amenity updated successfully!');
      fetchBrandData();
      setOpenEditModal(false);
      setSelectedBrand(null);
      reset();
    } catch (error) {
      console.error('Error updating amenity:', error);
      toast.error('Failed to update amenity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = (id) => {
    setRowIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirmation = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/amenities/${rowIdToDelete}`);

      toast.success('Amenity deleted successfully!');
      fetchBrandData();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting amenity:', error);
      toast.error('Error deleting amenity. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
  };

  const handleBulkDelete = async () => {
    setLoading(true);
    try {
      for (let id of selectedRows) {
        await api.delete(`/api/amenities/${id}`);
      }

      toast.success('Amenities deleted successfully!');
      fetchBrandData();
      setSelectedRows([]);
    } catch (error) {
      console.error('Error deleting selected amenities:', error);
      toast.error('Error deleting selected amenities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowSelection = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  const closeCreateModal = () => {
    setOpenAddModal(false);
    reset();
  };

  const closeEditModal = () => {
    setOpenEditModal(false);
    reset();
  };

  return (
    <div className="min-h-screen">
      <TokenExpiration />
      <ToastContainer />
      <div className="w-full mx-auto">
        <span className="flex mt-4 items-center w-full gap-6">
          <div className="relative flex flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
            <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
              <p className="pl-3 pr-2 text-xl">
                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
              </p>
              <input
                type="text"
                placeholder="Search by Name..."
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
              />
            </div>
          </div>

          <button
            onClick={handleAddBrand}
            className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
          >
            <FaPlus className="mr-2" /> Add Hotel Attributes
          </button>
        </span>

        {openAddModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
            onClick={closeCreateModal}
          >
            <div
              className="rounded-lg shadow-2xl p-8 transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Add Hotel Attributes</h2>

              <div className="mb-6">
                <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Enter Amenity Name"
                      className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      {...field}
                    />
                  )}
                />
                {errors.name && <p className="text-red-500 dark:text-red-400 text-sm">{errors.name.message}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Icon <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSaveChange}
                  className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border transition-colors" style={{ borderColor: 'var(--border-color)' }} />
                  </div>
                )}
                {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-6 py-2 border rounded-md transition-colors"
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
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(handleFormSubmit)}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {loading ? 'Adding...' : 'Add Amenity'}
                </button>
              </div>
            </div>
          </div>
        )}

        {openEditModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
            onClick={closeEditModal}
          >
            <div
              className="rounded-lg shadow-2xl p-8 transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Edit Hotel Attributes</h2>

              <div className="mb-6">
                <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Enter Amenity Name"
                      className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      {...field}
                    />
                  )}
                />
                {errors.name && <p className="text-red-500 dark:text-red-400 text-sm">{errors.name.message}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Icon
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded border transition-colors" style={{ borderColor: 'var(--border-color)' }} />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2 border rounded-md transition-colors"
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
                </button>
                <button
                  type="button"
                  onClick={handleSubmit(handleFormUpdate)}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {loading ? 'Updating...' : 'Update Amenity'}
                </button>
              </div>
            </div>
          </div>
        )}

        {openDeleteDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div 
              className="rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Confirm Delete</h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete this amenity? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCancelDelete}
                  className="px-6 py-2 border rounded-md transition-colors"
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
                </button>
                <button
                  onClick={handleDeleteConfirmation}
                  disabled={isDeleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors dark:bg-red-500 dark:hover:bg-red-600"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Card extra="w-full">
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                  <thead>
                    <tr className="border-b transition-colors" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRows(getPaginatedData().map((row) => row.id));
                            } else {
                              setSelectedRows([]);
                            }
                          }}
                          checked={selectedRows.length === getPaginatedData().length && getPaginatedData().length > 0}
                          className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                          style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>Icon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                    {getPaginatedData().map((brand) => (
                      <tr 
                        key={brand.id} 
                        className="transition-colors duration-150"
                        style={{ borderColor: 'var(--border-color)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(brand.id)}
                            onChange={() => handleRowSelection(brand.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                            style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {brand.icon && (
                            <img
                              src={API_CONFIG.getUrl(brand.icon)}
                              alt={brand.name}
                              className="w-10 h-10 object-cover rounded border transition-colors"
                              style={{ borderColor: 'var(--border-color)' }}
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {brand.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              brand.status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {brand.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center">
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
                              aria-label={`Actions for ${brand.name}`}
                            >
                              <FiMoreVertical />
                            </button>
                            <button
                              onClick={() => handleEditRow(brand)}
                              className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              aria-label={`Edit amenity ${brand.name}`}
                            >
                              <FaEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedRows.length > 0 && (
                <div 
                  className="mt-4 p-4 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  <button
                    onClick={handleBulkDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    {loading ? 'Deleting...' : `Delete Selected (${selectedRows.length})`}
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <option value={5} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>5</option>
                    <option value={10} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>10</option>
                    <option value={20} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>20</option>
                    <option value={50} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>50</option>
                  </select>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>entries</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 transition-colors"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-secondary)'
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
                  >
                    Previous
                  </button>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 transition-colors"
                    style={{
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-secondary)'
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
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default HotelAttributes;