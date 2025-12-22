import React, { useState, useEffect } from 'react';
import groceryService from '../../../services/groceryService';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrashAlt, FaPlus, FaSpinner, FaCheckCircle, FaTimesCircle, FaEllipsisV } from 'react-icons/fa';
import API_CONFIG from '../../../config/api.config';

const GroceryTable = () => {
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'inactive'

  useEffect(() => {
    fetchGroceries();
  }, []);

  const fetchGroceries = async () => {
    setLoading(true);
    try {
      const response = await groceryService.getAllGroceries();
      if (response.success) {
        setGroceries(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch groceries');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grocery item?')) {
      try {
        await groceryService.deleteGrocery(id);
        toast.success('Grocery deleted successfully');
        fetchGroceries(); // Re-fetch to update the list
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete grocery');
      }
    }
  };

  // Filter and sort groceries
  const filteredGroceries = groceries
    .filter(grocery => {
      if (statusFilter === 'active') return grocery.status === true;
      if (statusFilter === 'inactive') return grocery.status === false;
      return true; // 'all'
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <ToastContainer />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Grocery Management</h1>
        <div className="flex gap-2 items-center">
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
          <Link to="/admin/groceries/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 dark:bg-blue-500 dark:hover:bg-blue-600">
            <FaPlus className="mr-2" /> Add New Grocery
          </Link>
        </div>
      </div>
      <div 
        className="shadow-md rounded-lg overflow-x-auto transition-colors"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 1px 3px 0 var(--shadow-color)'
        }}
      >
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400 text-center p-8">{error}</div>
        ) : (
          <table className="min-w-full divide-y transition-colors" style={{ borderColor: 'var(--border-color)' }}>
            <thead className="transition-colors" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              {filteredGroceries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center" style={{ color: 'var(--text-secondary)' }}>No groceries found.</td>
                </tr>
              ) : (
                filteredGroceries.map((grocery) => (
                  <tr 
                    key={grocery.id} 
                    className="transition-colors duration-150"
                    style={{ borderColor: 'var(--border-color)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    }}
                  >
                    <td className="px-6 py-4">
                      <img
                        src={grocery.image ? API_CONFIG.getUrl(grocery.image) : 'https://via.placeholder.com/64'}
                        alt={grocery.name}
                        className="h-16 w-16 object-cover rounded-lg border transition-colors"
                        style={{ borderColor: 'var(--border-color)' }}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ color: 'var(--text-primary)' }}>{grocery.name}</td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                      <div>Original: ${grocery.original_price}</div>
                      <div>Discount: ${grocery.discounted_price}</div>
                    </td>
                    <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>{grocery.category}</td>
                    <td className="px-6 py-4">
                      {grocery.status ? (
                        <FaCheckCircle className="text-green-500 dark:text-green-400 text-xl" />
                      ) : (
                        <FaTimesCircle className="text-red-500 dark:text-red-400 text-xl" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium flex justify-center">
                      <div className="relative inline-block group">
                        <button
                          className="transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          aria-label={`Actions for ${grocery.name}`}
                        >
                          <FaEllipsisV />
                        </button>
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          <Link
                            to={`/admin/groceries/edit/${grocery.id}`}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            aria-label={`Edit ${grocery.name}`}
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(grocery.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            aria-label={`Delete ${grocery.name}`}
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GroceryTable;