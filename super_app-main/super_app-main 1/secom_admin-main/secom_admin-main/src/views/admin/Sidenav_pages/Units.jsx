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

function Units() {
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
        unit_name: '',
        unit_symbol: ''
    });
    const [editUnit, setEditUnit] = useState(null);
    const [unitToDelete, setUnitToDelete] = useState(null);

    // Yup validation schema
    const validationSchemaAdd = Yup.object({
        unit_name: Yup.string().required('Unit Name is required'),
    });

    const validationSchemaEdit = Yup.object({
        unit_name: Yup.string().required('Unit Name is required'),
    });

    const { reset, control, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            unit_name: selectedSize?.unit_name || '',
        },
    });

    const fetchSizeData = async () => {
        try {
            const data = await apiGet(API_CONFIG.ENDPOINTS.ADMIN.UNITS);
            setTableData(data);
            setTotalItems(data.length);  // Set total items for pagination
        } catch (error) {
            toast.error('Error fetching units');
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
            const filtered = tableData.filter((unit) =>
                unit.unit_name.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await apiPut(`${API_CONFIG.ENDPOINTS.ADMIN.UNITS}/${editUnit.id}`, formData);
                toast.success('Unit updated successfully');
            } else {
                await apiPost(API_CONFIG.ENDPOINTS.ADMIN.UNITS, formData);
                toast.success('Unit created successfully');
            }
            setIsModalOpen(false);
            fetchSizeData();
            reset();
        } catch (error) {
            toast.error('Error saving unit');
        }
    };

    const handleEdit = (unit) => {
        setEditUnit(unit);
        setFormData({
            unit_name: unit.unit_name,
            unit_symbol: unit.unit_symbol
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        try {
            await apiDelete(`${API_CONFIG.ENDPOINTS.ADMIN.UNITS}/${unitToDelete}`);
            toast.success('Unit deleted successfully');
            setOpenDeleteDialog(false);
            fetchSizeData();
        } catch (error) {
            toast.error('Error deleting unit');
        }
    };

    const handleAddBrand = () => {
        setSelectedSize(null);
        setValue('unit_name', '');
        setOpenAddModal(true);
    };

    const handleEditRow = (unit) => {
        setSelectedSize(unit);
        setValue('unit_name', unit.unit_name);
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
            await handleDelete();
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

            // Iterate through selected rows and delete each size
            for (let id of selectedRows) {
                await apiDelete(`${API_CONFIG.ENDPOINTS.ADMIN.UNITS}/${id}`);
            }

            // Refresh size data
            await fetchSizeData();
            setSelectedRows([]); // Clear selection
            window.location.reload(); // Optionally refresh the page

            // Show success toast after bulk delete is complete
            toast.success('Selected Units deleted successfully!', {
                progress: undefined,  // Hide progress bar
                hideProgressBar: true,
            });

        } catch (error) {
            console.error('Error deleting selected sizes:', error);

            // Show error toast if something goes wrong
            toast.error('Error deleting selected sizes!', {
                progress: undefined,  // Hide progress bar
                hideProgressBar: true,
            });
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
                                placeholder="Search by Units Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on change
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddBrand}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Units
                    </button>
                </span>

                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
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
                                Add Units
                            </h2>

                            <div className="mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Unit Name<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="unit_name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Unit Name"
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
                                {errors.unit_name && <p className="text-red-500 dark:text-red-400 text-sm">{errors.unit_name.message}</p>}
                            </div>

                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setOpenAddModal(false)}
                                    className="px-6 py-3 rounded-md transition-colors duration-300"
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit(handleSubmitForm)}
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

                {openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenEditModal(false)}
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
                                Edit Unit
                            </h2>

                            <div className="mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Unit Name<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="unit_name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Unit Name"
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
                                {errors.unit_name && (
                                    <p className="text-red-500 dark:text-red-400 text-sm">{errors.unit_name.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setOpenEditModal(false)}
                                    className="px-6 py-3 rounded-md transition-colors duration-300"
                                    style={{
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit(handleSubmitForm)}
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
                                            checked={false} 
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
                                    Units Name
                                </th>
                                <th 
                                    className="px-6 py-4 text-left transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Unit Symbol
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
                                getPaginatedData().map((unit) => (
                                    <tr 
                                        key={unit.id} 
                                        className="border-t transition-colors duration-300"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(unit.id)}
                                                onChange={() => handleRowSelection(unit.id)}
                                                className="transition-colors duration-300"
                                                style={{ accentColor: 'var(--text-primary)' }}
                                            />
                                        </td>

                                        <td 
                                            className="px-6 py-4 transition-colors duration-300"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {unit.unit_name}
                                        </td>
                                        <td 
                                            className="px-6 py-4 transition-colors duration-300"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {unit.unit_symbol}
                                        </td>

                                        <td className="text-right">
                                            <div className="relative inline-block group">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === unit.id ? null : unit.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{ marginTop: "-30px" }}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEdit(unit);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            setUnitToDelete(unit.id);
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
                            Are you sure you want to delete this Unit?
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

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">
                            {isEditMode ? 'Edit Unit' : 'Add Unit'}
                        </h2>
                        <form onSubmit={handleSubmitForm}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Unit Name
                                </label>
                                <input
                                    type="text"
                                    name="unit_name"
                                    value={formData.unit_name}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Unit Symbol
                                </label>
                                <input
                                    type="text"
                                    name="unit_symbol"
                                    value={formData.unit_symbol}
                                    onChange={handleInputChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        reset();
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    {isEditMode ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Units;