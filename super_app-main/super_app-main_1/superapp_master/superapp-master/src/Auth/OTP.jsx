import React, { useState, useEffect, useRef } from 'react';
import bellIcon from "../Images/HomeScreen/bellIcon.svg";
import { useNavigate } from 'react-router-dom';
import { otpService } from '../services/otpService';

function OTP() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [showOtpDisplay, setShowOtpDisplay] = useState(true);
    const [devOtp, setDevOtp] = useState('');
    const inputRefs = useRef([]);

    // Get stored data from localStorage
    const pendingEmail = localStorage.getItem('pendingEmail');
    const pendingPhone = localStorage.getItem('pendingPhone'); // Kept this line as it was clearly intended to be there
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    // Auto-focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Resend countdown timer
    useEffect(() => {
        let timer;
        if (resendCountdown > 0) {
            timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
        } else {
            setResendDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [resendCountdown]);

    // Check if user has pending OTP data
    useEffect(() => {
        if (isLoggedIn === 'true') {
            console.log('OTP: User already logged in, redirecting to home');
            navigate('/home');
            return;
        }
        if (!pendingEmail || !pendingPhone) {
            console.log('OTP: No pending OTP data found, redirecting to login');
            if (window.location.pathname === '/otp') {
                alert('No OTP session found. Please go back to login.');
                navigate('/login');
            }
        } else {
            console.log('OTP: Pending data found, proceeding with OTP verification');
        }
    }, [pendingEmail, pendingPhone, isLoggedIn, navigate]);

    // Fetch latest OTP for dev display
    useEffect(() => {
        const fetchDevOtp = async () => {
            if (pendingEmail || pendingPhone) {
                const result = await otpService.getLatestOTP(pendingEmail, pendingPhone);
                if (result.success) setDevOtp(result.otp);
            }
        };
        fetchDevOtp();
    }, [pendingEmail, pendingPhone]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleVerifyOtp(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (otpValue) => {
        if (!pendingEmail || !pendingPhone) {
            setError('No OTP session found. Please request a new OTP.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const result = await otpService.verifyOTP(pendingEmail, pendingPhone, otpValue);
            if (result.success) {
                console.log('OTP verified successfully, setting up authentication...');

                const token = result.token;
                if (token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('urban_partner_token', token);
                    console.log('Token stored for API access');

                    // Mark user as logged in ONLY if token exists
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', pendingEmail);
                    localStorage.setItem('userPhone', pendingPhone);

                    const userData = {
                        email: pendingEmail,
                        phone: pendingPhone,
                        isLoggedIn: true,
                        timestamp: new Date().toISOString()
                    };
                    localStorage.setItem('userData', JSON.stringify(userData));

                    // Clear pending OTP data
                    localStorage.removeItem('pendingEmail');
                    localStorage.removeItem('pendingPhone');

                    console.log('User authenticated, proceeding to home page');
                    navigate('/home');
                } else {
                    console.warn('No token received from backend');
                    setError('Authentication failed: No token received from server.');
                }
            } else {
                setError(result.message || 'Invalid OTP. Please try again.');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            setError('Verification failed. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };


    const handleResendOtp = async () => {
        if (!pendingEmail || !pendingPhone) {
            alert('No user data found. Please go back to login.');
            navigate('/login');
            return;
        }
        setResendDisabled(true);
        setResendCountdown(30);
        setError('');
        try {
            const result = await otpService.generateOTP(pendingEmail, pendingPhone);
            if (result.success) {
                setShowOtpDisplay(true);
                // Fetch and update dev OTP
                const latest = await otpService.getLatestOTP(pendingEmail, pendingPhone);
                if (latest.success) setDevOtp(latest.otp);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                setError(result.message || 'Failed to resend OTP.');
                setResendDisabled(false);
                setResendCountdown(0);
            }
        } catch (error) {
            setError('Failed to resend OTP. Please try again.');
            setResendDisabled(false);
            setResendCountdown(0);
        }
    };

    const formatPhone = (phone) => {
        if (!phone) return '';
        return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    };

    const copyOtpToClipboard = () => {
        if (devOtp) {
            navigator.clipboard.writeText(devOtp).then(() => {
                // Show success feedback
                const originalText = 'Copy Code';
                const button = event.target.closest('button');
                if (button) {
                    button.innerHTML = `
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span>Copied!</span>
                    `;
                    button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                    button.classList.add('bg-green-600');
                    
                    setTimeout(() => {
                        button.innerHTML = `
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            <span>Copy Code</span>
                        `;
                        button.classList.remove('bg-green-600');
                        button.classList.add('bg-blue-600', 'hover:bg-blue-700');
                    }, 2000);
                }
            }).catch(() => {
                alert('Failed to copy OTP. Please copy manually: ' + devOtp);
            });
        }
    };

    // Don't render if not on the correct route
    if (window.location.pathname !== '/otp') {
        return null;
    }

    return (
        <div className="w-full h-screen flex flex-col items-center justify-start">
            {/* Gradient Background */}
            <div className="w-full h-40 bg-gradient-to-b from-[#d6a1ef] to-white"></div>
            <div className="w-full max-w-sm px-4 py-8 bg-white flex flex-col items-center">
                {/* Logo */}
                <img src={bellIcon} alt='E-STORE' className="w-20 mt-4" />
                {/* Console OTP Display */}
                {showOtpDisplay && devOtp && (
                    <div className="w-full mt-4">
                        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-gray-400 text-xs ml-2">Console</span>
                                </div>
                                <button
                                    onClick={() => setShowOtpDisplay(false)}
                                    className="text-gray-400 hover:text-white text-xs"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="space-y-1">
                                <div className="text-green-400">
                                    <span className="text-gray-500">{'>'}</span> <span className="text-blue-400">const</span> <span className="text-yellow-300">otp</span> = <span className="text-orange-400">'123456'</span>;
                                </div>
                                <div className="text-green-400">
                                    <span className="text-gray-500">{'>'}</span> <span className="text-blue-400">console</span>.<span className="text-yellow-300">log</span>(<span className="text-orange-400">'Your OTP is:'</span>, <span className="text-yellow-300">otp</span>);
                                </div>
                                <div className="text-white">
                                    <span className="text-gray-500">{'>'}</span> Your OTP is: <span className="text-green-400 font-bold text-lg">{devOtp}</span>
                                </div>
                                <div className="text-gray-500 text-xs mt-2">
                                    {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-700 flex space-x-2">
                                <button
                                    onClick={copyOtpToClipboard}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                >
                                    Copy OTP
                                </button>
                                <button
                                    onClick={() => {
                                        const otpArray = devOtp.split('');
                                        setOtp(otpArray);
                                        setTimeout(() => {
                                            inputRefs.current[otpArray.length - 1]?.focus();
                                        }, 100);
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                >
                                    Auto-fill
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Show OTP button (when hidden) */}
                {!showOtpDisplay && devOtp && (
                    <button
                        onClick={() => setShowOtpDisplay(true)}
                        className="w-full mt-4 p-3 bg-gray-900 text-green-400 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 font-mono text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>Show Console OTP</span>
                    </button>
                )}
                
                {/* OTP Instruction */}
                <p className="text-sm text-gray-600 text-left mt-6">
                    Please enter the verification code we've sent to your <br />
                    Mobile Number <span className="text-[#5C3FFF]">{formatPhone(pendingPhone)}</span>
                </p>
                {/* Error Message */}
                {error && (
                    <div className="w-full mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                {/* OTP Input Fields - Now 6 digits */}
                <div className="flex space-x-2 mt-4">
                    {Array(6).fill(0).map((_, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            maxLength="1"
                            value={otp[index]}
                            onChange={e => handleOtpChange(index, e.target.value)}
                            onKeyDown={e => handleKeyDown(index, e)}
                            className="w-10 h-10 text-center text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] disabled:opacity-50"
                            disabled={isLoading}
                        />
                    ))}
                </div>
                {/* Resend OTP */}
                <div className="w-full text-right mt-4">
                    <button
                        onClick={handleResendOtp}
                        disabled={resendDisabled || isLoading}
                        className="text-sm text-[#5C3FFF] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resendDisabled
                            ? `Resend in ${resendCountdown}s`
                            : 'Resend OTP'
                        }
                    </button>
                </div>
                {/* Back to Login */}
                <div className="w-full text-center mt-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-500 cursor-pointer"
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
            {/* Confirm Button */}
            <div className='fixed left-0 right-0 bottom-16 px-4'>
                <button
                    onClick={() => handleVerifyOtp(otp.join(''))}
                    disabled={otp.join('').length !== 6 || isLoading}
                    className="w-full max-w-sm mt-6 h-12 bg-[#5C3FFF] text-white text-lg font-semibold rounded-full flex items-center justify-center transition duration-300 hover:bg-[#4A2FCC] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? 'Verifying...' : 'Confirm'}
                </button>
            </div>
        </div>
    );
}

export default OTP;