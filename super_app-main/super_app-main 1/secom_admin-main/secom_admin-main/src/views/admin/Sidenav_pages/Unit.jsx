import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/apiUtils';
import API_CONFIG from '../../../config/api.config';

function Unit() {
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    unit_name: '',
    unit_symbol: ''
  });
  const [editUnit, setEditUnit] = useState(null);
  const [unitToDelete, setUnitToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const data = await apiGet(API_CONFIG.ENDPOINTS.ADMIN.UNITS);
      setTableData(data);
    } catch (error) {
      toast.error('Error fetching units');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await apiPut(`${API_CONFIG.ENDPOINTS.ADMIN.UNITS}/${editUnit.id}`, formData);
        toast.success('Unit updated successfully');
      } else {
        await apiPost(API_CONFIG.ENDPOINTS.ADMIN.UNITS, formData);
        toast.success('Unit created successfully');
      }
      setIsModalOpen(false);
      fetchUnits();
      resetForm();
    } catch (error) {
      toast.error('Error saving unit');
    }
  };

  const handleEdit = (unit) => {
    setEditUnit(unit);
    setFormData({
      unit_name: unit.unit_name,
      unit_symbol: unit.unit_symbol
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await apiDelete(`${API_CONFIG.ENDPOINTS.ADMIN.UNITS}/${unitToDelete}`);
      toast.success('Unit deleted successfully');
      setIsDeleteModalOpen(false);
      fetchUnits();
    } catch (error) {
      toast.error('Error deleting unit');
    }
  };

  const resetForm = () => {
    setFormData({
      unit_name: '',
      unit_symbol: ''
    });
    setEditUnit(null);
    setIsEditMode(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Units</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <FaPlus className="mr-2" /> Add Unit
        </button>
      </div>

      {/* Unit Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((unit) => (
              <tr key={unit.id}>
                <td className="px-6 py-4 whitespace-nowrap">{unit.unit_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{unit.unit_symbol}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleEdit(unit)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setUnitToDelete(unit.id);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? 'Edit Unit' : 'Add Unit'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Unit Name
                </label>
                <input
                  type="text"
                  name="unit_name"
                  value={formData.unit_name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Unit Symbol
                </label>
                <input
                  type="text"
                  name="unit_symbol"
                  value={formData.unit_symbol}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {isEditMode ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this unit?</p>
            <div className="flex justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}

export default Unit; 