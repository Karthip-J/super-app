import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaEllipsisV } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import { FaSpinner } from 'react-icons/fa';

function Enquiry() {
    const [tableData, setTableData] = useState([]); // Store fetched data
    const [filteredData, setFilteredData] = useState([]); // Store filtered data for search and pagination
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        filterData(query); // Filter data based on the search query
    };

    const fetchEnquiryData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_enquiry');
            setTableData(response.data);
            setFilteredData(response.data); // Initially show all data
            setTotalItems(response.data.length); // Update total items count
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchEnquiryData();  // Fetch data on component mount
    }, []);

    // Filter data based on the search query
    const filterData = (query) => {
        if (query.trim() === '') {
            setFilteredData(tableData);
            setTotalItems(tableData.length);
        } else {
            const filtered = tableData.filter((enquiry) => {
                const enquiryName = enquiry.name || '';  // Handle undefined or null values
                return enquiryName.toLowerCase().includes(query.toLowerCase());
            });
            setFilteredData(filtered);
            setTotalItems(filtered.length);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            // Ensure you're filtering by the discount name
            const filtered = tableData.filter((Enquiry) =>
                Enquiry.name?.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by discount name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all discounts
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);

    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        filterData(searchQuery);
    }, [currentPage, itemsPerPage]);


    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
        // Open delete dialog or handle deletion logic here
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_enquiry_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            fetchEnquiryData();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting brand:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDelete = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_enquiry_by_id/${rowIdToDelete}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }
            fetchEnquiryData(); // Re-fetch data after deletion
            setSelectedRows([]);
        } catch (error) {
            console.error('Error deleting selected Enquirys:', error);
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

    return (
        <div className="min-h-screen pt-6">
             
            <TokenExpiration />
            <div className="w-full mx-auto">
                <span className="flex items-center w-full gap-3">
                    {/* Search bar */}
                    <div className="relative mt-3 flex h-[61px] flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
                        <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
                            <p className="pl-3 pr-2 text-xl">
                                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
                            </p>
                            <input
                                type="text"
                                placeholder="Search by Enquiry Name..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="block h-full w-full rounded-full text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
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
                                    <div className="flex justify-between items-center">
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
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Name</th>
                                <th className="px-6 py-4 text-left">Email</th>
                                <th className="px-6 py-4 text-left">Mobile Number</th>
                                <th className="px-6 py-4 text-left">Company</th>
                                <th className="px-6 py-4 text-left">Message</th>
                                <th className="px-6 py-4 text-right">
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
                                        No Enquiry found
                                    </td>
                                </tr>
                            ) : (
                                getPaginatedData().map((Enquiry) => (
                                    <tr key={Enquiry.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(Enquiry.id)}
                                                onChange={() => handleRowSelection(Enquiry.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">{Enquiry.name}</td>
                                        <td className="px-6 py-4">{Enquiry.email}</td>
                                        <td className="px-6 py-4">{Enquiry.mobile}</td>
                                        <td className="px-6 py-4">{Enquiry.company_name}</td>
                                        <td className="px-6 py-4">{Enquiry.message}</td>
                                        {/* <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === Enquiry.id ? null : Enquiry.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === Enquiry.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(Enquiry.id);
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
                                                    onClick={() => setOpenDropdown(openDropdown === Enquiry.id ? null : Enquiry.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-0 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{marginTop:"-30px"}}
                                                >
                                                    {/* <div
                                                        onClick={() => {
                                                            handleEditRow(Enquiry);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div> */}
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(Enquiry.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-red-600  cursor-pointer"
                                                    >
                                                        <FaTrashAlt className="mr-2" />
                                                    </div>
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Enquiry?</h2>
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

export default Enquiry;
