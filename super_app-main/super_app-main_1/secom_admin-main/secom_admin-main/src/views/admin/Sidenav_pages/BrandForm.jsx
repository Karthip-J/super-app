import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaUpload, FaSpinner } from 'react-icons/fa';
import brandService from '../../../services/brandService';
import API_CONFIG from '../../../config/api.config';

const BrandForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [brands, setBrands] = useState([]);
  const [checkingName, setCheckingName] = useState(false);
  const debounceTimer = useRef(null);

  // Validation schema
  const validationSchema = Yup.object({
    brand_name: Yup.string()
      .required('Brand name is required')
      .min(2, 'Brand name must be at least 2 characters')
      .max(50, 'Brand name must not exceed 50 characters'),
    photo: Yup.mixed()
      .test('fileType', 'Only image files are allowed', (value) => {
        if (!value) return true; // Allow empty for edit mode
        return value instanceof File && value.type.startsWith('image/');
      })
      .test('fileSize', 'File size must be less than 5MB', (value) => {
        if (!value) return true; // Allow empty for edit mode
        return value instanceof File && value.size <= 5 * 1024 * 1024;
      }),
    status: Yup.boolean().required('Status is required'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      brand_name: '',
      status: true,
    },
  });

  // Fetch all brands for duplicate checking
  useEffect(() => {
    fetchAllBrands();
  }, []);

  // Fetch brand data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchBrandData();
    }
  }, [id]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const fetchAllBrands = async () => {
    try {
      const response = await brandService.getAllBrands();
      setBrands(Array.isArray(response) ? response : (response.data || []));
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchBrandData = async () => {
    try {
      setLoading(true);
      const response = await brandService.getAllBrands();
      const brand = response.find(b => b.id == id);
      
      if (brand) {
        setValue('brand_name', brand.brand_name);
        setValue('status', brand.status);
        if (brand.photo) {
          const imageUrl = API_CONFIG.getUrl(brand.photo);
          setExistingImage(imageUrl);
          setImagePreview(imageUrl);
        }
      } else {
        toast.error('Brand not found');
        navigate('/admin/brands');
      }
    } catch (error) {
      console.error('Error fetching brand:', error);
      toast.error('Failed to fetch brand data');
      navigate('/admin/brands');
    } finally {
      setLoading(false);
    }
  };

  // Check if brand name already exists
  const checkBrandNameExists = (brandName) => {
    if (!brandName || brandName.trim().length < 2) {
      return false;
    }
    
    const trimmedName = brandName.trim().toLowerCase();
    return brands.some(brand => {
      // In edit mode, exclude the current brand
      if (isEditMode && brand.id == id) {
        return false;
      }
      return brand.brand_name?.toLowerCase() === trimmedName || 
             brand.name?.toLowerCase() === trimmedName;
    });
  };

  // Handle brand name change with debounced validation
  const handleBrandNameChange = (e) => {
    const value = e.target.value;
    setValue('brand_name', value, { shouldValidate: false });
    
    // Clear previous errors
    clearErrors('brand_name');
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Only check if name is long enough
    if (value && value.trim().length >= 2) {
      setCheckingName(true);
      
      // Debounce the check
      debounceTimer.current = setTimeout(() => {
        if (checkBrandNameExists(value)) {
          setError('brand_name', {
            type: 'manual',
            message: 'Brand name already exists, try another name'
          });
        }
        setCheckingName(false);
      }, 500);
    } else {
      setCheckingName(false);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setValue('photo', file);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('brand_name', data.brand_name);
      formData.append('status', data.status);
      
      if (data.photo) {
        formData.append('brand_image', data.photo);
      }

      // --- NEW LOGGING ---
      console.log("Submitting FormData from BrandForm.jsx:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      // --- END NEW LOGGING ---

      if (isEditMode) {
        await brandService.updateBrand(id, formData);
        toast.success('Brand updated successfully');
      } else {
        await brandService.createBrand(formData);
        toast.success('Brand created successfully');
      }
      
      navigate('/admin/brands');
    } catch (error) {
      console.error('Error saving brand:', error);
      // Check for specific error message from backend
      const errorMessage = error.response?.data?.message || 'Failed to save brand';
      // If the error message is "Brand already exists" or "Brand already Exists", show it directly
      if (errorMessage === 'Brand already exists' || errorMessage === 'Brand already Exists' || errorMessage.toLowerCase().includes('brand already exists')) {
        // Set error on the brand_name field
        setError('brand_name', {
          type: 'manual',
          message: 'Brand name already exists, try another name'
        });
        toast.error('Brand already Exists');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/brands');
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <ToastContainer />
      
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="mr-4 p-2 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          <FaArrowLeft className="text-lg" />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {isEditMode ? 'Edit Brand' : 'Add New Brand'}
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Brand Name *
            </label>
            <input
              type="text"
              {...register('brand_name')}
              onChange={handleBrandNameChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.brand_name ? 'border-red-500 dark:border-red-400' : ''
              }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.brand_name ? undefined : 'var(--border-color)'
              }}
              placeholder="Enter brand name"
            />
            {checkingName && (
              <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Checking availability...</p>
            )}
            {errors.brand_name && !checkingName && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.brand_name.message}</p>
            )}
          </div>

          {/* Brand Image */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Brand Image
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {(imagePreview || existingImage) && (
                <div className="flex items-center space-x-4">
                  <img
                    src={imagePreview || existingImage}
                    alt="Brand preview"
                    className="h-20 w-20 rounded-lg object-cover border transition-colors"
                    style={{ borderColor: 'var(--border-color)' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setExistingImage(null);
                      setValue('photo', null);
                    }}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              )}
              
              {/* File Upload */}
              <div className="flex items-center justify-center w-full">
                <label 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-4" style={{ color: 'var(--text-secondary)' }} />
                    <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            {errors.photo && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.photo.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Status *
            </label>
            <select
              {...register('status')}
              value={watch('status')}
              onChange={(e) => setValue('status', e.target.value === 'true')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.status ? 'border-red-500 dark:border-red-400' : ''
              }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.status ? undefined : 'var(--border-color)'
              }}
            >
              <option value={true} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Active</option>
              <option value={false} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Inactive</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.status.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading && <FaSpinner className="animate-spin mr-2" />}
              {isEditMode ? 'Update Brand' : 'Create Brand'}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border rounded-lg transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-input)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandForm; 