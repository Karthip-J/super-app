import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
  Switch,
} from '@material-tailwind/react';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { groceryCategoryService } from '../../../services/groceryCategoryService';
import API_CONFIG from '../../../config/api.config';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import classNames from 'classnames';

// Validation schema
const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Please enter the category name'),
  slug: yup.string().optional(), // Auto-generated, not required from user
  description: yup.string().optional(),
  status: yup.boolean(),
});

// Slug generator function with timestamp to ensure uniqueness
const generateSlug = (text) => {
  const baseSlug = text
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now().toString().slice(-6);
  return `${baseSlug}-${timestamp}`;
};

const GroceryCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch category data for editing
  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
  }, [id, isEditMode]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const category = await groceryCategoryService.getCategoryById(id);
      setFormData({
        name: category.name || '',
        slug: category.slug || generateSlug(category.name || ''),
        description: category.description || '',
        status: category.status !== undefined ? category.status : true,
      });
      if (category.image) {
        setImagePreview(API_CONFIG.getUrl(category.image));
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to fetch category details');
      navigate('/admin/grocerycategory');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        // Only auto-generate slug if slug field is empty
        slug: prev.slug ? prev.slug : generateSlug(value),
      }));
    } else if (field === 'slug') {
      // Allow manual editing without auto-conversion
      setFormData(prev => ({ ...prev, slug: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Validate form
  const validateForm = async (data) => {
    try {
      await validationSchema.validate(data, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach(error => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Apply slug generation before validation
    const finalFormData = {
      ...formData,
      slug: generateSlug(formData.slug || formData.name) // Generate proper slug on submit
    };
    
    if (!(await validateForm(finalFormData))) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', finalFormData.name);
      formDataToSend.append('slug', finalFormData.slug); // Use the generated slug
      formDataToSend.append('description', finalFormData.description);
      formDataToSend.append('status', finalFormData.status);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (isEditMode) {
        await groceryCategoryService.updateCategory(id, formDataToSend);
        toast.success('Category updated successfully');
      } else {
        await groceryCategoryService.createCategory(formDataToSend);
        toast.success('Category created successfully');
      }
      
      navigate('/admin/grocerycategory');
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <Typography variant="h6">Loading category...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col items-center gap-8">
      <Card className="w-full max-w-2xl p-2">
        <CardHeader
          variant="filled"
          color="white"
          className={classNames('mb-4 p-4 rounded-t-lg', {
            'shadow-none': isEditMode, // Remove shadow only in edit mode
          })}
          shadow={false} // Explicitly disable shadow
        >
          <div className="flex items-center gap-4">
            <Button
              variant="text"
              color="blue-gray"
              className="flex items-center gap-2"
              onClick={() => navigate('/admin/grocerycategory')}
            >
              <ArrowLeftIcon className="h-4 w-4" />

            </Button>
            <Typography variant="h5" style={{ color: '#000000' }}>
              {isEditMode ? 'Edit Grocery Category' : 'Add Grocery Category'}
            </Typography>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="category-name" className="block text-sm font-medium text-blue-gray-700 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="category-name"
                type="text"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                labelProps={{ className: "hidden" }}
                containerProps={{ className: "min-w-[100px]" }}
              />
              {errors.name && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.name}
                </Typography>
              )}
            </div>

            {/* Slug Field - Hidden since auto-generated */}
            <input
              type="hidden"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
            />

            {/* Description Field */}
            <div>
              <label htmlFor="category-description" className="block text-sm font-medium text-blue-gray-700 mb-1">Description</label>
              <Textarea
                id="category-description"
                placeholder="Enter a short description (optional)"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                labelProps={{ className: "hidden" }}
                containerProps={{ className: "min-w-[100px]" }}
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-blue-gray-700 mb-1">Category Image</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <PhotoIcon className="h-4 w-4" />
                    {imageFile || imagePreview ? 'Change Image' : 'Upload Image'}
                  </label>
                </div>
                {(imageFile || imagePreview) && (
                  <Button
                    variant="text"
                    color="red"
                    onClick={removeImage}
                    className="flex items-center gap-2"
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
            </div>

            {/* Status Field */}
            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                aria-pressed={!!formData.status}
                onClick={() => handleInputChange('status', !formData.status)}
                className={classNames(
                  'relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none',
                  formData.status ? 'bg-blue-600' : 'bg-gray-300'
                )}
                style={{ minWidth: 48 }}
              >
                <span
                  className={classNames(
                    'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                    formData.status ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
              <Typography variant="small" color="gray" className="font-normal">
                {formData.status ? 'Active: Category will be visible to users' : 'Inactive: Category will be hidden from users'}
              </Typography>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 justify-end">
              <Button
                type="submit"
                color="blue"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? 'Saving...' : (isEditMode ? 'Update Category' : 'Create Category')}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="gray"
                onClick={() => navigate('/admin/grocerycategory')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default GroceryCategoryForm;