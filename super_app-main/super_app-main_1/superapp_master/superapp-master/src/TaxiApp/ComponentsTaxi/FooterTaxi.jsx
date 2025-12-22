import React from "react";
import { useNavigate } from "react-router-dom";

function FooterTaxi() {
    const navigate = useNavigate();
    return (
        <div className="fixed bottom-0 w-full bg-white shadow flex items-center justify-around py-1 border-t z-50 px-1" style={{ minHeight: '44px' }}>
            {/* Back Arrow */}
            <button onClick={() => navigate(-1)} className="flex flex-col items-center text-xs text-gray-700 focus:outline-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                <span>Back</span>
            </button>
            {/* Home */}
            <button onClick={() => navigate('/home')} className="flex flex-col items-center text-xs text-gray-700 focus:outline-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>
                <span>Home</span>
            </button>
            {/* Book Ride */}
            <button onClick={() => navigate('/select-location')} className="flex flex-col items-center text-xs text-gray-700 focus:outline-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                <span>Book</span>
            </button>
            {/* Account */}
            <button onClick={() => navigate('/home-taxi/account')} className="flex flex-col items-center text-xs text-gray-700 focus:outline-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2"/></svg>
                <span>Account</span>
            </button>
        </div>
    );
}

export default FooterTaxi; 