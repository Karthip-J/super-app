import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import { useLocation } from 'react-router-dom';


function Stocks() {
    const [tableData, setTableData] = useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
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
    const [value, setValue] = useState('');
    // const [productId, setProductId] = useState(33);
    const [Error, setError] = useState();
    const [isEdit, setIsEdit] = useState(false);
    const [product, setProduct] = useState();
    const [isEditProduct, setIsEditProduct] = useState(false);
    const [productName, setProductName] = useState();
    const [quantity, setQuantity] = useState();

    const location = useLocation();

    const getQueryParam = (name) => {
        const urlParams = new URLSearchParams(location.search);
        return urlParams.get(name);
    };

    const productId = getQueryParam('product_variation_id');
    const {
        register,
        // handleSubmit,
        formState: { errors },
        reset,
    } = useForm();
    const [ProductDataId, setProductDataId] = useState([]);
    const fetchProductById = async () => {
        if (!productId) return;
        console.log(productId);

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://yrpitsolutions.com/ecom_backend/api/admin/get_product_variation_by_id/${productId}`);
            const data = await response.json();
            console.log(data);

            if (response.ok) {
                setProductName(data.variation_name); // Assuming the product has a "name" field
                setProductDataId(data.product.id)
                setQuantity(); // Default quantity (you can adjust this value)
            } else {
                throw new Error(data.message || 'Failed to fetch product');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProductById();
    }, [productId]);



    // Fetch brand data from the API
    const fetchStocks = async () => {
        console.log(productId);
        try {
            const response = await axios.get(`https://yrpitsolutions.com/ecom_backend/api/admin/getStockByProductVariation/${productId}`);
            const data = response.data;
            console.log(data);
            setTableData(data);
            setFilteredData(data);
            setTotalItems(data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchStocks(); // Fetch data when the component mounts
    }, []);

    // Handle search query change and filter data
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredData(tableData); // Reset to full data if no search query
            setTotalItems(tableData.length); // Reset total items
        } else {
            const filtered = tableData.filter(brand =>
                brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered); // Apply filtering
            setTotalItems(filtered.length); // Update the number of filtered items
            setCurrentPage(1); // Reset to page 1 when the search query changes
        }
    }, [searchQuery, tableData]);

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Calculate the total number of pages based on filtered data
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Ensure page resets to 1 when itemsPerPage or searchQuery changes
    useEffect(() => {
        setCurrentPage(1); // Reset to page 1
    }, [itemsPerPage, searchQuery]);

    // Get paginated data
    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);  // Paginate after filtering
    };




    const handleSubmit = async (e) => {
        e.preventDefault();

        // Start loading state
        setLoading(true);
        setError(null);  // Clear previous errors

        // Ensure accessToken is available
        const token = localStorage.getItem('OnlineShop-accessToken');

        if (!token) {
            setError("Access token is missing.");
            setLoading(false);
            return;
        }

        // Ensure productId is defined and available
        if (!productId) {
            setError("Product ID is required.");
            setLoading(false);
            return;
        }

        // Create FormData instance
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('product_id', ProductDataId);
        formData.append('name', productName);
        formData.append('quantity', quantity);

        try {
            // Make the API request using axios with FormData
            const response = await axios.post(
                `https://yrpitsolutions.com/ecom_backend/api/admin/update_product_variation_stock_by_id/${productId}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data', // Important to specify the multipart/form-data content type
                    },
                }
            );
            fetchStocks();
            // Handle successful response
            console.log('Product updated successfully:', response.data);
            // Optionally update your state or notify the user of success
        } catch (error) {
            // Handle network or other unexpected errors
            console.error('Error updating product:', error);
            setError(error.response?.data?.message || 'An error occurred while updating the product.');
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
            const token = localStorage.getItem('OnlineShop-accessToken');
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_stock_management/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchStocks();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting brand:', error);
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
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_stock_management/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }
            window.location.reload();
            // await fetchBrandData(); // Refresh the data
            setSelectedRows([]); // Clear selection after bulk delete
        } catch (error) {
            console.error('Error deleting selected brands:', error);
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
        <div className="min-h-screen pt-6">
            
            <TokenExpiration />

            <div className="bg-white p-8 rounded-lg shadow-lg w-full mt-6">

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="productName" className="block text-gray-700 font-medium mb-2">Product Variation Name:</label>
                        <input
                            type="text"
                            id="productName"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2">Quantity:</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none"
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-[150px] py-2 bg-[#4318ff] text-white font-semibold rounded-lg transition duration-300"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex justify-center items-center space-x-2">
                                <div className="w-4 h-4 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            'Add Stocks'
                        )}
                    </button>

                </form>
            </div>


            <div className="w-full mx-auto">
                <span className="flex mt-4 items-center w-full gap-6">
                </span>

                {/* Table */}
                <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-gray-600">
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
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Stocks</th>
                                <th className="px-6 py-4 text-left">Date and Time</th>
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
                                getPaginatedData().map((stocks) => (
                                    <tr key={stocks.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(stocks.id)}
                                                onChange={() => handleRowSelection(stocks.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {stocks.variation_name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {stocks.added_quantity}
                                        </td>
                                        <td className="px-6 py-4">
                                            {new Date(stocks.created_at).toLocaleString('en-GB', {
                                                weekday: 'short',   // Optional: "Mon"
                                                year: 'numeric',
                                                month: 'short',     // "Jan"
                                                day: 'numeric',     // "10"
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric',
                                                hour12: true        // Optional: true for AM/PM, false for 24-hour format
                                            })}
                                        </td>


                                        <td className="text-right">
                                            <div className="relative inline-block group">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === stocks.id ? null : stocks.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{ marginTop: "-30px" }}
                                                >
                                                    {/* <div
                                                        onClick={() => {
                                                            handleEditRow(blogcategory);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div> */}
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(stocks.id);
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
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No Stocks found
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this stock?</h2>
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




    );
}

export default Stocks;