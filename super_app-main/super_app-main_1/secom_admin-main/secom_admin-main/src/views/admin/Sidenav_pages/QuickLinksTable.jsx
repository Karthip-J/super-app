import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import quickLinkService from '../../../services/quickLinkService';
import { categoryService } from '../../../services/categoryService';
import productService from '../../../services/productService';

const QuickLinksTable = () => {
  const [quickLinks, setQuickLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Selection states
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuickLink, setEditingQuickLink] = useState(null);

  useEffect(() => {
    fetchQuickLinks();
    fetchCategories();
  }, []);

  const fetchQuickLinks = async () => {
    try {
      setLoading(true);
      const response = await quickLinkService.getAllQuickLinks();
      if (response.success) {
        setQuickLinks(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch quick links');
      }
    } catch (err) {
      console.error('Error fetching quick links:', err);
      setError('Failed to fetch quick links');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      console.log('🔍 QuickLinks: fetchCategories response:', response);
      if (response.success) {
        setCategories(response.data || []);
      } else {
        // Handle case where response doesn't have success property
        setCategories(response.data || []);
      }
      console.log('🔍 QuickLinks: Categories state set to:', response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    console.log('🔍 QuickLinks: handleCategoryChange called with:', categoryId);
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    setSelectedProducts([]);
    setProducts([]);

    if (categoryId) {
      try {
        // Fetch subcategories for the selected category
        console.log('🔍 QuickLinks: Fetching subcategories for category:', categoryId);
        const response = await categoryService.getSubcategories(categoryId);
        console.log('🔍 QuickLinks: Subcategories response:', response);
        if (response.success) {
          setSubcategories(response.data || []);
        }

        // Fetch products for the selected category
        console.log('🔍 QuickLinks: Fetching products for category:', categoryId);
        const productsResponse = await quickLinkService.getProductsForSelection(categoryId);
        console.log('🔍 QuickLinks: Products response:', productsResponse);
        if (productsResponse.success) {
          setProducts(productsResponse.data || []);
        }
      } catch (err) {
        console.error('Error fetching subcategories/products:', err);
      }
    } else {
      setSubcategories([]);
      setProducts([]);
    }
  };

  const handleSubcategoryChange = async (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
    setSelectedProducts([]);

    if (subcategoryId && selectedCategory) {
      try {
        const response = await quickLinkService.getProductsForSelection(selectedCategory, subcategoryId);
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleBulkCreate = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    try {
      const response = await quickLinkService.bulkCreateQuickLinks(selectedProducts);
      if (response.success) {
        toast.success(response.message || 'Quick links created successfully');
        setShowAddModal(false);
        setSelectedCategory('');
        setSelectedSubcategory('');
        setSelectedProducts([]);
        setProducts([]);
        fetchQuickLinks();
      } else {
        toast.error(response.message || 'Failed to create quick links');
      }
    } catch (err) {
      console.error('Error creating quick links:', err);
      toast.error('Failed to create quick links');
    }
  };

  const handleDelete = async (quickLinkId) => {
    if (window.confirm('Are you sure you want to delete this quick link?')) {
      try {
        const response = await quickLinkService.deleteQuickLink(quickLinkId);
        if (response.success) {
          toast.success('Quick link deleted successfully');
          fetchQuickLinks();
        } else {
          toast.error(response.message || 'Failed to delete quick link');
        }
      } catch (err) {
        console.error('Error deleting quick link:', err);
        toast.error('Failed to delete quick link');
      }
    }
  };

  const handleToggleStatus = async (quickLinkId, currentStatus) => {
    try {
      const response = await quickLinkService.updateQuickLink(quickLinkId, {
        is_active: !currentStatus
      });
      if (response.success) {
        toast.success(`Quick link ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchQuickLinks();
      } else {
        toast.error(response.message || 'Failed to update quick link');
      }
    } catch (err) {
      console.error('Error updating quick link:', err);
      toast.error('Failed to update quick link');
    }
  };

  // Status colors are now handled inline with dark mode support
  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading) return <div className="flex justify-center items-center h-full" style={{ color: 'var(--text-primary)' }}>Loading...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400 text-center">{error}</div>;
  
  // Debug logging
  console.log('🔍 QuickLinks: Rendering with categories:', categories);
  console.log('🔍 QuickLinks: Categories length:', categories.length);
  console.log('🔍 QuickLinks: Selected category:', selectedCategory);
  console.log('🔍 QuickLinks: Subcategories:', subcategories);
  console.log('🔍 QuickLinks: Products:', products);

  return (
    <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Quick Links Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold flex items-center gap-2 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <FaPlus /> Add Quick Links
        </button>
      </div>

      {/* Quick Links Table */}
      <div 
        className="rounded-lg shadow overflow-hidden transition-colors"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 1px 3px 0 var(--shadow-color)'
        }}
      >
        <table className="min-w-full divide-y transition-colors" style={{ borderColor: 'var(--border-color)' }}>
          <thead className="transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            {quickLinks.map((quickLink) => (
              <tr 
                key={quickLink.id || quickLink._id}
                className="transition-colors duration-150"
                style={{ borderColor: 'var(--border-color)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={quickLink.product_id?.image || '/placeholder.png'}
                        alt={quickLink.product_id?.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {quickLink.product_id?.name || 'Unknown Product'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                  {quickLink.product_id?.category_id?.name || 'Unknown Category'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                  ₹{quickLink.product_id?.price || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    quickLink.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {getStatusText(quickLink.is_active)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                  {quickLink.display_order}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleStatus(quickLink.id || quickLink._id, quickLink.is_active)}
                      className={`transition-colors ${
                        quickLink.is_active 
                          ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' 
                          : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                      }`}
                      title={quickLink.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {quickLink.is_active ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button
                      onClick={() => handleDelete(quickLink.id || quickLink._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {quickLinks.length === 0 && (
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          No quick links found. Add some to get started!
        </div>
      )}

      {/* Add Quick Links Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div 
            className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md transition-colors"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="mt-3">
              <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Add Quick Links</h3>
              
              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Select Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                    appearance: 'auto'
                  }}
                >
                  <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Choose a category</option>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category.id || category._id} value={category.id || category._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                        {category.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>No categories available</option>
                  )}
                </select>
              </div>

              {/* Subcategory Selection */}
              {selectedCategory && subcategories.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Select Subcategory (Optional)
                  </label>
                  <select
                    value={selectedSubcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-color)'
                    }}
                  >
                    <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All subcategories</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id || subcategory._id} value={subcategory.id || subcategory._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Product Selection */}
              {products.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Select Products ({selectedProducts.length} selected)
                  </label>
                  <div 
                    className="max-h-60 overflow-y-auto border rounded p-2 transition-colors"
                    style={{ 
                      borderColor: 'var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                  >
                    {products.map((product) => (
                      <div key={product.id || product._id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={product.id || product._id}
                          checked={selectedProducts.includes(product.id || product._id)}
                          onChange={() => handleProductSelection(product.id || product._id)}
                          className="mr-2 transition-colors"
                          style={{ accentColor: '#2563eb' }}
                        />
                        <label htmlFor={product.id || product._id} className="flex items-center cursor-pointer">
                          <img
                            src={product.image || '/placeholder.png'}
                            alt={product.name}
                            className="w-8 h-8 rounded object-cover mr-2"
                          />
                          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{product.name}</span>
                          <span className="text-sm ml-2" style={{ color: 'var(--text-secondary)' }}>₹{product.price}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCategory('');
                    setSelectedSubcategory('');
                    setSelectedProducts([]);
                    setProducts([]);
                  }}
                  className="px-4 py-2 rounded transition-colors"
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
                  Cancel
                </button>
                <button
                  onClick={handleBulkCreate}
                  disabled={selectedProducts.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Add Selected ({selectedProducts.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickLinksTable;
