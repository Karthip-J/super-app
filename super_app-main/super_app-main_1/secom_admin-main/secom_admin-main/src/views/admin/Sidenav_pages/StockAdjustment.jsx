import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaEllipsisV, FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

function StockAdjustment() {
    const navigate = useNavigate();
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
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
    // const [productId, setProductId] = useState(18); 
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);


    const validationSchemaAdd = Yup.object().shape({
        brandName: Yup.string().required('Brand name is required'),
        brandImage: Yup.mixed().notRequired(),
    });


    const validationSchemaEdit = Yup.object().shape({
        brandName: Yup.string().required('Brand name is required'),
        brandImage: Yup.mixed().required('Brand image is required'),
    });


    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            brandName: selectedBrand?.brand_name || '',
            brandImage: selectedBrand?.photo || null,
        },
    });


    const fetchStockData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://yrpitsolutions.com/ecom_backend/api/admin/get_all_product_variation`);
            const data = response.data;
            setTableData(data);
            setFilteredData(data);
            setTotalItems(data.length);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockData();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredData(tableData);
            setTotalItems(tableData.length);
        } else {
            const filtered = tableData.filter(brand =>
                brand.product.name.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleRowSelection = (id) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    const handleEditRow = (brand) => {
        setSelectedBrand(brand);
        setOpenEditModal(true);
        setValue('brandName', brand.brand_name);
    };

    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };


    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            
            // Delete product variation
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_product_variation_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
    
            // Fetch updated stock data and close the delete dialog
            fetchStockData();
            setOpenDeleteDialog(false);
    
            // Show success toast
            toast.success('Product variation deleted successfully!', {
                progress: undefined, // Hide the progress bar
                hideProgressBar: true,
            });
    
        } catch (error) {
            console.error('Error deleting product variation:', error);
            
            // Show error toast
            toast.error('Error deleting product variation!', {
                progress: undefined, // Hide the progress bar
                hideProgressBar: true,
            });
        } finally {
            setIsDeleting(false);
        }
    }
    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
    };

    const handleBulkDelete = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            for (let id of selectedRows) {
                // Use the `id` from `selectedRows` instead of `rowIdToDelete`
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_product_variation_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }
            window.location.reload();
            await fetchStockData(); // Refresh the data
            setSelectedRows([]); // Clear selection after bulk delete
        } catch (error) {
            console.error('Error deleting selected products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle dropdown close when clicking outside
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
        <div className="min-h-screen pt-6">
             
                 <ToastContainer />
            <div className="w-full mx-auto">
                {/* Search bar */}
                <span className="flex mt-4 items-center w-full gap-6">
                                    {/* Search bar */}
                                    <div className="relative flex  flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
                                        <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
                                            <p className="pl-3 pr-2 text-xl">
                                                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
                                            </p>
                                            <input
                        type="text"
                        placeholder="Search by Production Variation..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                        className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                    />
                                        </div>
                                    </div>
                
                                </span>

                {/* Table */}
                <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-gray-600">
                                <th className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        // checked={selectedRows.length === getPaginatedData().length}
                                        checked={false} 
                                        onChange={() => {
                                            if (selectedRows.length === getPaginatedData().length) {
                                                setSelectedRows([]);
                                            } else {
                                                setSelectedRows(getPaginatedData().map((row) => row.id));
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left">Product Variation</th>
                                <th className="px-6 py-4 text-left">Quantity Added</th>
                                <th className="px-6 py-4 text-right">Actions</th>
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
                            {filteredData.length > 0 ? (
                                getPaginatedData().map((stock) => (
                                    <tr key={stock.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(stock.id)}
                                                onChange={() => handleRowSelection(stock.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">{stock.variation_name}</td>
                                        <td className="px-6 py-4">{stock.quantity}</td>
                                        {/* <td className="text-right px-6 py-4">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === stock.id ? null : stock.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === stock.id && (
                                                    <div ref={dropdownRef} className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"> */}
                                                        {/* <div
                                                            onClick={() => {
                                                                handleEditRow(stock);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div> */}
                                                        {/* <div
                                                            onClick={() => {
                                                                handleEditRow(stock);
                                                                setOpenDropdown(null);
                                                                navigate(`/admin/stocks?product_variation_id=${stock.id}`); // Redirect to the stocks page
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(stock.id);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaTrashAlt className="mr-2" />
                                                            Delete
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td> */}
                                        <td className="text-right">
                                            <div className="relative inline-block group">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === stock.id ? null : stock.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{marginTop:"-30px"}}
                                                >
                                                    <div
                                                         onClick={() => {
                                                            handleEditRow(stock);
                                                            setOpenDropdown(null);
                                                            navigate(`/admin/stocks?product_variation_id=${stock.id}`); // Redirect to the stocks page
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(stock.id);
                                                            setOpenDropdown(null);
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
                                    <td colSpan="4" className="text-center py-4">No data found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>


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
                                : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'} px-6 py-2 rounded-[20px]`}
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
                                : 'bg-[#4318ff] text-white hover:bg-[#3700b3]'} px-6 py-2 rounded-[20px]`}
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation Dialog */}
                {openDeleteDialog && (
                    <div className="fixed inset-0 flex items-center justify-center z-20 bg-gray-500 bg-opacity-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                            <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Variation?</h2>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 mr-4 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
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
        </div>
    );
}

export default StockAdjustment;
