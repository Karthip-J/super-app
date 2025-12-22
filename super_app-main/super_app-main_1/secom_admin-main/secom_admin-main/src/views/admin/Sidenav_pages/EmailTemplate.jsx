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


function EmailTemplate() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedPages, setSelectedPages] = useState(null);
    const [brandName, setBrandName] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [brandImage, setBrandImage] = useState(null);
    const [filteredData, setFilteredData] = useState([]);  // Store filtered data for rendering
    const [searchQuery, setSearchQuery] = useState('');  // Search query state


    const validationSchemaAdd = Yup.object({
        title: Yup.string().required('title is required'),
        subject: Yup.string().required('subject is required'),
        body: Yup.string().required('body is required'),
    });

    const validationSchemaEdit = Yup.object({
        title: Yup.string().required('title is required'),
        subject: Yup.string().required('subject is required'),
        body: Yup.string().required('body is required'),

    });

    const { reset, control, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            page_name: selectedPages?.page_name || '',
            text_editor: selectedPages?.text_editor || null,
        },
    });



    // Fetch email template data once
    const fetchPagesData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_email_template');
            setTableData(response.data);  // Store the full data
            setFilteredData(response.data);  // Initially, all data is visible
            setTotalItems(response.data.length);  // Set the total number of items
            reset();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    // Handle page change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        fetchPagesData();  // Fetch data on component mount
    }, []);

    // Get paginated data
    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    };

    useEffect(() => {
        if (searchQuery) {
            // Ensure you're filtering by the discount name
            const filtered = tableData.filter((template) =>
                template.title?.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by discount name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all discounts
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);

    // Handle row selection
    const handleRowSelection = (id) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    // Modified handleFormSubmit
    const handleFormSubmit = async (data) => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('subject', data.subject);
        formData.append('body', data.body);
        setLoading(true);
    
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = 'https://yrpitsolutions.com/ecom_backend/api/admin/save_email_template';
    
            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    fetchPagesData();
                    setOpenAddModal(false);
                    reset();
                    toast.success('Form submitted successfully!', {
                        progress: undefined,  // Hides the progress bar
                        hideProgressBar: true,
                    });  // Success Toast
                } catch (error) {
                    console.error('Error submitting form:', error);
                    toast.error('Error submitting form!', {
                        progress: undefined,  // Hides the progress bar
                    });  // Error Toast
                } finally {
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);
            toast.error('Error preparing form data!', {
                progress: undefined,  // Hides the progress bar
            });  // Error Toast
        }
    };
    
    // Modified handleFormUpdate
    const handleFormUpdate = async (data) => {
        setLoading(true);
    
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('title', data.title || selectedPages.title);
        formData.append('subject', data.subject || selectedPages.subject);
        formData.append('body', data.body || selectedPages.body);
    
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/update_email_template_by_id/${selectedPages.id}`;
    
            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    fetchPagesData();
                    setOpenEditModal(false);
                    reset();
                    toast.success('Form updated successfully!', {
                        progress: undefined,  // Hides the progress bar
                        hideProgressBar: true,
                    });  // Success Toast
                } catch (error) {
                    console.error('Error updating form:', error);
                    toast.error('Error updating form!', {
                        progress: undefined,  // Hides the progress bar
                    });  // Error Toast
                } finally {
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);
            toast.error('Error preparing form data!', {
                progress: undefined,  // Hides the progress bar
            });  // Error Toast
        }
    };
    
    const handleAddBrand = () => {
        setSelectedPages(null);
        setValue('title', '');
        setValue('subject', '');
        setValue('body', '');
        setOpenAddModal(true);
        reset();
    };

    const handleEditRow = (page) => {
        setSelectedPages(page);
        setValue('title', page.title);
        setValue('subject', page.subject);
        setValue('body', page.body);
        setOpenEditModal(true);
        trigger();
    };

    // const handleEditRow = (page) => {
    //     setSelectedPages(page);

    //     // Reset form values and trigger validation
    //     reset({
    //         title: page.title,
    //         subject: page.subject,
    //         body: page.body,
    //     });

    //     // Trigger validation manually to ensure error messages are cleared
    //     trigger();

    //     setOpenEditModal(true);
    // };


    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_email_template_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            fetchPagesData();
            setOpenDeleteDialog(false);
            toast.success('Email template deleted successfully!', {
                progress: undefined,  // Hides the progress bar
            });
        } catch (error) {
            console.error('Error deleting email template:', error);
            toast.error('Error deleting email template!', {
                progress: undefined,  // Hides the progress bar
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
            
            // Iterate over selected rows and delete each one
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_email_template_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }
    
            await fetchPagesData(); // Refresh the data
            setSelectedRows([]); // Clear selection after bulk delete
            window.location.reload(); // Optionally, refresh the page
            toast.success('Email templates deleted successfully!', {
                progress: undefined, // Hide progress bar
            });
    
        } catch (error) {
            console.error('Error deleting selected email templates:', error);
            toast.error('Error deleting email templates!', {
                progress: undefined, // Hide progress bar
                hideProgressBar: true,
            });
        } finally {
            setLoading(false);
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
        <div 
            className="min-h-screen pt-6 transition-colors duration-300"
            style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            {/* <TokenExpiration /> */}
            <ToastContainer/>
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
                                placeholder="Search by Title..."
                                onChange={(e) => setSearchQuery(e.target.value)} // Set the search query
                                value={searchQuery}
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>


                    <button
                        onClick={handleAddBrand}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Email Template
                    </button>
                </span>

                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
                    >
                        <div
                            className="rounded-lg shadow-2xl p-12 w-[55%] max-h-[90%] transition-colors duration-300"
                            style={{ backgroundColor: 'var(--bg-card)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 
                                className="text-2xl font-semibold mb-6 transition-colors duration-300"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Add Email Template
                            </h2>

                            <div>
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Title<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Title"
                                            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.title && <p className="text-red-500 dark:text-red-400 text-sm">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label 
                                    className="block text-lg font-medium mb-2 mt-4 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Subject<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="subject"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Subject"
                                            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.subject && <p className="text-red-500 dark:text-red-400 text-sm">{errors.subject.message}</p>}
                            </div>

                            <div className="col-span-4 mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 mt-4 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Body<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="body"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)' }}>
                                            <ReactQuill
                                                {...field}
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                placeholder="Enter Email Body"
                                                className="w-full h-[100px] rounded-md px-0 py-0 focus:outline-none transition-colors duration-300"
                                                style={{
                                                    backgroundColor: 'var(--bg-input)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            />
                                        </div>
                                    )}
                                />
                                {errors.body && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.body.message}</p>}
                            </div>


                            <div className="flex justify-end space-x-4 mt-16">
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
                            className="rounded-lg shadow-2xl p-12 w-[55%] max-h-[90%] transition-colors duration-300"
                            style={{ backgroundColor: 'var(--bg-card)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 
                                className="text-2xl font-semibold mb-6 transition-colors duration-300"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                Edit Email Template
                            </h2>

                            <div className="mb-4">
                                <div>
                                    <label 
                                        className="block text-lg font-medium mb-2 transition-colors duration-300"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        Title<span className="text-red-500 ">*</span>
                                    </label>
                                    <Controller
                                        name="title"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Title"
                                                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 transition-colors duration-300"
                                                style={{
                                                    backgroundColor: 'var(--bg-input)',
                                                    color: 'var(--text-primary)',
                                                    borderColor: 'var(--border-color)'
                                                }}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.title && <p className="text-red-500 dark:text-red-400 text-sm">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label 
                                        className="block text-lg font-medium mb-2 mt-4 transition-colors duration-300"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        Subject<span className="text-red-500 ">*</span>
                                    </label>
                                    <Controller
                                        name="subject"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Subject"
                                                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400 transition-colors duration-300"
                                                style={{
                                                    backgroundColor: 'var(--bg-input)',
                                                    color: 'var(--text-primary)',
                                                    borderColor: 'var(--border-color)'
                                                }}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.subject && <p className="text-red-500 dark:text-red-400 text-sm">{errors.subject.message}</p>}
                                </div>
                            </div>

                            <div className="col-span-4 mb-6">
                                <label 
                                    className="block text-lg font-medium mb-2 transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Body<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="body"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="transition-colors duration-300" style={{ backgroundColor: 'var(--bg-input)' }}>
                                            <ReactQuill
                                                {...field}
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                placeholder="Enter Email Body"
                                                className="w-full h-[100px] rounded-md px-0 py-0 focus:outline-none transition-colors duration-300"
                                                style={{
                                                    backgroundColor: 'var(--bg-input)',
                                                    color: 'var(--text-primary)'
                                                }}
                                            />
                                        </div>
                                    )}
                                />
                                {errors.body && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.body.message}</p>}
                            </div>

                            <div className="flex justify-end space-x-4 mt-16">
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
                                        <div className="absolute inset-0 flex items-center justify-center w-full h-full">
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
                                        className="transition-colors duration-300"
                                        style={{ accentColor: 'var(--text-primary)' }}
                                    />
                                </th>
                                <th 
                                    className="px-6 py-4 text-left transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Title
                                </th>
                                <th 
                                    className="px-6 py-4 text-left transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Subject
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
                                        No Emailtemplate found
                                    </td>
                                </tr>
                            ) : (
                                getPaginatedData().map((template) => (
                                    <tr 
                                        key={template.id} 
                                        className="border-t transition-colors duration-300"
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(template.id)}
                                                onChange={() => handleRowSelection(template.id)} // Handle row selection
                                                className="transition-colors duration-300"
                                                style={{ accentColor: 'var(--text-primary)' }}
                                            />
                                        </td>
                                        <td 
                                            className="px-6 py-4 transition-colors duration-300"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {template.title}
                                        </td>
                                        <td 
                                            className="px-6 py-4 transition-colors duration-300"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {template.subject}
                                        </td>
                                        <td className="text-right">
                                            <div className="relative inline-block group">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === template.id ? null : template.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-0 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200  " style={{marginTop:"-30px"}}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEditRow(template);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700  cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(template.id);
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
                            Are you sure you want to delete this Emailtemplate?
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

export default EmailTemplate;
