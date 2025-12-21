import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Select from 'react-select';
import { FiSearch } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';



function BlogMain() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedBlog, setSelectedBlog] = useState(null);
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
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [tags, setTags] = useState([]);
    const [filteredData, setFilteredData] = useState([]);




    // Yup validation schema
    const validationSchemaAdd = Yup.object({
        blog_name: Yup.string().required('Blog Name is required'),
        blog_category_name_id: Yup.string().required('Category is required'),
        // // tag_id: Yup.string().required('Tag is required'),
        // link: Yup.string().required('Link is required'),
        description: Yup.string().required('Description is required'),
        photo: Yup.mixed().required('photo is required')

    });

    const validationSchemaEdit = Yup.object({
        blog_name: Yup.string().required('Brand Name is required'),
        blog_category_name_id: Yup.string().required('Category is required'),
        // // tag_id: Yup.string().required('Tag is required'),
        // link: Yup.string().required('Link is required'),
        description: Yup.string().required('Description is required'),

    });

    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            blog_name: selectedBlog?.blog_name || '',
            blog_category_name_id: selectedBlog?.blog_category_name_id || '',
            tag_id: selectedBlog?.tag_id || '',
            link: selectedBlog?.link || '',
            description: selectedBlog?.description || '',
            photo: selectedBlog?.photo || null, // Set default value for the image

        },
    });



    const fetchBlogMainData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_blog_data');
            setTableData(response.data);
            setTotalItems(response.data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const [CategoryData, setCategoryData] = useState([]);
    const fetchBlogCategoryData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_blog_ecom_category');
            setCategoryData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const [TagData, setTagData] = useState([]);
    const fetchTagData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_tags');
            setTagData(response.data);
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
        if (searchQuery) {
            const filtered = tableData.filter((category) =>
                category.blog_name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by category_name
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
        fetchBlogMainData();
        fetchBlogCategoryData();
        fetchTagData();
    }, [itemsPerPage]);


    const handleImageSaveChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setValue('photo', file);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setValue('photo', file);
        } else {
            setImagePreview(selectedBlog?.photo || null);
            setValue('photo', null);
        }
    };

    const [selectedTags, setSelectedTags] = useState([]);



    const handleTagChange = (selectedOptions) => {
        setSelectedTags(selectedOptions || []);
    };

    const handleRemoveSelectedTag = (tagId) => {
        setSelectedTags(selectedTags.filter(tag => tag.value !== tagId));
    };

    // Convert TagData into the format required by react-select
    const tagOptions = TagData.map((tag) => ({
        value: tag.id,
        label: tag.tag_name,
    }));

    const [error, setError] = useState(null);

    const handleFormSubmit = async (data) => {
        if (!data.photo || !(data.photo instanceof File)) {
            setError("Blog Image is required");
            return;
        }

        const formData = new FormData();
        formData.append('blog_name', data.blog_name);
        formData.append('blog_category_name_id', data.blog_category_name_id);

        // Ensure tag_id is sent as an array
        if (selectedTags && selectedTags.length > 0) {
            const tagIds = selectedTags.map(tag => tag.value); // Extract tag IDs
            tagIds.forEach(id => formData.append('tag_id[]', id));  // Append each tag_id as an array element
        }

        formData.append('link', data.link);
        formData.append('description', data.description);
        formData.append('photo', data.photo);

        setLoading(true);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = 'https://yrpitsolutions.com/ecom_backend/api/admin/save_blog';

            const response = await axios.post(url, formData, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.status === 200) {
                fetchBlogMainData();  // Make sure you have this function for fetching data
                setOpenAddModal(false);
                reset(); // Reset form if needed
                toast.success('Blog successfully added!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                console.error('Error in response:', response);
                toast.error('Failed to add the blog. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Error submitting the form. Please try again.', {
                position: "top-right",
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





    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('blog_name', data.blog_name || selectedBlog.blog_name);
        formData.append('blog_category_name_id', data.blog_category_name_id || selectedBlog.blog_category_name_id);

        // Ensure tag_id is sent as an array
        if (selectedTags && selectedTags.length > 0) {
            const tagIds = selectedTags.map(tag => tag.value); // Extract tag IDs
            tagIds.forEach(id => formData.append('tag_id[]', id));  // Append each tag_id as an array element
        }

        formData.append('link', data.link || selectedBlog.link);
        formData.append('description', data.description || selectedBlog.description);

        // Conditionally append 'photo' if it's a File instance
        if (data.photo && data.photo instanceof File) {
            formData.append('photo', data.photo);
        } else if (!data.photo) {
            formData.delete('photo');
        }

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/update_blog_by_id/${selectedBlog.id}`;

            setTimeout(async () => {
                try {
                    const response = await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    if (response.status === 200) {
                        fetchBlogMainData();  // Refresh the data
                        setOpenEditModal(false);
                        reset();
                        toast.success('Blog successfully updated!', {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    } else {
                        console.error('Error in response:', response);
                        toast.error('Failed to update the blog. Please try again.', {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    }
                } catch (error) {
                    console.error('Error updating form:', error);
                    toast.error('Error updating the blog. Please try again.', {
                        position: "top-right",
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
            toast.error('Error preparing the form data. Please try again.', {
                position: "top-right",
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
        setSelectedBlog(null);
        setValue('blog_name', '');
        setValue('blog_category_name_id', '');
        setValue('tag_id', '');
        setValue('link', '');
        setValue('description', '');
        setOpenAddModal(true);
    };

    const handleEditRow = (blog) => {
        setSelectedBlog(blog);

        // Pre-fill the fields
        setValue('blog_name', blog.blog_name);
        setValue('blog_category_name_id', blog.blog_category_name_id);
        setValue('link', blog.link);
        setValue('description', blog.description);

        // Check if tag_id is an array and contains values
        if (Array.isArray(blog.tag_id) && blog.tag_id.length > 0) {
            // Find the corresponding tag options
            const selectedTagOptions = tagOptions.filter(option =>
                blog.tag_id.includes(option.value)
            );
            // Update the selected tags
            setSelectedTags(selectedTagOptions);
            setValue('tag_id', blog.tag_id); // Update the tag_id field
        } else {
            // Clear tags if there's no tag_id or it's empty
            setSelectedTags([]);
            setValue('tag_id', []); // Ensure empty array is set
        }

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
            const response = await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_blog_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.status === 200) {
                fetchBlogMainData(); // Refresh the data
                setOpenDeleteDialog(false);
                toast.success('Blog deleted successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            } else {
                toast.error('Failed to delete the blog. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            toast.error('Error deleting the blog. Please try again.', {
                position: "top-right",
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
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_blog_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            await fetchBlogMainData(); // Refresh the data
            setSelectedRows([]); // Clear selection after bulk delete
            window.location.reload();

            toast.success('Selected blogs deleted successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

        } catch (error) {
            console.error('Error deleting selected blogs:', error);

            toast.error('Error deleting selected blogs. Please try again.', {
                position: "top-right",
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
        return tableData.slice(start, end);
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
                                placeholder="Search by Blog Name..."
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
                        <FaPlus className="mr-2" /> Add Blog
                    </button>
                </span>

                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-8 w-[60%] max-h-[90%] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Blog</h2>

                            <div className="mb-6 flex space-x-4">
                                {/* Blog Name Field */}
                                <div className="w-full">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Blog Name<span className="text-red-500">*</span></label>
                                    <Controller
                                        name="blog_name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Blog Name"
                                                className="w-full h-12 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.blog_name && <p className="text-red-500 text-sm">{errors.blog_name.message}</p>}
                                </div>

                                {/* Category Field */}
                                <div className="w-full">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Category<span className="text-red-500">*</span></label>
                                    <Controller
                                        name="blog_category_name_id"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full h-12 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select a Category</option>
                                                {CategoryData.map((categorydata) => (
                                                    <option key={categorydata.id} value={categorydata.id}>
                                                        {categorydata.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.blog_category_name_id && (
                                        <p className="text-red-500 text-sm">{errors.blog_category_name_id.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6 flex space-x-4">
                                {/* Tags Field */}
                                <div className="w-full">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Tags</label>
                                    <Controller
                                        name="tag_id"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="relative">
                                                <Select
                                                    {...field}
                                                    isMulti
                                                    options={tagOptions}
                                                    value={selectedTags} // Bind value to selectedTags
                                                    onChange={(selected) => {
                                                        handleTagChange(selected);
                                                        field.onChange(selected); // Ensure react-hook-form knows about the value change
                                                    }}
                                                    className="w-full"
                                                    classNamePrefix="react-select"
                                                    isClearable
                                                    hideSelectedOptions={true}
                                                    isSearchable={false}
                                                    styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            height: '48px',
                                                            borderRadius: '0.375rem',
                                                            borderColor: '#d1d5db',
                                                            paddingLeft: '1rem',
                                                            paddingRight: '1rem',
                                                            fontSize: '1rem',
                                                            color: '#ffffff', // Set the text color to white
                                                        }),
                                                        multiValue: (provided) => ({
                                                            ...provided,
                                                            backgroundColor: '#4318ff',
                                                            color: '#fff', // Corrected this property to 'color'
                                                            borderRadius: '9999px',
                                                            paddingLeft: '0.5rem',
                                                            paddingRight: '0.5rem',
                                                        }),
                                                        multiValueLabel: (provided) => ({
                                                            ...provided,
                                                            color: '#fff', // Ensure the label text within the chip is white as well
                                                        }),
                                                        multiValueRemove: (provided) => ({
                                                            ...provided,
                                                            color: '#fff', // Ensure the remove icon is white
                                                            ':hover': {
                                                                backgroundColor: '#fff', // Optional: change background on hover
                                                                color: '#4318ff', // Optional: change text color on hover
                                                            },
                                                        }),
                                                    }}
                                                />

                                            </div>
                                        )}
                                    />
                                    {errors.tag_id && <p className="text-red-500 text-sm">{errors.tag_id.message}</p>}
                                </div>

                                {/* Blog Image Field */}
                                <div className="w-full">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Blog Image<span className="text-red-500">*</span></label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSaveChange}
                                        className="w-full h-12 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                    {errors.photo && <p className="text-red-500 text-sm">{errors.photo.message}</p>}
                                </div>
                            </div>

                            {/* Description Field */}
                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">Description<span className="text-red-500">*</span></label>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <ReactQuill
                                            {...field}
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            placeholder="Enter a detailed description of the blog"
                                            className="w-full h-32 rounded-md px-4 py-2 text-gray-800 "
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 mt-14">
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
                            className="bg-white rounded-lg shadow-2xl p-8 w-[60%] max-h-[90%] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Blog</h2>

                            <div className="mb-6 flex space-x-4">
                                {/* Blog Name Field */}
                                <div className="w-full">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Blog Name</label>
                                    <Controller
                                        name="blog_name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Blog Name"
                                                className="w-full h-12 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.blog_name && <p className="text-red-500 text-sm">{errors.blog_name.message}</p>}
                                </div>

                                {/* Category Field */}
                                <div className="w-full">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Category</label>
                                    <Controller
                                        name="blog_category_name_id"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full h-12 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select a Category</option>
                                                {CategoryData.map((categorydata) => (
                                                    <option key={categorydata.id} value={categorydata.id}>
                                                        {categorydata.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.blog_category_name_id && (
                                        <p className="text-red-500 text-sm">{errors.blog_category_name_id.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6 flex space-x-4">
                                {/* Tags Field */}
                                <div className="w-full">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Tags</label>
                                    <Controller
                                        name="tag_id"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="relative">
                                                <Select
                                                    {...field}
                                                    isMulti
                                                    options={tagOptions}
                                                    value={selectedTags}
                                                    onChange={(selected) => {
                                                        setSelectedTags(selected); // Update the selectedTags state
                                                        field.onChange(selected.map(tag => tag.value)); // Ensure the form field gets the selected tag IDs
                                                    }}
                                                    className="w-full"
                                                    classNamePrefix="react-select"
                                                    isClearable
                                                    hideSelectedOptions={true}
                                                    isSearchable={false}
                                                    styles={{
                                                        control: (provided) => ({
                                                            ...provided,
                                                            height: '48px',
                                                            borderRadius: '0.375rem',
                                                            borderColor: '#d1d5db',
                                                            paddingLeft: '1rem',
                                                            paddingRight: '1rem',
                                                            fontSize: '1rem',
                                                            color: '#ffffff',
                                                        }),
                                                        multiValue: (provided) => ({
                                                            ...provided,
                                                            backgroundColor: '#4318ff',
                                                            color: '#fff',
                                                            borderRadius: '9999px',
                                                            paddingLeft: '0.5rem',
                                                            paddingRight: '0.5rem',
                                                        }),
                                                        multiValueLabel: (provided) => ({
                                                            ...provided,
                                                            color: '#fff',
                                                        }),
                                                        multiValueRemove: (provided) => ({
                                                            ...provided,
                                                            color: '#fff',
                                                            ':hover': {
                                                                backgroundColor: '#fff',
                                                                color: '#4318ff',
                                                            },
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        )}
                                    />

                                    {errors.tag_id && <p className="text-red-500 text-sm">{errors.tag_id.message}</p>}
                                </div>

                                {/* Blog Image Field */}
                                <div className="w-full">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Blog Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full h-12 border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                    {errors.photo && <p className="text-red-500 text-sm">{errors.photo.message}</p>}
                                </div>
                            </div>

                            {/* Description Field */}
                            <div className="mb-6">
                                <label className="block text-lg text-gray-600 font-medium mb-2">Description</label>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <ReactQuill
                                            {...field}
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            placeholder="Enter a detailed description of the blog"
                                            className="w-full h-32 rounded-md px-4 py-2 text-gray-800 "
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4 mt-14">
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
                                <th className="px-6 py-4 text-left">Blog Image</th>
                                <th className="px-6 py-4 text-left">Blog Name</th>
                                <th className="px-6 py-4 text-left">Category Name</th>
                                {/* <th className="px-6 py-4 text-left">Tag Name</th> */}
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
                                getPaginatedData().map((blog) => (
                                    <tr key={blog.id} className="border-t">
                                        <td className="px-6 py-4 ">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(blog.id)}
                                                onChange={() => handleRowSelection(blog.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <img
                                                src={blog.photo}
                                                alt={blog.blog_name}
                                                className="w-12 h-12 object-cover rounded-full"
                                            />
                                        </td>
                                        <td className="px-6 py-4">{blog.blog_name}</td>
                                        <td className="px-6 py-4">{blog.blog_category_name}</td>
                                        {/* <td className="px-6 py-4">
                                            {blog.tags && blog.tags.map((tag) => tag.name).join(', ')}
                                        </td> */}



                                        {/* <td className="text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === blog.id ? null : blog.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === blog.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                handleEditRow(blog);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(blog.id);
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
                                                    onClick={() => setOpenDropdown(openDropdown === blog.id ? null : blog.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-10 flex space-x-2 opacity-0  " style={{ marginTop: "-30px" }}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEditRow(blog);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(blog.id);
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Blog?</h2>
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

export default BlogMain;
