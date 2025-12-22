import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EmailConfiguration() {
    const [loading, setLoading] = useState(false);

    // Initialize useForm
    const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm({
        resolver: yupResolver(
            Yup.object({
                MAIL_MAILER: Yup.string().required('Mailer type is required'),
                MAIL_HOST: Yup.string().required('SMTP Host is required'),
                MAIL_PORT: Yup.number().required('SMTP Port is required'),
                MAIL_USERNAME: Yup.string().required('SMTP Username is required'),
                MAIL_PASSWORD: Yup.string().required('SMTP Password is required'),
                MAIL_ENCRYPTION: Yup.string().required('SMTP Encryption is required'),
                MAIL_FROM_ADDRESS: Yup.string().email('Invalid email address').required('From Address is required'),
                MAIL_FROM_NAME: Yup.string().required('From Name is required'),
            })
        ),
        defaultValues: {
            MAIL_MAILER: '',
            MAIL_HOST: '',
            MAIL_PORT: '',
            MAIL_USERNAME: '',
            MAIL_PASSWORD: '',
            MAIL_ENCRYPTION: '',
            MAIL_FROM_ADDRESS: '',
            MAIL_FROM_NAME: '',
        },
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('OnlineShop-accessToken');
                if (!token) {
                    throw new Error('Access token not found');
                }

                const response = await axios.get('https://yrpitsolutions.com/ecom_backend/api/getEmailSettings', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log('Profile data:', response.data);

                // Check if the response contains the expected fields, and set values accordingly
                if (response.data && response.data.MAIL_MAILER) {
                    setValue('MAIL_MAILER', response.data.MAIL_MAILER);
                }
                if (response.data && response.data.MAIL_HOST) {
                    setValue('MAIL_HOST', response.data.MAIL_HOST);
                }
                if (response.data && response.data.MAIL_PORT) {
                    setValue('MAIL_PORT', response.data.MAIL_PORT);
                }
                if (response.data && response.data.MAIL_USERNAME) {
                    setValue('MAIL_USERNAME', response.data.MAIL_USERNAME);
                }
                if (response.data && response.data.MAIL_PASSWORD) {
                    setValue('MAIL_PASSWORD', response.data.MAIL_PASSWORD);
                }
                if (response.data && response.data.MAIL_ENCRYPTION) {
                    setValue('MAIL_ENCRYPTION', response.data.MAIL_ENCRYPTION);
                }
                if (response.data && response.data.MAIL_FROM_ADDRESS) {
                    setValue('MAIL_FROM_ADDRESS', response.data.MAIL_FROM_ADDRESS);
                }
                if (response.data && response.data.MAIL_FROM_NAME) {
                    setValue('MAIL_FROM_NAME', response.data.MAIL_FROM_NAME);
                }

            } catch (error) {
                console.error('Failed to fetch profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // Transform the data keys to uppercase for the payload
            const transformedData = {
                MAIL_MAILER: data.MAIL_MAILER.trim(),
                MAIL_HOST: data.MAIL_HOST.trim(),
                MAIL_PORT: data.MAIL_PORT.toString().trim(),
                MAIL_USERNAME: data.MAIL_USERNAME.trim(),
                MAIL_PASSWORD: data.MAIL_PASSWORD.trim(),
                MAIL_ENCRYPTION: data.MAIL_ENCRYPTION.trim(),
                MAIL_FROM_ADDRESS: data.MAIL_FROM_ADDRESS.trim(),
                MAIL_FROM_NAME: data.MAIL_FROM_NAME.trim(),
            };

            const token = localStorage.getItem('OnlineShop-accessToken');
            if (!token) {
                throw new Error('Access token not found');
            }

            const response = await axios.post(
                'https://yrpitsolutions.com/ecom_backend/api/update-email-settings',
                transformedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                console.log('Configuration saved successfully');
            } else {
                console.log('Failed to save configuration');
            }
        } catch (error) {
            console.error('Failed to save configuration:', error.response ? error.response.data : error);
        } finally {
            setLoading(false);
        }
    };

    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <>
            <div 
                className="flex justify-center items-center mt-8 transition-colors duration-300"
                style={{ backgroundColor: 'var(--bg-primary)' }}
            >
                <ToastContainer />
                <div 
                    className="shadow-lg rounded-lg p-8 w-full transition-colors duration-300"
                    style={{ backgroundColor: 'var(--bg-card)' }}
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ml-2 mt-18  ">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SMTP Settings */}
                            <div>
                                <label 
                                    htmlFor="MAIL_MAILER" 
                                    className="block text-sm font-medium transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    Mailer Type <span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="MAIL_MAILER"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            id="MAIL_MAILER"
                                            className="mt-2 block w-full max-w-md px-4 py-3 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                        >
                                            <option value="select">Select</option>
                                            <option value="smtp">SMTP</option>
                                        </select>
                                    )}
                                />
                                {errors.MAIL_MAILER && <p className="text-red-500 dark:text-red-400 text-sm">{errors.MAIL_MAILER.message}</p>}
                            </div>

                            {/* SMTP Host */}
                            <div>
                                <label 
                                    htmlFor="MAIL_HOST" 
                                    className="block text-sm font-medium transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    SMTP Host <span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="MAIL_HOST"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            id="MAIL_HOST"
                                            className="mt-2 block w-full max-w-md px-4 py-3 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            placeholder="Enter SMTP Host"
                                        />
                                    )}
                                />
                                {errors.MAIL_HOST && <p className="text-red-500 dark:text-red-400 text-sm">{errors.MAIL_HOST.message}</p>}
                            </div>

                            {/* SMTP Port */}
                            <div>
                                <label 
                                    htmlFor="MAIL_PORT" 
                                    className="block text-sm font-medium transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    SMTP Port <span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="MAIL_PORT"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            id="MAIL_PORT"
                                            className="mt-2 block w-full max-w-md px-4 py-3 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            placeholder="Enter SMTP Port"
                                        />
                                    )}
                                />
                                {errors.MAIL_PORT && <p className="text-red-500 dark:text-red-400 text-sm">{errors.MAIL_PORT.message}</p>}
                            </div>

                            {/* SMTP Username */}
                            <div>
                                <label 
                                    htmlFor="MAIL_USERNAME" 
                                    className="block text-sm font-medium transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    SMTP Username <span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="MAIL_USERNAME"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            id="MAIL_USERNAME"
                                            className="mt-2 block w-full max-w-md px-4 py-3 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            placeholder="Enter SMTP Username"
                                        />
                                    )}
                                />
                                {errors.MAIL_USERNAME && <p className="text-red-500 dark:text-red-400 text-sm">{errors.MAIL_USERNAME.message}</p>}
                            </div>

                            <div>
                                <label 
                                    htmlFor="MAIL_PASSWORD" 
                                    className="block text-sm font-medium transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    SMTP Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Controller
                                        name="MAIL_PASSWORD"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type={passwordVisible ? "text" : "password"} // Toggle between 'password' and 'text'
                                                    id="MAIL_PASSWORD"
                                                    className="mt-2 block w-full px-4 py-3 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 pr-10 transition-colors duration-300"
                                                    style={{
                                                        backgroundColor: 'var(--bg-input)',
                                                        color: 'var(--text-primary)',
                                                        borderColor: 'var(--border-color)'
                                                    }}
                                                    placeholder="Enter SMTP Password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={togglePasswordVisibility}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300"
                                                    style={{ color: 'var(--text-secondary)' }}
                                                    aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                                                >
                                                    {passwordVisible ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                            <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7-11-7-11-7z" />
                                                            <path d="M12 8a4 4 0 0 1 0 8" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                                            <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7-11-7-11-7z" />
                                                            <path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    />
                                </div>
                                {errors.MAIL_PASSWORD && <p className="text-red-500 dark:text-red-400 text-sm">{errors.MAIL_PASSWORD.message}</p>}
                            </div>


                            {/* SMTP Encryption */}
                            <div>
                                <label 
                                    htmlFor="MAIL_ENCRYPTION" 
                                    className="block text-sm font-medium transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    SMTP Encryption <span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="MAIL_ENCRYPTION"
                                    control={control}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            id="MAIL_ENCRYPTION"
                                            className="mt-2 block w-full max-w-md px-4 py-3 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                        >
                                            <option value="select">Select</option>
                                            <option value="tls">TLS</option>
                                            <option value="ssl">SSL</option>
                                        </select>
                                    )}
                                />
                                {errors.MAIL_ENCRYPTION && <p className="text-red-500 dark:text-red-400 text-sm">{errors.MAIL_ENCRYPTION.message}</p>}
                            </div>

                            {/* From Address */}
                            <div>
                                <label 
                                    htmlFor="MAIL_FROM_ADDRESS" 
                                    className="block text-sm font-medium transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    From Address <span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="MAIL_FROM_ADDRESS"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="email"
                                            id="MAIL_FROM_ADDRESS"
                                            className="mt-2 block w-full max-w-md px-4 py-3 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            placeholder="Enter From Address"
                                        />
                                    )}
                                />
                                {errors.MAIL_FROM_ADDRESS && <p className="text-red-500 dark:text-red-400 text-sm">{errors.MAIL_FROM_ADDRESS.message}</p>}
                            </div>

                            {/* From Name */}
                            <div>
                                <label 
                                    htmlFor="MAIL_FROM_NAME" 
                                    className="block text-sm font-medium transition-colors duration-300"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    From Name <span className="text-red-500 ">*</span>
                                </label>
                                <Controller
                                    name="MAIL_FROM_NAME"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            id="MAIL_FROM_NAME"
                                            className="mt-2 block w-full max-w-md px-4 py-3 text-lg border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                                            style={{
                                                backgroundColor: 'var(--bg-input)',
                                                color: 'var(--text-primary)',
                                                borderColor: 'var(--border-color)'
                                            }}
                                            placeholder="Enter From Name"
                                        />
                                    )}
                                />
                                {errors.MAIL_FROM_NAME && <p className="text-red-500 dark:text-red-400 text-sm">{errors.MAIL_FROM_NAME.message}</p>}
                            </div>
                        </div>

                        {/* Submit Button */}
                        {/* <div className="flex  justify-center mt-auto mb-4 ml-[770px]"> */}
                        <div className="flex  justify-center mt-auto">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`relative bg-[#4318ff] text-white px-6 py-3 rounded-lg flex items-center justify-center 
                            ${loading ? "w-[100px] h-[50px]" : "w-[150px] h-[50px]"}`}
                            >
                                {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>


                    </form>
                </div>
            </div>
        </>
    );
}

export default EmailConfiguration;
