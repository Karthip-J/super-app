import React, { useState } from 'react';
import logo from "../Images/Logo/E-STORE.svg";
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

function SetPassword() {
    const navigate = useNavigate();

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-start">
            {/* Gradient Background */}
            <div className="w-full h-40 bg-gradient-to-b from-[#d6a1ef] to-white "></div>

            {/* Logo */}


            {/* Form Fields */}
            <div className="w-full max-w-sm px-4 py-8 bg-white flex flex-col items-center">
                <img src={logo} alt='E-STORE' className="w-32 mt-4" />
                <label className="mt-4 block text-sm text-gray-600 w-full">Enter password</label>
                <input type="password" className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1" />

                <label className="block text-sm text-gray-600 w-full mt-4">Confirm password</label>
                <div className="relative w-full">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />
                    <span
                        className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </span>
                </div>

                <div className='fixed left-0 right-0 bottom-16 px-4'>
                    <button
                        onClick={() => navigate('/home')}
                        className="w-full max-w-sm mt-6 h-12 bg-[#5C3FFF] text-white text-lg font-semibold rounded-full flex items-center justify-center transition duration-300 hover:bg-[#4A2FCC] hover:scale-105 active:scale-95">
                        Submit
                    </button>
                </div>
            </div>



        </div>
    );
}

export default SetPassword;