import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaUpload, FaSpinner, FaTimes } from 'react-icons/fa';
import groceryService from 'services/groceryService';
import API_CONFIG from 'config/api.config';

const GroceryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]); // Array of File objects
  const [additionalImagesPreview, setAdditionalImagesPreview] = useState([]); // Array of preview URLs
  const [existingAdditionalImages, setExistingAdditionalImages] = useState([]); // Existing images from edit mode

  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .trim(),
    description: Yup.string()
      .max(1000, 'Description must not exceed 1000 characters')
      .trim(),
    original_price: Yup.number()
      .typeError('Original price must be a number')
      .required('Original price is required')
      .positive('Original price must be greater than 0')
      .min(0.01, 'Original price must be at least 0.01'),
    discounted_price: Yup.number()
      .typeError('Discounted price must be a number')
      .positive('Discounted price must be greater than 0')
      .min(0, 'Discounted price cannot be negative')
      .test('less-than-original', 'Discounted price must be less than original price', function(value) {
        const { original_price } = this.parent;
        if (!value || !original_price) return true; // Skip validation if either is empty
        return value < original_price;
      }),
    rating: Yup.number()
      .typeError('Rating must be a number')
      .min(0, 'Rating must be at least 0')
      .max(5, 'Rating must not exceed 5')
      .nullable(),
    quantity: Yup.number()
      .typeError('Quantity must be a number')
      .required('Quantity is required')
      .integer('Quantity must be a whole number')
      .min(0, 'Quantity cannot be negative')
      .test('positive', 'Quantity must be at least 0', value => value >= 0),
    category: Yup.string()
      .required('Category is required')
      .min(2, 'Category must be at least 2 characters')
      .max(50, 'Category must not exceed 50 characters')
      .trim(),
    status: Yup.boolean().required('Status is required'),
    is_best_seller: Yup.boolean(),
    image: Yup.mixed()
      .nullable()
      .test('fileType', 'Only image files are allowed (JPEG, PNG, GIF)', (value) => {
        if (!value) return true; // Image is optional
        if (value instanceof File) {
          return ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(value.type);
        }
        return true; // Allow existing images (strings/URLs) in edit mode
      })
      .test('fileSize', 'File size must be less than 5MB', (value) => {
        if (!value) return true; // Image is optional
        if (value instanceof File) {
          return value.size <= 5 * 1024 * 1024; // 5MB
        }
        return true; // Allow existing images
      })
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      status: true,
      is_best_seller: false,
    },
  });

  useEffect(() => {
    if (isEditMode) {
      groceryService.getGroceryById(id).then(response => {
        const grocery = response.data;
        Object.keys(grocery).forEach(key => {
          setValue(key, grocery[key]);
        });
        if (grocery.image) {
          const imageUrl = API_CONFIG.getUrl(grocery.image);
          setExistingImage(imageUrl);
          setImagePreview(imageUrl);
        }
        // Handle existing additional images
        if (grocery.images && Array.isArray(grocery.images) && grocery.images.length > 0) {
          const existingImages = grocery.images.map(img => {
            const imgUrl = typeof img === 'string' ? API_CONFIG.getUrl(img) : API_CONFIG.getUrl(img.url || img);
            return {
              url: imgUrl,
              id: img._id || img.id || Math.random().toString(36).substr(2, 9)
            };
          });
          setExistingAdditionalImages(existingImages);
        }
      });
    }
  }, [id, setValue, isEditMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
        e.target.value = ''; // Clear the input
        return;
      }
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      setValue('image', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Clear input after selection
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        invalidFiles.push(file.name);
        return;
      }
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(file.name);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(', ')}. Only JPEG, PNG, GIF under 5MB are allowed.`);
    }

    if (validFiles.length > 0) {
      // Create previews for valid files
      const newPreviews = [];
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            file: file,
            preview: reader.result,
            id: Math.random().toString(36).substr(2, 9)
          });
          if (newPreviews.length === validFiles.length) {
            setAdditionalImages(prev => [...prev, ...validFiles]);
            setAdditionalImagesPreview(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    e.target.value = ''; // Clear input after selection
  };

  const removeAdditionalImage = (index) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    setAdditionalImagesPreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAdditionalImage = (id) => {
    setExistingAdditionalImages(prev => prev.filter(img => img.id !== id));
  };

  const onSubmit = async (data) => {
    // Validate image for new items
    if (!isEditMode && !data.image && !existingImage) {
      toast.error('Please upload an image');
      return;
    }

    const formData = new FormData();

    // Append main image
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    // Append additional images
    if (additionalImages.length > 0) {
      additionalImages.forEach((file, index) => {
        formData.append('images[]', file);
      });
    }

    // Append other form fields
    Object.keys(data).forEach(key => {
      if (key !== 'image') {
        formData.append(key, data[key]);
      }
    });

    setLoading(true);
    try {
      if (isEditMode) {
        await groceryService.updateGrocery(id, formData);
        toast.success('Grocery updated successfully');
      } else {
        await groceryService.createGrocery(formData);
        toast.success('Grocery created successfully');
      }
      navigate('/admin/groceries');
    } catch (error) {
      console.error('Error saving grocery:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save grocery';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <ToastContainer />
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/groceries')} 
          className="mr-4 p-2 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          <FaArrowLeft className="text-lg" />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {isEditMode ? 'Edit Grocery' : 'Add New Grocery'}
        </h1>
      </div>
      <div 
        className="max-w-2xl rounded-lg shadow-sm p-6 transition-colors"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 1px 3px 0 var(--shadow-color)'
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              placeholder="Enter grocery name"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? 'border-red-500 dark:border-red-400' : ''
              }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.name ? undefined : 'var(--border-color)'
              }}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>}
          </div>

          {/* Description Field */}
          <div>
            <label 
              htmlFor="description" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Description
            </label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Enter description"
              rows={4}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.description ? 'border-red-500 dark:border-red-400' : ''
              }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.description ? undefined : 'var(--border-color)'
              }}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.description.message}</p>}
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="original_price" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Original Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="original_price"
                step="0.01"
                min="0.01"
                {...register('original_price')}
                placeholder="0.00"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.original_price ? 'border-red-500 dark:border-red-400' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.original_price ? undefined : 'var(--border-color)'
                }}
              />
              {errors.original_price && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.original_price.message}</p>}
            </div>

            <div>
              <label 
                htmlFor="discounted_price" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Discounted Price
              </label>
              <input
                type="number"
                id="discounted_price"
                step="0.01"
                min="0"
                {...register('discounted_price')}
                placeholder="0.00"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.discounted_price ? 'border-red-500 dark:border-red-400' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.discounted_price ? undefined : 'var(--border-color)'
                }}
              />
              {errors.discounted_price && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.discounted_price.message}</p>}
            </div>
          </div>

          {/* Rating and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="rating" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Rating (0-5)
              </label>
              <input
                type="number"
                id="rating"
                step="0.1"
                min="0"
                max="5"
                {...register('rating')}
                placeholder="0.0"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.rating ? 'border-red-500 dark:border-red-400' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.rating ? undefined : 'var(--border-color)'
                }}
              />
              {errors.rating && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.rating.message}</p>}
            </div>

            <div>
              <label 
                htmlFor="quantity" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                step="1"
                min="0"
                {...register('quantity')}
                placeholder="0"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.quantity ? 'border-red-500 dark:border-red-400' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.quantity ? undefined : 'var(--border-color)'
                }}
              />
              {errors.quantity && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.quantity.message}</p>}
            </div>
          </div>

          {/* Category Field */}
          <div>
            <label 
              htmlFor="category" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="category"
              {...register('category')}
              placeholder="Enter category"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.category ? 'border-red-500 dark:border-red-400' : ''
              }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.category ? undefined : 'var(--border-color)'
              }}
            />
            {errors.category && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.category.message}</p>}
          </div>

          {/* Status and Best Seller */}
          <div className="flex items-start space-x-6">
            <div className="flex-1">
              <label 
                htmlFor="status" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                {...register('status')}
                value={watch('status')}
                onChange={(e) => setValue('status', e.target.value === 'true', { shouldValidate: true })}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.status ? 'border-red-500 dark:border-red-400' : ''
                }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.status ? undefined : 'var(--border-color)'
                }}
              >
                <option value="true" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Active</option>
                <option value="false" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Inactive</option>
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.status.message}</p>}
            </div>

            <div className="pt-8">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_best_seller')}
                  className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 transition-colors"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-input)'
                  }}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Best Seller</span>
              </label>
            </div>
          </div>

          {/* Main Image Upload */}
          <div>
            <label 
              htmlFor="image" 
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Main Image {!isEditMode && !existingImage && <span className="text-red-500">*</span>}
            </label>
            {(imagePreview || existingImage) && (
              <div className="mb-3">
                <img
                  src={imagePreview || existingImage}
                  alt="Main Preview"
                  className="h-32 w-32 rounded-lg object-cover border-2 transition-colors"
                  style={{ borderColor: 'var(--border-color)' }}
                />
              </div>
            )}
            <input
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleImageChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 ${
                errors.image ? 'border-red-500 dark:border-red-400' : ''
              }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.image ? undefined : 'var(--border-color)'
              }}
            />
            {errors.image && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.image.message}</p>}
            <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Accepted formats: JPEG, PNG, GIF. Max size: 5MB
            </p>
          </div>

          {/* Additional Images Section - Show only after main image is uploaded */}
          {(imagePreview || existingImage) && (
            <div>
              <label 
                htmlFor="additionalImages" 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Additional Images
              </label>
              
              {/* Existing Additional Images (from edit mode) */}
              {existingAdditionalImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Existing Images:</p>
                  <div className="grid grid-cols-4 gap-4">
                    {existingAdditionalImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt="Additional"
                          className="h-24 w-full rounded-lg object-cover border-2 transition-colors"
                          style={{ borderColor: 'var(--border-color)' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingAdditionalImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Additional Images Preview */}
              {additionalImagesPreview.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>New Images:</p>
                  <div className="grid grid-cols-4 gap-4">
                    {additionalImagesPreview.map((img, index) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Additional ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover border-2 transition-colors"
                          style={{ borderColor: 'var(--border-color)' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove image"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Images Button */}
              <div>
                <input
                  type="file"
                  id="additionalImages"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleAdditionalImagesChange}
                  multiple
                  className="hidden"
                />
                <label
                  htmlFor="additionalImages"
                  className="inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                >
                  <FaUpload className="mr-2" />
                  Add Images
                </label>
                <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  You can select multiple images. Accepted formats: JPEG, PNG, GIF. Max size per image: 5MB
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/groceries')}
              className="px-6 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-input)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-input)';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update' : 'Create'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroceryForm; 