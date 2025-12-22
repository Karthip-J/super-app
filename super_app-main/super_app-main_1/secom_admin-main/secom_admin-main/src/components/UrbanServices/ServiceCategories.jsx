import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [categoryServices, setCategoryServices] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    image: '',
    pricingType: 'fixed',
    minPrice: '',
    maxPrice: '',
    estimatedDuration: '',
    serviceAreas: ['All Cities'],
    metaTitle: '',
    metaDescription: '',
    isActive: true
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/urban-services/categories`);
      console.log('Categories response:', response.data);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesForCategory = async (categoryId) => {
    try {
      console.log(`Fetching services for category: ${categoryId}`);
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/urban-services/services?category=${categoryId}`);
      console.log('Services response:', response.data);
      setCategoryServices(prev => ({
        ...prev,
        [categoryId]: response.data.data || []
      }));
    } catch (error) {
      console.error('Error fetching services:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const toggleCategoryExpansion = async (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      if (!categoryServices[categoryId]) {
        await fetchServicesForCategory(categoryId);
      }
    }
    
    setExpandedCategories(newExpanded);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/upload/image`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Image file:', imageFile);
    console.log('Editing category:', editingCategory);
    
    setSubmitting(true);
    setError('');

    try {
      let imageUrl = formData.image;
      
      // Upload image if a new file is selected
      if (imageFile) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(imageFile);
        console.log('Image uploaded successfully:', imageUrl);
      }

      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const categoryData = {
        ...formData,
        image: imageUrl
      };
      
      console.log('Category data:', categoryData);
      
      let response;
      if (editingCategory) {
        // Update existing category
        response = await axios.put(`${API_CONFIG.BASE_URL}/api/urban-services/categories/${editingCategory._id}`, categoryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Create new category
        response = await axios.post(`${API_CONFIG.BASE_URL}/api/urban-services/categories`, categoryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ 
          name: '', 
          slug: '',
          description: '', 
          icon: '',
          image: '',
          pricingType: 'fixed',
          minPrice: '',
          maxPrice: '',
          estimatedDuration: '',
          serviceAreas: ['All Cities'],
          metaTitle: '',
          metaDescription: '',
          isActive: true 
        });
        setImageFile(null);
        setImagePreview('');
        fetchCategories(); // Refresh the categories list
      }
    } catch (error) {
      console.error('Error saving category:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setError('');
    setEditingCategory(null);
    setFormData({ 
      name: '', 
      slug: '',
      description: '', 
      icon: '',
      image: '',
      pricingType: 'fixed',
      minPrice: '',
      maxPrice: '',
      estimatedDuration: '',
      serviceAreas: ['All Cities'],
      metaTitle: '',
      metaDescription: '',
      isActive: true 
    });
    setImageFile(null);
    setImagePreview('');
  };

  const openEditModal = (category) => {
    console.log('Opening edit modal for category:', category);
    setShowModal(true);
    setError('');
    setEditingCategory(category);
    setFormData({ 
      name: category.name || '', 
      slug: category.slug || '',
      description: category.description || '', 
      icon: category.icon || '',
      image: category.image || '',
      pricingType: category.pricingType || 'fixed',
      minPrice: category.minPrice || '',
      maxPrice: category.maxPrice || '',
      estimatedDuration: category.estimatedDuration || '',
      serviceAreas: category.serviceAreas || ['All Cities'],
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setImageFile(null);
    
    // Set image preview with proper URL handling
    if (category.image) {
      const imageUrl = category.image.startsWith('http') ? category.image : `${API_CONFIG.BASE_URL}${category.image}`;
      console.log('Setting image preview to:', imageUrl);
      setImagePreview(imageUrl);
    } else {
      setImagePreview('');
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await axios.delete(`${API_CONFIG.BASE_URL}/api/urban-services/categories/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        fetchCategories(); // Refresh the categories list
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Categories</h1>
        <button 
          onClick={openModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Services
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <div className="text-lg font-medium mb-2">No categories found</div>
                    <div className="text-sm">Click "Add Category" to create your first service category</div>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <React.Fragment key={category._id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image ? (
                        <img 
                          src={category.image.startsWith('http') ? category.image : `${API_CONFIG.BASE_URL}${category.image}`}
                          alt={category.name}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center" style={{display: category.image ? 'none' : 'flex'}}>
                        <span className="text-gray-500 text-xs">No img</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{category.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleCategoryExpansion(category._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {expandedCategories.has(category._id) ? 'Hide' : 'Show'} Services
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => openEditModal(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteCategory(category._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  
                  {/* Services Row */}
                  {expandedCategories.has(category._id) && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Services in {category.name}</h4>
                          {categoryServices[category._id] && categoryServices[category._id].length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                              {categoryServices[category._id].map((service) => (
                                <div key={service._id} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex items-start space-x-3">
                                    {service.image && (
                                      <img 
                                        src={service.image.startsWith('http') ? service.image : `${API_CONFIG.BASE_URL}${service.image}`}
                                        alt={service.name}
                                        className="h-12 w-12 rounded object-cover"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <h5 className="text-sm font-medium text-gray-900">{service.name}</h5>
                                      <p className="text-xs text-gray-600 mt-1">{service.shortDescription || service.description?.substring(0, 100)}...</p>
                                      <div className="flex items-center space-x-4 mt-2">
                                        <span className="text-xs font-medium text-green-600">
                                          ₹{service.pricing?.basePrice || 0}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {service.duration || 60} {service.durationUnit || 'minutes'}
                                        </span>
                                        {service.popular && (
                                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                            Popular
                                          </span>
                                        )}
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          service.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          {service.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              No services found in this category
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Category Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slug">
                    Slug*
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="category-name-url"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description*
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="icon">
                    Icon
                  </label>
                  <input
                    type="text"
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="ac, plumbing, electrician, etc."
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pricingType">
                    Pricing Type*
                  </label>
                  <select
                    id="pricingType"
                    name="pricingType"
                    value={formData.pricingType}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Hourly Rate</option>
                    <option value="quote">Quote Based</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="minPrice">
                      Minimum Price*
                    </label>
                    <input
                      type="number"
                      id="minPrice"
                      name="minPrice"
                      value={formData.minPrice}
                      onChange={handleInputChange}
                      placeholder="299"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="maxPrice">
                      Maximum Price*
                    </label>
                    <input
                      type="number"
                      id="maxPrice"
                      name="maxPrice"
                      value={formData.maxPrice}
                      onChange={handleInputChange}
                      placeholder="1999"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="estimatedDuration">
                    Estimated Duration (minutes)*
                  </label>
                  <input
                    type="number"
                    id="estimatedDuration"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange}
                    placeholder="90"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="serviceAreas">
                    Service Areas*
                  </label>
                  <input
                    type="text"
                    id="serviceAreas"
                    name="serviceAreas"
                    value={formData.serviceAreas.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      serviceAreas: e.target.value.split(',').map(area => area.trim()).filter(area => area)
                    }))}
                    placeholder="All Cities, Chennai, Bangalore"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="metaTitle">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="SEO Title"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="metaDescription">
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="SEO Description"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                    Category Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-20 w-20 object-cover rounded"
                        onError={(e) => {
                          console.error('Image preview failed to load:', imagePreview);
                          e.target.onerror = null;
                          setImagePreview('');
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current image</p>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update Category' : 'Create Category')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCategories;
