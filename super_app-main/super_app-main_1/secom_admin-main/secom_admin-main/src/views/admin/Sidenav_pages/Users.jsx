import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrashAlt, FaPlus, FaEllipsisV, FaEye, FaKey } from 'react-icons/fa';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaSpinner } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserModuleHeader from 'components/common/UserModuleHeader';
import UserProfileModal from 'components/common/UserProfileModal';
import UserManagementInfo from 'components/common/UserManagementInfo';
import { userService } from 'services/userService';
import { roleService } from 'services/roleService';

// Password Change Form Component
const PasswordChangeForm = ({ user, onSave, onCancel, loading }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const validationSchema = Yup.object({
        new_password: Yup.string()
            .required('New password is required')
            .min(6, 'Password must be at least 6 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        confirm_password: Yup.string()
            .required('Please confirm your password')
            .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
    });

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            new_password: '',
            confirm_password: ''
        }
    });

    const onSubmit = (data) => {
        onSave({ newPassword: data.new_password });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-lg text-gray-600 font-medium mb-2">
                    New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Controller
                        name="new_password"
                        control={control}
                        render={({ field }) => (
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter new password"
                                {...field}
                            />
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>
                {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>}
            </div>

            <div>
                <label className="block text-lg text-gray-600 font-medium mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <Controller
                        name="confirm_password"
                        control={control}
                        render={({ field }) => (
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Confirm new password"
                                {...field}
                            />
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                        {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                </div>
                {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Updating...
                        </div>
                    ) : (
                        'Update Password'
                    )}
                </button>
            </div>
        </form>
    );
};

function Users() {
    const [tableData, setTableData] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [roles, setRoles] = useState([]);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [profileEditMode, setProfileEditMode] = useState(false);
    const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);

    // Yup validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Name is required')
            .matches(/^[A-Za-z\s]+$/, 'Name should contain only alphabets and spaces'),
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string().when('$isEdit', {
            is: false,
            then: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
            otherwise: (schema) => schema.optional(),
        }),
        phone: Yup.string()
            .matches(/^[0-9]+$/, 'Phone number should contain only numbers')
            .optional(),
        role: Yup.string()
            .required('Role is required')
            .notOneOf([''], 'Please select a role'),
        status: Yup.string()
            .required('Status is required')
            .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    });

    const { reset, control, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        context: { isEdit: openEditModal },
        defaultValues: {
            name: '',
            email: '',
            password: '',
            phone: '',
            role: '',
            status: 'active'
        }
    });

    // Fetch data functions
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers({
                page: currentPage,
                limit: itemsPerPage
            });
            
            if (response.success) {
                setTableData(response.data.users || response.data);
                setFilteredData(response.data.users || response.data);
                setTotalItems(response.data.pagination?.total || response.data.length);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(error.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await roleService.getAllRoles();
            if (response.success) {
                setRoles(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            // Don't show error toast for roles as it's not critical
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Handle search and status filtering
    useEffect(() => {
        let filtered = tableData;

        // Apply search filter
        if (searchQuery) {
            const lowercasedSearchQuery = searchQuery.toLowerCase();
            filtered = filtered.filter((user) => {
                return (
                    user.name?.toLowerCase().includes(lowercasedSearchQuery) ||
                    user.email?.toLowerCase().includes(lowercasedSearchQuery) ||
                    user.phone?.toLowerCase().includes(lowercasedSearchQuery) ||
                    user.role?.toLowerCase().includes(lowercasedSearchQuery)
                );
            });
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            filtered = filtered.filter(user => {
                // Handle both boolean (legacy) and string (new) status values
                if (typeof user.status === 'boolean') {
                    return user.status === isActive;
                } else {
                    return isActive ? user.status === 'active' : user.status === 'inactive';
                }
            });
        }

        setFilteredData(filtered);
        setTotalItems(filtered.length);
        setCurrentPage(1);
    }, [searchQuery, statusFilter, tableData]);

    useEffect(() => {
        fetchUserData();
        fetchRoles();
    }, [currentPage, itemsPerPage]);

    // Handle row selection
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

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // No state to reset since dropdown is hover-based
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function formatDateWithOrdinal(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        
        const ordinal = (n) => {
            if (n > 3 && n < 21) return 'th';
            switch (n % 10) {
                case 1: return 'st';
                case 2: return 'nd';
                case 3: return 'rd';
                default: return 'th';
            }
        };
    
        return `${day}${ordinal(day)} ${month} ${year}`;
    }

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Handle form submission
    const handleFormSubmit = async (data) => {
        try {
            setLoading(true);
            
            if (openEditModal && selectedUser) {
                // Update user
                const updateData = { ...data };
                if (!updateData.password) {
                    delete updateData.password;
                }
                
                await userService.updateUser(selectedUser.id, updateData);
                toast.success('User updated successfully!');
            } else {
                // Create user
                await userService.createUser(data);
                toast.success('User created successfully!');
            }
            
            setOpenAddModal(false);
            setOpenEditModal(false);
            setSelectedUser(null);
            reset();
            fetchUserData();
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error(error.message || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit user
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setValue('name', user.name);
        setValue('email', user.email);
        setValue('phone', user.phone || '');
        setValue('role', user.role || '');
        // Convert boolean status to string
        setValue('status', user.status === true || user.status === 'active' ? 'active' : 'inactive');
        // Don't set password field in edit mode
        setValue('password', '');
        setOpenEditModal(true);
    };

    // Handle delete user
    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setOpenDeleteDialog(true);
    };

    // Handle delete confirmation
    const handleDeleteConfirmation = async () => {
        if (!selectedUser) return;
        
        try {
            setIsDeleting(true);
            await userService.deleteUser(selectedUser.id);
            toast.success('User deleted successfully!');
            setOpenDeleteDialog(false);
            setSelectedUser(null);
            fetchUserData();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.message || 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle profile view/edit
    const handleProfileView = (user) => {
        setSelectedUserForProfile(user);
        setProfileEditMode(false);
        setProfileModalOpen(true);
    };

    const handleProfileEdit = (user) => {
        setSelectedUserForProfile(user);
        setProfileEditMode(true);
        setProfileModalOpen(true);
    };

    const handleProfileSave = async (formData) => {
        try {
            setLoading(true);
            await userService.updateUserProfile(selectedUserForProfile.id, formData);
            toast.success('User profile updated successfully!');
            setProfileModalOpen(false);
            setSelectedUserForProfile(null);
            fetchUserData();
        } catch (error) {
            console.error('Error updating user profile:', error);
            toast.error(error.message || 'Failed to update user profile');
        } finally {
            setLoading(false);
        }
    };

    // Handle password change
    const handlePasswordChange = (user) => {
        setSelectedUserForPassword(user);
        setPasswordModalOpen(true);
    };

    const handlePasswordSave = async (passwordData) => {
        try {
            setLoading(true);
            await userService.updatePassword(selectedUserForPassword.id, passwordData);
            toast.success('Password updated successfully!');
            setPasswordModalOpen(false);
            setSelectedUserForPassword(null);
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedRows.length === 0) {
            toast.warning('Please select at least one user to delete!');
            return;
        }

        try {
            setIsDeleting(true);
            
            for (const userId of selectedRows) {
                await userService.deleteUser(userId);
            }
            
            toast.success('Selected users deleted successfully!');
            setSelectedRows([]);
            fetchUserData();
        } catch (error) {
            console.error('Error deleting users:', error);
            toast.error(error.message || 'Failed to delete users');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <ToastContainer />
            
            {/* <UserManagementInfo currentModule="users" /> */}
            
            {/* Standardized Header */}
            <div className="pt-6">
                <UserModuleHeader
                title="User Management"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search by Name, Email, Phone, Role..."
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onAddClick={() => {
                    reset();
                    setOpenAddModal(true);
                }}
                addButtonText="Add User"
                loading={loading}
            />
            </div>

            {/* Add/Edit Modal */}
            {(openAddModal || openEditModal) && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50" onClick={() => {
                    setOpenAddModal(false);
                    setOpenEditModal(false);
                    setSelectedUser(null);
                    reset();
                }}>
                    <div 
                      className="rounded-lg shadow-2xl p-12 w-[50%] max-h-[85%] overflow-y-auto transition-colors duration-300"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                            {openEditModal ? 'Edit User' : 'Add New User'}
                        </h2>
                        
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-lg text-gray-600 dark:text-gray-300 font-medium mb-2">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Name"
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-800 dark:text-white bg-white dark:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                {...field}
                                                onKeyPress={(e) => {
                                                    // Only allow alphabets and spaces
                                                    if (!/[A-Za-z\s]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 dark:text-gray-300 font-medium mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="email"
                                                placeholder="Enter Email"
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-800 dark:text-white bg-white dark:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 dark:text-gray-300 font-medium mb-2">
                                        {openEditModal ? 'New Password (optional)' : 'Password'} <span className="text-red-500">{!openEditModal && '*'}</span>
                                    </label>
                                    <Controller
                                        name="password"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="password"
                                                placeholder={openEditModal ? "Leave blank to keep current password" : "Enter Password"}
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-800 dark:text-white bg-white dark:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                {...field}
                                            />
                                        )}
                                    />
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 dark:text-gray-300 font-medium mb-2">Phone</label>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="text"
                                                placeholder="Enter Phone"
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-800 dark:text-white bg-white dark:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                {...field}
                                                onKeyPress={(e) => {
                                                    // Only allow numbers
                                                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 dark:text-gray-300 font-medium mb-2">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="role"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-800 dark:text-white bg-white dark:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                {...field}
                                            >
                                                <option value="">Select Role</option>
                                                {roles.length > 0 ? (
                                                    roles.map((role) => (
                                                        <option key={role._id || role.id} value={role.name}>
                                                            {role.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    // Fallback to hardcoded roles if API fails
                                                    <>
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="ecommerce_admin">Ecommerce Admin</option>
                                                        <option value="grocery_admin">Grocery Admin</option>
                                                        <option value="taxi_admin">Taxi Admin</option>
                                                        <option value="hotel_admin">Hotel Admin</option>
                                                        <option value="restaurant_admin">Restaurant Admin</option>
                                                        <option value="porter_admin">Porter Admin</option>
                                                    </>
                                                )}
                                            </select>
                                        )}
                                    />
                                    {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-lg text-gray-600 dark:text-gray-300 font-medium mb-2">
                                        Status <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <select
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-800 dark:text-white bg-white dark:bg-navy-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                                {...field}
                                            >
                                                <option value="active">Available</option>
                                                <option value="inactive">Unavailable</option>
                                            </select>
                                        )}
                                    />
                                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpenAddModal(false);
                                        setOpenEditModal(false);
                                        setSelectedUser(null);
                                        reset();
                                    }}
                                    className="px-6 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-navy-700 bg-white dark:bg-navy-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-white bg-[#4318ff] rounded-md hover:bg-[#3311db] flex items-center"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <FaSpinner className="animate-spin mr-2" />
                                    ) : null}
                                    {openEditModal ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div 
              className="mt-8 shadow-lg rounded-lg p-6 transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                boxShadow: '0 10px 15px -3px var(--shadow-color), 0 4px 6px -2px var(--shadow-color)'
              }}
            >
                <table className="w-full table-auto">
                    <thead>
                        <tr style={{ color: 'var(--text-secondary)' }}>
                            <th className="px-6 py-4 text-left">
                                <div className="flex justify-between items-center">
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
                                    />
                                    {selectedRows.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            className={`text-gray-600 hover:text-red-600 text-xl flex items-center ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? (
                                                <FaSpinner className="animate-spin" />
                                            ) : (
                                                <FaTrashAlt />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-4 text-left">Date</th>
                            <th className="px-6 py-4 text-left">Last Login</th>
                            <th className="px-6 py-4 text-left">User</th>
                            <th className="px-6 py-4 text-left">Email</th>
                            <th className="px-6 py-4 text-left">Phone</th>
                            <th className="px-6 py-4 text-left">Role</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getPaginatedData().length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
                                    {loading ? 'Loading...' : 'No Users found'}
                                </td>
                            </tr>
                        ) : (
                            getPaginatedData().map((user) => (
                                <tr key={user.id} className="border-t transition-colors hover:bg-opacity-5" style={{ borderColor: 'var(--border-color)' }}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(user.id)}
                                            onChange={() => handleRowSelection(user.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatDateWithOrdinal(user.created_at || user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            {user.profile_picture ? (
                                                <img
                                                    src={user.profile_picture}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                                                    {getInitials(user.name)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.phone || user.mobile_number || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'ecommerce_admin' ? 'bg-blue-100 text-blue-800' :
                                            user.role === 'grocery_admin' ? 'bg-green-100 text-green-800' :
                                            user.role === 'taxi_admin' ? 'bg-yellow-100 text-yellow-800' :
                                            user.role === 'hotel_admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'restaurant_admin' ? 'bg-pink-100 text-pink-800' :
                                             user.role === 'porter_admin' ? 'bg-purple-100 text-purple-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-7 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            (user.status === true || user.status === 'active') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {(user.status === true || user.status === 'active') ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="relative inline-block group" ref={dropdownRef}>
                                            <button
                                                className="p-1 transition-colors hover:opacity-80"
                                                style={{ color: 'var(--text-primary)' }}
                                                aria-label={`Actions for ${user.name}`}
                                            >
                                                <FaEllipsisV />
                                            </button>
                                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded z-10 p-2 flex space-x-2 bg-transparent border-0">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="text-blue-600 hover:text-blue-600 p-1"
                                                    aria-label={`Edit ${user.name}`}
                                                    title="Edit User"
                                                >
                                                    <FaEdit />
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center">
                    <span className="mr-2" style={{ color: 'var(--text-primary)' }}>Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="border px-4 py-2 rounded-md transition-colors"
                        style={{ 
                          backgroundColor: 'var(--bg-input)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="ml-2" style={{ color: 'var(--text-primary)' }}>entries</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md disabled:opacity-50 transition-colors"
                        style={{ 
                          backgroundColor: 'var(--bg-input)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                    >
                        Previous
                    </button>
                    <span className="px-3 py-1" style={{ color: 'var(--text-primary)' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-md disabled:opacity-50 transition-colors"
                        style={{ 
                          backgroundColor: 'var(--bg-input)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {openDeleteDialog && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div 
                      className="p-6 rounded-md shadow-lg w-1/3 transition-colors duration-300"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Are you sure you want to delete this user?</h2>
                        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setOpenDeleteDialog(false)}
                                className="px-4 py-2 mr-4 border rounded-md hover:opacity-80 transition-opacity"
                                style={{ 
                                  backgroundColor: 'var(--bg-secondary)',
                                  borderColor: 'var(--border-color)',
                                  color: 'var(--text-primary)'
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

            {/* User Profile Modal */}
            <UserProfileModal
                user={selectedUserForProfile}
                isOpen={profileModalOpen}
                onClose={() => {
                    setProfileModalOpen(false);
                    setSelectedUserForProfile(null);
                }}
                onSave={handleProfileSave}
                isEditMode={profileEditMode}
                loading={loading}
            />

            {/* Password Change Modal */}
            {passwordModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={() => {
                    setPasswordModalOpen(false);
                    setSelectedUserForPassword(null);
                }}>
                    <div 
                      className="rounded-lg shadow-2xl p-8 w-[400px] transition-colors duration-300"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                            Change Password for {selectedUserForPassword?.name}
                        </h2>
                        
                        <PasswordChangeForm
                            user={selectedUserForPassword}
                            onSave={handlePasswordSave}
                            onCancel={() => {
                                setPasswordModalOpen(false);
                                setSelectedUserForPassword(null);
                            }}
                            loading={loading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;