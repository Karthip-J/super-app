import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import taxiService from '../../../services/taxiService';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

console.log('TaxiDriverForm.jsx component file loaded and executing.');

const TaxiDriverForm = () => {
  console.log('TaxiDriverForm component rendering...');
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    phone: Yup.string().required('Phone is required'),
    license_number: Yup.string().required('License number is required'),
    status: Yup.string().oneOf(['active', 'inactive', 'offline']).required('Status is required'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema)
  });

  useEffect(() => {
    console.log('TaxiDriverForm useEffect hook triggered. Edit mode:', isEdit);
    if (isEdit) {
      setLoading(true);
      taxiService.getTaxiDriverById(id)
        .then((response) => {
          if (response.success) {
            const data = response.data;
            reset({
              name: data.name,
              phone: data.phone,
              license_number: data.license_number,
              status: data.status,
            });
          } else {
            setError('Failed to load taxi driver');
            toast.error('Failed to load taxi driver');
          }
        })
        .catch(() => {
          setError('Failed to load taxi driver');
          toast.error('Failed to load taxi driver');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Get user_id from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      const user_id = userData?._id || userData?.id;
      if (!user_id) {
        setError('User ID not found. Please log in again.');
        toast.error('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      const dataToSubmit = {
        ...formData,
        user_id,
      };
      console.log('Submitting taxi driver data:', dataToSubmit);
      if (isEdit) {
        console.log('Updating taxi driver with ID:', id);
        const response = await taxiService.updateTaxiDriver(id, dataToSubmit);
        console.log('Update response:', response);
        toast.success('Taxi driver updated successfully');
      } else {
        console.log('Creating new taxi driver');
        const response = await taxiService.createTaxiDriver(dataToSubmit);
        console.log('Create response:', response);
        toast.success('Taxi driver created successfully');
      }
      navigate('/admin/taxi-drivers');
    } catch (err) {
      console.error('Error in form submission:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || 'Failed to save taxi driver';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <div className="flex justify-center items-center h-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Edit Taxi Driver' : 'Add Taxi Driver'}</h2>
      {error && <div className="text-red-500 dark:text-red-400 mb-2">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Name</label>
          <input 
            {...register('name')} 
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: errors.name ? undefined : 'var(--border-color)'
            }}
            placeholder="Enter driver name"
          />
          {errors.name && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Phone</label>
          <input 
            {...register('phone')} 
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: errors.phone ? undefined : 'var(--border-color)'
            }}
            placeholder="Enter phone number"
          />
          {errors.phone && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>License Number</label>
          <input 
            {...register('license_number')} 
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: errors.license_number ? undefined : 'var(--border-color)'
            }}
            placeholder="Enter license number"
          />
          {errors.license_number && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.license_number.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Status</label>
          <select 
            {...register('status')} 
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: errors.status ? undefined : 'var(--border-color)'
            }}
          >
            <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Select Status</option>
            <option value="inactive" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Inactive</option>
            <option value="active" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Active</option>
            <option value="offline" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Offline</option>
          </select>
          {errors.status && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.status.message}</p>}
        </div>

        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Driver' : 'Create Driver')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/admin/taxi-drivers')}
            className="flex-1 px-4 py-2 border rounded-md transition-colors"
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
        </div>
      </form>
    </div>
  );
};

export default TaxiDriverForm; 