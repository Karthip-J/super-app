import React from 'react';
import location from "../../Images/HomeScreen/location.svg";
import { useNavigate } from 'react-router-dom';
import arrowLeft from '../../Icons/arrow-left.svg';

function HomeHeaderTaxi({ showBack = false }) {
    const navigate = useNavigate();
    return (
        <div className="fixed top-0 left-0 w-full bg-white shadow-md flex justify-between items-center pt-4 px-4 pb-0 z-50">
            <div className="flex items-center gap-2">
                {showBack && (
                    <button onClick={() => navigate(-1)} className="mr-2 p-1 rounded hover:bg-gray-100">
                        <img src={arrowLeft} alt="Back" className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-lg font-bold">TAXI</h1>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 text-right">
                    <span>Delivery to </span><br />
                    <span className="font-semibold text-black">India - 501 642</span>
                </div>
                <div className="w-8 h-8 rounded-full border border-[#5C3FFF] flex items-center justify-center">
                    <img src={location} alt="Location" className="w-5 h-5" />
                </div>
            </div>
        </div>
    )
}
export default HomeHeaderTaxi;  