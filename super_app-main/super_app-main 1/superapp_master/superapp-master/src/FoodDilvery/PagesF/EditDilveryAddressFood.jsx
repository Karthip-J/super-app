import React from 'react';
import { useState } from "react";
import step1 from "../../Clothes/Images/step1.svg";
import gps from "../../Clothes/Images/gps.svg";
import { useNavigate } from 'react-router-dom';
import HeaderInsideFood from '../ComponentsF/HeaderInsideFood';

function EditDilveryAddressFood() {
    const [selected, setSelected] = useState("Home");

    const buttons = ["Home", "Office", "Others"];
    const navigate = useNavigate();
    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <HeaderInsideFood />
            {/* <div className='border border-[#E1E1E1] py-4'>
                <img src={step1} alt="" className='w-full mt-20 px-6' />
            </div > */}
            <div className=" flex justify-between items-center px-4 pt-24">
                <h2 className="text-base font-medium">Add delivery address</h2>
                <div className="flex items-center gap-2"> {/* Added flex, items-center & gap */}
                    <span className='text-[#888888] text-xs font-normal'>Add Location</span>
                    <img src={gps} alt="Close" className="cursor-pointer w-8 h-8" />
                </div>

            </div>
            <div className='px-4 pb-16'>
                <div className='pt-2'>
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

                    <label className="mt-4 block text-sm text-gray-600 w-full">Alternative phone number</label>
                    <input
                        type="number"
                        className=" bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">House no, Building name*</label>
                    <input
                        type="text"
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Road name, Area, Colony*</label>
                    <input
                        type="text"
                        className="bg-white w-full p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF] mt-1"
                    />

                    <label className="mt-4 block text-sm text-gray-600 w-full">Near by landmark*</label>
                    <input
                        type="text"
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
                            <label className="block text-sm text-gray-600">State*</label>
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
                </div>

                <div className='font-medium text-base  pt-4'>Select Type</div>

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
                </div>
                <button
                    onClick={() => navigate('/home-food/edit-option-all-address')}
                    className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px] mt-6" >
                    Dropping Place
                </button>
            </div>
        </div>
    )
}

export default EditDilveryAddressFood;