import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

function Tax() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    // const [brandImage, setBrandImage] = useState(null);
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

    const navigate = useNavigate();

    // Yup validation schema
    const validationSchemaAdd = Yup.object({
        name: Yup.string().required('Tax Name is required'),
        value: Yup.string().required('Tax value is required'),

    });

    const validationSchemaEdit = Yup.object({
        name: Yup.string().required('Tax Name is required'),
        value: Yup.string().required('Tax value is required'),
    });

    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            name: selectedBrand?.name || '',
            value: selectedBrand?.value || '',
        },
    });


    const handleGroupTax = () => {

        navigate('/grouptax');
    };

    const fetchTaxData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/taxes');
            setTableData(response.data);

            setTotalItems(response.data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Handle Page Change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        fetchTaxData();
    }, [itemsPerPage]);

    useEffect(() => {
        setTotalItems(getFilteredData().length); // Update totalItems after filtering
    }, [searchQuery, tableData]);

    const getFilteredData = () => {
        return tableData.filter(tax =>
            tax.name.toLowerCase().includes(searchQuery.toLowerCase()) // Case-insensitive search
        );
    };

    const [errorMessage, setErrorMessage] = useState('');

    const handleFormSubmit = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('value', data.value);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = 'https://yrpitsolutions.com/ecom_backend/api/admin/taxes';

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    // Success toast message
                    toast.success('Tax added successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                    });

                    // Reset form and fetch updated tax data
                    fetchTaxData();
                    setOpenAddModal(false);
                    reset();

                } catch (error) {
                    if (error.response && error.response.status === 422) {
                        // Handle specific error for duplicate tax name
                        toast.error('The Tax name has already been taken, try with another tax name.', {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: true,
                        });
                    } else {
                        console.error('Error submitting form:', error);

                        // General error toast message
                        toast.error('Something went wrong! Please try again.', {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: true,
                        });
                    }
                } finally {
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);
            toast.error('Something went wrong! Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
        }
    };

    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name || selectedBrand.name);
        formData.append('value', data.value || selectedBrand.value);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/taxes/${selectedBrand.id}`;

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    // Success toast message
                    toast.success('Tax updated successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                    });

                    // Fetch updated data, reset form, and close modal
                    fetchTaxData();
                    setOpenEditModal(false);
                    reset();
                } catch (error) {
                    console.error('Error updating form:', error);

                    // General error toast message
                    toast.error('Something went wrong! Please try again.', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                    });
                } finally {
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);

            // General error toast message
            toast.error('Something went wrong! Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
        }
    };


    const handleAddBrand = () => {
        setSelectedBrand(null);
        setValue('name', '');
        setValue('value', '');
        setOpenAddModal(true);
        reset();
    };

    const handleEditRow = (tax) => {
        setSelectedBrand(tax);
        setValue('name', tax.name);
        setValue('value', tax.value);
        setOpenEditModal(true);
    };


    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/taxes/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success toast message
            toast.success('Tax deleted successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });

            // Fetch updated data and close the delete dialog
            fetchTaxData();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting brand:', error);

            // Error toast message
            toast.error('Something went wrong! Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
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

            // Perform bulk delete for each selected row
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/taxes/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            // Success toast message
            toast.success('Selected taxes deleted successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });

            // Fetch updated data, reset selected rows, and reload page
            await fetchTaxData();
            setSelectedRows([]);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting selected brands:', error);

            // Error toast message
            toast.error('Something went wrong while deleting taxes. Please try again.', {
                position: "top-right",
                autoClose: 3000,
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

    useEffect(() => {
        if (searchQuery) {
            // Ensure you're filtering by the discount name
            const filtered = tableData.filter((tax) =>
                tax.name?.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by discount name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all discounts
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);

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
        <div 
            className="min-h-screen pt-6 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* <TokenExpiration /> */}
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
                                placeholder="Search by Tax Name..."
                                onChange={(e) => setSearchQuery(e.target.value)} // Directly set the search query
                                value={searchQuery}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>

                    {/* <button
                        onClick={handleGroupTax}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Group Tax
                    </button> */}
                    <button
                        onClick={handleAddBrand}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Tax
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
                                Add Tax
                            </h2>

                            {errorMessage && (
                                <div className="mb-4 text-red-500 dark:text-red-400 text-sm">
                                    {errorMessage}
                                </div>
                            )}

                            <div className="mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Tax Name<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Tax Name"
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
                                {errors.name && <p className="text-red-500 dark:text-red-400 text-sm">{errors.name.message}</p>}
                            </div>

                            <div className="mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Tax Value<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="value"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Tax Value"
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
                                {errors.value && <p className="text-red-500 dark:text-red-400 text-sm">{errors.value.message}</p>}
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
                            className="rounded-lg shadow-2xl p-12 w-[35%] max-h-[80%] overflow-y-auto transition-colors duration-300"
                            style={{ backgroundColor: 'var(--bg-card)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 
                                className="text-2xl font-semibold mb-6 transition-colors duration-300"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Edit Tax
                            </h2>

                            <div className="mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Tax Name<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Tax Name"
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
                                {errors.name && (
                                    <p className="text-red-500 dark:text-red-400 text-sm">{errors.name.message}</p>
                                )}
                            </div>



                            <div className="mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Tax Value<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="value"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Tax Value"
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
                                {errors.value && (
                                    <p className="text-red-500 dark:text-red-400 text-sm">{errors.value.message}</p>
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
                                    Tax Name
                                </th>
                                <th 
                                    className="px-6 py-4 text-left transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Tax Value
                                </th>
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
                                    <td 
                                        colSpan="4" 
                                        className="text-center py-4 transition-colors duration-300"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        No Tax data found
                                    </td>
                                </tr>
                            ) : (
                                getPaginatedData().map((tax) => (
                                    <tr 
                                        key={tax.id} 
                                        className="border-t transition-colors duration-300"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(tax.id)}
                                                onChange={() => handleRowSelection(tax.id)}
                                                className="transition-colors duration-300"
                                                style={{ accentColor: 'var(--text-primary)' }}
                                            />
                                        </td>
                                        <td 
                                            className="px-6 py-4 transition-colors duration-300"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {tax.name}
                                        </td>
                                        <td 
                                            className="px-6 py-4 transition-colors duration-300"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {tax.value}
                                        </td>
                                        {/* <td className="text-right">
                                            <div className="relative inline-block group">
                                               
                                                <button className="text-gray-600 hover:text-gray-900">
                                                    <FaEllipsisV />
                                                </button>

                                    
                                                <div className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                    <div
                                                        onClick={() => {
                                                            handleEditRow(tax);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                        Edit
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(tax.id);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaTrashAlt className="mr-2" />
                                                        Delete
                                                    </div>
                                                </div>
                                            </div>
                                        </td> */}

                                        {/* <td className="text-right">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => handleEditRow(tax)}
                                                    className="flex items-center px-3 py-1 text-navy-700 hover:bg-gray-200 rounded-md transition"
                                                >
                                                    <FaEdit className="mr-1 text-black" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRow(tax.id)}
                                                    className="flex items-center px-3 py-1 text-red-600 hover:bg-gray-200 rounded-md transition"
                                                >
                                                    <FaTrashAlt className="mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td> */}
                                        <td className="text-right group relative">
                                            <div className="flex items-center space-x-2">
                                                {/* Ellipsis icon */}
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === tax.id ? null : tax.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {/* Edit and Delete icons visible on hover */}
                                                <div className="absolute right-20 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200">
                                                    <button
                                                        onClick={() => handleEditRow(tax)}
                                                        className="text-navy-700 hover:bg-gray-200"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRow(tax.id)}
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
                        {[10, 20, 50, 100].map((option) => (
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
                            Are you sure you want to delete this Tax?
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

export default Tax;
