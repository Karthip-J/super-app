import React, { useState, useEffect, useRef } from 'react';
import Card from 'components/card';

import { FiSearch, FiEdit, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
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

function HotelFaqs() {
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedQuestion, setselectedQuestion] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [answer, setanswer] = useState('');

    const { control, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
        },
    });

    const fetchFaqData = async () => {
        try {
            const response = await api.get('/api/faqs');
            const data = response.data.data || response.data;
            console.log('FAQs data:', data);
            setTableData(data);
            setFilteredData(data);
            setTotalItems(data.length);
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            toast.error('Failed to fetch FAQs');
        }
    };

    useEffect(() => {
        fetchFaqData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredData(tableData);
            setTotalItems(tableData.length);
        } else {
            const filtered = tableData.filter((faq) =>
                faq.title && faq.title.toLowerCase().includes(searchQuery.toLowerCase())
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

    const [error, setError] = useState(null);
    
    const handleFormSubmit = async (data) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
    
        try {
            await api.post('/api/faqs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setOpenAddModal(false);
            fetchFaqData();
            toast.success('FAQ added successfully!');
        } catch (error) {
            console.error('Error saving FAQ:', error);
            toast.error('Error saving FAQ!');
        } finally {
            setLoading(false);
        }
    };
    
    const handleFormUpdate = async (data) => {
        setLoading(true);
    
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
    
        try {
            await api.put(`/api/faqs/${selectedQuestion.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
    
            setOpenEditModal(false);
            fetchFaqData();
            toast.success('FAQ updated successfully!');
        } catch (error) {
            console.error('Error updating FAQ:', error);
            toast.error('Error updating FAQ!');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFaq = () => {
        setselectedQuestion(null);
        setValue('title', '');
        setValue('description', '');
        setImagePreview(null);
        setOpenAddModal(true);
    };

    const handleEditRow = (faq) => {
        setselectedQuestion(faq);
        setValue('title', faq.title);
        setValue('description', faq.description);
        setOpenEditModal(true);
    };

    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/faqs/${rowIdToDelete}`);
    
            fetchFaqData();
            setOpenDeleteDialog(false);
            toast.success('FAQ deleted successfully!');
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            toast.error('Error deleting FAQ!');
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
                await api.delete(`/api/faqs/${id}`);
            }

            await fetchFaqData();
            setSelectedRows([]);
            toast.success('Selected FAQs deleted successfully!');
        } catch (error) {
            console.error('Error deleting selected FAQs:', error);
            toast.error('Error deleting selected FAQs!');
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

    const handleCloseAddModal = () => {
        setOpenAddModal(false);
        reset();
    };

    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        reset();
    };

    return (
        <div className="min-h-screen pt-6">
            
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
                                placeholder="Search by Title..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                                value={searchQuery}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddFaq}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Hotel FAQ
                    </button>
                </span>

                {openAddModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={handleCloseAddModal}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Hotel FAQ</h2>

                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">
                                    Question <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Question"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">
                                    Answer <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <textarea
                                            placeholder="Enter Answer"
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={handleCloseAddModal}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit(handleFormSubmit)}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Adding...' : 'Add FAQ'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={handleCloseEditModal}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Hotel FAQ</h2>

                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">
                                    Question <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Question"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                            </div>

                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">
                                    Answer <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <textarea
                                            placeholder="Enter Answer"
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit(handleFormUpdate)}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update FAQ'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {openDeleteDialog && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Confirm Delete</h2>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this FAQ? This action cannot be undone.</p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirmation}
                                    disabled={isDeleting}
                                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
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
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedRows(getPaginatedData().map(row => row.id));
                                                        } else {
                                                            setSelectedRows([]);
                                                        }
                                                    }}
                                                    checked={selectedRows.length === getPaginatedData().length && getPaginatedData().length > 0}
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {getPaginatedData().map((faq) => (
                                            <tr key={faq.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(faq.id)}
                                                        onChange={() => handleRowSelection(faq.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {faq.title}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    <div className="max-w-xs truncate">
                                                        {faq.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        faq.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {faq.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleEditRow(faq)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <FiEdit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRow(faq.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <FiTrash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {selectedRows.length > 0 && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Deleting...' : `Delete Selected (${selectedRows.length})`}
                                    </button>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">Show:</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span className="text-sm text-gray-700">entries</span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
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

export default HotelFaqs;