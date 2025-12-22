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


function BlogCategory() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [brandName, setBrandName] = useState('');
    const [brandImage, setBrandImage] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filteredData, setFilteredData] = useState([]); // State to store filtered data
    const [searchQuery, setSearchQuery] = useState(''); // State for search query


    // Yup validation schema
    // const validationSchema = Yup.object({
    //     brandName: Yup.string().required('Brand Name is required'),
    //     brandImage: Yup.mixed()
    // });

    // Yup validation schema
    const validationSchemaAdd = Yup.object({
        category_name: Yup.string().required('Category name is required'),

    });

    const validationSchemaEdit = Yup.object({
        category_name: Yup.string().required('Category Name is required'),
        // No image validation in edit modal
    });

    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            category_name: selectedBrand?.category_name || '',
        },
    });



    const fetchBlogCategoryData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_blog_ecom_category');
            setTableData(response.data);
            setFilteredData(response.data); // Initialize filtered data with all categories
            setTotalItems(response.data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    useEffect(() => {
        if (searchQuery) {
            const filtered = tableData.filter((category) =>
                category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by category_name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to the first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all categories
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);

    useEffect(() => {
        fetchBlogCategoryData();
    }, [itemsPerPage]);

    useEffect(() => {
        fetchBlogCategoryData();
    }, [itemsPerPage]);

    const handleFormSubmit = async (data) => {
           const Blogcategory = data.blogcategory;
                const existingBrand = getPaginatedData().find(blog => blog.Blogcategory.toLowerCase() === Blogcategory.toLowerCase());
        
                if (existingBrand) {
                    toast.error("This Blog already exists. Provide different category name.", {
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                    return; // Prevent form submission if the brand name already exists
                }
        const formData = new FormData();
        formData.append('category_name', data.category_name);
        setLoading(true);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = 'https://yrpitsolutions.com/ecom_backend/api/admin/save_blog_ecom_category';

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    // Success toast
                    toast.success("Category added successfully!", {
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    fetchBlogCategoryData();
                    setOpenAddModal(false);
                    reset();
                } catch (error) {
                    console.error('Error submitting form:', error);
                    // Error toast
                    toast.error("An error occurred while submitting the form. Please try again.", {
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                } finally {
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);
            // Error toast for preparation failure
            toast.error("An error occurred while preparing the form data.", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('category_name', data.category_name || selectedBrand.category_name);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/update_blog_ecom_category/${selectedBrand.id}`;

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    // Success toast
                    toast.success("Category updated successfully!", {
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    fetchBlogCategoryData();
                    setOpenEditModal(false);
                    reset();
                } catch (error) {
                    console.error('Error updating form:', error);
                    // Error toast
                    toast.error("An error occurred while updating the category. Please try again.", {
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                } finally {
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);
            // Error toast for preparation failure
            toast.error("An error occurred while preparing the form data.", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleAddBrand = () => {
        setSelectedBrand(null);
        setValue('category_name', '');
        setOpenAddModal(true);
        reset();
    };

    // const handleEditRow = (blogcategory) => {
    //     setSelectedBrand(blogcategory);
    //     setValue('category_name', blogcategory.category_name);
    //     setOpenEditModal(true);

    // };

    const handleEditRow = (blogcategory) => {
        setSelectedBrand(blogcategory);
        setOpenEditModal(true); // Open the modal
    };

    useEffect(() => {
        // Reset form data whenever the modal opens
        if (openEditModal && selectedBrand) {
            setValue('category_name', selectedBrand.category_name); // Update form values when the modal opens
        }
    }, [openEditModal, selectedBrand, setValue]);
    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_blog_ecom_category_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success toast
            toast.success("Category deleted successfully!", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            fetchBlogCategoryData(); // Refresh the data
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting category:', error);

            // Error toast
            toast.error("An error occurred while deleting the category. Please try again.", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
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
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_blog_ecom_category_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            // Success toast for bulk delete
            toast.success("Selected categories deleted successfully!", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            await fetchBlogCategoryData(); // Refresh the data
            setSelectedRows([]); // Clear selection after bulk delete
            window.location.reload();
        } catch (error) {
            console.error('Error deleting selected categories:', error);

            // Error toast for failed bulk delete
            toast.error("An error occurred while deleting selected categories. Please try again.", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
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

    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end); // Return filtered data for pagination
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
                    {/* Search bar */}
                    <div className="relative flex flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
                        <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
                            <p className="pl-3 pr-2 text-xl">
                                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
                            </p>
                            <input
                                type="text"
                                placeholder="Search by Category Name..."
                                onChange={(e) => setSearchQuery(e.target.value)} // Update search query on change
                                value={searchQuery}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>


                    <button
                        onClick={handleAddBrand}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Blog Category
                    </button>
                </span>



                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-12  w-[35%]  max-h-[80%] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Blog Category</h2>

                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">Category Name<span className="text-red-500">*</span></label>
                                <Controller
                                    name="category_name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Category Name"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.category_name && <p className="text-red-500 text-sm">{errors.category_name.message}</p>}
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
                            className="bg-white rounded-lg shadow-2xl p-12  w-[35%]  max-h-[80%] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Blog Category</h2>

                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">Category Name<span className="text-red-500">*</span></label>
                                <Controller
                                    name="category_name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Category Name"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.category_name && (
                                    <p className="text-red-500 text-sm">{errors.category_name.message}</p>
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

                                <th className="px-6 py-4 text-left">Category Name</th>

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

                            {getPaginatedData().length > 0 ? (
                                getPaginatedData().map((blogcategory) => (
                                    <tr key={blogcategory.id} className="border-t">
                                        <td className="px-6 py-4 ">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(blogcategory.id)}
                                                onChange={() => handleRowSelection(blogcategory.id)}
                                            />
                                        </td>

                                        <td className="px-6 py-4">{blogcategory.category_name}</td>

                                        {/* <td className="text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === blogcategory.id ? null : blogcategory.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === blogcategory.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                handleEditRow(blogcategory);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(blogcategory.id);
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
                                                    onClick={() => setOpenDropdown(openDropdown === blogcategory.id ? null : blogcategory.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{marginTop:"-30px"}}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEditRow(blogcategory);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(blogcategory.id);
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
                                        <hr className='mb-4'></hr>
                                        No data found.
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Blog Category?</h2>
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

export default BlogCategory
