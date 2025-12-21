import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Switch,
} from '@material-tailwind/react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurantService, restaurantCategoryService } from '../../../services/restaurantService';
import API_CONFIG from '../../../config/api.config';
import { toast } from 'react-toastify';

const RestaurantForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    category_id: '',
    status: true,
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await restaurantCategoryService.getAll();
        console.log('Fetched categories:', data);
        setCategories(data);
      } catch (error) {
        toast.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  // Fetch restaurant if edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchRestaurant = async () => {
        try {
          setLoading(true);
          const response = await restaurantService.getById(id);
          const restaurant = response.data || response;
          setFormData({
            name: restaurant.name || '',
            address: restaurant.address || '',
            category_id: (typeof restaurant.category_id === 'object' && restaurant.category_id !== null)
              ? restaurant.category_id._id
              : (restaurant.category_id || ''),
            status: restaurant.status !== undefined ? restaurant.status : true,
          });
          if (restaurant.image) {
            setImagePreview(API_CONFIG.getUrl(restaurant.image));
          }
        } catch (error) {
          toast.error('Failed to fetch restaurant details');
          navigate('/admin/restaurant');
        } finally {
          setLoading(false);
        }
      };
      fetchRestaurant();
    }
  }, [isEditMode, id, navigate]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field === 'category_id') {
      setFormData(prev => ({ ...prev, [field]: value ? String(value) : '' }));
    } else if (field === 'status') {
      console.log('Status before:', formData.status, 'after:', value);
      setFormData(prev => ({ ...prev, [field]: !!value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('status', formData.status);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      if (isEditMode) {
        await restaurantService.update(id, formDataToSend);
        toast.success('Restaurant updated successfully');
      } else {
        await restaurantService.create(formDataToSend);
        toast.success('Restaurant created successfully');
      }
      navigate('/admin/restaurant');
    } catch (error) {
      toast.error(error.message || 'Failed to save restaurant');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Typography variant="h6" style={{ color: 'var(--text-primary)' }}>Loading restaurant...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col items-center gap-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Card className="w-full max-w-2xl shadow-lg p-2 transition-colors" style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px 0 var(--shadow-color)' }}>
        <CardBody>
          <Typography variant="h5" style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Restaurant' : 'Add Restaurant'}
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Name <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                placeholder="Enter restaurant name"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.name ? undefined : 'var(--border-color)'
                }}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Address <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                error={!!errors.address}
                placeholder="Enter address"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.address ? undefined : 'var(--border-color)'
                }}
              />
              {errors.address && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Category <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={e => handleInputChange('category_id', e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.category_id ? undefined : 'var(--border-color)'
                }}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Select category</option>
                {categories.filter(cat => cat.status).map(cat => (
                  <option key={cat._id} value={cat._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.category_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Image</label>
              {imagePreview ? (
                <div className="relative w-32 h-32 mb-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg border transition-colors" style={{ borderColor: 'var(--border-color)' }} />
                  <button type="button" onClick={removeImage} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">Remove</button>
                </div>
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm transition-colors file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                style={{ color: 'var(--text-secondary)' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="status-toggle"
                checked={!!formData.status}
                onChange={e => handleInputChange('status', e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition-colors"
                style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
              />
              <label htmlFor="status-toggle" className="ml-2 text-sm select-none" style={{ color: 'var(--text-primary)' }}>
                {formData.status ? 'Active' : 'Inactive'}
              </label>
              <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Active: Restaurant will be visible</span>
            </div>
            <div className="flex gap-4 pt-4 justify-end">
              <Button
                type="submit"
                color="blue"
                disabled={loading}
                className="flex items-center gap-2 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {loading ? 'Saving...' : (isEditMode ? 'Update Restaurant' : 'Create Restaurant')}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="gray"
                onClick={() => navigate('/admin/restaurant')}
                disabled={loading}
                className="transition-colors"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
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

export default RestaurantForm;