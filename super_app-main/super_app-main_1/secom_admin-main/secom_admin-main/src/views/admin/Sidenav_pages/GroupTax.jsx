import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller, set } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

function GroupTax() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectGroupTax, setSelectGroupTax] = useState(null);
    console.log(selectGroupTax)
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Yup validation schema
    const validationSchemaAdd = Yup.object({
        name: Yup.string().required('Tax Name is required'),
        taxes: Yup.array()
            .of(Yup.number().required('Each tax must be a valid number'))
            .required('Taxes are required'),


    });

    const validationSchemaEdit = Yup.object({
        name: Yup.string().required('Tax Name is required'),
        taxes: Yup.array().min(1, 'Please select at least one tax').required(),

    });

    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            name: selectGroupTax?.name || '',
            taxes: selectGroupTax?.taxes || '',
        },
    });

    const fetchDroupTaxData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/group-taxes');
            console.log(response.data);
            setTableData(response.data);
            setTotalItems(response.data.length);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const [tax, setTax] = useState([]);
    const fetchTaxData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/admin/taxes');
            console.log(response.data);
            setTax(response.data);
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

    // Handle search input change
    useEffect(() => {
        if (searchQuery) {
            const filtered = tableData.filter((variation) =>
                variation.name?.toLowerCase().includes(searchQuery.toLowerCase()) // Perform case-insensitive search
            );
            setFilteredData(filtered); // Update filtered data based on search
            setSelectedRows((prevSelected) =>
                prevSelected.filter((id) => filtered.some((item) => item.id === id)) // Keep selected rows within filtered data
            );
        } else {
            setFilteredData(tableData); // Reset to original data when search is cleared
            setSelectedRows([]); // Clear selection when search query is cleared
        }
    }, [searchQuery, tableData]); // Effect runs on change of searchQuery or tableData

    useEffect(() => {
        fetchDroupTaxData();
        fetchTaxData();
    }, [itemsPerPage]);

    const { getValues } = useForm();
    const [selectedTaxes, setSelectedTaxes] = useState([]);

    console.log("Selected Taxes:", selectedTaxes);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    // Toggle dropdown visibility

    const toggleDropdown = () => setIsDropdownVisible((prev) => !prev);

    const handleSelectAll = () => {
        if (selectedTaxes.length === tax.length) {
            setSelectedTaxes([]);
        } else {
            setSelectedTaxes(tax.map((taxItem) => taxItem.id));
        }
    };

    const handleFormSubmit = async (data) => {
        const formData = new FormData();
        formData.append('name', data.name);

        selectedTaxes.forEach((tax) => {
            formData.append('taxes[]', tax); // Use the "[]" syntax to indicate an array
        });

        setLoading(true);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = 'https://yrpitsolutions.com/ecom_backend/api/admin/group-taxes';

            setTimeout(async () => {
                try {
                    await axios.post(url, formData, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });

                    // Success toast message
                    toast.success('Group tax added successfully!', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: true,
                    });

                    // Reset form and state
                    reset({
                        name: '',
                        taxes: [],
                    });
                    setSelectedTaxes([]); // Reset the selected taxes state
                    fetchDroupTaxData();
                    setOpenAddModal(false);
                    setSelectGroupTax(null);
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
            }, 2000);
        } catch (error) {
            setLoading(false);
            console.error('Error preparing form data:', error);

            // Error toast message
            toast.error('Something went wrong! Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
        }
    };


    const handleAddBrand = () => {
        setSelectGroupTax(null);
        setSelectedTaxes([]);
        setTotalTax(0);

        setValue('name', '');
        setValue('taxes', []);
        setOpenAddModal(true);
        reset({
            name: '',
            taxes: [],
        });
    };
    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name || selectGroupTax.name);

        // Debugging: Check if selectedTaxes exists in the data object
        console.log('Data for form submission:', data);

        if (Array.isArray(data.taxes) && data.taxes.length > 0) {
            data.taxes.forEach((tax) => {
                formData.append('taxes[]', tax); // This should work correctly if selectedTaxes is an array
            });
        } else {
            console.error('Selected taxes are not in the expected format or are empty');
            toast.error('Selected taxes are not in the expected format or are empty.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
            setLoading(false);
            return;  // Exit the function if the format is wrong
        }

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');
            const url = `https://yrpitsolutions.com/ecom_backend/api/admin/group-taxes/${selectGroupTax?.id}`;

            // Make the API request to update the group tax
            await axios.post(url, formData, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success toast message
            toast.success('Group tax updated successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });

            // Fetch updated data and reset state after successful update
            fetchDroupTaxData();
            setOpenEditModal(false);
            reset();
        } catch (error) {
            console.error('Error updating form:', error);

            // Error toast message
            toast.error('Something went wrong while updating the group tax. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };


    const [taxValueforEdit, setTaxValueforEdit] = useState("");
    const handleEditRow = (groupTax) => {
        setSelectGroupTax(groupTax);
        console.log(groupTax.name);
        // const parsedTaxes = JSON.parse(groupTax.taxes); // ["1", "2"]
        // setSelectedTaxes(parsedTaxes); 
        setValue('name', groupTax.name);
        const parsedTaxes = groupTax.taxes.map(tax => tax.id);
        setValue('taxes', parsedTaxes);
        setSelectedTaxes(parsedTaxes);
        setTaxValueforEdit(groupTax.total_value)
        console.log(parsedTaxes)
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
            await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/group-taxes/${rowIdToDelete}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // Success toast message
            toast.success('Group tax deleted successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });

            // Fetch updated data and close the delete dialog
            fetchDroupTaxData();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting brand:', error);

            // Error toast message
            toast.error('Something went wrong while deleting the group tax. Please try again.', {
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

            // Loop through each selected row and perform the delete operation
            for (let id of selectedRows) {
                await axios.delete(`https://yrpitsolutions.com/ecom_backend/api/admin/group-taxes/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
            }

            // Success toast message
            toast.success('Selected group taxes deleted successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });

            // Refresh the data after successful deletion
            await fetchDroupTaxData();
            setSelectedRows([]); // Clear selection after bulk delete
        } catch (error) {
            console.error('Error deleting selected brands:', error);

            // Error toast message
            toast.error('Something went wrong while deleting the selected group taxes. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: true,
            });
        } finally {
            setLoading(false); // End loading state
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

    const [groupTax, setGroupTax] = useState(null);

    const handleSelectChange = (taxId) => {
        if (!selectedTaxes.includes(taxId)) {
            setSelectedTaxes([...selectedTaxes, taxId]);
        }
        setTotalTax(calculateTotalTax([...selectedTaxes, taxId]));
    };

    const handleRemoveSelectedTax = (taxId) => {
        const newSelectedTaxes = selectedTaxes.filter((id) => id !== taxId);
        setSelectedTaxes(newSelectedTaxes);
        setTotalTax(calculateTotalTax(newSelectedTaxes));
    };

    const [totalTax, setTotalTax] = useState(0);

    const calculateTotalTax = (selectedTaxIds) => {
        let totalTaxValue = 1;
        selectedTaxIds.forEach((taxId) => {
            const taxItem = tax.find((item) => item.id === taxId);
            if (taxItem) {
                totalTaxValue *= (1 + taxItem.value / 100);
            }
        });
        return (totalTaxValue - 1) * 100;
    };


    useEffect(() => {
        if (groupTax) {
            setSelectedTaxes(groupTax.taxes.map(tax => tax.id));
        }
    }, [groupTax]);


    return (
        <div 
          className="min-h-screen pt-6 transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
            <TokenExpiration />
            <ToastContainer />
            <div className="w-full mx-auto">
                <span className="flex mt-4 items-center w-full gap-6">
                    {/* Search bar */}
                    <div 
                      className="relative flex flex-grow items-center justify-around gap-2 rounded-full px-2 py-3 shadow-xl transition-colors duration-300"
                      style={{ 
                        backgroundColor: 'var(--bg-card)',
                        boxShadow: 'var(--shadow-card)'
                      }}
                    >
                        <div 
                          className="flex h-full w-full items-center rounded-full transition-colors duration-300"
                          style={{ 
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-primary)'
                          }}
                        >
                            <p className="pl-3 pr-2 text-xl">
                                <FiSearch 
                                  className="h-4 w-4 transition-colors duration-300"
                                  style={{ color: 'var(--text-muted)' }}
                                />
                            </p>
                            <input
                                type="text"
                                placeholder="Search by Group Tax Name..."
                                onChange={(e) => setSearchQuery(e.target.value)} // Updates the search query
                                value={searchQuery}
                                className="block w-full rounded-full text-base font-medium outline-none transition-colors duration-300"
                                style={{
                                  backgroundColor: 'var(--bg-input)',
                                  color: 'var(--text-primary)'
                                }}
                            />
                        </div>
                    </div>


                    <button
                        onClick={handleAddBrand}
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Group Tax
                    </button>
                </span>

                {/* Add Group Tax Modal */}
                {openAddModal && !openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenAddModal(false)}
                    >
                        <div
                            className="rounded-lg shadow-2xl p-12 w-[600px] h-[480px] transition-colors duration-300"
                            style={{ backgroundColor: 'var(--bg-card)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 
                              className="text-2xl font-semibold mb-6 transition-colors duration-300"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              Add Group Tax
                            </h2>

                            <div className="mb-6">
                                <label 
                                  className="block text-lg font-medium mb-2 transition-colors duration-300"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  Group Tax Name<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="text"
                                            placeholder="Enter GroupTax Name"
                                            className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                                            style={{
                                              backgroundColor: 'var(--bg-input)',
                                              color: 'var(--text-primary)',
                                              borderColor: 'var(--border-color)'
                                            }}
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.name && <p className="text-red-500 dark:text-red-400 text-sm">{errors.name.message}</p>}
                            </div>

                            <div className="mb-6 relative">
                                <label 
                                  className="block text-lg font-medium mb-2 transition-colors duration-300"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  Taxes<span className="text-red-500 ">*</span>
                                </label>

                                {/* Display selected taxes with a cross mark */}
                                <div
                                    className="w-full border rounded-md px-4 py-3 cursor-pointer transition-colors duration-300"
                                    style={{
                                      backgroundColor: 'var(--bg-input)',
                                      color: 'var(--text-primary)',
                                      borderColor: 'var(--border-color)'
                                    }}
                                    onClick={toggleDropdown}
                                >
                                    {selectedTaxes.length === 0 ? 'Select taxes' : `${selectedTaxes.length} selected`}
                                </div>

                                {/* Conditionally render the dropdown */}
                                {isDropdownVisible && (
                                    <div 
                                      className="absolute z-10 w-full mt-2 border rounded-md shadow-lg transition-colors duration-300"
                                      style={{
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)'
                                      }}
                                    >
                                        <div className="p-2">
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    placeholder="Search taxes..."
                                                    className="w-full p-2 border rounded-md transition-colors duration-300"
                                                    style={{
                                                      backgroundColor: 'var(--bg-input)',
                                                      color: 'var(--text-primary)',
                                                      borderColor: 'var(--border-color)'
                                                    }}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <div className="max-h-40 overflow-y-auto">
                                                {tax
                                                    .filter((taxItem) => taxItem.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                    .map((taxItem) => (
                                                        <div
                                                            key={taxItem.id}
                                                            className="flex items-center justify-between p-2 cursor-pointer transition-colors duration-300 hover:opacity-80"
                                                            style={{
                                                              backgroundColor: 'var(--bg-card)',
                                                              color: 'var(--text-primary)'
                                                            }}
                                                            onClick={() => {
                                                                handleSelectChange(taxItem.id);
                                                                setIsDropdownVisible(false); // Close the dropdown after selecting
                                                            }}
                                                        >
                                                            <span>{taxItem.name} - {taxItem.value}%</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Display selected "marks" */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedTaxes.map((taxId) => {
                                        const taxItem = tax.find((item) => item.id === taxId);
                                        return (
                                            <div
                                                key={taxId}
                                                className="bg-[#4318ff] text-white px-3 py-1 rounded-full cursor-pointer flex items-center"
                                                onClick={() => handleRemoveSelectedTax(taxId)}
                                            >
                                                {taxItem ? taxItem.name : ''}
                                                <span className="ml-1 text-lg">×</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Error message */}
                                {errors.taxes && (
                                    <p className="text-red-500 text-sm">{errors.taxes.message}</p>
                                )}
                            </div>

                            {/* Total Tax Display */}
                            <div className="mt-4">
                                <span 
                                  className="font-semibold text-lg transition-colors duration-300"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  Total Tax Value: 
                                </span>
                                <span 
                                  className="transition-colors duration-300"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  {totalTax.toFixed(2)}%
                                </span>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 mt-4">
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
                                        'Create Group Tax'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {/* Edit Group Tax Modal */}
                {openEditModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50"
                        onClick={() => setOpenEditModal(false)}  // Close on outside click
                    >
                        <div
                            className="rounded-lg shadow-2xl p-12 w-[600px] h-[480px] transition-colors duration-300"
                            style={{ backgroundColor: 'var(--bg-card)' }}
                            onClick={(e) => e.stopPropagation()}  // Prevent close when clicking inside
                        >
                            <h2 
                              className="text-2xl font-semibold mb-6 transition-colors duration-300"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              Edit Group Tax
                            </h2>

                            <form onSubmit={handleSubmit(handleFormUpdate)}>
                                {/* Group Tax Name */}
                                <div className="mb-6">
                                    <label 
                                      className="block text-lg font-medium mb-2 transition-colors duration-300"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                        Group Tax Name<span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        defaultValue={groupTax?.name || ''} // Prefill with current groupTax name
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter GroupTax Name"
                                                className="w-full border rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                                                style={{
                                                  backgroundColor: 'var(--bg-input)',
                                                  color: 'var(--text-primary)',
                                                  borderColor: 'var(--border-color)'
                                                }}
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.name && <p className="text-red-500 dark:text-red-400 text-sm">{errors.name.message}</p>}
                                </div>

                                {/* Taxes */}
                                <div className="mb-6 relative">
                                    <label 
                                      className="block text-lg font-medium mb-2 transition-colors duration-300"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                        Taxes<span className="text-red-500">*</span>
                                    </label>
                                    <div
                                        className="w-full border rounded-md px-4 py-3 cursor-pointer transition-colors duration-300"
                                        style={{
                                          backgroundColor: 'var(--bg-input)',
                                          color: 'var(--text-primary)',
                                          borderColor: 'var(--border-color)'
                                        }}
                                        onClick={toggleDropdown}
                                    >
                                        {selectedTaxes.length === 0 ? 'Select taxes' : `${selectedTaxes.length} selected`}
                                    </div>

                                    {isDropdownVisible && (
                                        <div 
                                          className="absolute z-10 w-full mt-2 border rounded-md shadow-lg transition-colors duration-300"
                                          style={{
                                            backgroundColor: 'var(--bg-card)',
                                            borderColor: 'var(--border-color)'
                                          }}
                                        >
                                            <div className="p-2">
                                                <input
                                                    type="text"
                                                    placeholder="Search taxes..."
                                                    className="w-full p-2 border rounded-md transition-colors duration-300"
                                                    style={{
                                                      backgroundColor: 'var(--bg-input)',
                                                      color: 'var(--text-primary)',
                                                      borderColor: 'var(--border-color)'
                                                    }}
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                                <div className="max-h-40 overflow-y-auto">
                                                    {tax
                                                        .filter((taxItem) => taxItem.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                        .map((taxItem) => (
                                                            <div
                                                                key={taxItem.id}
                                                                className={`flex items-center justify-between p-2 cursor-pointer transition-colors duration-300 hover:opacity-80 ${
                                                                    selectedTaxes.includes(taxItem.id) 
                                                                      ? 'opacity-80' 
                                                                      : ''
                                                                }`}
                                                                style={{
                                                                  backgroundColor: selectedTaxes.includes(taxItem.id)
                                                                    ? 'var(--bg-secondary)'
                                                                    : 'var(--bg-card)',
                                                                  color: 'var(--text-primary)'
                                                                }}
                                                                onClick={() => handleSelectChange(taxItem.id)}
                                                            >
                                                                <span>{taxItem.name} - {taxItem.value}%</span>
                                                                {selectedTaxes.includes(taxItem.id) && (
                                                                    <span className="text-green-500 dark:text-green-400">✔</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {selectedTaxes.map((taxId) => {
                                            const taxItem = tax.find((item) => item.id === taxId);
                                            return (
                                                <div
                                                    key={taxId}
                                                    className="bg-[#4318ff] text-white px-4 py-2 rounded-full cursor-pointer flex items-center text-lg"
                                                    onClick={() => handleRemoveSelectedTax(taxId)}
                                                >
                                                    {taxItem ? taxItem.name : ''}
                                                    <span className="ml-2 text-xl">×</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {errors.taxes && <p className="text-red-500 text-sm">{errors.taxes.message}</p>}
                                </div>


                                {/* Total Tax Display */}
                                <div className="mt-4">
                                    <span 
                                      className="font-semibold text-lg transition-colors duration-300"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                      Total Tax Value: 
                                    </span>
                                    <span 
                                      className="transition-colors duration-300"
                                      style={{ color: 'var(--text-primary)' }}
                                    >
                                      {taxValueforEdit}%
                                    </span>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end space-x-4 mt-4">
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
                            </form>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div 
                  className="mt-8 shadow-lg rounded-lg p-6 transition-colors duration-300"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                    <table className="w-full table-auto mt-6">
                        <thead>
                            <tr 
                              className="transition-colors duration-300"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                                <th className="px-6 py-4 text-left">
                                    <div className="flex justify-between items-center">
                                        <input
                                            type="checkbox"
                                            checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                                            onChange={() => {
                                                if (selectedRows.length === filteredData.length) {
                                                    setSelectedRows([]); // Deselect all rows
                                                } else {
                                                    setSelectedRows(filteredData.map((row) => row.id)); // Select all rows
                                                }
                                            }}
                                            disabled={filteredData.length === 0} // Disable checkbox if no data
                                            className="dark:bg-navy-700 dark:border-navy-500"
                                        />
                                    </div>
                                </th>
                                <th 
                                  className="px-6 py-4 text-left transition-colors duration-300"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  Tax Name
                                </th>
                                <th 
                                  className="px-6 py-4 text-left transition-colors duration-300"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  Total Value
                                </th>
                                <th>
                                    {selectedRows.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            className={`text-xl flex items-center transition-colors duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            style={{ color: 'var(--text-secondary)' }}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="relative">
                                                    <div className="w-6 h-6 border-4 border-t-transparent border-red-600 dark:border-red-400 rounded-full animate-spin"></div>
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
                            {filteredData.length > 0 ? (
                                filteredData.map((groupTax) => (
                                    <tr 
                                      key={groupTax.id} 
                                      className="border-t group transition-colors duration-300 hover:opacity-80"
                                      style={{ 
                                        backgroundColor: 'var(--bg-card)',
                                        borderColor: 'var(--border-color)'
                                      }}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(groupTax.id)}
                                                onChange={() => handleRowSelection(groupTax.id)}
                                                className="dark:bg-navy-700 dark:border-navy-500"
                                            />
                                        </td>
                                        <td 
                                          className="px-6 py-4 transition-colors duration-300"
                                          style={{ color: 'var(--text-primary)' }}
                                        >
                                          {groupTax.name}
                                        </td>
                                        <td 
                                          className="px-6 py-4 transition-colors duration-300"
                                          style={{ color: 'var(--text-primary)' }}
                                        >
                                          {groupTax.total_value}
                                        </td>

                                        <td className="text-right relative">
                                            <div className="flex items-center space-x-2">
                                                {/* Ellipsis icon */}
                                                <button
                                                    onMouseEnter={() => setOpenDropdown(groupTax.id)}
                                                    onMouseLeave={() => setOpenDropdown(null)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                {/* Edit and Delete icons visible on hover */}
                                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200">
                                                    <button
                                                        onClick={() => handleEditRow(groupTax)}
                                                        className="text-navy-700 hover:bg-gray-200 p-2 rounded"
                                                    >
                                                        <FaEdit className="text-black" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRow(groupTax.id)}
                                                        className="text-red-600 hover:bg-gray-200 p-2 rounded"
                                                    >
                                                        <FaTrashAlt className="text-black" style={{ marginRight: '70px' }} />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td 
                                      colSpan="4" 
                                      className="px-6 py-4 text-center transition-colors duration-300"
                                      style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <hr 
                                          className="mb-4 transition-colors duration-300"
                                          style={{ borderColor: 'var(--border-color)' }}
                                        />
                                        No Group Tax data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>



            </div>

            {/* Pagination */}
            <div 
              className="flex justify-between items-center mt-4 transition-colors duration-300"
              style={{ color: 'var(--text-secondary)' }}
            >
                <div className="flex items-center">
                    <span className="mr-2">Show</span>
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
                    <span className="ml-2">entries</span>
                </div>

                <div className="flex space-x-4">
                    {/* Showing Item Range */}

                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`${currentPage === 1
                            ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
                            : 'bg-[#4318ff] dark:bg-blue-500 text-white hover:bg-[#3700b3] dark:hover:bg-blue-600'
                            } px-6 py-2 rounded-[20px] transition-colors duration-300`}
                    >
                        Back
                    </button>
                    <span 
                      className="mt-2 transition-colors duration-300"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                        {` ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} items`}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`${currentPage === totalPages || totalItems === 0
                            ? 'bg-[#4318ff] text-white opacity-50 cursor-not-allowed'
                            : 'bg-[#4318ff] dark:bg-blue-500 text-white hover:bg-[#3700b3] dark:hover:bg-blue-600'
                            } px-6 py-2 rounded-[20px] transition-colors duration-300`}
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
                          Are you sure you want to delete this Group Tax
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
                                className="px-4 py-2 text-white bg-red-600 dark:bg-red-500 rounded-md hover:bg-red-700 dark:hover:bg-red-600 flex items-center justify-center transition-colors duration-300"
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

export default GroupTax;
