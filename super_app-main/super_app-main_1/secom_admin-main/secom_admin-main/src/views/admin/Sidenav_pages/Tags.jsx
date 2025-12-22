import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { getApiUrl, getAuthHeaders, handleApiError } from '../../../utils/apiUtils';

function Tags() {
  const [tableData, setTableData] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectTags, setSelectedTags] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [rowIdToDelete, setRowIdToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Yup validation schema
  const validationSchemaAdd = Yup.object({
    tag_name: Yup.string().required('Tag Name is required'),
  });

  const validationSchemaEdit = Yup.object({
    tag_name: Yup.string().required('Tag Name is required'),
  });

  const { reset, control, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
    resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
    defaultValues: {
      tag_name: selectTags?.tag_name || '',
    },
  });

  const fetchTagsData = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/admin/get_all_tags'));
      setTableData(response.data);
      setTotalItems(response.data.length);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(handleApiError(error));
    }
  };

  useEffect(() => {
    fetchTagsData();
  }, [itemsPerPage]);

  // Handle Page Change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (searchQuery) {
      // Ensure you're filtering by the discount name
      const filtered = tableData.filter((tags) =>
        tags.tag_name?.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by discount name
      );
      setFilteredData(filtered);
      setTotalItems(filtered.length);
      setCurrentPage(1); // Reset to first page when search query changes
    } else {
      setFilteredData(tableData); // If no search query, show all discounts
      setTotalItems(tableData.length);
    }
  }, [searchQuery, tableData]);

  const handleRowSelection = (id) => {
    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id]
    );
  };

  // Get paginated data
  const getPaginatedData = () => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('OnlineShop-accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please login.');
      }

      const response = await axios.post(
        getApiUrl('/api/admin/save_tag'),
        data,
        { headers: getAuthHeaders() }
      );

      fetchTagsData();
      setOpenAddModal(false);
      reset();
      toast.success('Tag created successfully!', { hideProgressBar: true });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleFormUpdate = async (data) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('OnlineShop-accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please login.');
      }

      const response = await axios.put(
        getApiUrl(`/api/admin/update_tag_by_id/${selectTags.id}`),
        data,
        { headers: getAuthHeaders() }
      );

      fetchTagsData();
      setOpenEditModal(false);
      reset();
      toast.success('Tag updated successfully!', { hideProgressBar: true });
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    setSelectedTags(null);
    setValue('tag_name', '');

    setOpenAddModal(true);
  };

  const handleEditRow = (tag) => {
    setSelectedTags(tag);
    setValue('tag_name', tag.tag_name);
    setOpenEditModal(true);
    trigger();
  };

  const handleDeleteRow = (id) => {
    setRowIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const accessToken = localStorage.getItem('OnlineShop-accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please login.');
      }

      await axios.delete(
        getApiUrl(`/api/admin/delete_tag_by_id/${rowIdToDelete}`),
        { headers: getAuthHeaders() }
      );

      fetchTagsData();
      setOpenDeleteDialog(false);
      toast.success('Tag deleted successfully!', { hideProgressBar: true });
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error(handleApiError(error));
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
      const accessToken = localStorage.getItem('OnlineShop-accessToken');
      if (!accessToken) {
        throw new Error('Access token is missing. Please login.');
      }

      for (let id of selectedRows) {
        await axios.delete(
          getApiUrl(`/api/admin/delete_tag_by_id/${id}`),
          { headers: getAuthHeaders() }
        );
      }

      fetchTagsData();
      setSelectedRows([]);
      toast.success('Selected tags deleted successfully!', { hideProgressBar: true });
    } catch (error) {
      console.error('Error bulk deleting tags:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className=" min-h-screen pt-6">
      
      {/* <TokenExpiration /> */}
      <ToastContainer />
      <div className="w-full mx-auto">
        <span className="flex mt-4 items-center w-full gap-6">
          {/* Search Bar */}
          <div className="relative flex flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
            <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
              <p className="pl-3 pr-2 text-xl">
                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
              </p>
              <input
                type="text"
                placeholder="Search by Tags Name..."
                onChange={(e) => setSearchQuery(e.target.value)} // Directly set the search query
                value={searchQuery}
                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
              />
            </div>
          </div>

          <button
            onClick={handleAddTag}
            className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
          >
            <FaPlus className="mr-2" /> Add Tags
          </button>
        </span>

        {openAddModal && !openEditModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
            onClick={() => setOpenAddModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Tag</h2>

              <div className="mb-6">
                <label className="block text-lg text-gray-600 font-medium mb-2">
                  Tag Name<span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="tag_name"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Enter Tag Name"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                      {...field}
                    />
                  )}
                />
                {errors.tag_name && (
                  <p className="text-red-500 text-sm">{errors.tag_name.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setOpenAddModal(false)}
                  className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit(handleFormSubmit)}
                  disabled={loading}
                  className="relative bg-[#4318ff] text-white px-6 py-3 rounded-lg flex items-center ml-auto max-w-xs"
                >
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center w-full h-full">
                      <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {openEditModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
            onClick={() => setOpenEditModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl p-12"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Tag</h2>

              <div className="mb-6">
                <label className="block text-lg text-gray-600 font-medium mb-2">Tag Name<span className="text-red-500 ">*</span></label>
                <Controller
                  name="tag_name"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      placeholder="Enter Tag Name"
                      className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                      {...field}
                    />
                  )}
                />
                {errors.tag_name && (
                  <p className="text-red-500 text-sm">{errors.tag_name.message}</p>
                )}
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setOpenEditModal(false)}
                  className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit(handleFormUpdate)}
                  disabled={loading}
                  className="relative bg-[#4318ff] text-white px-6 py-3 rounded-lg flex items-center ml-auto max-w-xs"
                >
                  {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-gray-600">
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === getPaginatedData().length && getPaginatedData().length > 0}
                    onChange={() => {
                      if (selectedRows.length === getPaginatedData().length) {
                        setSelectedRows([]);
                      } else {
                        setSelectedRows(getPaginatedData().map((row) => row.id));
                      }
                    }}
                    disabled={getPaginatedData().length === 0}
                  />
                </th>
                <th className="px-6 py-4 text-left">Tag Name</th>

                <th className="">
                  {/* Action */}
                  <span></span>

                  {selectedRows.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className={`text-gray-600 hover:text-red-600 text-xl flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="relative">
                          <div className="w-6 h-6 border-4 border-t-transparent border-red-600 rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <FaTrashAlt />
                      )}
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {getPaginatedData().length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No Users found
                  </td>
                </tr>
              ) : (
                getPaginatedData().map((tags) => (
                  <tr key={tags.id} className="border-t">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(tags.id)}
                        onChange={() => handleRowSelection(tags.id)}
                      />
                    </td>
                    <td className="px-6 py-4">{tags.tag_name}</td>
                    
                    <td className="text-right group relative">
                      <div className="flex items-center space-x-2">
                        {/* Ellipsis icon */}
                        <button
                          onClick={() => setOpenDropdown(openDropdown === tags.id ? null : tags.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FaEllipsisV />
                        </button>
                        {/* Edit and Delete icons visible on hover */}
                        <div className="absolute right-40 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200">
                          <button
                            onClick={() => {
                              handleEditRow(tags);
                            }}
                            className="text-navy-700 hover:bg-gray-200"
                          >
                            <FaEdit className="mr-2 text-black" />
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteRow(tags.id);
                            }}
                            className="text-red-600 hover:bg-gray-200"
                          >
                            <FaTrashAlt className="mr-2" />
                          </button>
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

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center">
          <span className="mr-2">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="border border-gray-300 px-4 py-2 rounded-md"
          >
            {[5, 10, 20, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="ml-2">entries</span>
        </div>

        <div className="flex space-x-4">
          {/* Showing Item Range */}

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${currentPage === 1
              ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
              : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'
              } px-6 py-2 rounded-[20px]`}
          >
            Back
          </button>
          <span className="text-gray-600 mt-2">
            {` ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} items`}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${currentPage === totalPages || totalItems === 0
              ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
              : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'
              } px-6 py-2 rounded-[20px]`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {openDeleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Tag?</h2>
            <div className="flex justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 mr-4 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  'Delete'
                )}
                {isDeleting ? 'Deleting...' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tags;
