import API_CONFIG from "../config/api.config.js";
import React, { useState } from 'react';
import logo from "../Images/Logo/E-STORE.svg";
import { useNavigate } from 'react-router-dom';
import { otpService } from '../services/otpService';
// import frame from "../Images/Auth/Frame.svg"



function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [loading, setLoading] = useState(false);

    const validatePhone = (phoneNumber) => {
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        if (!digitsOnly) {
            return 'Mobile number is required';
        }
        if (digitsOnly.length !== 10) {
            return 'Mobile number must be exactly 10 digits';
        }
        // Indian mobile number validation: should start with 6, 7, 8, or 9
        if (!/^[6-9]/.test(digitsOnly)) {
            return 'Mobile number must start with 6, 7, 8, or 9';
        }
        return '';
    };

    const handlePhoneChange = (value) => {
        const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
        setPhone(digitsOnly);
        // Real-time validation
        if (digitsOnly.length > 0) {
            const validationError = validatePhone(digitsOnly);
            setPhoneError(validationError);
        } else {
            setPhoneError('');
        }
        // Clear general error when user starts typing
        if (error) setError('');
    };

    const handlePhoneBlur = () => {
        // Validate on blur
        const validationError = validatePhone(phone);
        setPhoneError(validationError);
    };

    const handleContinue = async () => {
        // Clear previous errors
        setError('');
        setPhoneError('');

        // Validate all fields
        if (!name || !email || !phone || !password) {
            setError('Please fill all fields.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        // Validate phone number
        const trimmedPhone = phone.replace(/\D/g, '');
        const phoneValidationError = validatePhone(trimmedPhone);
        if (phoneValidationError) {
            setPhoneError(phoneValidationError);
            setError(phoneValidationError);
            return;
        }

        setError('');
        setPhoneError('');
        setLoading(true);
        // Register user
        try {
            const res = await fetch(API_CONFIG.getUrl('/api/auth/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone: trimmedPhone })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setError(data.message || 'Registration failed.');
                setLoading(false);
                return;
            }
            // Save to localStorage for OTP session
            localStorage.setItem('pendingEmail', email);
            localStorage.setItem('pendingPhone', trimmedPhone);
            // Call OTP API
            const result = await otpService.generateOTP(email, trimmedPhone);
            setLoading(false);
            if (result.success) {
                navigate('/otp');
            } else {
                setError(result.message || 'Failed to generate OTP. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-start">
            {/* Gradient Background */}
            <div className="w-full h-40 bg-gradient-to-b from-[#d6a1ef] to-white "></div>
            {/* <img src={frame} alt="frame" className="w-full h-32 rounded-b-3xl" /> */}
            {/* Logo */}

            {/* Form Fields */}
            <div className="w-full max-w-sm px-4 py-8 bg-white flex flex-col items-center">
                <img src={logo} alt='E-STORE' className="w-32 mt-4" />
                <label className="mt-4 block text-sm text-gray-600 w-full">
                    Enter your name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                />

                <label className="mt-4 block text-sm text-gray-600 w-full">
                    Enter your email ID <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                />

                <label className="mt-4 block text-sm text-gray-600 w-full">
                    Enter your mobile number <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onBlur={handlePhoneBlur}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className={`w-full p-3 border rounded-full focus:outline-none focus:ring-2 mt-1 ${
                        phoneError 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-[#5C3FFF]'
                    }`}
                />
                {phoneError && (
                    <div className="w-full mt-1 text-red-600 text-xs">{phoneError}</div>
                )}

                <label className="mt-4 block text-sm text-gray-600 w-full">
                    Enter your password <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(min. 6 characters)</span>
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                />

                {error && <div className="w-full mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

                <div className="w-full text-right mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <span
                            className="text-[#5C3FFF] cursor-pointer"
                            onClick={() => navigate('/login')}
                        >
                            Sign in here
                        </span>
                    </p>
                </div>
            </div>

            <div className='fixed left-0 right-0 bottom-16 px-4'>
                <button
                    onClick={handleContinue}
                    disabled={loading}
                    className="w-full max-w-sm mt-6 h-12 bg-[#5C3FFF] text-white text-lg font-semibold rounded-full flex items-center justify-center transition duration-300 hover:bg-[#4A2FCC] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? 'Registering...' : 'Continue'}
                </button>
            </div>
        </div>
    );
}

export default Register;