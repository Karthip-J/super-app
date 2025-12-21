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
  Textarea,
} from "@material-tailwind/react";
import { toast } from 'react-toastify';
import PorterDriverService from '../../../../services/porterDriverService';

const PorterDriverForm = ({ driver, onSave, onCancel }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    license_number: '',
    status: 'active',
    current_location: {
      address: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [fetchingDriver, setFetchingDriver] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Check if we're in edit mode (either from props or URL params)
    const editId = driver?._id || id;
    if (editId) {
      setIsEditMode(true);
      fetchDriverData(editId);
    }
  }, [driver, id]);

  const fetchDriverData = async (driverId) => {
    if (!driverId) return;
    
    try {
      setFetchingDriver(true);
      const response = await PorterDriverService.getDriverById(driverId);
      if (response.success) {
        const driverData = response.data;
        setFormData({
          name: driverData.name || '',
          phone: driverData.phone || '',
          email: driverData.email || '',
          license_number: driverData.license_number || '',
          status: driverData.status || 'active',
          current_location: {
            address: driverData.current_location?.address || ''
          }
        });
      } else {
        toast.error('Failed to load driver data');
      }
    } catch (error) {
      console.error('Error fetching driver:', error);
      toast.error('Failed to load driver data');
    } finally {
      setFetchingDriver(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for phone number
    if (name === 'phone') {
      // Only allow digits and limit to 10 characters
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: phoneValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      current_location: {
        ...prev.current_location,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number
    if (formData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    
    setLoading(true);

    try {
      // Get user_id from localStorage (similar to Taxi driver)
      const userData = JSON.parse(localStorage.getItem('userData'));
      const user_id = userData?._id || userData?.id;
      
      const dataToSubmit = {
        ...formData,
        user_id: user_id || 'demo-user-id' // Fallback for demo
      };

      let response;
      const driverId = driver?._id || id;
      if (isEditMode && driverId) {
        response = await PorterDriverService.updateDriver(driverId, dataToSubmit);
      } else {
        response = await PorterDriverService.createDriver(dataToSubmit);
      }

      if (response.success) {
        toast.success(isEditMode ? 'Driver updated successfully' : 'Driver created successfully');
        // Navigate back to the list page
        navigate('/admin/porter-drivers');
      } else {
        toast.error(response.message || 'Failed to save driver');
      }
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error('Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to the list page
    navigate('/admin/porter-drivers');
  };

  if (fetchingDriver) {
    return (
      <Card className="w-full">
        <CardBody>
          <Typography>Loading driver data...</Typography>
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
          {isEditMode ? 'Edit Porter Driver' : 'Add New Porter Driver'}
        </Typography>
        <Typography 
          className="mt-1 font-normal transition-colors duration-300"
          style={{ color: 'var(--text-secondary)' }}
        >
          {isEditMode ? 'Update driver information' : 'Create a new porter driver'}
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
                Driver Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
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
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="Enter 10 digit number"
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
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., driver@example.com"
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
                License Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="license_number"
                value={formData.license_number}
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
                <Option value="inactive">Inactive</Option>
                <Option value="offline">Offline</Option>
              </Select>
            </div>
          </div>

          <div>
            <Typography 
              variant="h6" 
              className="mb-3 transition-colors duration-300"
              style={{ color: 'var(--text-primary)' }}
            >
              Current Location
            </Typography>
            <label 
              className="block text-sm font-medium mb-2 transition-colors duration-300"
              style={{ color: 'var(--text-primary)' }}
            >
              Address
            </label>
            <Input
              type="text"
              value={formData.current_location.address}
              onChange={(e) => handleLocationChange('address', e.target.value)}
              placeholder="e.g., Main Street, City Center"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-300"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)'
              }}
            />
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
              {loading ? 'Saving...' : (isEditMode ? 'Update Driver' : 'Create Driver')}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default PorterDriverForm;