import React, { useState, useEffect } from 'react';
import { FaSpinner, FaArrowLeft, FaSave, FaImage } from 'react-icons/fa';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../../services/categoryService';
import { authService } from '../../../services/authService';
import API_CONFIG from '../../../config/api.config';

function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Validation schema - dynamic based on edit mode
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Category name is required')
      .min(2, 'Category name must be at least 2 characters')
      .max(100, 'Category name must not exceed 100 characters'),
    description: Yup.string()
      .max(500, 'Description must not exceed 500 characters'),
    parent_id: Yup.string()
      .nullable()
      .transform((value) => (value === '' ? null : value)),
    status: Yup.boolean()
      .required('Status is required'),
    meta_title: Yup.string()
      .max(60, 'Title must not exceed 60 characters'),
    meta_description: Yup.string()
      .max(160, 'Description must not exceed 160 characters'),
    category_image: isEditMode 
      ? Yup.mixed().nullable() // Edit mode: image is optional
      : Yup.mixed() // Create mode: keep validation
        .test('fileSize', 'File size must be less than 5MB', (value) => {
          if (!value) return true;
          return value.size <= 5 * 1024 * 1024;
        })
        .test('fileType', 'Only image files are allowed', (value) => {
          if (!value) return true;
          return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(value.type);
        })
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      description: '',
      parent_id: null,
      status: true,
      meta_title: '',
      meta_description: '',
      category_image: null // Make sure this is explicitly null
    }
  });

  // Check authentication and fetch data on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        navigate("/auth/sign-in");
        return;
      }
      
      await fetchCategories();
      
      if (id) {
        setIsEditMode(true);
        await fetchCategoryData();
      }
    };
    
    checkAuth();
  }, [navigate, id]);

  // Fetch all categories for parent selection
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Fetch category data for editing
  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const categoryData = await categoryService.getCategoryById(id);
      setInitialData(categoryData);
      
      // Set form values
      setValue('name', categoryData.name || '');
      setValue('description', categoryData.description || '');
      setValue('parent_id', categoryData.parent_id || null);
      setValue('status', categoryData.status !== undefined ? categoryData.status : true);
      setValue('meta_title', categoryData.meta_title || '');
      setValue('meta_description', categoryData.meta_description || '');
      
      // Set image preview
      if (categoryData.image) {
                    setImagePreview(API_CONFIG.getUrl(categoryData.image));
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category data');
      navigate('/admin/categories');
    } finally {
      setLoading(false);
    }
  };

  // Handle image change
  const handleImageChange = (e, onChange) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      onChange(file);
    }
  };

  // Get available parent categories (exclude current category and its descendants)
  const getAvailableParents = () => {
    return categories.filter(cat => !cat.parent_id);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('status', data.status);
      
      if (data.parent_id) {
        formData.append('parent_id', data.parent_id);
      }
      
      if (data.meta_title) {
        formData.append('meta_title', data.meta_title);
      }
      
      if (data.meta_description) {
        formData.append('meta_description', data.meta_description);
      }
      
      // IMPORTANT: Only append image if a new file is selected
      if (data.category_image instanceof File) {
        formData.append('category_image', data.category_image);
      }

      if (isEditMode) {
        await categoryService.updateCategory(id, formData);
        toast.success('Category updated successfully!');
      } else {
        // For create mode, image might be required - check validation schema
        await categoryService.createCategory(formData);
        toast.success('Category created successfully!');
      }
      
      navigate('/admin/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save category';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      
      
      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/categories')}
              className="transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {isEditMode ? 'Edit Category' : 'Add New Category'}
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {isEditMode ? 'Update category information' : 'Create a new product category'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div 
          className="rounded-lg shadow-md p-6 transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            boxShadow: '0 1px 3px 0 var(--shadow-color)'
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Category Name <span className="text-red-500">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter category name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.name ? 'border-red-500 dark:border-red-400' : ''
                    }`}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: errors.name ? undefined : 'var(--border-color)'
                    }}
                  />
                )}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Parent Category
              </label>
              <Controller
                name="parent_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? e.target.value : null)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>No Parent (Main Category)</option>
                    {getAvailableParents().map((category) => (
                      <option key={category.id || category._id} value={category.id || category._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.parent_id && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.parent_id.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="Enter category description"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.description ? 'border-red-500 dark:border-red-400' : ''
                    }`}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: errors.description ? undefined : 'var(--border-color)'
                    }}
                  />
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Category Image */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Category Image {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <Controller
                name="category_image"
                control={control}
                render={({ field }) => (
                  <div className="space-y-4">
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
                          <FaImage className="w-8 h-8 mb-4" style={{ color: 'var(--text-secondary)' }} />
                          <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>PNG, JPG, WebP up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, field.onChange)}
                        />
                      </label>
                    </div>
                    
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Preview:</p>
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-32 h-32 object-cover rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--border-color)' }}
                        />
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.category_image && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.category_image.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Status <span className="text-red-500">*</span>
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={true}
                        checked={field.value === true}
                        onChange={() => field.onChange(true)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Active</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value={false}
                        checked={field.value === false}
                        onChange={() => field.onChange(false)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Inactive</span>
                    </label>
                  </div>
                )}
              />
              {errors.status && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.status.message}</p>
              )}
            </div>

            {/* Meta Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Title
              </label>
              <Controller
                name="meta_title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter the title"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.meta_title ? 'border-red-500 dark:border-red-400' : ''
                    }`}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: errors.meta_title ? undefined : 'var(--border-color)'
                    }}
                  />
                )}
              />
              {errors.meta_title && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.meta_title.message}</p>
              )}
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Description
              </label>
              <Controller
                name="meta_description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    placeholder="Enter the description"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.meta_description ? 'border-red-500 dark:border-red-400' : ''
                    }`}
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: errors.meta_description ? undefined : 'var(--border-color)'
                    }}
                  />
                )}
              />
              {errors.meta_description && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.meta_description.message}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t transition-colors" style={{ borderColor: 'var(--border-color)' }}>
              <button
                type="button"
                onClick={() => navigate('/admin/categories')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    {isEditMode ? 'Update Category' : 'Create Category'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default CategoryForm; 