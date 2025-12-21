import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riderAPI } from '../config/superAppApi';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    vehicleType: 'Bike',
    vehicleModel: '',
    vehicleNumber: '',
    vehicleColor: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only allow 10 digits
    if (name === 'phone') {
      const phoneRegex = /^\d{0,10}$/;
      if (!phoneRegex.test(value)) {
        return; // Don't update if invalid
      }
    }
    
    setForm({ ...form, [name]: value });
    setError('');
    
    // Clear error for this field when user starts typing
    if (touched[name]) {
      setTouched({ ...touched, [name]: false });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (!form.name.trim()) {
      errors.name = 'Full name is required';
    } else if (form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Phone validation
    if (!form.phone) {
      errors.phone = 'Phone number is required';
    } else if (form.phone.length !== 10) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }
    
    // Password validation
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    // Confirm password validation
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // License number validation
    if (!form.licenseNumber.trim()) {
      errors.licenseNumber = 'License number is required';
    } else if (form.licenseNumber.trim().length < 5) {
      errors.licenseNumber = 'Please enter a valid license number';
    }
    
    // Vehicle model validation
    if (!form.vehicleModel.trim()) {
      errors.vehicleModel = 'Vehicle model is required';
    } else if (form.vehicleModel.trim().length < 2) {
      errors.vehicleModel = 'Please enter a valid vehicle model';
    }
    
    // Vehicle number validation
    if (!form.vehicleNumber.trim()) {
      errors.vehicleNumber = 'Vehicle number is required';
    } else if (form.vehicleNumber.trim().length < 5) {
      errors.vehicleNumber = 'Please enter a valid vehicle number';
    }
    
    // Vehicle color validation
    if (!form.vehicleColor.trim()) {
      errors.vehicleColor = 'Vehicle color is required';
    } else if (form.vehicleColor.trim().length < 2) {
      errors.vehicleColor = 'Please enter a valid vehicle color';
    }
    
    return errors;
  };

  const getErrorMessage = (fieldName) => {
    const errors = validateForm();
    return errors[fieldName];
  };

  const isFieldInvalid = (fieldName) => {
    return touched[fieldName] && getErrorMessage(fieldName);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(form);
    const touchedFields = {};
    allFields.forEach(field => {
      touchedFields[field] = true;
    });
    setTouched(touchedFields);
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]); // Show the first error
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const riderData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
        license_number: form.licenseNumber.trim(),
        vehicle_type: form.vehicleType,
        vehicle_model: form.vehicleModel.trim(),
        vehicle_number: form.vehicleNumber.trim(),
        vehicle_color: form.vehicleColor.trim()
      };
      
      const response = await riderAPI.register(riderData);
      
      if (response.success) {
        setSuccess(true);
        setLoading(false);
        // Store the token
        localStorage.setItem('rider-token', response.token);
        localStorage.setItem('rider-user', JSON.stringify(response.data));
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError(response.message || 'Registration failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      if (error.message && error.message.includes('already exists')) {
        setError('A rider with this email or phone number already exists. Please use different credentials.');
      } else if (error.message && error.message.includes('validation failed')) {
        setError('Please check your information and try again.');
      } else if (error.message && error.message.includes('Network error')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 24, width: 320, maxWidth: '90vw', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={{ margin: 0, textAlign: 'center', color: '#2563eb' }}>Driver Registration</h2>
        
        {/* Personal Information */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#333' }}>Personal Information</h3>
          
          <input 
            name="name" 
            placeholder="Full Name" 
            value={form.name} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('name') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('name') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('name')}</div>}
          
          <input 
            name="email" 
            type="email"
            placeholder="Email Address" 
            value={form.email} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('email') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('email') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('email')}</div>}
          
          <input 
            name="phone" 
            placeholder="Phone Number (10 digits)" 
            value={form.phone} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('phone') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('phone') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('phone')}</div>}
          
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('password') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('password') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('password')}</div>}
          
          <input 
            name="confirmPassword" 
            type="password" 
            placeholder="Confirm Password" 
            value={form.confirmPassword} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('confirmPassword') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('confirmPassword') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('confirmPassword')}</div>}
        </div>
        
        {/* Driver Information */}
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#333' }}>Driver Information</h3>
          
          <input 
            name="licenseNumber" 
            placeholder="License Number" 
            value={form.licenseNumber} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('licenseNumber') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('licenseNumber') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('licenseNumber')}</div>}
          
          <select 
            name="vehicleType" 
            value={form.vehicleType} 
            onChange={handleChange}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 12,
              width: '100%'
            }}
          >
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
            <option value="Car">Car</option>
            <option value="SUV">SUV</option>
            <option value="Auto">Auto Rickshaw</option>
          </select>
          
          <input 
            name="vehicleModel" 
            placeholder="Vehicle Model (e.g., Honda Activa)" 
            value={form.vehicleModel} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('vehicleModel') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('vehicleModel') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('vehicleModel')}</div>}
          
          <input 
            name="vehicleNumber" 
            placeholder="Vehicle Number (e.g., TN 23 AB 1234)" 
            value={form.vehicleNumber} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('vehicleNumber') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('vehicleNumber') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('vehicleNumber')}</div>}
          
          <input 
            name="vehicleColor" 
            placeholder="Vehicle Color (e.g., Black)" 
            value={form.vehicleColor} 
            onChange={handleChange}
            onBlur={handleBlur}
            style={{ 
              padding: 10, 
              borderRadius: 6, 
              border: isFieldInvalid('vehicleColor') ? '1px solid #e53935' : '1px solid #ddd', 
              fontSize: 16,
              marginBottom: 4
            }} 
          />
          {isFieldInvalid('vehicleColor') && <div style={{ color: '#e53935', fontSize: 12, marginTop: 2 }}>{getErrorMessage('vehicleColor')}</div>}
        </div>
        
        {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
        {success && <div style={{ color: 'green', fontSize: 14 }}>Registration successful! Redirecting...</div>}
        
        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            background: '#2563eb', 
            color: '#fff', 
            border: 'none', 
            borderRadius: 6, 
            padding: 12, 
            fontWeight: 600, 
            fontSize: 16, 
            cursor: loading ? 'not-allowed' : 'pointer', 
            marginTop: 8,
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Registering...' : 'Register as Driver'}
        </button>
        
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          Already have an account? <span style={{ color: '#2563eb', cursor: 'pointer' }} onClick={() => navigate('/')}>Login</span>
        </div>
      </form>
    </div>
  );
};

export default Register;