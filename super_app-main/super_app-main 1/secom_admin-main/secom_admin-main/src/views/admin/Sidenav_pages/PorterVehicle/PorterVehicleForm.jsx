import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { toast } from 'react-toastify';
import PorterVehicleService from '../../../../services/porterVehicleService';
import PorterDriverService from '../../../../services/porterDriverService';

const PorterVehicleForm = ({ vehicle, onSave, onCancel }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    vehicle_number: '',
    model: '',
    make: '',
    vehicle_type: 'Bike',
    capacity: 2,
    status: 'active',
    driver_id: '' // Add driver_id field
  });
  const [loading, setLoading] = useState(false);
  const [fetchingVehicle, setFetchingVehicle] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [drivers, setDrivers] = useState([]); // Add drivers state
  const [fetchingDrivers, setFetchingDrivers] = useState(false); // Add loading state for drivers

  useEffect(() => {
    // Fetch all drivers when component mounts
    fetchDrivers();
    
    // Check if we're in edit mode (either from props or URL params)
    const editId = vehicle?._id || id;
    if (editId) {
      setIsEditMode(true);
      fetchVehicleData(editId);
    }
  }, [vehicle, id]);

  // Debug useEffect to log formData changes
  useEffect(() => {
    console.log('Form data updated:', formData);
    console.log('Current driver_id:', formData.driver_id);
    console.log('Available drivers:', drivers);
  }, [formData, drivers]);

  // Validate driver_id when drivers are loaded
  useEffect(() => {
    if (drivers.length > 0 && formData.driver_id) {
      const driverExists = drivers.find(d => d._id === formData.driver_id);
      if (!driverExists) {
        console.warn('Current driver_id not found in drivers list, clearing it');
        setFormData(prev => ({ ...prev, driver_id: '' }));
      }
    }
  }, [drivers, formData.driver_id]);

  // Add function to fetch all drivers
  const fetchDrivers = async () => {
    try {
      setFetchingDrivers(true);
      const response = await PorterDriverService.getAllDrivers();
      if (response.success) {
        const driversData = response.data || [];
        console.log('Fetched drivers:', driversData);
        setDrivers(driversData);
      } else {
        console.error('Failed to fetch drivers:', response.message);
        toast.error('Failed to load drivers');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    } finally {
      setFetchingDrivers(false);
    }
  };

  const fetchVehicleData = async (vehicleId) => {
    if (!vehicleId) return;
    
    try {
      setFetchingVehicle(true);
      const response = await PorterVehicleService.getVehicleById(vehicleId);
      if (response.success) {
        const vehicleData = response.data;
        console.log('Vehicle data received:', vehicleData);
        
        // Handle driver_id - it could be a string ID or a populated object
        let driverId = '';
        if (vehicleData.driver_id) {
          if (typeof vehicleData.driver_id === 'string') {
            driverId = vehicleData.driver_id;
          } else if (vehicleData.driver_id._id) {
            driverId = vehicleData.driver_id._id;
          }
        }
        console.log('Extracted driver_id:', driverId);
        
        setFormData({
          vehicle_number: vehicleData.vehicle_number || '',
          model: vehicleData.model || '',
          make: vehicleData.make || '',
          vehicle_type: vehicleData.vehicle_type || 'Bike',
          capacity: vehicleData.capacity || 2,
          status: vehicleData.status || 'active',
          driver_id: driverId
        });
      } else {
        toast.error('Failed to load vehicle data');
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      toast.error('Failed to load vehicle data');
    } finally {
      setFetchingVehicle(false);
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
    setLoading(true);

    try {
      // Include driver_id in the submission if selected
      const dataToSubmit = {
        ...formData
      };
      
      // Only include driver_id if it's selected
      if (!dataToSubmit.driver_id) {
        delete dataToSubmit.driver_id;
      }

      let response;
      const vehicleId = vehicle?._id || id;
      if (isEditMode && vehicleId) {
        response = await PorterVehicleService.updateVehicle(vehicleId, dataToSubmit);
      } else {
        response = await PorterVehicleService.createVehicle(dataToSubmit);
      }

      if (response.success) {
        toast.success(isEditMode ? 'Vehicle updated successfully' : 'Vehicle created successfully');
        // Navigate back to the list page
        navigate('/admin/porter-vehicles');
      } else {
        toast.error(response.message || 'Failed to save vehicle');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to the list page
    navigate('/admin/porter-vehicles');
  };

  const getCapacityOptions = (vehicleType) => {
    switch (vehicleType) {
      case 'Bike':
        return [1, 2];
      case 'Auto':
        return [2, 3, 4];
      case 'Mini-Truck':
        return [4, 6, 8, 10];
      default:
        return [1, 2, 3, 4];
    }
  };

  // Helper function to get driver display text
  const getDriverDisplayText = (driverId) => {
    if (!driverId) return '';
    const driver = drivers.find(d => d._id === driverId);
    return driver ? driver.name : '';
  };

  // Helper function to get driver name by ID
  const getDriverNameById = (driverId) => {
    if (!driverId) return '';
    const driver = drivers.find(d => d._id === driverId);
    return driver ? driver.name : '';
  };

  if (fetchingVehicle) {
    return (
      <Card className="w-full">
        <CardBody>
          <Typography>Loading vehicle data...</Typography>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card 
      className="w-full transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <CardHeader floated={false} shadow={false} className="rounded-none">
       <Typography 
          variant="h5" 
          className="transition-colors duration-300"
          style={{ color: 'var(--text-primary)' }}
        >
          {isEditMode ? 'Edit Porter Vehicle' : 'Add New Porter Vehicle'}
        </Typography>
        <Typography 
          className="mt-1 font-normal transition-colors duration-300"
          style={{ color: 'var(--text-secondary)' }}
        >
          {isEditMode ? 'Update vehicle information' : 'Create a new porter vehicle'}
        </Typography>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Vehicle Number<span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="vehicle_number"
                value={formData.vehicle_number}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Make <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Model <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.vehicle_type}
                onChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    vehicle_type: value,
                    capacity: getCapacityOptions(value)[0] // Reset capacity based on type
                  }));
                }}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <Option value="Bike">Bike</Option>
                <Option value="Auto">Auto</Option>
                <Option value="Mini-Truck">Mini-Truck</Option>
              </Select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Capacity <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.capacity.toString()}
                onChange={(value) => setFormData(prev => ({ ...prev, capacity: parseInt(value) }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                {getCapacityOptions(formData.vehicle_type).map(capacity => (
                  <Option key={capacity} value={capacity.toString()}>
                    {capacity} persons
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Status
              </label>
              <Select
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <Option value="active">Active</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2 transition-colors duration-300"
                style={{ color: 'var(--text-primary)' }}
              >
                Driver (Optional)
              </label>
              <select
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
                value={formData.driver_id || ''}
                onChange={(e) => {
                  console.log('Driver dropdown changed to:', e.target.value);
                  setFormData(prev => ({ ...prev, driver_id: e.target.value }));
                }}
                disabled={fetchingDrivers}
              >
                <option value="">No Driver Assigned</option>
                {drivers.map(driver => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name}
                  </option>
                ))}
              </select>
              {fetchingDrivers && (
                <Typography 
                  variant="small" 
                  className="mt-1 transition-colors duration-300"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Loading drivers...
                </Typography>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outlined"
              color="red"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Vehicle' : 'Create Vehicle')}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default PorterVehicleForm;