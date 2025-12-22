import React from 'react'
import arrow from "../../Icons/arrow-right.svg";
import Footer from '../SubPages/Footer';
import Header from '../SubPages/Header';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const navigate = useNavigate();
    
    const handleSignOut = () => {
        console.log('Grocery Settings: Signing out user');
        // Clear all authentication data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userPhone');
        localStorage.removeItem('userData');
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('pendingPhone');
        localStorage.removeItem('generated_otp');
        localStorage.removeItem('token');
        // Navigate to login
        navigate('/login');
    };
    
    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <Header />
            <div className='px-4 pt-24'>
                <div className='font-medium text-base'>Settings</div>
                <div className='bg-white border border-[#E1E1E1] p-4 rounded-[20px] mt-4'>

                    <div className="flex justify-between items-center px-4 py-3 border-b border-[#CCCCCC]"
                        onClick={() => navigate("/home-grocery/notification")}
                    >
                        <h2 className="text-sm font-medium">Notification</h2>
                        <img
                            src={arrow}
                            className="w-4 h-4 cursor-pointer transform transition-transform"
                            alt="Toggle view"
                        />
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-[#CCCCCC]"
                        onClick={() => navigate("/home-grocery/terms-conditions")}
                    >
                        <h2 className="text-sm font-medium">Term & Conditions</h2>
                        <img
                            src={arrow}
                            className="w-4 h-4 cursor-pointer transform transition-transform"
                            alt="Toggle view"
                        />
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-[#CCCCCC]"
                        onClick={() => navigate("/home-grocery/privacy-policy")}>
                        <h2 className="text-sm font-medium">Privacy Policy</h2>
                        <img
                            src={arrow}
                            className="w-4 h-4 cursor-pointer transform transition-transform"
                            alt="Toggle view"
                        />
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-[#CCCCCC]"
                    onClick={() => navigate("/home-grocery/about")}>
                        <h2 className="text-sm font-medium">About</h2>
                        <img
                            src={arrow}
                            className="w-4 h-4 cursor-pointer transform transition-transform"
                            alt="Toggle view"
                        />
                    </div>
                    <div className="flex justify-between items-center px-4 py-3"
                        onClick={handleSignOut}>
                        <h2 className="text-sm font-medium">Sign Out</h2>
                        <img
                            src={arrow}
                            className="w-4 h-4 cursor-pointer transform transition-transform"
                            alt="Toggle view"
                        />
                    </div>


                </div>
            </div>
            <Footer />
        </div>
    )
}
export default Settings;