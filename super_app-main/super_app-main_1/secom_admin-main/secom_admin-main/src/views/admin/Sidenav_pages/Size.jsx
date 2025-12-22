import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/apiUtils';
import API_CONFIG from '../../../config/api.config';

function Size() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [brandImage, setBrandImage] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);  // For storing the filtered data
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        size_name: ''
    });
    const [editSize, setEditSize] = useState(null);
    const [sizeToDelete, setSizeToDelete] = useState(null);

    // Yup validation schema
    const validationSchemaAdd = Yup.object({
        size_name: Yup.string().required('Size Name is required'),
    });

    const validationSchemaEdit = Yup.object({
        size_name: Yup.string().required('Size Name is required'),
    });

    const { reset, control, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            size_name: selectedSize?.size_name || '',
        },
    });

    const fetchSizeData = async () => {
        try {
            const data = await apiGet(API_CONFIG.ENDPOINTS.ADMIN.SIZES);
            setTableData(data);
            setTotalItems(data.length);  // Set total items for pagination
        } catch (error) {
            toast.error('Error fetching sizes');
        }
    };

    useEffect(() => {
        fetchSizeData();  // Fetch data whenever itemsPerPage or currentPage changes
    }, [itemsPerPage, currentPage, searchQuery]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            // If there's no search query, reset to all data
            setFilteredData(tableData);
            setTotalItems(tableData.length);
        } else {
            // Filter the table data based on the search query
            const filtered = tableData.filter((size) =>
                size.size_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length); // Update total items count after filtering
        }
    }, [searchQuery, tableData]);

    // Handle Page Change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        fetchSizeData();
    }, [itemsPerPage]);

    const handleFormSubmit = async (data) => {
        const formData = new FormData();
        formData.append('size_name', data.size_name);
        setLoading(true);

        try {
            if (isEditMode) {
                await apiPut(`${API_CONFIG.ENDPOINTS.ADMIN.SIZES}/${editSize.id}`, formData);
                toast.success('Size updated successfully');
            } else {
                await apiPost(API_CONFIG.ENDPOINTS.ADMIN.SIZES, formData);
                toast.success('Size created successfully');
            }
            setIsModalOpen(false);
            fetchSizeData();
            reset();
        } catch (error) {
            toast.error('Error saving size');
        } finally {
            setLoading(false);
        }
    };

    const handleEditRow = (size) => {
        setSelectedSize(size);
        setValue('size_name', size.size_name);
        setOpenEditModal(true);
        trigger();
    };

    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            await apiDelete(`${API_CONFIG.ENDPOINTS.ADMIN.SIZES}/${sizeToDelete}`);
            toast.success('Size deleted successfully');
            setOpenDeleteDialog(false);
            fetchSizeData();
        } catch (error) {
            toast.error('Error deleting size');
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
                await apiDelete(`${API_CONFIG.ENDPOINTS.ADMIN.SIZES}/${id}`);
            }
            await fetchSizeData();
            setSelectedRows([]); // Clear selection
            window.location.reload(); // Optionally refresh the page
            toast.success('Selected sizes deleted successfully');
        } catch (error) {
            toast.error('Error deleting selected sizes');
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
        if (searchQuery) {
            // Ensure you're filtering by the discount name
            const filtered = tableData.filter((size) =>
                size.size_name?.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by discount name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all discounts
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);

    // Get paginated data
    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEdit = (size) => {
        setEditSize(size);
        setFormData({
            size_name: size.size_name
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleResetForm = () => {
        setFormData({
            size_name: ''
        });
        setEditSize(null);
        setIsEditMode(false);
    };

    useEffect(() => {
        fetchSizeData();
    }, []);

    return (
        <div 
            className="min-h-screen pt-6 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <TokenExpiration />
            <ToastContainer />
            <div className="w-full mx-auto">
                <span className="flex mt-4 items-center w-full gap-6">
                    {/* Search bar */}
                    <div className="relative flex flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
                        <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
                            <p className="pl-3 pr-2 text-xl">
                                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
                            </p>
                            <input
                                type="text"
                                placeholder="Search by Size Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on change
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            handleResetForm();
                            setIsModalOpen(true);
                        }}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Size
                    </button>
                </span>

                {isModalOpen && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <div
                            className="rounded-lg shadow-2xl p-12 w-[35%] max-h-[80%] overflow-y-auto transition-colors duration-300"
                            style={{ backgroundColor: 'var(--bg-card)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 
                                className="text-2xl font-semibold mb-6 transition-colors duration-300"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {isEditMode ? 'Edit Size' : 'Add Size'}
                            </h2>

                            <div className="mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Size Name<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="size_name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Size Name"
                                            className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.size_name && <p className="text-red-500 dark:text-red-400 text-sm">{errors.size_name.message}</p>}
                            </div>

                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-md transition-colors duration-300"
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)'
                                    }}
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
                                        'Save'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div 
                    className="mt-8 shadow-lg rounded-lg p-6 transition-colors duration-300"
                    style={{ backgroundColor: 'var(--bg-table)' }}
                >
                    <table className="w-full table-auto">
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)' }}>
                                <th className="px-6 py-4 text-left">
                                    <div className="flex justify-between items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.length === getPaginatedData().length}
                                            onChange={() => {
                                                if (selectedRows.length === getPaginatedData().length) {
                                                    setSelectedRows([]);
                                                } else {
                                                    setSelectedRows(getPaginatedData().map((row) => row.id));
                                                }
                                            }}
                                            className="transition-colors duration-300"
                                            style={{ accentColor: 'var(--text-primary)' }}
                                        />
                                    </div>
                                </th>

                                <th 
                                    className="px-6 py-4 text-left transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Size Name
                                </th>
                                <th className="">
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
                            {getPaginatedData().length > 0 ? (
                                getPaginatedData().map((size) => (
                                    <tr 
                                        key={size.id} 
                                        className="border-t transition-colors duration-300"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(size.id)}
                                                onChange={() => handleRowSelection(size.id)}
                                                className="transition-colors duration-300"
                                                style={{ accentColor: 'var(--text-primary)' }}
                                            />
                                        </td>

                                        <td 
                                            className="px-6 py-4 transition-colors duration-300"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {size.size_name}
                                        </td>

                                        <td className="text-right">
                                            <div className="relative inline-block group">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === size.id ? null : size.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{ marginTop: "-30px" }}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEdit(size);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            setSizeToDelete(size.id);
                                                            setOpenDeleteDialog(true);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaTrashAlt className="mr-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td 
                                        colSpan="4" 
                                        className="px-6 py-4 text-center transition-colors duration-300"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        No data found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                    <span 
                        className="mr-2 transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Show
                    </span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="border px-4 py-2 rounded-md transition-colors duration-300"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-primary)',
                            borderColor: 'var(--border-color)'
                        }}
                    >
                        {[5, 10, 20, 50, 100].map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span 
                        className="ml-2 transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        entries
                    </span>
                </div>

                <div className="flex space-x-4">
                    {/* Showing Item Range */}

                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`${currentPage === 1
                            ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
                            : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'
                            } px-6 py-2 rounded-[20px] transition-colors duration-300`}
                    >
                        Back
                    </button>
                    <span 
                        className="mt-2 transition-colors duration-300"
                        style={{ color: 'var(--text-primary)' }}
                    >
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
                    <div 
                        className="p-6 rounded-md shadow-lg w-1/3 transition-colors duration-300"
                        style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                        <h2 
                            className="text-xl font-semibold mb-4 transition-colors duration-300"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            Are you sure you want to delete this Size?
                        </h2>
                        <div className="flex justify-end">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 mr-4 border rounded-md transition-colors duration-300"
                                style={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    borderColor: 'var(--border-color)'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirmation}
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

export default Size;