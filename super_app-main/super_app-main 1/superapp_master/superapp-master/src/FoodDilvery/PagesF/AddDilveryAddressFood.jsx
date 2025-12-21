import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import HeaderF from '../ComponentsF/HeaderF';
import FooterFood from '../ComponentsF/FooterFood';

// Import images
import step1 from "../../Clothes/Images/step1.svg";
import gpsIcon from "../../Clothes/Images/gps.svg";

function AddDeliveryAddressFood() {
    const [selected, setSelected] = useState("Home");
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        altPhoneNumber: "",
        houseNo: "",
        roadName: "",
        landmark: "",
        city: "",
        state: "",
        pincode: ""
    });

    const addressTypes = ["Home", "Office", "Others"];
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        navigate('/home-food/choose-address');
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <HeaderF />
            
            {/* Progress Bar
            <div className='border-b border-gray-200 py-4 bg-white sticky top-16 z-10'>
                <img src={step1} alt="Step 1" className='w-full px-6' />
            </div> */}
            
            Main Content
            <div className="px-4 py-6 max-w-md mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Add delivery address</h2>
                    <button className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                        <span>Add Location</span>
                        <img src={gpsIcon} alt="GPS Location" className="w-4 h-4" />
                    </button>
                </div>

                {/* Address Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* Alternative Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alternative phone number</label>
                        <input
                            type="tel"
                            name="altPhoneNumber"
                            value={formData.altPhoneNumber}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>

                    {/* House Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">House no, Building name*</label>
                        <input
                            type="text"
                            name="houseNo"
                            value={formData.houseNo}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* Road Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Road name, Area, Colony*</label>
                        <input
                            type="text"
                            name="roadName"
                            value={formData.roadName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* Landmark */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nearby landmark*</label>
                        <input
                            type="text"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>
                    </div>

                    {/* Pincode */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode*</label>
                        <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* Address Type Selection */}
                    <div className="mt-6">
                        <h3 className="text-base font-medium text-gray-800 mb-3">Select Type</h3>
                        <div className="flex gap-3">
                            {addressTypes.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSelected(type)}
                                    className={`px-4 py-2 text-sm rounded-full border transition-colors ${
                                        selected === type
                                            ? "bg-orange-600 text-white border-orange-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full mt-8 px-6 py-3 bg-orange-600 text-white font-medium rounded-full hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                    >
                        Save Address
                    </button>
                </form>
            </div>
            <FooterFood />
        </div>
    );
}

export default AddDeliveryAddressFood;