import React from "react";
import location from "../../Images/HomeScreen/location.svg";
import leftarrow from "../../Icons/arrow-left.svg";
import bellIcon from "../../Images/HomeScreen/bellIcon.svg";
import { useNavigate } from "react-router-dom";

function ClothesHeader() {
    const navigate = useNavigate();
    return (
        <div className="fixed top-0 left-0 w-full bg-white shadow-md flex justify-between items-center pt-8 px-4 pb-2 z-50">
            <div className="flex items-center gap-2">
                <img src={leftarrow} alt="arrow" className="w-6 h-6" onClick={()=> navigate(-1)}/> 
                <img src={bellIcon} alt='E-STORE' className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 text-right">
                    <span>Delivery to </span><br />
                    <span className="font-semibold text-black">India - 501 642</span>
                </div>
                <img src={location} alt="Location" className="w-10 h-10" />
            </div>
        </div>
    );
}

export default ClothesHeader;
