import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FiSearch } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import ReactQuill from 'react-quill';


function Toppings() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryImage, setCategoryImage] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0); const [isDeleting, setIsDeleting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categoryData, setCategoryData] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);

    const validationSchemaAdd = Yup.object({
        subCategoryName: Yup.string().required('SubCategory Name is required'),
        brand_id: Yup.string().required('Brand is required'),
        category_id: Yup.string().required('Category is required'),
    });

    const validationSchemaEdit = Yup.object({
        subCategoryName: Yup.string().required('SubCategory Name is required'),
        brand_id: Yup.string().required('Brand is required'),
        category_id: Yup.string().required('Category is required'),
    });

    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            subCategoryName: selectedCategory ? selectedCategory.name : '',
            category_id: selectedCategory ? selectedCategory.category_id : '',
            brand_id: selectedCategory ? selectedCategory.brand_id : '',
        }
    });

    useEffect(() => {
        if (selectedCategory) {
            setValue('subCategoryName', selectedCategory.name);
            setValue('category_id', selectedCategory.category_id);
            setValue('brand_id', selectedCategory.brand_id);
            if (!categories.some(cat => cat.id === selectedCategory.category_id)) {
                fetchCategoryData(selectedCategory.brand_id);
            }
        }
    }, [selectedCategory, setValue, categories]);

    useEffect(() => {
        const fetchBrandData = async () => {
            try {
                const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_brand');
                setBrands(response.data);
            } catch (error) {
                console.error('Error fetching brand data:', error);
            }
        };
        fetchBrandData();
    }, []);

    useEffect(() => {
        if (selectedBrand) {
            fetchCategoryData(selectedBrand);
        }
    }, [selectedBrand]);

    const fetchCategoryData = async (brandId) => {
        if (!brandId) return;
        try {
            const response = await axios.get(`https://yrpitsolutions.com/ecom_backend/api/admin/category_by_brand_id/${brandId}`);
            // console.log('Categories fetched:', response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to the first page when search query changes
    };

    useEffect(() => {
        fetchSubCategoryData();
    }, [searchQuery, currentPage, itemsPerPage]);

    const fetchSubCategoryData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_subcategory');

            // Apply the filter only to the subcategory's name
            const filteredData = response.data.filter((subcategory) =>
                subcategory.name.toLowerCase().includes(searchQuery.toLowerCase())
            );

            // Update table data with filtered data
            setTableData(filteredData);

            // Dynamically calculate totalItems based on filtered data
            const filteredItemsCount = filteredData.length;
            setTotalItems(filteredItemsCount); // Set the total filtered items

        } catch (error) {
            console.error('Error fetching subcategory data:', error);
        }
    };

    useEffect(() => {
        fetchSubCategoryData();
    }, [itemsPerPage]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            const filtered = tableData.filter((category) =>
                category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (category.brand && category.brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);  // Update total items based on filtered data
        } else {
            setFilteredData(tableData);  // Reset to all data if no search query
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);


    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);  // Paginate after filtering
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handleCloseModal = () => {
        setOpenAddModal(false);
        fetchSubCategoryData();
    };


    // const handleFormSubmit = async (data) => {
    //     setLoading(true);
    //     const formData = new FormData();
    //     formData.append('brand_id', data.brand_id);
    //     formData.append('category_id', data.category_id);
    //     formData.append('name', data.subCategoryName);

    //     try {
    //         const accessToken = localStorage.getItem('OnlineShop-accessToken');
    //         await axios.post('https://yrpitsolutions.com/ecom_backend/api/admin/save_subcategory', formData, {
    //             headers: { Authorization: `Bearer ${accessToken}` },
    //         });

    //         // Success toaster message
    //         toast.success('Subcategory added successfully!', {
    //             position: "top-right",
    //             autoClose: 3000,
    //             hideProgressBar: true,
    //         });

    //         reset();
    //         setOpenAddModal(false);
    //         fetchSubCategoryData();
    //     } catch (error) {
    //         console.error('Error submitting form:', error);

    //         // Error toaster message
    //         toast.error('Something went wrong! Please try again.', {
    //             position: "top-right",
    //             autoClose: 3000, hideProgressBar: true,
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    const handleFormSubmit = async (data) => {
        setLoading(true);

        // Prevent form submission if subcategory name already exists in the table
        const subCategoryName = data.subCategoryName;
        const existingSubCategory = getPaginatedData().find(subCategory => subCategory.name.toLowerCase() === subCategoryName.toLowerCase());

        if (existingSubCategory) {
            toast.error("This subcategory already exists. Provide a different name.", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setLoading(false); // Ensure loading state is stopped
            return; // Prevent form submission if the subcategory name already exists
        }

        const formData = new FormData();
        formData.append('brand_id', data.brand_id);
        formData.append('category_id', data.category_id);
        formData.append('name', data.subCategoryName);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            await axios.post('https://yrpitsolutions.com/ecom_backend/api/admin/save_subcategory', formData, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success toast message
            toast.success('Subcategory added successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });

            // Reset form and fetch updated data
            reset();
            setOpenAddModal(false);
            fetchSubCategoryData();
        } catch (error) {
            console.error('Error submitting form:', error);

            // Error toast message
            toast.error('Something went wrong! Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedBrand) {
            fetchCategoryData(selectedBrand);
        }
    }, [selectedBrand]);


    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();

        formData.append('brand_id', data.brand_id);
        formData.append('category_id', data.category_id);
        formData.append('name', data.subCategoryName);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/update_subcategory_by_id/${selectedCategory.id}`;
            formData.append('_method', 'put');

            await axios.post(url, formData, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success toaster message
            toast.success('Subcategory updated successfully!', {
                position: "top-right",
                autoClose: 3000, hideProgressBar: true,
            });

            fetchSubCategoryData();
            setOpenEditModal(false);
            setCategoryImage(null);
            reset();
        } catch (error) {
            console.error('Error updating category:', error);

            // Error toaster message
            toast.error('Failed to update subcategory. Please try again.', {
                position: "top-right",
                autoClose: 3000, hideProgressBar: true,
            });
        } finally {
            setLoading(false);
            // Reloading page is often a heavy operation. To prevent page reload, consider removing this line.
            // window.location.reload();
        }
    };


    const handleAddCategory = () => {
        setOpenAddModal(true);
        setSelectedBrand(null);
        setCategories([]);
        setValue('brand_id', '');
        setValue('category_id', '');
        setValue('subCategoryName', '');

        // reset({
        //     brand_id: '',
        //     category_id: '',
        //     subCategoryName: ''
        // });
        reset();


    };

    const handleEditRow = (category) => {
        setSelectedCategory(category);
        setOpenEditModal(true);
        // reset();
    };

    const handleRowSelection = (id) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_subcategory_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success toaster message
            toast.success('Subcategory deleted successfully!', {
                position: "top-right",
                autoClose: 3000, hideProgressBar: true,
            });

            fetchSubCategoryData();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting category:', error);

            // Error toaster message
            toast.error('Failed to delete subcategory. Please try again.', {
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
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_subcategory_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            // Success toaster message
            toast.success('Selected subcategories deleted successfully!', {
                position: "top-right",
                autoClose: 3000, hideProgressBar: true,
            });

            await fetchSubCategoryData();
            setSelectedRows([]);
        } catch (error) {
            console.error('Error deleting selected categories:', error);

            // Error toaster message
            toast.error('Failed to delete selected subcategories. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
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
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by Toppings Name..."
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleAddCategory}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Toppings
                    </button>
                </span>

                {/* add */}
                {openAddModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => {
                            setOpenAddModal(false);
                            reset(); // Reset the form when closing the modal
                        }}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-10 max-w-xl w-[35%]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Add Toppings</h2>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name Input */}
                                <div className="mb-2">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Name<span className="text-red-500">*</span></label>
                                    <Controller
                                        name="subCategoryName"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Name"
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.subCategoryName && <p className="text-red-500 text-sm">{errors.subCategoryName.message}</p>}
                                </div>
                                {/* Price Input */}
                                <div className="mb-2">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Price</label>
                                    <Controller
                                        name="subCategoryName"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Price"
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.subCategoryName && <p className="text-red-500 text-sm">{errors.subCategoryName.message}</p>}
                                </div>
                            </div>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Image Input */}
                                <div className="mb-2">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Image<span className="text-red-500">*</span></label>
                                    <Controller
                                        name="subCategoryName"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="file"
                                                className="w-full h-12 border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.subCategoryName && <p className="text-red-500 text-sm">{errors.subCategoryName.message}</p>}
                                </div>

                                {/* Category Dropdown */}
                                <div className="mb-2">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Variation<span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="category_id"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select a Variation</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.category_id && (
                                        <p className="text-red-500 text-sm">
                                            {errors.category_id.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description Input */}
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
                                            placeholder="Enter a detailed description for Toppings"
                                            className="w-full h-32 rounded-md text-gray-800"
                                        />
                                    )}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 pt-8">
                                <button
                                    onClick={() => {
                                        setOpenAddModal(false);
                                        reset(); // Reset the form when closing the modal
                                    }}
                                    className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit(handleFormSubmit)}
                                    disabled={loading}
                                    className="relative bg-[#4318ff] text-white px-6 py-3 rounded-lg"
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
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenEditModal(false)}>
                        <div className="bg-white rounded-lg shadow-2xl p-10 max-w-xl w-[35%]  " onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Edit Sub Category</h2>

                            {/* Brand Dropdown */}
                            <div className="mb-2">
                                <label className="block text-lg text-gray-600 font-medium mb-2">Brand<span className="text-red-500 ">*</span></label>
                                <Controller
                                    name="brand_id"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        >
                                            <option value="">Select a Brand</option>
                                            {brands.map((brand) => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.brand_name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.brand_id && <p className="text-red-500 text-sm">{errors.brand_id.message}</p>}
                            </div>

                            {/* Category Dropdown */}
                            <div className="mb-2">
                                <label className="block text-lg text-gray-600 font-medium mb-2">Category<span className="text-red-500 ">*</span></label>
                                <Controller
                                    name="category_id"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        >
                                            <option value="">Select a Category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id.message}</p>}
                            </div>


                            {/* SubCategory Name Input */}
                            <div className="mb-2">
                                <label className="block text-lg text-gray-600 font-medium mb-2">SubCategory Name<span className="text-red-500 ">*</span></label>
                                <Controller
                                    name="subCategoryName"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter SubCategory Name"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.subCategoryName && <p className="text-red-500 text-sm">{errors.subCategoryName.message}</p>}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setOpenEditModal(false)}
                                    className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit(handleFormUpdate)} // Handle form submission
                                    disabled={loading} // Disable if loading
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


                <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="text-gray-600">
                                <th className="px-6 py-4 text-left">
                                    <div className="flex justify-between items-center">
                                        <input
                                            type="checkbox"
                                            checked={getPaginatedData().length > 0 && selectedRows.length === getPaginatedData().length}
                                            onChange={() => {
                                                if (selectedRows.length === getPaginatedData().length) {
                                                    setSelectedRows([]); // Deselect all rows
                                                } else {
                                                    setSelectedRows(getPaginatedData().map((row) => row.id)); // Select all rows
                                                }
                                            }}
                                            disabled={getPaginatedData().length === 0}  // Disable checkbox if no data
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Image</th>
                                <th className="px-6 py-4 text-left">Name</th>
                                <th className="px-6 py-4 text-left">Price</th>
                                <th className="px-6 py-4 text-left">Variation</th>
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
                            {getPaginatedData().length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No data available</td>
                                </tr>
                            ) : (
                                getPaginatedData().map((category) => (
                                    <tr key={category.id} className="border-t group">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(category.id)}
                                                onChange={() => handleRowSelection(category.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <img
                                                src={category?.category?.photo}
                                                alt={category.name}
                                                className="w-12 h-12 object-cover rounded-full"
                                            />
                                        </td>
                                        <td className="px-6 py-4">{category.brand?.brand_name || ''}</td>
                                        <td className="px-6 py-4">{category.category?.name || ''}</td>
                                        <td className="px-6 py-4">{category.name}</td>
                                        <td className="text-right">
                                            <div className="relative inline-block">
                                                <div className="flex items-center space-x-2">
                                                    {/* Ellipsis icon */}
                                                    <button
                                                        onClick={() => setOpenDropdown(openDropdown === category.id ? null : category.id)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        <FaEllipsisV />
                                                    </button>

                                                    {/* Edit and Delete buttons */}
                                                    <div className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200">
                                                        <button
                                                            onClick={() => {
                                                                handleEditRow(category);
                                                            }}
                                                            className="text-navy-700 hover:bg-gray-200"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                handleDeleteRow(category.id);
                                                            }}
                                                            className="text-red-600 hover:bg-gray-200"
                                                        >
                                                            <FaTrashAlt className="mr-2" />
                                                        </button>
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
                        {[10, 20, 50, 100].map((option) => (
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this SubCategory?</h2>
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

export default Toppings;
