import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight } from 'lucide-react';

const HotelOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { phone, from: bookingInfo } = location.state || {};
    const [otp, setOtp] = useState(new Array(4).fill(""));
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!phone) {
            navigate('/hotel-login');
        }
        inputRefs.current[0]?.focus();
    }, [phone, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value !== "" && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleVerify = () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 4) {
            setError('Please enter the 4-digit OTP.');
            return;
        }
        
        // This is a mock verification.
        // In a real app, you'd call an API.
        console.log(`Verifying OTP ${enteredOtp} for ${phone}`);
        setError('');
        
        // On success:
        localStorage.setItem('hotelUserPhone', phone);
        localStorage.setItem('hotelUser', 'true');
        localStorage.setItem('token', 'demo-token'); // Ensure token is set for API calls

        // Redirect back to the payment page with booking info
        // Ensure we pass the complete booking data structure
        navigate('/hotel-payment', { 
            state: { 
                booking: bookingInfo?.booking || bookingInfo 
            } 
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-red-100 to-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-2">Verification</h1>
                <p className="text-gray-500 mb-6">Enter the OTP sent to {phone}</p>

                <div className="flex justify-center gap-2 mb-6">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            value={data}
                            ref={el => inputRefs.current[index] = el}
                            onChange={e => handleChange(e.target, index)}
                            onFocus={e => e.target.select()}
                            className="w-14 h-16 text-center text-2xl font-semibold border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-red-500"
                            maxLength="1"
                        />
                    ))}
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                
                <p className="text-sm text-gray-500 mb-6">
                    Didn't receive code? <span className="font-semibold text-red-600 cursor-pointer">Resend</span>
                </p>

                <button
                    onClick={handleVerify}
                    className="w-full bg-red-600 text-white py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-red-700 transition-all transform hover:scale-105"
                >
                    Verify & Proceed <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default HotelOTP; 