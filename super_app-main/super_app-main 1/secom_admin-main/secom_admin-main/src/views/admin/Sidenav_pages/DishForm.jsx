import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
} from '@material-tailwind/react';
import { useParams, useNavigate } from 'react-router-dom';
import { dishService, restaurantService } from '../../../services/restaurantService';
import API_CONFIG from '../../../config/api.config';
import { toast } from 'react-toastify';

const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');

const DishForm = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    restaurant_id: '',
    status: true,
  });
  const [restaurants, setRestaurants] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getAll();
        setRestaurants(data);
      } catch (error) {
        toast.error('Failed to fetch restaurants');
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch dish if edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchDish = async () => {
        try {
          setLoading(true);
          const dish = await dishService.getById(id);
          
          // Handle restaurant_id - it might be populated object or just ID
          let restaurantId = '';
          if (dish.restaurant_id) {
            if (typeof dish.restaurant_id === 'object' && dish.restaurant_id._id) {
              // It's a populated restaurant object
              restaurantId = dish.restaurant_id._id;
            } else {
              // It's just the ID string
              restaurantId = String(dish.restaurant_id);
            }
          }
          
          setFormData({
            name: dish.name || '',
            slug: dish.slug || generateSlug(dish.name || ''),
            description: dish.description || '',
            price: dish.price ? String(dish.price) : '',
            restaurant_id: restaurantId,
            status: dish.status !== undefined ? dish.status : true,
          });
          if (dish.image) {
            setImagePreview(API_CONFIG.getUrl(dish.image));
          }
        } catch (error) {
          toast.error('Failed to fetch dish details');
          navigate('/admin/dish');
        } finally {
          setLoading(false);
        }
      };
      fetchDish();
    }
  }, [isEditMode, id, navigate]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: prev.slug ? prev.slug : generateSlug(value),
      }));
    } else if (field === 'slug') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    } else if (field === 'restaurant_id') {
      setFormData(prev => ({ ...prev, [field]: value ? String(value) : '' }));
    } else if (field === 'status') {
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
    if (!formData.slug.trim()) newErrors.slug = 'Dish Code is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.restaurant_id) newErrors.restaurant_id = 'Restaurant is required';
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
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('restaurant_id', formData.restaurant_id);
      formDataToSend.append('status', formData.status);
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      // DEBUG LOGS
      console.log('Submitting dish with name:', formData.name);
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }
      if (isEditMode) {
        await dishService.update(id, formDataToSend);
        toast.success('Dish updated successfully');
      } else {
        await dishService.create(formDataToSend);
        toast.success('Dish created successfully');
      }
      navigate('/admin/dish');
    } catch (error) {
      toast.error(error.message || 'Failed to save dish');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Typography variant="h6" style={{ color: 'var(--text-primary)' }}>Loading dish...</Typography>
      </div>
    );
  }

  return (
    <div className="mt-8 mb-8 flex flex-col items-center gap-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Card className="w-full max-w-2xl shadow-lg p-2 transition-colors" style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px 0 var(--shadow-color)' }}>
        <CardBody>
          <Typography variant="h5" className="mb-6 font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEditMode ? 'Edit Dish' : 'Add Dish'}
          </Typography>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Name <span className="text-red-500 dark:text-red-400">*</span></label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                placeholder="Enter dish name"
                className="transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.name ? undefined : 'var(--border-color)'
                }}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Dish Code <span className="text-red-500 dark:text-red-400">*</span></label>
              <Input
                type="text"
                value={formData.slug}
                onChange={e => handleInputChange('slug', e.target.value)}
                error={!!errors.slug}
                placeholder="Auto-generated from name, or edit manually"
                className="transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.slug ? undefined : 'var(--border-color)'
                }}
              />
              {errors.slug && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.slug}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Description <span className="text-red-500 dark:text-red-400">*</span></label>
              <Textarea
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                error={!!errors.description}
                placeholder="Enter dish description"
                rows={4}
                className="transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.description ? undefined : 'var(--border-color)'
                }}
              />
              {errors.description && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.description}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Price <span className="text-red-500 dark:text-red-400">*</span></label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => handleInputChange('price', e.target.value)}
                error={!!errors.price}
                placeholder="Enter price"
                className="transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.price ? undefined : 'var(--border-color)'
                }}
              />
              {errors.price && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Restaurant <span className="text-red-500 dark:text-red-400">*</span></label>
              <select
                className="block w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: errors.restaurant_id ? undefined : 'var(--border-color)'
                }}
                value={formData.restaurant_id}
                onChange={e => handleInputChange('restaurant_id', e.target.value)}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Select restaurant</option>
                {restaurants.filter(rest => rest.status).map(restaurant => (
                  <option key={restaurant._id} value={restaurant._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>{restaurant.name}</option>
                ))}
              </select>
              {errors.restaurant_id && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.restaurant_id}</p>}
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
              <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Active: Dish will be visible</span>
            </div>
            <div className="flex gap-4 pt-4 justify-end">
              <Button
                type="submit"
                color="blue"
                disabled={loading}
                className="flex items-center gap-2 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {loading ? 'Saving...' : (isEditMode ? 'Update Dish' : 'Create Dish')}
              </Button>
              <Button
                type="button"
                variant="outlined"
                color="gray"
                onClick={() => navigate('/admin/dish')}
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

export default DishForm; 