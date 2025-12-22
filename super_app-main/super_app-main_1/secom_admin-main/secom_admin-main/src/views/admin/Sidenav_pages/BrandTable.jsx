import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaPlus, FaSearch, FaEllipsisV } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import brandService from '../../../services/brandService';
import API_CONFIG from '../../../config/api.config';

const BrandTable = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('active');
  const [clickedEdit, setClickedEdit] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await brandService.getAllBrands();
      console.log('Fetched brands:', response);
      setBrands(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to fetch brands');
    } finally {
      setLoading(false);
    }
  };

  // Filter brands based on search query and status
  const filteredBrands = brands
    .filter(brand => {
      if (statusFilter === 'active') return brand.status === true;
      if (statusFilter === 'inactive') return brand.status === false;
      return true; // 'all'
    })
    .filter(brand =>
      brand.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBrands = filteredBrands.slice(startIndex, endIndex);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Handle row selection
  const handleRowSelection = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedBrands.length === currentBrands.length) {
      setSelectedBrands([]);
    } else {
      setSelectedBrands(currentBrands.map(brand => brand.id));
    }
  };

  // Handle delete
  const handleDelete = async (brandId) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await brandService.deleteBrand(brandId);
        toast.success('Brand deleted successfully');
        fetchBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
        toast.error('Failed to delete brand');
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedBrands.length === 0) {
      toast.warning('Please select brands to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedBrands.length} brands?`)) {
      try {
        await brandService.bulkDeleteBrands(selectedBrands);
        toast.success('Brands deleted successfully');
        setSelectedBrands([]);
        fetchBrands();
      } catch (error) {
        console.error('Error bulk deleting brands:', error);
        toast.error('Failed to delete brands');
      }
    }
  };

  // Handle edit
  const handleEdit = (brandId) => {
    if (!brandId) {
      console.error('Brand ID is missing');
      toast.error('Unable to edit: Brand ID is missing');
      return;
    }
    try {
      setClickedEdit(brandId);
      const editPath = `/admin/brands/edit/${brandId}`;
      console.log('Navigating to:', editPath);
      navigate(editPath);
    } catch (error) {
      console.error('Error navigating to edit page:', error);
      toast.error('Failed to navigate to edit page');
    }
  };

  // Handle add new
  const handleAddNew = () => {
    navigate('/admin/brands/new');
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
      <ToastContainer />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Brand Management</h1>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <FaPlus className="text-sm" />
          Add New Brand
        </button>
      </div>

      {/* Search and Actions */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex gap-2 items-center w-full max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors" style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search brands..."
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
        {selectedBrands.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors dark:bg-red-500 dark:hover:bg-red-600"
          >
            <FaTrashAlt className="text-sm" />
            Delete Selected ({selectedBrands.length})
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
        <table className="min-w-full divide-y transition-colors" style={{ borderColor: 'var(--border-color)' }}>
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedBrands.length === currentBrands.length && currentBrands.length > 0}
                  onChange={handleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                  style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                  aria-label="Select all brands"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Brand Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Brand Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Created At
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            {currentBrands.map((brand) => (
              <tr 
                key={brand.id} 
                className="transition-colors"
                style={{ 
                  borderColor: 'var(--border-color)'
                }}
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
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => handleRowSelection(brand.id)}
                    className="rounded text-blue-600 focus:ring-blue-500 transition-colors"
                    style={{ borderColor: 'var(--border-color)', accentColor: '#2563eb' }}
                    aria-label={`Select ${brand.name}`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {brand.photo ? (
                    <img
                      src={API_CONFIG.getUrl(brand.photo)}
                      alt={brand.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {brand.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      brand.status === true 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {brand.status === true ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(brand.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-center">
                  <div className="relative inline-block group">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(brand.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        aria-label={`Edit ${brand.name}`}
                        title="Edit Brand"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                        aria-label={`Delete ${brand.name}`}
                        title="Delete Brand"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {currentBrands.length === 0 && (
          <div className="text-center py-8">
            <p style={{ color: 'var(--text-secondary)' }}>No brands found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredBrands.length)} of {filteredBrands.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }
              }}
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm" style={{ color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-secondary)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandTable;