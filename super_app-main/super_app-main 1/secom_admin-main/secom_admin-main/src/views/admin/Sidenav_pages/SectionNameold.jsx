import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { TokenExpiration } from 'views/auth/TokenExpiration ';

function SectionName() {
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
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [brandToEdit, setBrandToEdit] = useState(null);
     const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [sessionNames, setSessionNames] = useState([]);

    const [selectedType, setSelectedType] = useState("");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [selectedProduct, setSelectedProduct] = useState("");
    const [selectedSession, setSelectedSession] = useState("");
    const [desktopImage, setDesktopImage] = useState(null);
    const [mobileImage, setMobileImage] = useState(null);
    const [buttonName, setButtonName] = useState('');
    const [buttonUrl, setButtonUrl] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const validationSchemaAdd = Yup.object().shape({
        section_name_id: Yup.string().required('Section Name is required'),
        type: Yup.string().required('Type is required'),
        button_name: Yup.string().required('Button Name is required'),
        button_url: Yup.string()
            .url('Button URL must be a valid URL')
            .required('Button URL is required'),
        desktop_image: Yup.mixed().required('Desktop Image is required'),
        mobile_image: Yup.mixed().required('Mobile Image is required'),
        date: Yup.string().required('Date is required'),
        time_period: Yup.string().required('Time is required'),
        // Conditional validations for dynamic fields
        brand_id: Yup.string().when('type', {
            is: 'brand',
            then: Yup.string().required('Brand is required')
        }),
        category_id: Yup.string().when('type', {
            is: 'category',
            then: Yup.string().required('Category is required')
        }),
        sub_category_id: Yup.string().when('type', {
            is: 'subcategory',
            then: Yup.string().required('Sub-category is required')
        }),
        product_id: Yup.array().when('type', {
            is: 'product',
            then: Yup.array().min(1, 'At least one product must be selected').required('Products are required')
        }),
    });
    
    const validationSchemaEdit = Yup.object().shape({
        section_name_id: Yup.string().required('Section Name is required'),
        type: Yup.string().required('Type is required'),
        button_name: Yup.string().required('Button Name is required'),
        button_url: Yup.string()
            .url('Button URL must be a valid URL')
            .required('Button URL is required'),
        desktop_image: Yup.mixed().notRequired(), 
        mobile_image: Yup.mixed().notRequired(),
        date: Yup.string().required('Date is required'),
        time_period: Yup.string().required('Time is required'),
        // Conditional validations for dynamic fields
        brand_id: Yup.string().when('type', {
            is: 'brand',
            then: Yup.string().required('Brand is required')
        }),
        category_id: Yup.string().when('type', {
            is: 'category',
            then: Yup.string().required('Category is required')
        }),
        sub_category_id: Yup.string().when('type', {
            is: 'subcategory',
            then: Yup.string().required('Sub-category is required')
        }),
        product_id: Yup.array().when('type', {
            is: 'product',
            then: Yup.array().min(1, 'At least one product must be selected').required('Products are required')
        }),
    });
    
    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit), // Dynamic validation schema based on the modal state
    });

    const fetchSectionData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/getAll_HomePageSubSections');
            const data = response.data.data;

            if (Array.isArray(data)) {
                setTableData(data); // Store the full data
                setFilteredData(data); // Show all data initially
                setTotalItems(data.length); // Set total items for pagination
            } else {
                console.error('API response is not an array:', data);
                setFilteredData([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setFilteredData([]);
        }
    };


    useEffect(() => {
        fetchSectionData();
    }, []);


    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredData(tableData);
            setTotalItems(tableData.length);
        } else {
            const filtered = tableData.filter(brand =>
                brand.section_name.section_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1);
        }
    }, [searchQuery, tableData]);

    // Handle page change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);


    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage, searchQuery]);

    // Get paginated data
    const getPaginatedData = () => {
        console.log('filteredData:', filteredData);
        if (!Array.isArray(filteredData)) {
            console.error('filteredData is not an array:', filteredData);
            return [];
        }

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    };
    const [error, setError] = useState(null);



    const handleAddBrand = () => {
        setSubsectionId(null);
        setImagePreview(null);
        setOpenAddModal(true);
    };

    const handleEditRow = (section) => {
        setSubsectionId(section.id);
        setValue('section_name_id', section.section_name);
        setValue('type', section.type);
        setValue('brand_id', section.brand_id);
        setValue('category_id', section.category_id);
        setValue('sub_category_id', section.sub_category_id);
        setValue('product_id', section.products);
        setValue('desktop_image', section.desktop_image);
        setValue('mobile_image', section.mobile_image);
        setValue('button_name', section.button_name);
        setValue('button_url', section.button_url);
        setValue('date', section.date);
        setValue('time_period', section.time);
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
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_HomePageSubSection/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            fetchSectionData();
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
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/delete_HomePageSubSection/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }
            window.location.reload();
            // await fetchSectionData(); 
            setSelectedRows([]);
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

   

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [brandResponse, categoryResponse, subCategoryResponse, productResponse, sessionResponse] = await Promise.all([
                    axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_brand'),
                    axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_category'),
                    axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_subcategory'),
                    axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_product'),
                    axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/get_all_data_homepage'),
                ]);

                setBrands(brandResponse.data);
                setCategories(categoryResponse.data);
                setSubCategories(subCategoryResponse.data);
                setProducts(productResponse.data);
                if (Array.isArray(sessionResponse.data)) {
                    setSessionNames(sessionResponse.data); // Store session names
                } else {
                    console.error("Session data is not in the expected array format");
                }

                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    const handleSelectChange = (e) => {
        setSelectedType(e.target.value);
        setSelectedBrand("");
        setSelectedCategory("");
        setSelectedSubCategory("");
        setSelectedProduct("");

    };
    const handleDesktopImageChange = (e) => {
        setDesktopImage(e.target.files[0]);
    };

    const handleMobileImageChange = (e) => {
        setMobileImage(e.target.files[0]);
    };

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value); // Update selected time state
    };
    // const handleFormSubmit = async () => {


    //     setLoading(true);

    //     // Prepare the form data object
    //     const formData = new FormData();
    //     formData.append('section_name_id', selectedSession);
    //     formData.append('type', selectedType);
    //     formData.append('button_name', buttonName);
    //     formData.append('button_url', buttonUrl);
    //     formData.append('desktop_image', desktopImage); // Assuming desktopImage is a file input
    //     formData.append('mobile_image', mobileImage); // Assuming mobileImage is a file input
    //     formData.append('date', selectedDate);
    //     formData.append('time', selectedTime);

    //     // Add other dynamic data fields based on selected type (brand, category, etc.)
    //     if (selectedType === 'brand') {
    //         formData.append('brand_id', selectedBrand);
    //     } else if (selectedType === 'category') {
    //         formData.append('category_id', selectedCategory);
    //     } else if (selectedType === 'subcategory') {
    //         formData.append('subcategory_id', selectedSubCategory);
    //     }
    //      // Add selected products as an array
    //      if (selectedType === 'product') {
    //         formData.append('product_id', JSON.stringify(selectedProducts)); // Send as a JSON array
    //     }


    //     try {
    //         const accessToken = localStorage.getItem('OnlineShop-accessToken'); // Retrieve token from localStorage

    //         // Make the API call using axios
    //         const response = await axios.post(
    //             'https://yrpitsolutions.com/ecom_backend/api/admin/save_HomePageSubSection',
    //             formData,
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${accessToken}`, // Authorization header with token
    //                     'Content-Type': 'multipart/form-data', // Ensure the correct content type for file uploads
    //                 }
    //             }
    //         );

    //         setLoading(false);


    //         fetchSectionData();
    //         setOpenAddModal(false);
    //         resetFormData();

    //     } catch (error) {
    //         setLoading(false);
    //         console.error('Error:', error);

    //     }
    // };

    // Reset form data after successful submission

    const handleFormSubmit = async () => {
        setLoading(true);

        // Prepare the form data object
        const formData = new FormData();
        formData.append('section_name_id', selectedSession);
        formData.append('type', selectedType);
        formData.append('button_name', buttonName);
        formData.append('button_url', buttonUrl);
        formData.append('desktop_image', desktopImage); // Assuming desktopImage is a file input
        formData.append('mobile_image', mobileImage); // Assuming mobileImage is a file input
        formData.append('date', selectedDate);
        formData.append('time_period', selectedTime);

        // Add other dynamic data fields based on selected type (brand, category, etc.)
        if (selectedType === 'brand') {
            formData.append('brand_id', selectedBrand);
        } else if (selectedType === 'category') {
            formData.append('category_id', selectedCategory);
        } else if (selectedType === 'subcategory') {
            formData.append('subcategory_id', selectedSubCategory);
        }

        // Add selected products as an array (appending each product_id separately)
        if (selectedType === 'product') {
            selectedProducts.forEach((productId) => {
                formData.append('product_id[]', productId);
            });
        }

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');

            // Make the API call using axios
            const response = await axios.post(
                'https://yrpitsolutions.com/ecom_backend/api/admin/save_HomePageSubSection',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            setLoading(false);
            fetchSectionData();
            setOpenAddModal(false);
            resetFormData();

        } catch (error) {
            setLoading(false);
            console.error('Error:', error);
        }
    };

    const resetFormData = () => {
        setSelectedSession('');
        setSelectedType('');
        setSelectedBrand('');
        setSelectedCategory('');
        setSelectedSubCategory('');
        setSelectedProduct('');
        setButtonName('');
        setButtonUrl('');
        setDesktopImage(null);
        setMobileImage(null);
        setSelectedDate('');
        setSelectedTime('');
    };

    const [selectedProducts, setSelectedProducts] = useState([]);

    // State to control dropdown visibility
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);



    // Function to toggle dropdown visibility
    const toggleDropdown = () => {
        setIsDropdownVisible((prev) => !prev);
    };

    // Function to handle selecting products
    const handleSelectProduct = (productId) => {
        setSelectedProducts((prevSelected) => {
            if (prevSelected.includes(productId)) {
                // If already selected, remove it
                return prevSelected.filter((id) => id !== productId);
            } else {
                // Otherwise, add to the selection
                return [...prevSelected, productId];
            }
        });

        // Close the dropdown after selection
        setIsDropdownVisible(false);
    };

    // Function to handle removing selected product
    const handleRemoveSelectedProduct = (productId) => {
        setSelectedProducts((prevSelected) => prevSelected.filter((id) => id !== productId));
    };


    const [subsectionId, setSubsectionId] = useState('');
    const handleFormUpdate = async () => {
        try {
            setLoading(true);
            setError(null); // Reset error message
    
            // Construct the data payload (make sure you have the correct fields based on your API)
            const formData = new FormData();
            formData.append('_method','PUT');
            formData.append('section_name_id', selectedSession);
            formData.append('type', selectedType);
            formData.append('button_name', buttonName);
            formData.append('button_url', buttonUrl);
            formData.append('desktop_image', desktopImage); // Assuming desktopImage is a file input
            formData.append('mobile_image', mobileImage); // Assuming mobileImage is a file input
            formData.append('date', selectedDate);
            formData.append('time_period', selectedTime);
    
            // Add other dynamic data fields based on selected type (brand, category, etc.)
            if (selectedType === 'brand') {
                formData.append('brand_id', selectedBrand);
            } else if (selectedType === 'category') {
                formData.append('category_id', selectedCategory);
            } else if (selectedType === 'subcategory') {
                formData.append('subcategory_id', selectedSubCategory);
            }
    
            // Add selected products as an array (appending each product_id separately)
            if (selectedType === 'product') {
                selectedProducts.forEach((productId) => {
                    formData.append('product_id[]', productId);
                });
            }
    
            // Prepare the API URL dynamically using the `subsectionId`
            const apiUrl = `https://yrpitsolutions.com/ecom_backend/api/admin/update_HomePageSubSection/${subsectionId}`;
    
            // Use fetch to send the formData
            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData, // Send the formData directly
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Failed to update section");
            }
    
            // Handle success (you might want to show a success message or perform any other action)
            console.log("Form submitted successfully:", data);
    
            // Optionally close the modal or reset the form
            setOpenEditModal(false);
        } catch (error) {
            console.error("Error:", error);
            setError(error.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };
    

    return (
        <div className="min-h-screen pt-6">
            <TokenExpiration />
            <div className="w-full mx-auto">
                <span className="flex mt-4 items-center w-full gap-6">
                    {/* Search bar */}
                    <div className="relative flex  flex-grow items-center justify-around gap-2 rounded-full bg-white px-2 py-3 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
                        <div className="flex h-full w-full items-center rounded-full text-navy-700 dark:bg-navy-900 dark:text-white">
                            <p className="pl-3 pr-2 text-xl">
                                <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
                            </p>
                            <input
                                type="text"
                                placeholder="Search by Section Name..."
                                onChange={(e) => setSearchQuery(e.target.value)} // Directly set the search query
                                value={searchQuery}
                                className="block  w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>


                    <button
                        onClick={handleAddBrand}
                        className="bg-[#4318ff] text-white px-6 py-2  rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Section
                    </button>
                </span>


                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Section</h2>

                            {/* Fields in 2 Columns for Section Name and Select Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Section Name */}
                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Section Name <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                        onChange={(e) => setSelectedSession(e.target.value)}
                                        value={selectedSession}
                                    >
                                        <option value="">Select Session</option>
                                        {sessionNames.length > 0 ? (
                                            sessionNames.map((session, index) => (
                                                <option key={index} value={session.id}>
                                                    {session.section_name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No sessions available</option>
                                        )}
                                    </select>
                                </div>

                                {/* Select Type */}
                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Select Type
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                        onChange={handleSelectChange}
                                        value={selectedType}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="brand">Brand</option>
                                        <option value="category">Category</option>
                                        <option value="subcategory">Sub-category</option>
                                        <option value="product">Product</option>
                                    </select>
                                </div>
                            </div>

                            {/* Conditional Dropdowns for Type */}
                            {selectedType === "brand" && (
                                <div className="mb-4">
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Select Brand
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        value={selectedBrand}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((brand, index) => (
                                            <option key={index} value={brand.id}>
                                                {brand.brand_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedType === "category" && (
                                <div className="mb-4">
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Select Category
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        value={selectedCategory}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category, index) => (
                                            <option key={index} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedType === "subcategory" && (
                                <div className="mb-4">
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Select Sub-category
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                        value={selectedSubCategory}
                                    >
                                        <option value="">Select Sub-category</option>
                                        {subCategories.map((subCategory, index) => (
                                            <option key={index} value={subCategory.id}>
                                                {subCategory.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Conditional Dropdowns for Type */}
                            {selectedType === "product" && (
                                <div className="mb-6 relative">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Select Product<span className="text-red-500">*</span>
                                    </label>

                                    {/* Filter products dynamically */}
                                    <div
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 cursor-pointer"
                                        onClick={toggleDropdown}
                                    >
                                        {selectedProducts.length === 0
                                            ? "Select products"
                                            : `${selectedProducts.length} selected`}
                                    </div>

                                    {isDropdownVisible && (
                                        <div className="absolute z-10 w-full mt-2 border border-gray-300 bg-white rounded-md shadow-lg">
                                            <div className="p-2">
                                                {/* Search bar inside the dropdown */}
                                                <div className="mb-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search products..."
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>

                                                <div className="max-h-40 overflow-y-auto">
                                                    {/* Dynamically filtered products */}
                                                    {products
                                                        .filter((product) => {
                                                            const matchesSearch = product.name
                                                                .toLowerCase()
                                                                .includes(searchQuery.toLowerCase());
                                                            const matchesBrand = !selectedBrand || product.brandId === selectedBrand;
                                                            const matchesCategory =
                                                                !selectedCategory || product.categoryId === selectedCategory;
                                                            const matchesSubCategory =
                                                                !selectedSubCategory ||
                                                                product.subCategoryId === selectedSubCategory;

                                                            return matchesSearch && matchesBrand && matchesCategory && matchesSubCategory;
                                                        })
                                                        .map((product) => (
                                                            <div
                                                                key={product.id}
                                                                className="flex items-center justify-between p-2 cursor-pointer"
                                                                onClick={() => handleSelectProduct(product.id)}
                                                            >
                                                                <span>{product.name}</span>
                                                                {selectedProducts.includes(product.id) && (
                                                                    <span className="text-red-500">×</span> // Cross to remove from selection
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Display selected "marks" (cross marks to remove) */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedProducts.map((productId) => {
                                            const productItem = products.find((item) => item.id === productId);
                                            return (
                                                <div
                                                    key={productId}
                                                    className="bg-[#4318ff] text-white px-3 py-1 rounded-full cursor-pointer flex items-center"
                                                    onClick={() => handleRemoveSelectedProduct(productId)}
                                                >
                                                    {productItem ? productItem.name : ""}
                                                    <span className="ml-1 text-lg">×</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Button Name and URL in 2 Columns */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Button Name */}
                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Button Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Button Name"
                                        onChange={(e) => setButtonName(e.target.value)}
                                        value={buttonName}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                </div>

                                {/* Button URL */}
                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Button URL <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="Enter Button URL"
                                        onChange={(e) => setButtonUrl(e.target.value)}
                                        value={buttonUrl}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Image Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Desktop Image <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleDesktopImageChange}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Mobile Image <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMobileImageChange}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Date Picker and Time Picker */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        value={selectedDate}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        onChange={handleTimeChange}
                                        value={selectedTime}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setOpenAddModal(false)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleFormSubmit}
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
                            className="bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Brand</h2>


                            {/* Section Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="mb-6">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Section Name <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        onChange={(e) => setSelectedSession(e.target.value)}
                                        value={selectedSession}
                                    >
                                        <option value="">Select Session</option>
                                        {sessionNames.length > 0 ? (
                                            sessionNames.map((session, index) => (
                                                <option key={index} value={session.id}>
                                                    {session.section_name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No sessions available</option>
                                        )}
                                    </select>
                                </div>

                                {/* Select Type */}
                                <div className="mb-6">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Select Type</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        onChange={handleSelectChange}
                                        value={selectedType}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="brand">Brand</option>
                                        <option value="category">Category</option>
                                        <option value="subcategory">Sub-category</option>
                                        <option value="product">Product</option>
                                    </select>
                                </div>

                                {/* Conditional Dropdowns for Type */}

                            </div>

                            {selectedType === "brand" && (
                                <div className="mb-6">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Select Brand</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        onChange={(e) => setSelectedBrand(e.target.value)}
                                        value={selectedBrand}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((brand, index) => (
                                            <option key={index} value={brand.id}>
                                                {brand.brand_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {/* Select Category */}
                            {selectedType === "category" && (
                                <div className="mb-6">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Select Category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        value={selectedCategory}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category, index) => (
                                            <option key={index} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Select Sub-category */}
                            {selectedType === "subcategory" && (
                                <div className="mb-6">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Select Sub-category</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                                        value={selectedSubCategory}
                                    >
                                        <option value="">Select Sub-category</option>
                                        {subCategories.map((subCategory, index) => (
                                            <option key={index} value={subCategory.id}>
                                                {subCategory.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Select Product */}
                            {selectedType === "product" && (
                                <div className="mb-6 relative">
                                    <label className="block text-lg text-gray-600 font-medium mb-2">Select Product</label>
                                    <div
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 cursor-pointer"
                                        onClick={toggleDropdown}
                                    >
                                        {selectedProducts.length === 0
                                            ? "Select products"
                                            : `${selectedProducts.length} selected`}
                                    </div>

                                    {isDropdownVisible && (
                                        <div className="absolute z-10 w-full mt-2 border border-gray-300 bg-white rounded-md shadow-lg">
                                            <div className="p-2">
                                                <div className="mb-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search products..."
                                                        className="w-full p-2 border border-gray-300 rounded-md"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>

                                                <div className="max-h-40 overflow-y-auto">
                                                    {products
                                                        .filter((product) => {
                                                            const matchesSearch = product.name
                                                                .toLowerCase()
                                                                .includes(searchQuery.toLowerCase());
                                                            const matchesBrand =
                                                                !selectedBrand || product.brandId === selectedBrand;
                                                            const matchesCategory =
                                                                !selectedCategory || product.categoryId === selectedCategory;
                                                            const matchesSubCategory =
                                                                !selectedSubCategory || product.subCategoryId === selectedSubCategory;

                                                            return matchesSearch && matchesBrand && matchesCategory && matchesSubCategory;
                                                        })
                                                        .map((product) => (
                                                            <div
                                                                key={product.id}
                                                                className="flex items-center justify-between p-2 cursor-pointer"
                                                                onClick={() => handleSelectProduct(product.id)}
                                                            >
                                                                <span>{product.name}</span>
                                                                {selectedProducts.includes(product.id) && (
                                                                    <span className="text-red-500">×</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {selectedProducts.map((productId) => {
                                            const productItem = products.find((item) => item.id === productId);
                                            return (
                                                <div
                                                    key={productId}
                                                    className="bg-[#4318ff] text-white px-3 py-1 rounded-full cursor-pointer flex items-center"
                                                    onClick={() => handleRemoveSelectedProduct(productId)}
                                                >
                                                    {productItem ? productItem.name : ""}
                                                    <span className="ml-1 text-lg">×</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}




                            {/* Image Inputs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Desktop Image <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleDesktopImageChange}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Mobile Image <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMobileImageChange}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Button Name and URL */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Button Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Button Name"
                                        onChange={(e) => setButtonName(e.target.value)}
                                        value={buttonName}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 font-medium mb-2">
                                        Button URL <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="Enter Button URL"
                                        onChange={(e) => setButtonUrl(e.target.value)}
                                        value={buttonUrl}
                                        className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Date Picker and Time Picker */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        value={selectedDate}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-md text-gray-600 font-medium mb-2">
                                        Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        onChange={handleTimeChange}
                                        value={selectedTime}
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-800 focus:outline-none"
                                    />
                                </div>
                            </div>


                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-4 mt-4">
                                <button
                                    onClick={() => setOpenEditModal(false)}
                                    className="bg-gray-300 text-gray-800 px-6 py-3 rounded-md"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleFormUpdate}
                                    disabled={loading}
                                    className="relative bg-[#4318ff] text-white px-6 py-3 rounded-lg flex items-center ml-auto max-w-xs"
                                >
                                    {loading ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        "Save Changes"
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
                                <th className="px-6 py-4 text-left">Section Name</th> {/* Updated */}
                                <th className="px-6 py-4 text-left">Button Name</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Time Period</th>
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
                                getPaginatedData().map((section) => (
                                    <tr key={section.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(section.id)}
                                                onChange={() => handleRowSelection(section.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">{section.section_name.section_name}</td>
                                        <td className="px-6 py-4">{section.button_name}</td>
                                        <td className="px-6 py-4">{section.date}</td>
                                        <td className="px-6 py-4">{section.time_period}</td>
                                        <td className="text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === section.id ? null : section.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {openDropdown === section.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="absolute right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md w-40 z-10"
                                                    >
                                                        <div
                                                            onClick={() => {
                                                                handleEditRow(section);
                                                                setOpenDropdown(null);
                                                            }}
                                                            className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                        >
                                                            <FaEdit className="mr-2 text-black" />
                                                            Edit
                                                        </div>
                                                        <div
                                                            onClick={() => {
                                                                handleDeleteRow(section.id);
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
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No Brand data found
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Section?</h2>
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

export default SectionName;