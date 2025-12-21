import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import { comment } from 'postcss';

function Rating() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedRating, setSelectedRating] = useState(null);
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

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };


    const validationSchema = Yup.object({
        ratings: Yup.string().required('Rating Name is required'),
        user_id: Yup.string().required('User ID is required'),
        comment: Yup.string().required('Comment is required'),
        Status: Yup.string()
            .oneOf(['draft', 'publish'], 'Status must be either draft or publish')
            .required('Status is required'),
    });

    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        context: {
            isAdd: openAddModal,
        },
        defaultValues: {
            ratings: selectedRating?.Rating_name || '',
            Status: selectedRating?.status || 'draft',
            user_id: selectedRating?.user_id || '',
            comment: selectedRating?.comment || '',
        },
    });

    const fetchRatingData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_rating ');
            let data = response.data;

            // Apply the search query filter here
            if (searchQuery.trim() !== '') {
                data = data.filter((Rating) =>
                    Rating.Rating_name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Set filtered data (filtered by search query)
            setFilteredData(data);
            setTotalItems(data.length);  // Set total items for pagination
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchRatingData();
    }, [itemsPerPage, currentPage, searchQuery]);

    useEffect(() => {
        if (searchQuery) {
            // Ensure you're filtering by the discount name
            const filtered = tableData.filter((Rating) =>
                Rating.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by discount name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all discounts
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);



    // Handle Page Change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        fetchRatingData();
    }, [itemsPerPage]);

    const [error, setError] = useState(null);

    const handleFormUpdate = async (data) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('status', data.Status);
        
        // If the user name is present in the selectedRating, we fetch user_id
        const user_id = selectedRating?.user?.id || ''; // Make sure user_id exists or fallback to empty string
    
        formData.append('user_name', data.user_id.trim() || selectedRating.user.name); // Prefill user_name
        formData.append('user_id', user_id);  // Pass user_id based on user_name
        formData.append('ratings', data.ratings.trim() || selectedRating.ratings);
        formData.append('comment', data.comment.trim() || selectedRating.comment);
    
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/update_rating_by_id/${selectedRating.id}`;
            const response = await axios.post(url, formData, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            fetchRatingData();
            setOpenEditModal(false);
            reset();
        } catch (error) {
            console.error('Error updating rating:', error);
        } finally {
            setLoading(false);
        }
    };
    


    const handleEditRow = (Rating) => {
        setSelectedRating(Rating);
        setValue('ratings', Rating.ratings);  // Set the rating name
        setValue('user_id', Rating.user ? Rating.user.name : '');  // Set the user name if available
        setValue('comment', Rating.comment);  // Set the comment
        setOpenEditModal(true);  // Open the modal for editing
    };


    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_rating_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            fetchRatingData();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting Rating:', error);
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
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_rating_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }
            fetchRatingData();
            setSelectedRows([]); // Clear selection after bulk delete
        } catch (error) {
            console.error('Error deleting selected Ratings:', error);
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
        <div className=" min-h-screen pt-6">
            
            <TokenExpiration />
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
                                placeholder="Search by Ratings ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>
                </span>

                {/* Modal for editing a Rating */}

                {openEditModal ? (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenEditModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-8 w-[45%] max-h-[90%] overflow-hidden" // Reduced padding (p-12 to p-8) for more compact modal
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Edit Rating</h2>

                            {/* Fields in Row */}
                            <div className="mb-4 flex space-x-4">
                                {/* User Name */}
                                <div className="w-1/2">
                                    <label className="block text-lg text-gray-600 font-medium">Product Type</label>
                                    <Controller
                                        name=""
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Product Type"
                                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                                disabled={true}  // Disabling this since it should only be viewed, not edited
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.dd && <p className="text-red-500 text-sm">{errors.dd.message}</p>}
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-lg text-gray-600 font-medium">User Name</label>
                                    <Controller
                                        name="user_id"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter User Name"
                                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                                disabled={true}  // Disabling this since it should only be viewed, not edited
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.user_id && <p className="text-red-500 text-sm">{errors.user_id.message}</p>}
                                </div>

                                {/* Rating Name */}
                                <div className="w-1/2">
                                    <label className="block text-lg text-gray-600 font-medium">Rating</label>
                                    <Controller
                                        name="ratings"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Rating Name"
                                                className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none" // Reduced padding py-3 to py-2
                                                disabled={true} // Disable the input
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.ratings && <p className="text-red-500 text-sm">{errors.ratings.message}</p>}
                                </div>
                            </div>

                            {/* Comment Field */}
                            <div className="mb-4">
                                <label className="block text-lg text-gray-600 font-medium">Comment</label>
                                <Controller
                                    name="comment" // Add the comment field here
                                    control={control}
                                    render={({ field }) => (
                                        <textarea
                                            placeholder="Enter your comment here"
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none h-16" // Reduced height from h-24 to h-16
                                            disabled={true} // Disable the textarea
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.comment && <p className="text-red-500 text-sm">{errors.comment.message}</p>}
                            </div>

                            {/* Status */}
                            <div className="mb-4">
                                <label className="block text-lg text-gray-600 font-medium">Status<span className="text-red-500 ">*</span></label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none" // Reduced padding py-3 to py-2
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="publish">Publish</option>
                                        </select>
                                    )}
                                />
                                {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setOpenEditModal(false)} // Close modal on cancel
                                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md" // Reduced padding
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit(handleFormUpdate)} // Submit the form
                                    disabled={loading}
                                    className="relative bg-[#4318ff] text-white px-6 py-2 rounded-lg flex items-center ml-auto max-w-xs" // Reduced padding
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
                ) : null}

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
                                <th className="px-6 py-4 text-left">Product Type</th>
                                <th className="px-6 py-4 text-left">User</th>
                                <th className="px-6 py-4 text-left">Rating </th>
                                <th className="px-6 py-4 text-left">Comment</th>
                                <th className="">{selectedRows.length > 0 && (
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
                                )}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getPaginatedData().length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-gray-500">
                                        No Ratings found
                                    </td>
                                </tr>
                            ) : (
                                getPaginatedData().map((Rating) => (
                                    <tr key={Rating.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(Rating.id)}
                                                onChange={() => handleRowSelection(Rating.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <td className="px-6 py-4">Ecommerece</td>
                                        </td>
                                        <td className="px-6 py-4">
                                            <td className="px-6 py-4">{Rating.user.name}</td>
                                        </td>
                                        <td className="px-6 py-4">
                                            {/* Display rating as stars */}
                                            <div className="flex items-center">
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <span
                                                        key={index}
                                                        className={`text-3xl ${index < Rating.ratings ? 'text-yellow-500' : 'text-gray-300'}`}
                                                    >
                                                        {index < Rating.ratings ? '★' : '☆'}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">{Rating.comment}</td>
                                        {/* <td className="text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === Rating.id ? null : Rating.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === Rating.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                handleEditRow(Rating);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(Rating.id);
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
                                                    onClick={() => setOpenDropdown(openDropdown === Rating.id ? null : Rating.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-0 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{ marginTop: "-30px" }}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEditRow(Rating);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700  cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(Rating.id);
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

            {/* pageignation */}
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Rating?</h2>
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

export default Rating;