import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';
import API_CONFIG from '../../../config/api.config';

function Profile() {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileId, setProfileId] = useState('');
  const [existingLogo, setExistingLogo] = useState(null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(
      Yup.object({
        // Logo is optional if there's an existing logo
        logo: Yup.mixed().nullable(),
        business_name: Yup.string().required('Business Name is required'),
        name: Yup.string().required('Full Name is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        district_city: Yup.string().required('District/City is required'),
        state: Yup.string().required('State is required'),
        country: Yup.string().required('Country is required'),
        pincode: Yup.string()
          .matches(/^\d{6}$/, 'Pincode must be exactly 6 digits')
          .required('Pincode is required'),
        mobile_number: Yup.string()
          .matches(/^\d{10}$/, 'Mobile number must be exactly 10 digits')
          .required('Mobile number is required'),
        gst_number: Yup.string().optional(),
        facebook: Yup.string().url('Invalid URL').optional().nullable(),
        instagram: Yup.string().url('Invalid URL').optional().nullable(),
        linkedin: Yup.string().url('Invalid URL').optional().nullable(),
        pintrest: Yup.string().url('Invalid URL').optional().nullable(),
        youtube: Yup.string().url('Invalid URL').optional().nullable(),
        twitter: Yup.string().url('Invalid URL').optional().nullable(),
      })
    ),
    defaultValues: {
      logo: null,
      business_name: '',
      name: '',
      email: '',
      mobile_number: '',
      district_city: '',
      state: '',
      country: '',
      pincode: '',
      gst_number: '',
      facebook: '',
      instagram: '',
      linkedin: '',
      pintrest: '',
      youtube: '',
      twitter: '',
    },
  });


  const fetchData = async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('OnlineShop-accessToken') || localStorage.getItem('token') || 'demo-token';
      const apiUrl = API_CONFIG.getUrl('/api/admin/profiles') || 'https://yrpitsolutions.com/ecom_backend/api/admin/profiles';

      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('API Response:', response.data);

      const data = response.data && response.data[0] ? response.data[0] : response.data;

      if (data) {
        const id = data.id || data._id;
        setProfileId(id);
        setExistingLogo(data.logo);

        // Set form values
        setValue('business_name', data.business_name || '');
        setValue('name', data.name || '');
        setValue('email', data.email || '');
        setValue('mobile_number', data.mobile_number || '');
        setValue('district_city', data.district_city || '');
        setValue('state', data.state || '');
        setValue('country', data.country || '');
        setValue('pincode', data.pincode || '');
        setValue('gst_number', data.gst_number || '');
        setValue('facebook', data.facebook || '');
        setValue('instagram', data.instagram || '');
        setValue('linkedin', data.linkedin || '');
        setValue('pintrest', data.pintrest || '');
        setValue('youtube', data.youtube || '');
        setValue('twitter', data.twitter || '');

        // Set image preview
        if (data.logo) {
          let logoUrl;
          if (data.logo.startsWith('http')) {
            logoUrl = data.logo;
          } else if (data.logo.startsWith('/uploads')) {
            // Path starts with /uploads
            logoUrl = API_CONFIG.getUrl(data.logo);
          } else if (data.logo.startsWith('uploads')) {
            // Path starts with uploads (no leading slash)
            logoUrl = API_CONFIG.getUrl(`/${data.logo}`);
          } else {
            // Relative path, assume it's in uploads
            logoUrl = API_CONFIG.getUrl(`/uploads/${data.logo}`);
          }
          console.log('Logo path from backend:', data.logo);
          console.log('Constructed logo URL:', logoUrl);
          setImagePreview(logoUrl);
        } else {
          console.log('No logo found in profile data');
          setImagePreview(null);
        }
      } else {
        // No profile exists yet - will be created on first save
        console.log('No existing profile found. Will create on save.');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast.error('Failed to load profile data. Please refresh the page.', {
        position: "top-right",
        autoClose: 3000,
      });
      setLoading(false);
    }
  };

  const onUpdate = async (data) => {
    // Validate that we have either a profileId or will create a new profile
    if (!profileId && !logoFile && !existingLogo) {
      toast.error('Please upload a logo before saving.', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append all form fields to formData (skip logo field from form data)
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'logo' && value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      }

      // Append logo file if a new one was selected
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const accessToken = localStorage.getItem('OnlineShop-accessToken') || localStorage.getItem('token') || 'demo-token';
      const apiUrl = API_CONFIG.getUrl('/api/admin/profiles') || 'https://yrpitsolutions.com/ecom_backend/api/admin/profiles';

      let response;

      if (profileId) {
        // Update existing profile
        const updateUrl = `${apiUrl}/${profileId}`;
        response = await axios.post(updateUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      } else {
        // Create new profile - first get the profile to get the ID
        const getResponse = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const existingData = getResponse.data && getResponse.data[0] ? getResponse.data[0] : getResponse.data;
        if (existingData && (existingData.id || existingData._id)) {
          // Profile exists, update it
          const updateUrl = `${apiUrl}/${existingData.id || existingData._id}`;
          response = await axios.post(updateUrl, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${accessToken}`,
            },
          });
        } else {
          // Create new profile - backend will handle this
          toast.error('Profile creation not yet implemented. Please contact administrator.', {
            position: "top-right",
            autoClose: 3000,
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (response && (response.status === 200 || response.status === 201)) {
        console.log('Profile updated successfully:', response.data);

        // Update image preview if logo was uploaded
        if (response.data?.data?.logo) {
          const updatedLogo = response.data.data.logo;
          let logoUrl;
          if (updatedLogo.startsWith('http')) {
            logoUrl = updatedLogo;
          } else if (updatedLogo.startsWith('/uploads')) {
            logoUrl = API_CONFIG.getUrl(updatedLogo);
          } else if (updatedLogo.startsWith('uploads')) {
            logoUrl = API_CONFIG.getUrl(`/${updatedLogo}`);
          } else {
            logoUrl = API_CONFIG.getUrl(`/uploads/${updatedLogo}`);
          }
          setImagePreview(logoUrl);
        }

        // Show success toast message
        toast.success('Profile updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Refresh the form data
        await fetchData();

        // Notify Navbar to update (this uses the window event we just added listener for)
        window.dispatchEvent(new Event('adminProfileUpdated'));

        // Reset logo file state
        setLogoFile(null);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);

      // Extract error message
      let errorMessage = 'An error occurred while updating the profile. Please try again.';
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error toast message
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDrop = (files) => {
    if (files && files[0]) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB.', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      setLogoFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex justify-center items-center transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p
            className="mt-4 transition-colors duration-300"
            style={{ color: 'var(--text-secondary)' }}
          >
            Loading profile data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen flex justify-center items-center transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {/* Form Section */}
        <ToastContainer />
        <div
          className="shadow-lg rounded-lg p-8 w-full max-w-8xl mt-10 transition-colors duration-300"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <form onSubmit={handleSubmit(onUpdate)} className="space-y-6" noValidate>

            <h1
              className="text-3xl font-semibold text-center mb-8 transition-colors duration-300"
              style={{ color: 'var(--text-primary)' }}
            >
              Edit Profile
            </h1>

            {/* Profile Image Section */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                {/* Label Above the Image */}
                <label
                  htmlFor="logo"
                  className="block text-center mb-2 font-semibold transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Logo
                </label>

                {/* Hidden File Input */}
                <input
                  name="logo"
                  type="file"
                  id="logo"  // Added for label targeting
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleDrop(e.target.files)}
                />

                {/* Image Preview */}
                <div
                  className="w-32 h-32 rounded-full border-4 flex items-center justify-center overflow-hidden transition-colors duration-300"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-muted)'
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        console.error('Failed to load image:', imagePreview);
                        e.target.style.display = 'none';
                        setImagePreview(null);
                        toast.error('Failed to load profile image. Please upload again.', {
                          position: "top-right",
                          autoClose: 3000,
                        });
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', imagePreview);
                      }}
                    />
                  ) : (
                    <span className="flex items-center text-2xl">
                      <span role="img" aria-label="camera" className="mr-1">📷</span>
                      <span className="text-red-500" aria-hidden="true">*</span>
                    </span>
                  )}
                </div>
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Business Name */}
              <div>
                <label
                  htmlFor="business_name"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Business Name <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="business_name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="business_name"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Business Name"
                    />
                  )}
                />{errors.business_name && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.business_name.message}</p>
                )}
              </div>


              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Full Name <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="name"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Full Name"
                    />
                  )}
                />{errors.name && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Email Address <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      id="email"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Email Address"
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Mobile Number <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="mobile_number"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="mobile"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Mobile Number"
                    />
                  )}
                />
                {errors.mobile_number && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.mobile_number.message}</p>
                )}
              </div>

              {/* District/City */}
              <div>
                <label
                  htmlFor="district_city"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  District/City <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="district_city"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="district_city"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter District/City"
                    />
                  )}
                /> {errors.district_city && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.district_city.message}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  State <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="state"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter State"
                    />
                  )}
                />
                {errors.state && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.state.message}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Country <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="country"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Country"
                    />
                  )}
                />
                {errors.country && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.country.message}</p>
                )}
              </div>

              {/* Pincode */}
              <div>
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Pincode <span className="text-red-500 ">*</span>
                </label>
                <Controller
                  name="pincode"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="pincode"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Pincode"
                    />
                  )}
                />
                {errors.pincode && (
                  <p className="text-red-500 dark:text-red-400 text-sm">{errors.pincode.message}</p>
                )}
              </div>

              {/* GST Number */}
              <div>
                <label
                  htmlFor="gst_number"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  GST Number
                </label>
                <Controller
                  name="gst_number"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      id="gst_number"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter GST Number"
                    />
                  )}
                />
              </div>

              {/* Social Media Fields */}
              <div>
                <label
                  htmlFor="facebook"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Facebook URL
                </label>
                <Controller
                  name="facebook"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      id="facebook"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Facebook URL"
                    />
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Instagram URL
                </label>
                <Controller
                  name="instagram"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      id="instagram"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Instagram URL"
                    />
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="linkedin"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  LinkedIn URL
                </label>
                <Controller
                  name="linkedin"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      id="linkedin"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter LinkedIn URL"
                    />
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="pinterest"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Pinterest URL
                </label>
                <Controller
                  name="pintrest"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      id="pinterest"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Pinterest URL"
                    />
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="youtube"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  YouTube URL
                </label>
                <Controller
                  name="youtube"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      id="youtube"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter YouTube URL"
                    />
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="twitter"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Twitter URL
                </label>
                <Controller
                  name="twitter"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="url"
                      id="twitter"
                      className="mt-2 block w-full px-6 py-4 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                      }}
                      placeholder="Enter Twitter URL"
                    />
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className={`px-8 py-3 rounded-md font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${isSubmitting
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                  }`}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>

  );
}

export default Profile;
