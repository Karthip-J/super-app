import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import API_CONFIG from '../../../config/api.config';



function ProductVariation() {
    const location = useLocation();
    // Extract query parameters
    const searchParams = new URLSearchParams(location.search);
    const productId = searchParams.get("product_id");
    const brandId = searchParams.get("brand_id");
    const categoryId = searchParams.get("category_id");
    const subCategoryId = searchParams.get("sub_category_id");
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
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [size, setSize] = useState([]);
    const [color, setColor] = useState([]);
    const [unit, setUnit] = useState([]);
    const [images, setImages] = useState([]);
    const validationSchemaAdd = Yup.object({
        variation_name: Yup.string().required('Variation name is required'),
        // variation_size: Yup.string().required('Size is required'),
        // variation_color: Yup.string().required('Color is required'),
        variation_price: Yup.number().required('Price is required'),
        // quantity: Yup.number().required('Quantity is required'),
    });

    const validationSchemaEdit = Yup.object({
        variation_name: Yup.string().required('Variation name is required'),
        // variation_size: Yup.string().required('Size is required'),
        // variation_color: Yup.string().required('Color is required'),
        variation_price: Yup.number().required('Price is required'),
        // quantity: Yup.number().required('Quantity is required'),
    });

    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            brand_id: selectedBrand?.brand_id || '',
            category_id: selectedBrand?.category_id || '',
            sub_category_id: selectedBrand?.sub_category_id || '',
            product_id: selectedBrand?.product_id || '',
            variation_size: selectedBrand?.variation_size || '',
            variation_color: selectedBrand?.variation_color || '',
            variation_price: selectedBrand?.variation_price || '',
            quantity: selectedBrand?.quantity || '',
            unit_name: selectedBrand?.unit_name || '',

        },
    });

    const fetchVariationData = async () => {
        if (!productId) {
            console.warn("productId is undefined.");
            return;
        }
        try {
            const response = await axios.get(
                API_CONFIG.getUrl(`api/admin/get_product_variation_by_product_id/${productId}`)
            );
            setTableData(response.data);
            setTotalItems(response.data.length);
        } catch (error) {
            console.error("Error fetching variation data:", error);
        }
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const fetchSizeData = async () => {
        try {
            const response = await axios.get(
                API_CONFIG.getUrl('api/admin/get_all_size')
            );
            setSize(response.data.data);
        } catch (error) {
            console.error("Error fetching size data:", error);
        }
    };

    const fetchColorData = async () => {
        try {
            const response = await axios.get(
                API_CONFIG.getUrl('api/admin/get_all_colours')
            );
            setColor(response.data.data);
        } catch (error) {
            console.error("Error fetching color data:", error);
        }
    };

    const fetchUnitData = async () => {
        try {
            const response = await axios.get(
                API_CONFIG.getUrl('api/admin/get_all_unit')
            );
            setUnit(response.data.data);
        } catch (error) {
            console.error("Error fetching Unit data:", error);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchVariationData();
        }
        fetchSizeData();
        fetchUnitData();
        fetchColorData();
    }, [productId, itemsPerPage]);

    // Handle search input change
    useEffect(() => {
        if (searchQuery) {
            const filtered = tableData.filter((variation) =>
                variation.variation_name?.toLowerCase().includes(searchQuery.toLowerCase()) // Assuming variation_name is the field
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all data
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);


    // Get paginated data
    const getPaginatedData = () => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    };

    // Handle page change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    useEffect(() => {
        if (productId) {
            fetchVariationData();
        }
        fetchSizeData();
        fetchUnitData();
        fetchColorData();
    }, [productId, itemsPerPage]);


    const handleRowSelection = (id) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    const handleFormSubmit = async (data) => {

        const VariationName = data.variation_name;
        const existingBrand = getPaginatedData().find(variationname => variationname.variation_name.toLowerCase() === VariationName.toLowerCase());

        if (existingBrand) {
            toast.error("This Variation Name already exists. Provide different name.", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return; // Prevent form submission if the brand name already exists
        }
        setLoading(true);

        const formData = new FormData();
        formData.append('brand_id', brandId);
        formData.append('category_id', categoryId);
        formData.append('sub_category_id', subCategoryId);
        formData.append('product_id', productId);
        formData.append('variation_size', data.variation_size);
        formData.append('variation_color', data.variation_color);
        formData.append('variation_name', data.variation_name);
        formData.append('variation_price', data.variation_price);
        formData.append('quantity', data.quantity);
        formData.append('weight', data.weight);
        formData.append('unit_name', data.unit_name);

        // Append other images if exists
        if (images?.length > 0) {
            images.forEach((image) => {
                formData.append('images[]', image);
            });
        }

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = API_CONFIG.getUrl('api/admin/save_product_variation');

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });
                    fetchVariationData();
                    setOpenAddModal(false);
                    reset();
                    setImages();

                    // Show success toaster without progress bar
                    toast.success('Product variation added successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined
                    });
                } catch (error) {
                    console.error('Error submitting form:', error);
                    // Show error toaster with more details
                    toast.error('Failed to add product variation! Please try again.', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined
                    });
                } finally {
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);
            // Show error toaster for form data preparation
            toast.error('Error preparing form data. Please check your input.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined
            });
        }

    };

    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files.length + images?.length > 5) {
            alert('You can upload a maximum of 5 images.');
            return;
        }

        const newImages = [...images];
        for (let i = 0; i < files.length; i++) {
            newImages.push(files[i]);
        }
        setImages(newImages);
    };

    const handleRemoveImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('brand_id', data.brand_id || selectedBrand.brand_id);
        formData.append('category_id', data.category_id || selectedBrand.category_id);
        formData.append('sub_category_id', data.sub_category_id || selectedBrand.sub_category_id);
        formData.append('product_id', data.product_id || selectedBrand.product_id);
        formData.append('variation_size', data.variation_size || selectedBrand.variation_size);
        formData.append('variation_color', data.variation_color || selectedBrand.variation_color);
        formData.append('variation_name', data.variation_name || selectedBrand.variation_name);
        formData.append('variation_price', data.variation_price || selectedBrand.variation_price);
        formData.append('quantity', data.quantity || selectedBrand.quantity);
        formData.append('weight', data.weight || selectedBrand.weight);
        formData.append('unit_name', data.unit_name || selectedBrand.unit_name);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = API_CONFIG.getUrl(`api/admin/update_product_variation_by_id/${selectedBrand.id}`);

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    // Show success toaster after updating
                    toast.success('Product variation updated successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    fetchVariationData();
                    setOpenEditModal(false);
                    reset();

                } catch (error) {
                    console.error('Error updating form:', error);
                    // Show error toaster if update fails
                    toast.error('Failed to update product variation. Please try again.', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
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
            // Show error toaster if preparing the form data fails
            toast.error('Error preparing form data. Please check your input.', {
                position: "top-right",
                autoClose: 5000,
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
        setValue('brand_id', '');
        setValue('category_id', '');
        setValue('sub_category_id', '');
        setValue('product_id', '');
        setValue('variation_size', '');
        setValue('variation_color', '');
        setValue('variation_name', '');
        setValue('variation_price', '');
        setValue('quantity', '');
        setValue('weight', '');
        setValue('unit_name', '');

        setOpenAddModal(true);
    };

    const handleEditRow = (variation) => {
        setSelectedBrand(variation);
        setValue('brand_id', variation.brand_id);
        setValue('category_id', variation.category_id);
        setValue('sub_category_id', variation.sub_category_id);
        setValue('product_id', variation.product_id);
        setValue('variation_size', variation.variation_size);
        setValue('variation_color', variation.variation_color);
        setValue('variation_name', variation.variation_name);
        setValue('variation_price', variation.variation_price);
        setValue('quantity', variation.quantity);
        setValue('weight', variation.weight);
        setValue('unit_name', variation.unit_name);
        setImages(variation.images || []);
        setOpenEditModal(true);
    };


    const handleDeleteRow = (id) => {
        setRowIdToDelete(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true); // Start loading state

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');

            // Sending DELETE request to delete product variation
            await axios.delete(API_CONFIG.getUrl(`api/admin/delete_product_variation_by_id/${rowIdToDelete}`), {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            fetchVariationData(); // Refresh the data after deletion
            setOpenDeleteDialog(false); // Close the delete dialog

            // Show success toast after successful deletion
            toast.success('Product variation deleted successfully!', {
                position: 'top-right',
                autoClose: 3000,  // Toast will auto-close in 3 seconds
                hideProgressBar: true,  // Hide progress bar for cleaner UI
                closeOnClick: true,  // Allow the user to click to close the toast
                pauseOnHover: true,  // Pause the toast when hovered over
                draggable: true,  // Allow the user to drag the toast around
                progress: undefined,  // Disable the progress bar
            });

        } catch (error) {
            console.error('Error deleting product variation:', error);

            // Show error toast if deletion fails
            toast.error('Failed to delete product variation. Please try again.', {
                position: 'top-right',
                autoClose: 3000,  // Toast will auto-close in 3 seconds
                hideProgressBar: true,  // Hide progress bar for error case
                closeOnClick: true,  // Allow user to click to close the error message
                pauseOnHover: true,  // Pause on hover for better interaction
                draggable: true,  // Allow dragging for error toast
                progress: undefined,  // Disable progress bar
            });
        } finally {
            setIsDeleting(false); // Stop loading state once the operation is complete
        }
    };



    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
    };
    const handleBulkDelete = async () => {
        setLoading(true); // Start loading state

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');

            // Iterate through the selected rows and delete each one
            for (let id of selectedRows) {
                await axios.delete(API_CONFIG.getUrl(`api/admin/delete_product_variation_by_id/${id}`), {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            // Refresh the data after deletion
            fetchVariationData();
            setSelectedRows([]); // Clear the selection

            // Show success toast after successful bulk deletion
            toast.success('Selected products have been successfully deleted!', {
                position: 'top-right',
                autoClose: 3000, // Toast auto-close in 3 seconds
                hideProgressBar: true, // Hide the progress bar for cleaner UI
                closeOnClick: true, // Allow users to close the toast by clicking
                pauseOnHover: true, // Pause the toast when hovered over
                draggable: true, // Allow dragging the toast
                progress: undefined, // Disable progress bar
            });

        } catch (error) {
            console.error('Error deleting selected products:', error);

            // Show error toast if bulk deletion fails
            toast.error('There was an error deleting the selected products. Please try again.', {
                position: 'top-right',
                autoClose: 3000, // Toast auto-close in 3 seconds
                hideProgressBar: true, // Hide the progress bar for error case
                closeOnClick: true, // Allow users to close the error toast by clicking
                pauseOnHover: true, // Pause the toast when hovered over
                draggable: true, // Allow dragging the error toast
                progress: undefined, // Disable progress bar
            });
        } finally {
            setLoading(false); // Stop loading state once the operation is complete
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

            <TokenExpiration />
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
                                placeholder="Search by Name..."
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
                        <FaPlus className="mr-2" /> Add Variation
                    </button>
                </span>

                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-8 w-[70%] max-h-[90%] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add Variation</h2>
                            {/* Variation Price and Quantity in Same Row */}
                            {/* <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-5"> */}
                            {/* Variation Price */}
                            <div>
                                <label className="block text-lg text-gray-600 font-medium mb-2">Variation Name<span className="text-red-500">*</span></label>
                                <Controller
                                    name="variation_name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter Variation Price"
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.variation_name && <p className="text-red-500 text-sm">{errors.variation_name.message}</p>}
                                {/* </div> */}
                            </div>

                            {/* Variation Price and Quantity in Same Row */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                                {/* Variation Price */}
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Variation Price<span className="text-red-500">*</span></label>
                                    <Controller
                                        name="variation_price"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Variation Price"
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.variation_price && <p className="text-red-500 text-sm">{errors.variation_price.message}</p>}
                                </div>

                                {/* Quantity */}
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Quantity</label>
                                    <Controller
                                        name="quantity"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Quantity"
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
                                </div>
                            </div>

                            {/* Variation Size and Color in Same Row */}
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-6 mt-5">
                                {/* Variation Size */}
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Variation Size</label>
                                    <Controller
                                        name="size_name"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select size</option>
                                                {size.map((sizes) => (
                                                    <option key={sizes.id} value={sizes.size_name}>
                                                        {sizes.size_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.size_name && <p className="text-red-500 text-sm">{errors.size_name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Unit</label>
                                    <Controller
                                        name="unit_name"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select Unit</option>
                                                {unit.map((unit) => (
                                                    <option key={unit.id} value={unit.unit_name}>
                                                        {unit.unit_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.unit_name && <p className="text-red-500 text-sm">{errors.unit_name.message}</p>}
                                </div>

                                {/* Variation Color */}
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Variation Color</label>
                                    <Controller
                                        name="variation_color"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select Color</option>
                                                {color.map((colors) => {
                                                    const rgbValue = `rgb(${colors.r}, ${colors.g}, ${colors.b})`;
                                                    return (
                                                        <option
                                                            key={colors.id}
                                                            value={rgbValue}
                                                            style={{ backgroundColor: rgbValue, color: 'black' }}
                                                        >
                                                            {rgbValue}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        )}
                                    />
                                    {errors.variation_color && <p className="text-red-500 text-sm">{errors.variation_color.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {/* Upload Multiple Images Section */}
                                <div className="col-span-6 sm:col-span-3 md:col-span-3 lg:col-span-3">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Upload Multiple Images (Max 5)<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={images?.length >= 5}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                    />
                                    {/* {errors.images && <p className="text-red-500 text-sm">{errors.images.message}</p>} */}

                                    {/* Display uploaded images */}
                                    <div style={{ marginTop: '10px' }}>
                                        {images.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between my-2">
                                                <mark className="px-3 py-1 bg-yellow-200 rounded-md">{file.name}</mark>
                                                <button
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="ml-2 text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-600">{images?.length} / 5 images uploaded</p>

                                </div>

                                {/* Weight Field (New Field) */}
                                <div className="col-span-6 sm:col-span-3 md:col-span-3 lg:col-span-3">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Weight (in kg)
                                    </label>
                                    <Controller
                                        name="weight"
                                        control={control}
                                        rules={{ required: "Weight is required" }}
                                        render={({ field }) => (
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Enter Weight (in kg)"
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {/* {errors.weight && (
                                        <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                                    )} */}
                                </div>
                            </div>

                            {/* Action Buttons */}
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
                            className="bg-white rounded-lg shadow-2xl p-8 w-[70%] max-h-[90%] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Variation</h2>

                            {/* Variation Fields */}
                            <div className="mb-6 grid grid-cols-1 gap-6">
                                {/* Variation Name (Full Row) */}
                                <div className="col-span-1">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Variation Name<span className="text-red-500">*</span></label>
                                    <Controller
                                        name="variation_name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Variation Name"
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.variation_name && <p className="text-red-500 text-sm">{errors.variation_name.message}</p>}
                                </div>

                                {/* Variation Price and Quantity in same row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Variation Price */}
                                    <div>
                                        <label className="block text-lg text-gray-600 font-medium mb-2">Variation Price<span className="text-red-500">*</span></label>
                                        <Controller
                                            name="variation_price"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    placeholder="Enter Variation Price"
                                                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                    {...field}
                                                />
                                            )}
                                        />
                                        {errors.variation_price && <p className="text-red-500 text-sm">{errors.variation_price.message}</p>}
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-lg text-gray-600 font-medium mb-2">Quantity</label>
                                        <Controller
                                            name="quantity"
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    type="text"
                                                    placeholder="Enter Quantity"
                                                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                    {...field}
                                                />
                                            )}
                                        />
                                        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}
                                    </div>
                                </div>

                                {/* Variation Size and Color */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
                                    {/* Variation Size */}
                                    <div>
                                        <label className="block text-lg text-gray-600 font-medium mb-2">Variation Size</label>
                                        <Controller
                                            name="variation_size"
                                            control={control}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                >
                                                    <option value="">Select size</option>
                                                    {size.map((sizes) => (
                                                        <option key={sizes.id} value={sizes.id}>
                                                            {sizes.size_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />
                                        {errors.variation_size && <p className="text-red-500 text-sm">{errors.variation_size.message}</p>}
                                    </div>

                                    {/* Variation Color */}
                                    <div>
                                        <label className="block text-lg text-gray-600 font-medium mb-2">Variation Color</label>
                                        <Controller
                                            name="variation_color"
                                            control={control}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                >
                                                    <option value="">Select Color</option>
                                                    {color.map((colors) => {
                                                        const rgbValue = `rgb(${colors.r}, ${colors.g}, ${colors.b})`;
                                                        return (
                                                            <option
                                                                key={colors.id}
                                                                value={colors.id}
                                                                style={{ backgroundColor: rgbValue, color: 'black' }}
                                                            >
                                                                {rgbValue}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            )}
                                        />
                                        {errors.variation_color && <p className="text-red-500 text-sm">{errors.variation_color.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {/* Upload Multiple Images Section */}
                                <div className="col-span-6 sm:col-span-3 md:col-span-3 lg:col-span-3">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Upload Multiple Images (Max 5)<span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        disabled={images?.length >= 5}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                    />
                                    {errors.images && <p className="text-red-500 text-sm">{errors.images.message}</p>}

                                    {/* Display uploaded images */}
                                    <div style={{ marginTop: '10px' }}>
                                        {images.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between my-2">
                                                <mark className="px-3 py-1 bg-yellow-200 rounded-md">{file.name}</mark>
                                                <button
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="ml-2 text-sm text-red-600 hover:text-red-800"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-600">{images?.length} / 5 images uploaded</p>
                                </div>

                                {/* Weight Field (New Field) */}
                                <div className="col-span-6 sm:col-span-3 md:col-span-3 lg:col-span-3">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Weight (in kg)
                                    </label>
                                    <Controller
                                        name="weight"
                                        control={control}
                                        rules={{ required: "Weight is required" }}
                                        render={({ field }) => (
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Enter Weight (in kg)"
                                                className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
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
                                        {/* <input
                                            type="checkbox"
                                            onChange={() => {
                                                if (selectedRows.length === getPaginatedData().length) {
                                                    setSelectedRows([]); // Deselect all rows
                                                } else {
                                                    setSelectedRows(getPaginatedData().map((row) => row.id)); // Select all rows
                                                }
                                            }}
                                        /> */}
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.length === getPaginatedData().length && getPaginatedData().length > 0}
                                            onChange={() => {
                                                if (selectedRows.length === getPaginatedData().length) {
                                                    setSelectedRows([]);
                                                } else {
                                                    setSelectedRows(getPaginatedData().map((row) => row.id));
                                                }
                                            }}
                                            disabled={getPaginatedData().length === 0}  // Disable checkbox when no data is available
                                        />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Variation Name</th>
                                <th className="px-6 py-4 text-left">Price</th>
                                <th className="px-6 py-4 text-left">Size</th>
                                <th className="px-6 py-4 text-left">Color</th>
                                <th className="px-6 py-4 text-left">Unit</th>
                                <th className="px-6 py-4 text-left">Quantity</th>
                                <th className="px-6 py-4 text-left">
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
                                    <td colSpan="6" className="text-center py-4 text-gray-500">
                                        No Variation found
                                    </td>
                                </tr>
                            ) : (
                                getPaginatedData().map((variation) => (
                                    <tr key={variation.id} className="border-t group relative">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(variation.id)}
                                                onChange={() => handleRowSelection(variation.id)} // Handle selection
                                            />
                                        </td>
                                        <td className="px-6 py-4">{variation.variation_name}</td>
                                        <td className="px-6 py-4">{variation.variation_price}</td>
                                        <td className="px-6 py-4">{variation.variation_size}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        backgroundColor: variation.variation_color,
                                                        borderRadius: '50%',
                                                        marginRight: '8px',
                                                    }}
                                                    title={variation.variation_color}
                                                ></div>
                                                <span className="text-sm">{variation.variation_color}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{variation.unit_name}</td>
                                        <td className="px-6 py-4">{variation.quantity}</td>

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === variation.id ? null : variation.id)}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <FaEllipsisV />
                                            </button>
                                            <div className="absolute right-20 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditRow(variation)}
                                                    className=" mr-4"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRow(variation.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="text-gray-600 hover:text-gray-900"
                                                    onClick={() => { }}
                                                >

                                                </button>
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




    );
}

export default ProductVariation;
