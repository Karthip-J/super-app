import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import taxiService from '../../../services/taxiService';
import { userService } from '../../../services/userService';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';

// Move these to the top of the file, outside the component
const defaultUsers = [
  { _id: 'default-user-1', name: 'John Doe' },
  { _id: 'default-user-2', name: 'Jane Smith' }
];
const defaultDrivers = [
  { _id: 'default-driver-1', name: 'Driver John' },
  { _id: 'default-driver-2', name: 'Driver Jane' }
];
const defaultVehicles = [
  { _id: 'default-vehicle-1', make: 'Toyota', model: 'Camry', plate_number: 'ABC123' },
  { _id: 'default-vehicle-2', make: 'Honda', model: 'Civic', plate_number: 'XYZ789' }
];

const TaxiForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Validation schema
  const validationSchema = Yup.object().shape({
    user_id: Yup.string().required('User is required'),
    driver_id: Yup.string().required('Driver is required'),
    vehicle_id: Yup.string().required('Vehicle is required'),
    pickup_address: Yup.string().required('Pickup address is required'),
    dropoff_address: Yup.string().required('Dropoff address is required'),
    fare: Yup.number()
      .required('Fare is required')
      .typeError('Fare must be a number')
      .min(0, 'Fare must be greater than or equal to 0'),
    status: Yup.string()
      .oneOf(['pending', 'accepted', 'started', 'completed', 'cancelled'])
      .required('Status is required'),
    started_at: Yup.date().nullable(),
    completed_at: Yup.date().nullable(),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: yupResolver(validationSchema)
  });

  // Fix: Always extract correct array for users, drivers, vehicles
  useEffect(() => {
    const fetchData = async () => {
      setDropdownLoading(true);
      try {
        const [driversRes, vehiclesRes, usersRes] = await Promise.all([
          taxiService.getAllTaxiDrivers(),
          taxiService.getAllTaxiVehicles(),
          userService.getAllUsers()
        ]);

        // Debug logging
        console.log('Drivers response:', driversRes);
        console.log('Vehicles response:', vehiclesRes);
        console.log('Users response:', usersRes);

        // Always extract correct array
        setDrivers(Array.isArray(driversRes.data) ? driversRes.data : driversRes.data?.drivers || driversRes.data?.data || []);
        setVehicles(Array.isArray(vehiclesRes.data) ? vehiclesRes.data : vehiclesRes.data?.vehicles || vehiclesRes.data?.data || []);
        setUsers(Array.isArray(usersRes.data?.users) ? usersRes.data.users : usersRes.data?.data || usersRes.data || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        setDrivers(defaultDrivers);
        setVehicles(defaultVehicles);
        setUsers(defaultUsers);
        toast.error('Failed to load dropdown data. Using default options.');
      } finally {
        setDropdownLoading(false);
      }
    };
    fetchData();
  }, []); // Only run once on mount

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch drivers, vehicles, and users for dropdowns
        try {
          const [driversRes, vehiclesRes, usersRes] = await Promise.all([
            taxiService.getAllTaxiDrivers(),
            taxiService.getAllTaxiVehicles(),
            userService.getAllUsers()
          ]);

          // Debug logging
          console.log('Drivers response:', driversRes);
          console.log('Vehicles response:', vehiclesRes);
          console.log('Users response:', usersRes);

          if (driversRes.success) setDrivers(driversRes.data || []);
          else {
            console.error('Failed to fetch drivers:', driversRes);
            setDrivers(defaultDrivers);
          }
          
          if (vehiclesRes.success) setVehicles(vehiclesRes.data || []);
          else {
            console.error('Failed to fetch vehicles:', vehiclesRes);
            setVehicles(defaultVehicles);
          }
          
          if (usersRes.success) setUsers(usersRes.data?.users || usersRes.data || []);
          else {
            console.error('Failed to fetch users:', usersRes);
            setUsers(defaultUsers);
          }
        } catch (error) {
          console.error('Error fetching dropdown data:', error);
          setDrivers(defaultDrivers);
          setVehicles(defaultVehicles);
          setUsers(defaultUsers);
          
          // Show error message to user
          toast.error('Failed to load dropdown data. Using default options.');
        } finally {
          setDropdownLoading(false);
        }

        if (isEdit) {
          setLoading(true);
          const res = await taxiService.getTaxiRideById(id);
          if (res.success) {
            const data = res.data;
            
            // Debug logging for date fields
            console.log('Taxi ride data received:', {
              id: data._id,
              createdAt: data.createdAt,
              started_at: data.started_at,
              completed_at: data.completed_at,
              started_at_type: typeof data.started_at,
              completed_at_type: typeof data.completed_at
            });
            
            // Helper function to safely format date
            const formatDateForInput = (dateValue) => {
              if (!dateValue) return '';
              try {
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) return '';
                return date.toISOString().slice(0, 16);
              } catch (error) {
                console.error('Error formatting date:', error, 'Value:', dateValue);
                return '';
              }
            };
            
            reset({
              user_id: data.user_id?._id || data.user_id,
              driver_id: data.driver_id?._id || data.driver_id,
              vehicle_id: data.vehicle_id?._id || data.vehicle_id,
              pickup_address: data.pickup_location?.address || '',
              dropoff_address: data.dropoff_location?.address || '',
              fare: data.fare,
              status: data.status,
              requested_at: formatDateForInput(data.createdAt),
              started_at: formatDateForInput(data.started_at),
              completed_at: formatDateForInput(data.completed_at),
            });
          } else {
            setError('Failed to load taxi ride');
            toast.error('Failed to load taxi ride');
          }
        }
      } catch (err) {
        setError('Failed to load data');
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit, reset]);

  // Add debug logging and user-friendly error messages for failed submissions
  const onSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Always use logged-in user's ID for user_id
      const userData = JSON.parse(localStorage.getItem('userData'));
      const user_id = formData.user_id || userData?._id || userData?.id;
      if (!user_id) {
        setError('User ID not found. Please log in again.');
        toast.error('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      if (!formData.driver_id || !formData.vehicle_id) {
        setError('Driver and Vehicle are required.');
        toast.error('Driver and Vehicle are required.');
        setLoading(false);
        return;
      }
      const data = {
        user_id,
        driver_id: formData.driver_id,
        vehicle_id: formData.vehicle_id,
        pickup_location: {
          address: formData.pickup_address
        },
        dropoff_location: {
          address: formData.dropoff_address
        },
        fare: formData.fare,
        status: formData.status,
        started_at: formData.started_at || null,
        completed_at: formData.completed_at || null,
      };
      console.log('Submitting taxi ride data:', data);
      if (isEdit) {
        await taxiService.updateTaxiRide(id, data);
        toast.success('Taxi ride updated successfully');
      } else {
        await taxiService.createTaxiRide(data);
        toast.success('Taxi ride created successfully');
      }
      navigate('/admin/taxi-rides');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save taxi ride';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Taxi ride submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) return <div className="flex justify-center items-center h-full" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>Loading...</div>;

  // Add debug log for validation errors
  console.log('Form validation errors:', errors);

  return (
    <div className="p-4 max-w-2xl mx-auto" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{isEdit ? 'Edit Taxi Ride' : 'Add Taxi Ride'}</h2>
      {error && <div className="text-red-500 dark:text-red-400 mb-2">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>User</label>
            <select 
              {...register('user_id')} 
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.user_id ? undefined : 'var(--border-color)'
              }}
              disabled={dropdownLoading}
            >
              <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>{dropdownLoading ? 'Loading users...' : 'Select User'}</option>
              {Array.isArray(users) && users.map(user => (
                <option key={user._id} value={user._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                  {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}
                </option>
              ))}
            </select>
            {errors.user_id && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.user_id.message}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Driver</label>
            <select 
              {...register('driver_id')} 
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.driver_id ? undefined : 'var(--border-color)'
              }}
              disabled={dropdownLoading}
            >
              <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>{dropdownLoading ? 'Loading drivers...' : 'Select Driver'}</option>
              {Array.isArray(drivers) && drivers.map(driver => (
                <option key={driver._id} value={driver._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                  {driver.name}
                </option>
              ))}
            </select>
            {errors.driver_id && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.driver_id.message}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Vehicle</label>
            <select 
              {...register('vehicle_id')} 
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.vehicle_id ? undefined : 'var(--border-color)'
              }}
              disabled={dropdownLoading}
            >
              <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>{dropdownLoading ? 'Loading vehicles...' : 'Select Vehicle'}</option>
              {Array.isArray(vehicles) && vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                  {vehicle.make} {vehicle.model} - {vehicle.plate_number}
                </option>
              ))}
            </select>
            {errors.vehicle_id && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.vehicle_id.message}</p>}
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
              <option value="pending" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Requested</option>
              <option value="accepted" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Accepted</option>
              <option value="started" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Started</option>
              <option value="completed" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Completed</option>
              <option value="cancelled" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Cancelled</option>
            </select>
            {errors.status && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.status.message}</p>}
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Pickup Location</label>
          <input 
            {...register('pickup_address')} 
            placeholder="Pickup Address" 
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: errors.pickup_address ? undefined : 'var(--border-color)'
            }}
          />
          {errors.pickup_address && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.pickup_address.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Dropoff Location</label>
          <input 
            {...register('dropoff_address')} 
            placeholder="Dropoff Address" 
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: errors.dropoff_address ? undefined : 'var(--border-color)'
            }}
          />
          {errors.dropoff_address && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.dropoff_address.message}</p>}
        </div>

        <div>
          <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Fare</label>
          <input 
            type="number" 
            step="0.01" 
            {...register('fare')} 
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderColor: errors.fare ? undefined : 'var(--border-color)'
            }}
          />
          {errors.fare && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.fare.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Requested At</label>
            <input 
              type="datetime-local" 
              {...register('requested_at')} 
              className="w-full border rounded-md px-3 py-2 focus:outline-none transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-color)'
              }}
              readOnly
              disabled
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>This is automatically set when the ride is created</p>
          </div>

          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Started At </label>
            <input 
              type="datetime-local" 
              {...register('started_at')} 
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.started_at ? undefined : 'var(--border-color)'
              }}
            />
            {errors.started_at && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{"Select a valid starting date & time"}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Completed At </label>
            <input 
              type="datetime-local" 
              {...register('completed_at')} 
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: errors.completed_at ? undefined : 'var(--border-color)'
              }}
            />
            {errors.completed_at && <p className="text-red-500 dark:text-red-400 text-sm mt-1">{"Select a valid ending date & time"}</p>}
          </div>
        </div>

        <div className="flex space-x-4">
          <button 
            type="submit" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            onClick={() => console.log('Add Taxi Ride button clicked!')}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Taxi Ride' : 'Add Taxi Ride'}
          </button>
          <button 
            type="button" 
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
            onClick={() => navigate('/admin/taxi-rides')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaxiForm; 