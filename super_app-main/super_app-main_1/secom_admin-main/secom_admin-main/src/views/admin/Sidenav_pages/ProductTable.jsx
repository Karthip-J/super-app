import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaSearch, FaEye, FaEllipsisV } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import API_CONFIG from '../../../config/api.config';
import avatarPlaceholder from '../../../assets/img/avatars/avatar1.png';

const ProductTable = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('active');
  const dropdownRef = useRef(null);

  // Handle click outside (optional for hover-based)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // No-op for hover-based
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/products`);
      console.log('Fetched products raw response:', response.data);

      // Handle both new and old response formats
      const productsData = response.data.data || response.data || [];
      console.log('Processed products data:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search query and status
  const filteredProducts = products
    .filter(product => {
      if (statusFilter === 'active') return product.status === true;
      if (statusFilter === 'inactive') return product.status === false;
      return true; // 'all'
    })
    .filter(product =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle row selection
  const handleRowSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === currentProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(currentProducts.map(product => product._id));
    }
  };

  // Handle delete
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('OnlineShop-accessToken');
        await axios.delete(`${API_CONFIG.BASE_URL}/api/products/delete_product_by_id/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select products to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      try {
        await Promise.all(selectedProducts.map(productId =>
          axios.delete(`${API_CONFIG.BASE_URL}/api/products/${productId}`)
        ));
        toast.success('Products deleted successfully');
        setSelectedProducts([]);
        fetchProducts();
      } catch (error) {
        console.error('Error bulk deleting products:', error);
        toast.error('Failed to delete products');
      }
    }
  };

  // Handle edit
  const handleEdit = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  // Handle view
  const handleView = (productId) => {
    navigate(`/admin/products/view/${productId}`);
  };

  // Handle add new
  const handleAddNew = () => {
    navigate('/admin/products/new');
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Product Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-150 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <FaPlus className="text-sm" />
          Add New Product
        </button>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex gap-2 items-center w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px] transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <option value="all" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>All</option>
            <option value="active" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Active</option>
            <option value="inactive" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Inactive</option>
          </select>
        </div>
        {selectedProducts.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-150 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <FaTrashAlt className="text-sm" />
            Delete Selected ({selectedProducts.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div 
        className="rounded-lg shadow overflow-hidden transition-colors"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 1px 3px 0 var(--shadow-color)'
        }}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y transition-colors" style={{ borderColor: 'var(--border-color)' }}>
            <thead className="transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === currentProducts.length && currentProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                    style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                    aria-label="Select all products"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Product Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              {currentProducts.map((product) => {
                const productId = product._id;
                if (!productId) {
                  console.error('Product ID is missing:', product);
                  return null;
                }
                const imgSrc = product.photo && (product.photo.startsWith('http') || product.photo.startsWith('data:'))
                  ? product.photo
                  : product.photo
                    ? API_CONFIG.getUrl(product.photo)
                    : avatarPlaceholder;

                console.log(`Product ID: ${productId}, Photo: ${product.photo}, Calculated Img Src: ${imgSrc}`);

                return (
                  <tr 
                    key={productId} 
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
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(productId)}
                        onChange={() => handleRowSelection(productId)}
                        className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                        style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                        aria-label={`Select product ${product.name}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={imgSrc}
                        alt={product.name || 'Product Image'}
                        className="h-12 w-12 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = avatarPlaceholder;
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{product.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatPrice(product.price)}
                      </div>
                      {product.sale_price && product.sale_price > 0 && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Sale: {formatPrice(product.sale_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 10
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                      {product.brand || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                      {product.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.status
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {product.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center">
                      <div className="relative inline-block group" ref={dropdownRef}>
                        <button
                          className="transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          aria-label={`More actions for product ${product.name}`}
                          aria-haspopup="true"
                        >
                          <FaEllipsisV />
                        </button>
                        <div
                          className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2"
                        >
                          {/* <button
                            onClick={() => handleView(productId)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label={`View product ${product.name}`}
                          >
                            <FaEye />
                          </button> */}
                          <button
                            onClick={() => handleEdit(productId)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            aria-label={`Edit product ${product.name}`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(productId)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            aria-label={`Delete product ${product.name}`}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {currentProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No products found</div>
            <div className="text-gray-500 text-sm mt-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-150"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-150"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;