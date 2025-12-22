import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { TokenExpiration } from 'views/auth/TokenExpiration ';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

function RolePermission() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [brands, setBrands] = useState([]);
    const [mainModelData, setMainModelData] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [modelPermissionData, setModelPermissionData] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    const [selectedMainModelId, setSelectedMainModelId] = useState(null);
    const [permissionsFetched, setPermissionsFetched] = useState(false);

    // Yup validation schema
    const validationSchemaAdd = Yup.object({
        permission_ids: Yup.array().min(1, 'At least one permission must be selected').required('Permissions are required'),

    });

    const validationSchemaEdit = Yup.object({
        // size_name: Yup.string().required('Size Name is required'),
    });

    const { reset, control, handleSubmit, setValue, trigger, formState: { errors } } = useForm({
        resolver: yupResolver(openAddModal ? validationSchemaAdd : validationSchemaEdit),
        defaultValues: {
            role_id: selectedRoleId || '',
            main_model_id: selectedMainModelId || '',
            permission_id: selectedPermissionIds || []
        },
    });


    const fetchBrandData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/get_role');
            setBrands(response.data);
        } catch (error) {
            console.error('Error fetching Role data:', error);
        }
    };


    // Function to fetch permissions based on the model ID
    const fetchPermissionsForTab = async (role) => {
        try {
            const selectedModelId = role.main_model_id;
            if (selectedModelId) {
                const response = await axios.get(`https://yrpitsolutions.com/ecom_backend/api/get_permissions_by_main_model_id/${selectedModelId}`);
                setPermissions(response.data);
                const selectedPermissions = role.permissions.map(p => p.permission_id);
                setSelectedPermissionIds(selectedPermissions);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Effect to prefill selected permissions when the modal opens
    useEffect(() => {
        if (permissions.length > 0 && selectedPermissionIds.length > 0 && !permissionsFetched) {
            const initialSelectedPermissions = permissions
                .filter(permission => selectedPermissionIds.includes(permission.id))
                .map(permission => permission.id);

            setSelectedPermissionIds(initialSelectedPermissions); // Only set if it's not already set
            setPermissionsFetched(true); // Ensure we don't overwrite it
        }
    }, [permissions, selectedPermissionIds, permissionsFetched]);

    // Effect to handle when role is selected for editing
    const handleEditRow = (unit) => {
        setSelectedRoleId(unit.role_id);
        setSelectedMainModelId(unit.main_model_id);

        const selectedPermissions = unit.permissions.map(permission => permission.permission_id);

        setSelectedPermissionIds(selectedPermissions); // Prefill selected permissions
        setOpenEditModal(true); // Open the modal
        fetchPermissionsForTab(unit); // Fetch permissions only if necessary
    };

    const handlePermissionChange = (permissionId) => {
        setSelectedPermissionIds((prev) => {
            if (prev.includes(permissionId)) {
                return prev.filter((id) => id !== permissionId); // Remove if already selected
            } else {
                return [...prev, permissionId]; // Add if not selected
            }
        });

        setValue('permission_id', selectedPermissionIds); // Update form value
    };


    // UseEffect to fetch permissions whenever the index changes
    useEffect(() => {
        fetchPermissionsForTab();
    }, []);


    useEffect(() => {
        const fetchMainModelData = async () => {
            try {
                const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/get_all_main_model');
                setMainModelData(response.data);
                setLoading(false);
                if (response.data.length > 0) {
                    fetchPermissionsForTab();
                }
            } catch (error) {
                console.error('Error fetching main model data:', error);
            }
        };

        fetchMainModelData(); // Initial fetch on page load
    }, []);


    const fetchSizeData = async () => {
        try {
            const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/get_all_role_have_permission');
            let data = response.data;

            // Group by role_id and main_model_id
            const groupedData = data.reduce((acc, item) => {
                const key = `${item.role_id}-${item.main_model_id}`;
                if (!acc[key]) {
                    acc[key] = {
                        role_id: item.role_id,
                        role_name: item.role_name,
                        main_model_id: item.main_model_id,
                        main_model_name: item.main_model_name,
                        permissions: [],
                    };
                }
                acc[key].permissions.push(...item.permissions);
                return acc;
            }, {});

            // Convert object back to an array
            let formattedData = Object.values(groupedData);

            // Apply search filter
            if (searchQuery.trim() !== '') {
                formattedData = formattedData.filter((role) =>
                    role.role_name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            setFilteredData(formattedData);
            setTotalItems(formattedData.length);  // Update total items for pagination
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };



    useEffect(() => {
        fetchBrandData();
        fetchSizeData();
    }, [itemsPerPage, currentPage, searchQuery]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = tableData.filter((role) =>
                role.role_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredData(filtered);
            setTotalItems(filtered.length);
            setCurrentPage(1); 
        } else {
            setFilteredData(tableData); 
            setTotalItems(tableData.length);
        }
    }, [searchQuery, tableData]);

    const getPaginatedData = () => {
        if (!Array.isArray(filteredData)) {
            console.error("filteredData is not an array", filteredData);
            return []; 
        }
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredData.slice(start, end);
    };

    // Handle Page Change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    useEffect(() => {
        fetchSizeData();
    }, [itemsPerPage]);

    useEffect(() => {
        if (permissions.length > 0 && selectedPermissionIds.length === 0) {
            const initialSelectedPermissions = permissions
                .filter(permission => permission.selected)
                .map(permission => permission.id);

            setSelectedPermissionIds(initialSelectedPermissions);
        }
    }, [permissions]);

    const handleFormUpdate = async (data) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');  // Tell the API that it's an update operation
        formData.append('role_id', data.role_id || selectedRoleId);  // Get the role_id from form data or state
        formData.append('main_model_id', data.main_model_id || selectedMainModelId);  // Get the main_model_id
        selectedPermissionIds.forEach(permissionId => {
            formData.append('permission_ids[]', permissionId); // Send each permission_id individually
        });

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');

            // Updated URL with role_id and main_model_id as path parameters
            const url = `https://yrpitsolutions.com/ecom_backend/api/update_role_have_permission_by_id/${selectedRoleId}/${selectedMainModelId}`;

            const response = await axios.post(url, formData, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.status === 200) {
                fetchSizeData();  // Refresh the data after the update
                setOpenEditModal(false);  // Close the edit modal
                reset();  // Reset the form values

                toast.success('Role and permissions updated successfully!');
            }
        } catch (error) {
            console.error('Error updating role and permissions:', error);
            toast.error('Error updating role and permissions!');
        } finally {
            setLoading(false);
        }
    };

    const [rowIdToDelete, setRowIdToDelete] = useState(null);
    const [ModelIdToDelete, setModelIdToDelete] = useState(null);
    const handleDeleteRow = (roleId, modelId) => {
        console.log("Selected roleId to delete:", roleId);
        console.log("Selected modelId to delete:", modelId);
        setRowIdToDelete(roleId);
        setModelIdToDelete(modelId);
        setOpenDeleteDialog(true);
    };

    const handleDeleteConfirmation = async () => {
        setIsDeleting(true);

        try {
            // Log the necessary values for debugging
            const accessToken = localStorage.getItem('OnlineShop-accessToken');


            // Check if either roleId or mainModelId is missing
            if (!ModelIdToDelete || !rowIdToDelete) {
                console.error("Error: Invalid role_id or main_model_id", { rowIdToDelete, ModelIdToDelete });
                toast.error('Invalid role_id or main_model_id!', { progress: undefined, hideProgressBar: true });
                return; // Exit early if IDs are invalid
            }

            // Log the URL being sent to the server
            const url = `https://yrpitsolutions.com/ecom_backend/api/delete/roles/${rowIdToDelete}/permissions/${ModelIdToDelete}`;
            console.log("Request URL:", url);  // Debugging: Check the URL

            // Make the delete request
            const response = await axios.delete(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            console.log("API response:", response);  // Log the API response if successful

            // Update UI if the request was successful
            fetchBrandData();
            window.location.reload(); // Optionally refresh the page
            setOpenDeleteDialog(false);

            // Show success toast
            toast.success('Role permission deleted successfully!', {
                progress: undefined,  // Hide progress bar
                hideProgressBar: true,
            });

        } catch (error) {
            console.error('Error deleting role permission:', error);

            // Show error toast if something goes wrong
            toast.error('Error deleting role permission!', {
                progress: undefined,  // Hide progress bar
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
        if (selectedRows.length === 0) {
            // If no rows are selected, show a warning toast
            toast.warning('Please select at least one role to delete!', { progress: undefined });
            return;
        }

        // Show loading state
        setIsDeleting(true);

        try {
            const accessToken = localStorage.getItem('OnlineShop-accessToken');

            // Loop through the selected rows and make an API request for each
            for (const rowId of selectedRows) {
                // Find the corresponding role data using the rowId
                const role = getPaginatedData().find((r) => r.id === rowId);
                if (!role) {
                    console.error('Role not found for selected rowId:', rowId);
                    continue;
                }

                // Get the necessary IDs for the delete request
                const roleId = role.role_id;
                const modelId = role.main_model_id;

                // Ensure we have valid IDs
                if (!roleId || !modelId) {
                    console.error("Invalid role_id or main_model_id", { roleId, modelId });
                    continue; // Skip this role if IDs are invalid
                }

                // Construct the URL for the DELETE request
                const url = `https://yrpitsolutions.com/ecom_backend/api/delete/roles/${roleId}/permissions/${modelId}`;
                console.log("Request URL for deletion:", url);

                // Send the DELETE request
                await axios.delete(url, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                console.log(`Successfully deleted role permission for roleId: ${roleId}, modelId: ${modelId}`);
            }

            // Once all deletions are done, fetch updated data and close any dialogs
            fetchBrandData();  // Fetch updated data (make sure this function works as expected)
            window.location.reload(); // Optionally refresh the page
            toast.success('Selected roles deleted successfully!', { progress: undefined });

        } catch (error) {
            console.error('Error deleting selected roles:', error);
            toast.error('Error deleting selected roles!', { progress: undefined });
        } finally {
            setIsDeleting(false); // Reset loading state
            setSelectedRows([]);  // Clear selected rows after the bulk delete operation
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

    console.log("Selected Permission IDs:", selectedPermissionIds);

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
                                placeholder="Search by Role Name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on change
                                className="block w-full rounded-full text-base font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
                            />
                        </div>
                    </div>

                    {/* <button
                        className="bg-[#4318ff] text-white px-6 py-2 rounded-full text-lg font-medium flex items-center ml-auto"
                    >
                        <FaPlus className="mr-2" /> Add Roles with Permission
                    </button> */}
                    
                </span>

                {openEditModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50" onClick={() => setOpenEditModal(false)}>
                        <div className="bg-white rounded-lg shadow-2xl p-12 w-[50%] max-h-[85%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Edit Role with Permission</h2>

                            <div className="mb-2">
                                <label className="block text-lg text-gray-600 font-medium mb-2">
                                    Role Name<span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="role_id"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            value={selectedRoleId || ''} // Prefill with selectedRoleId
                                            onChange={(e) => {
                                                setSelectedRoleId(e.target.value);
                                                setValue('role_id', e.target.value); // Set the value for the form
                                            }}
                                            className="w-full border border-gray-300 rounded-md px-4 py-3 text-gray-800 focus:outline-none"
                                        >
                                            <option value="">Select a Role</option>
                                            {brands.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                                {errors.role_id && <p className="text-red-500 text-sm">{errors.role_id.message}</p>}
                            </div>

                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="block font-semibold text-lg text-black font-medium">
                                        Assign Permission to Roles
                                    </label>
                                </div>

                                <div className="mb-6">
                                    <div className="flex flex-wrap">
                                        {loading ? (
                                            <div>Loading permissions...</div>
                                        ) : permissions.length > 0 ? (
                                            permissions.map((permission) => (
                                                <div key={permission.id} className="w-1/3 mb-4">
                                                    <div className="space-y-2">
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                className="text-indigo-500"
                                                                checked={selectedPermissionIds.includes(permission.id)} // Ensure checked state
                                                                onChange={() => {
                                                                    setSelectedPermissionIds((prev) =>
                                                                        prev.includes(permission.id)
                                                                            ? prev.filter((id) => id !== permission.id) // Remove if selected
                                                                            : [...prev, permission.id] // Add if not selected
                                                                    );
                                                                }}
                                                            />
                                                            <span>{permission.name}</span> {/* Display permission name */}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div>No permissions available for this role.</div>
                                        )}
                                    </div>
                                </div>


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
                                            checked={false} // Adjust logic if needed
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
                                <th className="px-6 py-4 text-left">Role Name</th>
                                <th className="px-6 py-4 text-left">Model Name</th>
                                <th className="px-6 py-4">Permissions</th> {/* Permissions column */}
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
                                getPaginatedData().map((unit) => (
                                    <tr key={unit.id} className="border-t">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(unit.id)}
                                                onChange={() => handleRowSelection(unit.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">{unit.role_name}</td>
                                        <td className="px-6 py-4">{unit.main_model_name}</td>
                                        <td className="px-6 py-4">
                                            {/* Check if permission_name is available */}
                                            {unit.permissions && unit.permissions.length > 0 ? (
                                                unit.permissions.map((permission, index) => (
                                                    <span key={index} className="inline-block m-1 px-3 py-1 text-white text-sm font-medium bg-[#4318ff] rounded-md">
                                                        {permission.permission_name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span>No permissions available</span> // Handle cases where there are no permissions
                                            )}
                                        </td>
                                        <td className="text-right">
                                            <div className="relative inline-block group">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === unit.role_id ? null : unit.role_id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    <FaEllipsisV />
                                                </button>
                                                <div
                                                    className="absolute right-10 flex space-x-2 opacity-0 group-hover:opacity-100 group-hover:flex transition-all duration-200"
                                                    style={{ marginTop: "-30px" }}
                                                >
                                                    <div
                                                        onClick={() => {
                                                            handleEditRow(unit);
                                                            setOpenDropdown(null);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-navy-700 hover:bg-gray-200 cursor-pointer"
                                                    >
                                                        <FaEdit className="mr-2 text-black" />
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            handleDeleteRow(unit?.role_id, unit?.main_model_id);
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
                                        No data found
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
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this Role have Permission?</h2>
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

export default RolePermission;