import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaArrowLeft, FaUpload, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import API_CONFIG from '../../../config/api.config';
import brandService from '../../../services/brandService';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const fileInputRef = useRef(null);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Product name is required')
      .min(2, 'Product name must be at least 2 characters')
      .max(100, 'Product name must not exceed 100 characters'),
    description: Yup.string()
      .max(1000, 'Description must not exceed 1000 characters'),
    price: Yup.number()
      .required('Price is required')
      .positive('Price must be positive')
      .min(0, 'Price cannot be negative'),
    sale_price: Yup.number()
      .positive('Sale price must be positive')
      .min(0, 'Sale price cannot be negative'),
    stock: Yup.number()
      .required('Stock is required')
      .integer('Stock must be a whole number')
      .min(0, 'Stock cannot be negative'),
    sku: Yup.string()
      .required('Product Code is required')
      .min(2, 'Product Code must be at least 2 characters')
      .max(50, 'Product Code must not exceed 50 characters'),
    slug: Yup.string()
      .required('Category Code is required')
      .min(2, 'Category Code must be at least 2 characters')
      .max(100, 'Category Code must not exceed 100 characters'),
    brand_id: Yup.string().required('Brand is required'),
    category_id: Yup.string().required('Category is required'),
    sub_category_id: Yup.string(),
    status: Yup.boolean().required('Status is required'),
    meta_title: Yup.string().max(60, 'Title must not exceed 60 characters'),
    meta_description: Yup.string().max(160, 'Description must not exceed 160 characters'),
    photo: Yup.mixed().nullable(), // logic handled manually or via simple check
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      sale_price: '',
      stock: 0,
      sku: '',
      slug: '',
      brand_id: '',
      category_id: '',
      sub_category_id: '',
      status: true,
      meta_title: '',
      meta_description: '',
    },
  });

  const selectedBrand = watch('brand_id');
  const selectedCategory = watch('category_id');

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brands = await brandService.getAllBrands();
        console.log('Brands fetched:', brands);
        setBrands(Array.isArray(brands) ? brands : []);
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast.error('Failed to load brands');
      }
    };
    fetchBrands();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      // ✅ FIXED: Simplified filtering logic to handle both object and string IDs
      const categoryId = typeof selectedCategory === 'object' ? selectedCategory._id : selectedCategory;

      const filteredSubCategories = categories.filter(cat => {
        const parentId = cat.parent_id;
        return String(parentId) === String(categoryId);
      });

      setSubCategories(filteredSubCategories);
      // Reset subcategory selection when category changes
      setValue('sub_category_id', '');
    } else {
      setSubCategories([]);
      setValue('sub_category_id', '');
    }
  }, [selectedCategory, categories, setValue]);

  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchProductData();
    }
  }, [id]);

  // ✅ ADD: Trigger subcategory filtering when product data is loaded in edit mode
  useEffect(() => {
    if (isEditMode && categories.length > 0) {
      // Get the current category_id from the form
      const currentCategoryId = watch('category_id');
      console.log('🔍 DEBUG: Edit mode subcategory filtering - currentCategoryId:', currentCategoryId);

      if (currentCategoryId) {
        // Filter subcategories for the current category
        const filteredSubCategories = categories.filter(cat => {
          const parentId = cat.parent_id;
          return String(parentId) === String(currentCategoryId);
        });
        console.log('🔍 DEBUG: Edit mode - filtered subcategories:', filteredSubCategories);
        setSubCategories(filteredSubCategories);
      }
    }
  }, [categories, isEditMode, watch]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/products/${id}`);
      const product = response.data;

      console.log('🔍 DEBUG: Fetched product data:', {
        category_id: product.category_id,
        sub_category_id: product.sub_category_id,
        brand_id: product.brand_id
      });

      setValue('name', product.name);
      setValue('description', product.description || '');
      setValue('price', product.price);
      setValue('sale_price', product.sale_price || '');
      setValue('stock', product.stock);
      setValue('sku', product.sku);
      setValue('slug', product.slug);
      setValue('brand_id', product.brand_id);
      setValue('category_id', product.category_id);
      setValue('sub_category_id', product.sub_category_id || '');
      setValue('status', product.status);
      setValue('meta_title', product.meta_title || '');
      setValue('meta_description', product.meta_description || '');

      console.log('🔍 DEBUG: After setValue - sub_category_id:', product.sub_category_id);

      if (product.images && product.images.length > 0) {
        // Correctly handle absolute URLs if the backend sends them (which we updated it to do)
        // If helper API_CONFIG.getUrl is needed for some reason, use it.
        // Backend now returns absolute URLs in 'images' array.
        setExistingImages(product.images);
      } else if (product.photo) {
        // Fallback for old data
        const imageUrl = product.photo.startsWith('http') ? product.photo : API_CONFIG.getUrl(product.photo);
        setExistingImages([imageUrl]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product data');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Append to newImages state
    setNewImages(prev => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('price', data.price);
      formData.append('sale_price', data.sale_price || '');
      formData.append('stock', data.stock);
      formData.append('sku', data.sku);
      formData.append('slug', data.slug);
      formData.append('brand_id', data.brand_id);
      formData.append('category_id', data.category_id);
      if (data.sub_category_id) {
        formData.append('sub_category_id', data.sub_category_id);
      }
      formData.append('status', data.status);
      formData.append('meta_title', data.meta_title || '');
      formData.append('meta_description', data.meta_description || '');

      // Append existing images (to keep)
      existingImages.forEach(url => {
        formData.append('existing_images', url);
      });

      // Append new images
      newImages.forEach(file => {
        formData.append('product_images', file);
      });

      const accessToken = localStorage.getItem('token');
      if (isEditMode) {
        await axios.put(`${API_CONFIG.BASE_URL}/api/products/update_product_by_id/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`
          },
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${API_CONFIG.BASE_URL}/api/products/save_product`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`
          },
        });
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/products');
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
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Product Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.name ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.name ? undefined : 'var(--border-color)'
                }}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Product Code *
              </label>
              <input
                type="text"
                {...register('sku')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.sku ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.sku ? undefined : 'var(--border-color)'
                }}
                placeholder="Enter Product Code"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.sku.message}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.price ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.price ? undefined : 'var(--border-color)'
                }}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.price.message}</p>
              )}
            </div>

            {/* Sale Price */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Sale Price
              </label>
              <input
                type="number"
                step="0.01"
                {...register('sale_price')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.sale_price ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.sale_price ? undefined : 'var(--border-color)'
                }}
                placeholder="0.00"
              />
              {errors.sale_price && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.sale_price.message}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Stock *
              </label>
              <input
                type="number"
                {...register('stock')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.stock ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.stock ? undefined : 'var(--border-color)'
                }}
                placeholder="0"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.stock.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Category Code *
              </label>
              <input
                type="text"
                {...register('slug')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.slug ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.slug ? undefined : 'var(--border-color)'
                }}
                placeholder="enter a Category Code"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.slug.message}</p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Brand *
              </label>
              <select
                {...register('brand_id')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.brand_id ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.brand_id ? undefined : 'var(--border-color)'
                }}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Select a brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                    {brand.brand_name}
                  </option>
                ))}
              </select>
              {errors.brand_id && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.brand_id.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Category *
              </label>
              <select
                {...register('category_id')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.category_id ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.category_id ? undefined : 'var(--border-color)'
                }}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Select a category</option>
                {categories.filter(cat => !cat.parent_id).map((category) => (
                  <option key={category.id} value={category.id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.category_id.message}</p>
              )}
            </div>

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Subcategory
              </label>
              <select
                {...register('sub_category_id')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.sub_category_id ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.sub_category_id ? undefined : 'var(--border-color)',
                  opacity: !selectedCategory ? 0.6 : 1
                }}
                disabled={!selectedCategory}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Select a subcategory</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
              {errors.sub_category_id && (
                <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.sub_category_id.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Status *
              </label>
              <select
                {...register('status')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.status ? 'border-red-500 dark:border-red-400' : ''
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.description ? 'border-red-500 dark:border-red-400' : ''
                }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.description ? undefined : 'var(--border-color)'
              }}
              placeholder="Enter product description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Meta Title */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Title
            </label>
            <input
              type="text"
              {...register('meta_title')}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.meta_title ? 'border-red-500 dark:border-red-400' : ''
                }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.meta_title ? undefined : 'var(--border-color)'
              }}
              placeholder="Enter the title"
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
            <textarea
              {...register('meta_description')}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.meta_description ? 'border-red-500 dark:border-red-400' : ''
                }`}
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.meta_description ? undefined : 'var(--border-color)'
              }}
              placeholder="Enter the description"
            />
            {errors.meta_description && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.meta_description.message}</p>
            )}
          </div>

          {/* Product Images */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Product Images
            </label>
            <div className="space-y-4">
              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {/* Existing Images */}
                {existingImages.map((src, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <img
                      src={src}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border transition-colors"
                      style={{ borderColor: 'var(--border-color)' }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700 focus:outline-none"
                      >
                        <span className="text-xs">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* New Image Previews */}
                {newImagePreviews.map((src, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <img
                      src={src}
                      alt={`New Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border transition-colors border-blue-500"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="text-white bg-red-600 p-2 rounded-full hover:bg-red-700 focus:outline-none"
                      >
                        <span className="text-xs">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upload Button Block */}
                <div
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors"
                  style={{ borderColor: 'var(--border-color)' }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <FaUpload className="text-2xl mb-2 text-gray-400" />
                  <span className="text-xs text-gray-500 text-center px-2">Click to Upload</span>
                </div>
              </div>

              <div className="hidden">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
              </div>
              <p className="text-sm text-gray-500">
                Select multiple images. Max 5MB per file.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
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
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading && <FaSpinner className="animate-spin mr-2" />}
              {isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm; 