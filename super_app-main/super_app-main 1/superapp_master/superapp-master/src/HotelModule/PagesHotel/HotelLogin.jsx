import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';

const HotelLogin = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    // Show login-required message if redirected from payment page
    const showLoginMessage = Boolean(location.state?.from);

    const handleContinue = () => {
        if (phone.replace(/\D/g, '').length !== 10) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }
        setError('');
        // Redirect to OTP page, passing phone number and original booking info
        navigate('/hotel-otp', {
            state: {
                phone: phone,
                from: location.state?.from, // This is the original bookingInfo
            },
        });
        localStorage.setItem('hotelUserLoggedIn', 'true');
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-sky-100 to-white flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center">
                <h1 className="text-3xl font-bold text-sky-600 mb-2">Login</h1>
                {showLoginMessage && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm font-medium">
                        Please login to continue
                    </div>
                )}
                <p className="text-gray-500 mb-8">Enter your phone number to proceed.</p>

                <div className="relative mb-6">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-4 pl-12 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                    />
                </div>

                {error && <p className="text-sky-500 text-sm mb-4">{error}</p>}

                <button
                    onClick={handleContinue}
                    className="w-full bg-sky-600 text-white py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 shadow-lg hover:bg-sky-700 transition-all transform hover:scale-105"
                >
                    Continue <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default HotelLogin; 