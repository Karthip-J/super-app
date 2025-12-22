import React, { useState, useEffect, useRef } from 'react';
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

function HotelPolicy() {
    const [tableData, setTableData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null); // Fixed variable name
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
        },
    });

    const fetchPolicyData = async () => {
        try {
            const response = await api.get('/api/policies');
            const data = response.data.data || response.data;
            console.log('Policies data:', data);
            setTableData(data);
            setFilteredData(data);
            setTotalItems(data.length);
        } catch (error) {
            console.error('Error fetching policies:', error);
            toast.error('Failed to fetch policies');
        }
    };

    useEffect(() => {
        fetchPolicyData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredData(tableData);
            setTotalItems(tableData.length);
        } else {
            const filtered = tableData.filter((policy) =>
                policy.title && policy.title.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleFormSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post('/api/policies', {
                title: data.title,
                description: data.description
            });
            setOpenAddModal(false);
            fetchPolicyData();
            toast.success('Hotel Policy added successfully!');
        } catch (error) {
            console.error('Error saving Hotel Policy:', error);
            toast.error('Error saving Hotel Policy!');
        } finally {
            setLoading(false);
        }
    };

    const handleFormUpdate = async (data) => {
        setLoading(true);
        try {
            await api.put(`/api/policies/${selectedQuestion.id}`, {
                title: data.title,
                description: data.description
            });
            setOpenEditModal(false);
            fetchPolicyData();
            toast.success('Hotel Policy updated successfully!');
        } catch (error) {
            console.error('Error updating Hotel Policy:', error);
            toast.error('Error updating Hotel Policy!');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPolicy = () => {
        setSelectedQuestion(null); // Fixed variable name
        setValue('title', '');
        setValue('description', '');
        setImagePreview(null);
        setOpenAddModal(true);
    };

    const handleEditRow = (policy) => {
        setSelectedQuestion(policy); // Fixed variable name
        setValue('title', policy.title);
        setValue('description', policy.description);
        setOpenEditModal(true);
        setOpenDropdown(null);
    };

    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
        setOpenDropdown(null);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/policies/${rowIdToDelete}`);
            fetchPolicyData();
            setOpenDeleteDialog(false);
            toast.success('Policy deleted successfully!');
        } catch (error) {
            console.error('Error deleting Hotel Policy:', error);
            toast.error('Error deleting Hotel Policy!');
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
                await api.delete(`/api/policies/${id}`);
            }
            toast.success('Policies deleted successfully!');
            await fetchPolicyData();
            setSelectedRows([]);
        } catch (error) {
            console.error('Error deleting selected policies:', error);
            toast.error('Error deleting selected policies!');
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
                                placeholder="Search by Title..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                                value={searchQuery}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddPolicy}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Hotel Policy
                    </button>
                </span>

                {openAddModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={handleCloseAddModal}
                    >
                        <div
                            className="rounded-lg shadow-2xl p-8 w-[50%] max-h-[85%] overflow-y-auto transition-colors"
                            style={{ 
                                backgroundColor: 'var(--bg-card)',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Add Hotel Policy</h2>
                            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                                <div className="mb-6">
                                    <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Policy Title"
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
                                    {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title.message}</p>}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                placeholder="Enter Policy Description"
                                                rows={4}
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
                                    {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description.message}</p>}
                                </div>
                                <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <button
                                        type="button"
                                        onClick={handleCloseAddModal}
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
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        {loading ? (
                                            <span className="mr-2">Adding...</span>
                                        ) : (
                                            <>
                                                <FaPlus className="mr-2" />
                                                Add Policy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={handleCloseEditModal}
                    >
                        <div
                            className="rounded-lg shadow-2xl p-8 w-[50%] max-h-[85%] overflow-y-auto transition-colors"
                            style={{ 
                                backgroundColor: 'var(--bg-card)',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Edit Hotel Policy</h2>
                            <form onSubmit={handleSubmit(handleFormUpdate)} className="space-y-4">
                                <div className="mb-6">
                                    <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Policy Title"
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
                                    {errors.title && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.title.message}</p>}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <textarea
                                                placeholder="Enter Policy Description"
                                                rows={4}
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
                                    {errors.description && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.description.message}</p>}
                                </div>
                                <div className="flex justify-end gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
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
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                                    >
                                        {loading ? (
                                            <span className="mr-2">Updating...</span>
                                        ) : (
                                            <>
                                                <FaPlus className="mr-2" />
                                                Update Policy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
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
                            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete this policy? This action cannot be undone.</p>
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
                                                            setSelectedRows(getPaginatedData().map(row => row.id));
                                                        } else {
                                                            setSelectedRows([]);
                                                        }
                                                    }}
                                                    checked={selectedRows.length === getPaginatedData().length && getPaginatedData().length > 0}
                                                    className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                                                    style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider transition-colors" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                                        {getPaginatedData().map((policy) => (
                                            <tr 
                                                key={policy.id} 
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
                                                        checked={selectedRows.includes(policy.id)}
                                                        onChange={() => handleRowSelection(policy.id)}
                                                        className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                                                        style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                    {policy.title}
                                                </td>
                                                <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    <div className="max-w-xs truncate">
                                                        {policy.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        policy.status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                        {policy.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center">
                                                    <div className="relative inline-flex items-center justify-center group" ref={openDropdown === policy.id ? dropdownRef : null}>
                                                        <button
                                                            className="p-1 rounded-full transition-colors duration-150 flex items-center"
                                                            style={{ color: 'var(--text-secondary)' }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.color = 'var(--text-primary)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.color = 'var(--text-secondary)';
                                                            }}
                                                            aria-label={`Actions for ${policy.title}`}
                                                            onClick={() => handleEditRow(policy)}
                                                        >
                                                            <FaEdit 
                                                                className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-1 dark:text-blue-400" 
                                                            />
                                                            <FiMoreVertical />
                                                        </button>
                                                        {openDropdown === policy.id && (
                                                            <div 
                                                                className="absolute right-0 mt-8 z-10 w-48 rounded-md shadow-lg ring-1 transition-colors"
                                                                style={{
                                                                    backgroundColor: 'var(--bg-card)',
                                                                    borderColor: 'var(--border-color)',
                                                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                                                }}
                                                            >
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            handleEditRow(policy);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="flex items-center px-4 py-2 text-sm w-full text-left transition-colors"
                                                                        style={{ color: 'var(--text-primary)' }}
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                                        }}
                                                                        aria-label={`Edit policy ${policy.title}`}
                                                                    >
                                                                        <FaEdit className="mr-2 text-blue-600 dark:text-blue-400" />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            handleDeleteRow(policy.id);
                                                                            setOpenDropdown(null);
                                                                        }}
                                                                        className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 w-full text-left transition-colors"
                                                                        onMouseEnter={(e) => {
                                                                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                                        }}
                                                                        aria-label={`Delete policy ${policy.title}`}
                                                                    >
                                                                        <FiTrash2 className="mr-2" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
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

export default HotelPolicy;