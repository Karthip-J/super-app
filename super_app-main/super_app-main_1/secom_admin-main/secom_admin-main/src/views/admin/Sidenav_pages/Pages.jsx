import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FiSearch } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import Navbar from 'components/navbar';


function Pages() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedPages, setSelectedPages] = useState(null);
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);


    const validationSchemaAdd = Yup.object({
        page_name: Yup.string().required('page name is required'),
        text_editor: Yup.string().required('text editor is required'),
    });

    const validationSchemaEdit = Yup.object({
        page_name: Yup.string().required('Page name is required'),
        text_editor: Yup.string()
            .required('Description is required')
            .test('is-empty', 'Description cannot be empty', (value) => {
                return value && value.trim() !== '';
            }),
    });

    const { reset, control, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            page_name: selectedPages?.page_name || '',
            text_editor: selectedPages?.text_editor || '',
        },
    });


    const fetchPagesData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_pages');
            setTableData(response.data);
            setTotalItems(response.data.length);
            console.log(response.data);
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
        fetchPagesData();
    }, [itemsPerPage]);



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
            const filtered = tableData.filter((page) =>
                page.page_name?.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by discount name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all discounts
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);



    const handleImageSaveChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setValue('brandImage', file);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setValue('brandImage', file);
        } else {
            setImagePreview(selectedPages?.photo || null);
            setValue('brandImage', null);
        }
    };


    const handleFormSubmit = async (data) => {
        const PageName = data.page_name;
        const existingBrand = getPaginatedData().find(page => page.page_name.toLowerCase() === PageName.toLowerCase());

        if (existingBrand) {
            toast.error("This Question already exists. Provide different Question.", {
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
        formData.append('page_name', data.page_name);
        formData.append('text_editor', data.text_editor);

        setLoading(true);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = 'https://yrpitsolutions.com/ecom_backend/api/admin/save_pages';

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });

                    // Show success message
                    toast.success("Page saved successfully!", {
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    fetchPagesData();  // Refresh data
                    setOpenAddModal(false);
                    setBrandImage(null);
                    reset();
                } catch (error) {
                    console.error('Error submitting form:', error);

                    // Show error message
                    toast.error("Error saving page. Please try again.", {
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

            // Show error message
            toast.error("Error preparing form data. Please try again.", {
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
        formData.append('page_name', data.page_name || selectedPages.page_name);
        formData.append('text_editor', data.text_editor || selectedPages.text_editor);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/update_pages_by_id/${selectedPages.id}`;

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    // Success toast
                    toast.success("Page updated successfully!", {
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    fetchPagesData();  // Refresh data
                    setOpenEditModal(false);
                    reset();
                } catch (error) {
                    console.error('Error updating form:', error);

                    // Error toast
                    toast.error("Error updating page. Please try again.", {
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
            toast.error("Error preparing form data. Please try again.", {
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
        setSelectedPages(null);
        setValue('page_name', '');
        setValue('text_editor', '');
        setOpenAddModal(true);
    };

    const handleEditRow = (page) => {
        setSelectedPages(page);
        setValue('page_name', page.page_name);
        setValue('text_editor', page.text_editor);
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
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_pages_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success toast
            toast.success("Page deleted successfully!", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            fetchPagesData();  // Refresh the pages data after deletion
            setOpenDeleteDialog(false);  // Close the delete confirmation dialog
        } catch (error) {
            console.error('Error deleting page:', error);

            // Error toast
            toast.error("Error deleting page. Please try again.", {
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

            // Loop through selected rows and delete each
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_pages_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            // Refresh the data and reset selection
            await fetchPagesData(); // Refresh the pages data
            setSelectedRows([]); // Clear selection after bulk delete

            // Success toast notification
            toast.success("Pages deleted successfully!", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            window.location.reload();  // Optional: Reload the page after deletion if necessary
        } catch (error) {
            console.error('Error deleting selected pages:', error);

            // Error toast notification
            toast.error("Error deleting selected pages. Please try again.", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } finally {
            setLoading(false);  // Stop loading spinner after the operation
        }
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
            {/* Removed duplicate Navbar - already in layout */}
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
                                placeholder="Search by Page Name..."
                                onChange={(e) => setSearchQuery(e.target.value)} // Directly set the search query
                                value={searchQuery}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>


                    <button
                        onClick={handleAddBrand}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Page
                    </button>
                </span>

                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-8 w-[600px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Page</h2>

                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">Page Name<span className="text-red-500 ">*</span></label>
                                <Controller
                                    name="page_name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Page Name"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.page_name && <p className="text-red-500 text-sm">{errors.page_name.message}</p>}
                            </div>

                            <div className="col-span-4">
                                <label className="block text-lg text-gray-600 font-medium mb-2">
                                    Description<span className="text-red-500">*</span>
                                </label>
                                <div className="relative text-editor-container" > {/* Set a fixed height */}
                                    <Controller
                                        name="text_editor"
                                        control={control}
                                        render={({ field }) => (
                                            <ReactQuill
                                                {...field}
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                placeholder="Enter description"
                                                className="overflow-y-auto w-full h-full rounded-md px-0 py-0 text-gray-800 focus:outline-none"
                                            />
                                        )}
                                    />
                                </div>
                                {errors.text_editor && (
                                    <p className="text-red-500 text-sm mt-1 ml-1">
                                        {errors.text_editor.message}
                                    </p>
                                )}
                            </div>



                            <div className="flex justify-end space-x-4 mt-16">
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
                            className="bg-white rounded-lg shadow-2xl p-8 w-[600px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Page</h2>

                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">
                                    Page Name<span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="page_name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Page Name"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.page_name && <p className="text-red-500 text-sm">{errors.page_name.message}</p>}
                            </div>

                            <div className="col-span-4">
                                <label className="block text-lg text-gray-600 font-medium mb-2">
                                    Description<span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Controller
                                        name="text_editor"
                                        control={control}
                                        render={({ field }) => (
                                            <ReactQuill
                                                {...field}
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                placeholder="Enter description"
                                                className="w-full h-[140px] rounded-md px-0 py-0 text-gray-800 focus:outline-none"
                                            />
                                        )}
                                    />
                                </div>
                                {errors.text_editor && (
                                    <p className="text-red-500 text-sm mt-1 ml-1">
                                        {errors.text_editor.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 mt-16">
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
                                <th className="px-6 py-4 text-left">Page Name</th>
                                <th className="px-6 py-4 text-left">Description</th>
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
                                    <td colSpan="4" className="text-center py-4 text-gray-500">
                                        No Page found
                                    </td>
                                </tr>
                            ) : (
                                getPaginatedData().map((page) => (
                                    <tr key={page.id} className="border-t">
                                        <td className="px-6 py-4 ">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(page.id)}
                                                onChange={() => handleRowSelection(page.id)}
                                            />
                                        </td>

                                        <td className="px-6 py-4">{page.page_name}</td>
                                        {/* <td className="px-6 py-4">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        page.text_editor.split(' ').slice(0, 10).join(' ') +
                                                        (page.text_editor.split(' ').length > 10 ? '...' : ''),
                                                }}
                                            />
                                        </td> */}
                                        <td className="px-6 py-4 break-words">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        page.text_editor.split(' ').slice(0, 10).join(' ') +
                                                        (page.text_editor.split(' ').length > 10 ? '...' : ''),
                                                }}
                                                style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
                                            />
                                        </td>


                                        {/* <td className="text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === page.id ? null : page.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === page.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                handleEditRow(page);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(page.id);
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
                                                    onClick={() => setOpenDropdown(openDropdown === page.id ? null : page.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-0 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{ marginTop: "-30px" }}

                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEditRow(page);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-2 py-0 text-navy-700 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(page.id);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-2 py-2 text-red-600 cursor-pointer"
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
            {
                openDeleteDialog && (
                    <div className="fixed inset-0 flex items-center justify-center z-20 bg-gray-500 bg-opacity-50">
                        <div className="bg-white p-6 rounded-md shadow-lg w-1/3">
                            <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Page?</h2>
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
                )
            }
        </div >




    );
}

export default Pages;
