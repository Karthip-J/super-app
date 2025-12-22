import React, { useState, useRef, useEffect } from 'react';
import { FaEdit, FaCamera, FaSpinner, FaTimes } from 'react-icons/fa';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

const UserProfileModal = ({
  user,
  isOpen,
  onClose,
  onSave,
  isEditMode = false,
  loading = false
}) => {
  const [imagePreview, setImagePreview] = useState(user?.profile_picture || null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().optional(),
    address_line1: Yup.string().optional(),
    address_line2: Yup.string().optional(),
    city: Yup.string().optional(),
    state: Yup.string().optional(),
    country: Yup.string().optional(),
    pincode: Yup.string().optional(),
    bio: Yup.string().optional()
  });

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address_line1: user?.profile?.address_line1 || '',
      address_line2: user?.profile?.address_line2 || '',
      city: user?.profile?.city || '',
      state: user?.profile?.state || '',
      country: user?.profile?.country || '',
      pincode: user?.profile?.pincode || '',
      bio: user?.profile?.bio || ''
    }
  });

  // Reset form values when user changes
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('address_line1', user.profile?.address_line1 || '');
      setValue('address_line2', user.profile?.address_line2 || '');
      setValue('city', user.profile?.city || '');
      setValue('state', user.profile?.state || '');
      setValue('country', user.profile?.country || '');
      setValue('pincode', user.profile?.pincode || '');
      setValue('bio', user.profile?.bio || '');
      
      // Reset image preview
      setImagePreview(user.profile_picture || null);
      setImageFile(null);
    }
  }, [user, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (data) => {
    const formData = new FormData();
    
    // Add all form fields
    Object.keys(data).forEach(key => {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    });

    // Add image if selected
    if (imageFile) {
      formData.append('profile_picture', imageFile);
    }

    await onSave(formData);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditMode ? 'Edit User Profile' : 'User Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200">
                  {getInitials(user?.name)}
                </div>
              )}
              
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <FaCamera className="text-sm" />
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Role: {user?.role?.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    {...field}
                    disabled={!isEditMode}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                )}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <input
                    type="email"
                    {...field}
                    disabled={!isEditMode}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                )}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <input
                    type="tel"
                    {...field}
                    disabled={!isEditMode}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                )}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    disabled={!isEditMode}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    placeholder="Tell us about yourself..."
                  />
                )}
              />
              {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-800 mb-4">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1
                </label>
                <Controller
                  name="address_line1"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      disabled={!isEditMode}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <Controller
                  name="address_line2"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      disabled={!isEditMode}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      disabled={!isEditMode}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      disabled={!isEditMode}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      disabled={!isEditMode}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <Controller
                  name="pincode"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      {...field}
                      disabled={!isEditMode}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditMode && (
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaEdit className="mr-2" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal; 