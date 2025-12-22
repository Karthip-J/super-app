import API_CONFIG from "../config/api.config.js";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../Images/Logo/E-STORE.svg";
import { otpService } from '../services/otpService';
import bellIcon from "../Images/HomeScreen/bellIcon.svg";

function Login({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        setError('');
        if (!email || !phone) {
            setError('Please enter both email and phone number');
            return;
        }
        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        setIsLoading(true);
        try {
            console.log('🔧 Login: Starting OTP generation...');
            console.log('🔧 Login: Form data:', { email, phone });
            console.log('🔧 Login: API base URL:', API_CONFIG.BASE_URL);
            console.log('🔧 Login: Debug info:', API_CONFIG.DEBUG);
            console.log('🔧 Login: Environment variable:', process.env.REACT_APP_API_URL);
            console.log('🔧 Login: Window location:', window.location.href);
            console.log('🔧 Login: Hostname:', window.location.hostname);
            
            // Test connectivity first
            console.log('🔧 Login: Testing connectivity to backend...');
            const testUrl = API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.AUTH);
            console.log('🔧 Login: Test URL:', testUrl);
            
            try {
                const testResponse = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                console.log('🔧 Login: Connectivity test response status:', testResponse.status);
                console.log('🔧 Login: Connectivity test response headers:', testResponse.headers);
            } catch (connectivityError) {
                console.error('🔧 Login: Connectivity test failed:', connectivityError);
                console.error('🔧 Login: Test URL that failed:', testUrl);
                setError('Cannot connect to server. Please check your internet connection.');
                setIsLoading(false);
                return;
            }
            
            const result = await otpService.generateOTP(email, phone);
            console.log('Login: OTP generation result:', result);

            if (result.success) {
                console.log('Login: OTP generated successfully, navigating to OTP page');
                // Store email and phone for OTP verification
                localStorage.setItem('pendingEmail', email);
                localStorage.setItem('pendingPhone', phone);
                localStorage.setItem('generated_otp', result.otp);
                navigate('/otp');
            } else {
                console.error('Login: OTP generation failed:', result.message);
                setError(result.message);
            }
        } catch (error) {
            console.error('Login: Unexpected error during OTP generation:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-start">
            {/* Gradient Background */}
            <div className="w-full h-40 bg-gradient-to-b from-[#d6a1ef] to-white "></div>
            {/* Logo */}
            <img src={bellIcon} alt='E-STORE' className="w-10 mt-4" />
            {/* Form Fields */}
            <div className="w-full max-w-sm px-4 py-8 bg-white flex flex-col items-center">
                <label className="mt-4 block text-sm text-gray-600 w-full">Enter your email ID</label>
                <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    placeholder="Enter your email"
                />
                <label className="mt-4 block text-sm text-gray-600 w-full">Enter your mobile number</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={e => { 
                        const val = e.target.value; 
                        if (/^\d*$/.test(val) && val.length <= 10) setPhone(val); 
                    }}
                    className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    maxLength="10"
                    placeholder="Enter 10-digit number"
                />
                {error && (
                    <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                <div className="w-full text-right mt-4">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <span className="text-[#5C3FFF] cursor-pointer" onClick={() => navigate('/register')}>
                            Sign up
                        </span>
                    </p>
                </div>
            </div>
            {/* Send OTP Button */}
            <div className='fixed left-0 right-0 bottom-16 px-4'>
                <button
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full max-w-sm mt-6 h-12 bg-[#5C3FFF] text-white text-lg font-semibold rounded-full flex items-center justify-center transition duration-300 hover:bg-[#4A2FCC] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
            </div>
        </div>
    );
}

export default Login;