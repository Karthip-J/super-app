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


function Banner() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectBanner, setSelectedBanner] = useState(null);
    const [brandImage, setBrandImage] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // Search query state
    const [filteredData, setFilteredData] = useState([]);  // For storing the filtered data

    // Yup validation schema
    const validationSchemaAdd = Yup.object({
        banner_type_id: Yup.string().required('Banner Type is required'),
        // name: Yup.string().required('Banner Name is required'),
        // button_name: Yup.string().required('Button Name is required'),
        // url: Yup.string().required('Button URL is required'),
        choose_file_for_mobile: Yup.mixed().required('* required'),
        choose_file_for_desktop: Yup.mixed().required('* required'),
        background_file_for_desktop: Yup.mixed().required('* required'),
        background_file_for_mobile: Yup.mixed().required('* required'),

    });


    const validationSchemaEdit = Yup.object({
        banner_type_id: Yup.string().required('Banner Type is required'),
        // name: Yup.string().required('Banner Name is required'),
        // button_name: Yup.string().required('Button Name is required'),
        // url: Yup.string().required('Button URL is required'),
        choose_file_for_mobile: Yup.mixed().required('* required'),
        choose_file_for_desktop: Yup.mixed().required('* required'),
        background_file_for_desktop: Yup.mixed().required('* required'),
        background_file_for_mobile: Yup.mixed().required('* required'),


    });

    const { reset, control, handleSubmit, setValue, formState: { errors }, clearErrors } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            banner_type_id: selectBanner?.banner_type_id || '',
            name: selectBanner?.name || '',
            button_name: selectBanner?.button_name || '',
            url: selectBanner?.url || '',
            choose_file_for_desktop: selectBanner?.choose_file_for_desktop || null,
            choose_file_for_mobile: selectBanner?.choose_file_for_mobile || null,
            background_file_for_desktop: selectBanner?.background_file_for_desktop || null,
            background_file_for_mobile: selectBanner?.background_file_for_mobile || null,
        },
    });

    // Reset form values and clear errors when opening the modal
    useEffect(() => {
        if (openEditModal) {
            reset({
                banner_type_id: selectBanner?.banner_type_id || '',
                name: selectBanner?.name || '',
                button_name: selectBanner?.button_name || '',
                url: selectBanner?.url || '',
                choose_file_for_desktop: selectBanner?.choose_file_for_desktop || null,
                choose_file_for_mobile: selectBanner?.choose_file_for_mobile || null,
                background_file_for_desktop: selectBanner?.background_file_for_desktop || null,
                background_file_for_mobile: selectBanner?.background_file_for_mobile || null,
            });
            clearErrors(); // Clears the error messages
        }
    }, [openEditModal, selectBanner, reset, clearErrors]);




    const fetchBannerData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_home_banner');
            setTableData(response.data);
            setTotalItems(response.data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const [bannerTypeData, setBannerTypeData] = useState([]);
    const fetchBannerTypeData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_banner_type');
            setBannerTypeData(response.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Handle Page Change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalFilteredItems = tableData.filter((banner) =>
        banner.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).length;

    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

    useEffect(() => {
        fetchBannerData();
        fetchBannerTypeData();
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
            const filtered = tableData.filter((banner) =>
                banner.name?.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by discount name
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); // Reset to first page when search query changes
        } else {
            setFilteredData(tableData); // If no search query, show all discounts
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);



    const handleFileChange = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result); // Optional: for preview purposes
            reader.readAsDataURL(file);
            setValue(key, file);
        }
    };



    // const handleFormSubmit = async (data) => {
    //     const formData = new FormData();
    //     formData.append('name', data.name);
    //     formData.append('banner_type_id', data.banner_type_id);
    //     formData.append('button_name', data.button_name);
    //     formData.append('url', data.url);
    //     formData.append('choose_file_for_mobile', data.choose_file_for_mobile);
    //     formData.append('choose_file_for_desktop', data.choose_file_for_desktop);
    //     formData.append('background_file_for_mobile', data.background_file_for_mobile);
    //     formData.append('background_file_for_desktop', data.background_file_for_desktop);

    //     setLoading(true);
    //     try {
    //         const accessToken = localStorage.getItem('OnlineShop-accessToken');
    //         const url = 'https://yrpitsolutions.com/ecom_backend/api/admin/save_home_banner';

    //         try {
    //             await axios.post(url, formData, {
    //                 headers: { Authorization: `Bearer ${accessToken}` }
    //             });

    //             // Success toaster message
    //             toast.success('Banner added successfully!', {
    //                 position: "top-right",
    //                 autoClose: 3000,
    //                 hideProgressBar: true,
    //             });

    //             fetchBannerData();
    //             setOpenAddModal(false);
    //             setBrandImage(null);
    //             reset();
    //         } catch (error) {
    //             console.error('Error submitting form:', error);

    //             // Error toaster message
    //             toast.error('Something went wrong while adding the banner. Please try again.', {
    //                 position: "top-right",
    //                 autoClose: 3000,
    //                 hideProgressBar: true,
    //             });
    //         } finally {
    //             setLoading(false);
    //         }
    //     } catch (error) {
    //         setLoading(false);
    //         console.error('Error preparing form data:', error);
    //     }
    // };


    const handleFormSubmit = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('banner_type_id', data.banner_type_id);
        formData.append('button_name', data.button_name);
        formData.append('url', data.url);
        formData.append('choose_file_for_mobile', data.choose_file_for_mobile);
        formData.append('choose_file_for_desktop', data.choose_file_for_desktop);
        formData.append('background_file_for_mobile', data.background_file_for_mobile);
        formData.append('background_file_for_desktop', data.background_file_for_desktop);

        setLoading(true);
        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = 'https://yrpitsolutions.com/ecom_backend/api/admin/save_home_banner';

            try {
                await axios.post(url, formData, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                // Success toaster message
                toast.success('Banner added successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                });

                fetchBannerData();
                setOpenAddModal(false);
                setBrandImage(null);
                reset();
            } catch (error) {
                console.error('Error submitting form:', error);

                // Error toaster message
                toast.error('Something went wrong while adding the banner. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: true,
                });
            } finally {
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);
        }
    };
    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name || selectBanner.name);
        formData.append('banner_type_id', data.banner_type_id || selectBanner.banner_type_id);
        formData.append('button_name', data.button_name || selectBanner.button_name);
        formData.append('url', data.url || selectBanner.url);

        if (data.choose_file_for_mobile && data.choose_file_for_mobile instanceof File) {
            formData.append('choose_file_for_mobile', data.choose_file_for_mobile);
        } else if (!data.choose_file_for_mobile) {
            formData.delete('choose_file_for_mobile');
        }
        if (data.choose_file_for_desktop && data.choose_file_for_desktop instanceof File) {
            formData.append('choose_file_for_desktop', data.choose_file_for_desktop);
        } else if (!data.choose_file_for_desktop) {
            formData.delete('choose_file_for_desktop');
        }
        if (data.background_file_for_mobile && data.background_file_for_mobile instanceof File) {
            formData.append('background_file_for_mobile', data.background_file_for_mobile);
        } else if (!data.background_file_for_mobile) {
            formData.delete('background_file_for_mobile');
        }
        if (data.background_file_for_desktop && data.background_file_for_desktop instanceof File) {
            formData.append('background_file_for_desktop', data.background_file_for_desktop);
        } else if (!data.background_file_for_desktop) {
            formData.delete('background_file_for_desktop');
        }

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/update_home_banner_by_id/${selectBanner.id}`;

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    // Success toaster message
                    toast.success('Banner updated successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                    });

                    fetchBannerData();
                    setOpenEditModal(false);
                    setBrandImage(null);
                    reset();
                } catch (error) {
                    console.error('Error updating form:', error);

                    // Error toaster message
                    toast.error('Something went wrong while updating the banner. Please try again.', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                    });
                } finally {
                    setLoading(false);
                }
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);

            // Error toaster message
            toast.error('An error occurred while preparing the form data. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
        }
    };


    const handleAddBrand = () => {
        setSelectedBanner(null);
        setValue('name', '');
        setValue('banner_type_id', '');
        setValue('button_name', '');
        setValue('url', '');
        setOpenAddModal(true);
        reset();
    };

    const handleEditRow = (banner) => {
        setSelectedBanner(banner);
        setValue('name', banner.name);
        setValue('banner_type_id', banner.banner_type_id);
        setValue('button_name', banner.button_name);
        setValue('url', banner.url);
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
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_home_banner_by_id/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success Toast
            toast.success("Banner deleted successfully!", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            fetchBannerData();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting banner:', error);

            // Error Toast
            toast.error("Error deleting banner. Please try again.", {
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
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_home_banner_by_id/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            // Success Toast for bulk delete
            toast.success("Banners deleted successfully!", {
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Refresh data and clear selection
            window.location.reload();
            await fetchBannerData(); // Refresh the data
            setSelectedRows([]); // Clear selection after bulk delete
        } catch (error) {
            console.error('Error deleting selected banners:', error);

            // Error Toast for bulk delete
            toast.error("Error deleting selected banners. Please try again.", {
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
                                placeholder="Search by Banner Name..."
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
                        <FaPlus className="mr-2" /> Add Banner
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
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Add Banner</h2>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Banner Name</label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Banner Name"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Banner Type<span className="text-red-500 ">*</span></label>
                                    <Controller
                                        name="banner_type_id"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                                            >
                                                <option value="">Select Banner Type</option>
                                                {bannerTypeData?.map((banner) => (
                                                    <option key={banner.id} value={banner.id}>
                                                        {banner.banner_type_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.banner_type_id && <p className="text-red-500 text-sm">{errors.banner_type_id.message}</p>}
                                </div>
                            </div>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Button Name</label>
                                    <Controller
                                        name="button_name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Button Name"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Button URL</label>
                                    <Controller
                                        name="url"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Button URL"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="choose_file_for_mobile" className="block text-lg text-gray-600 font-medium mb-2">
                                        Choose File for Mobile<span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        id="choose_file_for_mobile"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'choose_file_for_mobile')}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                                    />
                                    {errors.choose_file_for_mobile && (
                                        <p className="text-red-500 text-sm">{errors.choose_file_for_mobile.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="choose_file_for_desktop" className="block text-lg text-gray-600 font-medium mb-2">
                                        Choose File for Desktop<span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        id="choose_file_for_desktop"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'choose_file_for_desktop')}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                                    />
                                    {errors.choose_file_for_desktop && (
                                        <p className="text-red-500 text-sm">{errors.choose_file_for_desktop.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="background_file_for_mobile" className="block text-lg text-gray-600 font-medium mb-2">
                                        Background for Mobile<span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        id="background_file_for_mobile"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'background_file_for_mobile')}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                                    />
                                    {errors.background_file_for_mobile && (
                                        <p className="text-red-500 text-sm">{errors.background_file_for_mobile.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="background_file_for_desktop" className="block text-lg text-gray-600 font-medium mb-2">
                                        Background for Desktop <span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        id="background_file_for_desktop"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'background_file_for_desktop')}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                                    />
                                    {errors.background_file_for_desktop && (
                                        <p className="text-red-500 text-sm">{errors.background_file_for_desktop.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setOpenAddModal(false)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit(handleFormSubmit)}
                                    disabled={loading}
                                    className="relative bg-[#4318ff] text-white px-4 py-2 rounded-lg flex items-center ml-auto max-w-xs"
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
                            className="bg-white rounded-lg shadow-2xl p-8 w-[600px]" // Apply same width as in Add Modal
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Edit Banner</h2>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Banner Name</label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Banner Name"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none" // Updated input class
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Banner Type<span className="text-red-500 ">*</span></label>
                                    <Controller
                                        name="banner_type_id"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none" // Updated input class
                                            >
                                                <option value="">Select Banner Type</option>
                                                {bannerTypeData?.map((banner) => (
                                                    <option key={banner.id} value={banner.id}>
                                                        {banner.banner_type_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.banner_type_id && <p className="text-red-500 text-sm">{errors.banner_type_id.message}</p>}
                                </div>
                            </div>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Button Name</label>
                                    <Controller
                                        name="button_name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Button Name"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none" // Updated input class
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Button URL</label>
                                    <Controller
                                        name="url"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Button URL"
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none" // Updated input class
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="choose_file_for_mobile" className="block text-lg text-gray-600 font-medium mb-2">
                                        Choose File for Mobile<span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        id="choose_file_for_mobile"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'choose_file_for_mobile')}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none" // Updated input class
                                    />
                                    {errors.choose_file_for_mobile && (
                                        <p className="text-red-500 text-sm">{errors.choose_file_for_mobile.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="choose_file_for_desktop" className="block text-lg text-gray-600 font-medium mb-2">
                                        Choose File for Desktop<span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        id="choose_file_for_desktop"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'choose_file_for_desktop')}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none" // Updated input class
                                    />
                                    {errors.choose_file_for_desktop && (
                                        <p className="text-red-500 text-sm">{errors.choose_file_for_desktop.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="background_file_for_mobile" className="block text-lg text-gray-600 font-medium mb-2">
                                        Background for Mobile<span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        id="background_file_for_mobile"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'background_file_for_mobile')}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none" // Updated input class
                                    />
                                    {errors.background_file_for_mobile && (
                                        <p className="text-red-500 text-sm">{errors.background_file_for_mobile.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="background_file_for_desktop" className="block text-lg text-gray-600 font-medium mb-2">
                                        Background for Desktop<span className="text-red-500 ">*</span>
                                    </label>
                                    <input
                                        id="background_file_for_desktop"
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleFileChange(e, 'background_file_for_desktop')}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none" // Updated input class
                                    />
                                    {errors.background_file_for_desktop && (
                                        <p className="text-red-500 text-sm">{errors.background_file_for_desktop.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setOpenEditModal(false)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSubmit(handleFormUpdate)}
                                    disabled={loading}
                                    className="relative bg-[#4318ff] text-white px-4 py-2 rounded-lg flex items-center ml-auto max-w-xs"
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
                                            checked={selectedRows.length > 0 && selectedRows.length === getPaginatedData().length}
                                            onChange={() => {
                                                if (selectedRows.length === getPaginatedData().length) {
                                                    // Deselect all
                                                    setSelectedRows([]);
                                                } else {
                                                    // Select all on this page
                                                    setSelectedRows(getPaginatedData().map((row) => row.id));
                                                }
                                            }}
                                        />

                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left">Banner Type</th>
                                <th className="px-6 py-4 text-left">Banner Name</th>
                                <th className="px-6 py-4 text-left">Button Name</th>
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
                                getPaginatedData().map((banner) => (
                                    <tr key={banner.id} className="border-t">
                                        <td className="px-6 py-4 ">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(banner.id)}
                                                onChange={() => handleRowSelection(banner.id)}
                                            />
                                        </td>

                                        <td className="px-6 py-4">{banner.banner_type.banner_type_name}</td>
                                        <td className="px-6 py-4">{banner.name}</td>
                                        <td className="px-6 py-4">{banner.button_name}</td>

                                        {/* <td className="text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === banner.id ? null : banner.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === banner.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                handleEditRow(banner);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(banner.id);
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

                                        <td className="text-right group relative">
                                            <div className="flex items-center space-x-2">
                                                {/* Ellipsis icon */}
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === banner.id ? null : banner.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>

                                                {/* Edit and Delete buttons visible on hover */}
                                                <div className="absolute right-20 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200">
                                                    <button
                                                        onClick={() => {
                                                            handleEditRow(banner);
                                                        }}
                                                        className="text-navy-700 "
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleDeleteRow(banner.id);
                                                        }}
                                                        className="text-red-600 "
                                                    >
                                                        <FaTrashAlt className="mr-2"  />
                                                    </button>
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Banner?</h2>
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

export default Banner;
