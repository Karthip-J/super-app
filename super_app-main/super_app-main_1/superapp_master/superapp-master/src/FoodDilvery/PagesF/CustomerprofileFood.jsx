import React from 'react';
import { useState } from 'react';
import profilepic from '../../Clothes/Images/profilepic.svg';
import plus from "../../Icons/plus.svg";
import { useNavigate } from 'react-router-dom';
import HeaderInsideFood from '../ComponentsF/HeaderInsideFood';
import FooterFood from '../ComponentsF/FooterFood';

function CustomerProfileFood() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState("Home");
    const buttons = ["Home", "Office", "Others"];
    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <HeaderInsideFood />
            <div className='pt-20 pb-28 px-4'>
                <div className='font-medium text-base pt-4'>Your Profile</div>
                <div className="mt-2 bg-white rounded-full p-2 border border-[#E1E1E1] flex items-center gap-3">

                    <div className="relative w-[50px] h-[50px]">
                        <img src={profilepic} alt="Profile" className="rounded-full w-full h-full" />
                        <img
                            src={plus}
                            alt="Plus"
                            className="absolute bottom-0 right-0 w-4 h-4 rounded-full p-0.5"
                            style={{ height: '18px', width: '18px' }}
                        />
                    </div>
                    <div>
                        <div className='text-xs font-medium'>Your Account</div>
                        <div className='text-base font-semibold'>Breeza Quiz</div>
                    </div>
                </div>
                <label className="mt-4 block text-sm text-gray-600 w-full">Full name</label>
                <input
                    type="text"
                    className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                />

                <label className="mt-4 block text-sm text-gray-600 w-full">Phone number</label>
                <input
                    type="number"
                    className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                />

                <label className="mt-4 block text-sm text-gray-600 w-full">Email ID</label>
                <input
                    type="email"
                    className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                />

                <div className="flex gap-x-4 mt-4">
                    <div className="w-1/2">
                        <label className="block text-sm text-gray-600">City*</label>
                        <input
                            type="text"
                            className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm text-gray-600">State</label>
                        <input
                            type="text"
                            className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                        />
                    </div>
                </div>
                <label className="mt-4 block text-sm text-gray-600 w-full">Pincode*</label>
                <input
                    type="text"
                    className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                />
                {/* <div className='font-medium text-base  pt-4'>Select Type</div>
                <div className="flex space-x-2  pt-2">
                    {buttons.map((btn) => (
                        <button
                            key={btn}
                            onClick={() => setSelected(btn)}
                            className={`px-4 py-1 rounded-full border ${selected === btn
                                ? "bg-[#5C3FFF] text-white"
                                : "bg-white text-black border-gray-300"
                                }`}
                        >
                            {btn}
                        </button>
                    ))}
                </div> */}
                <button
                    onClick={() => navigate('/home-food/account')}
                    className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px] mt-6" >
                    Submit
                </button>
            </div>
            <FooterFood />
        </div>
    );
}

export default CustomerProfileFood;
