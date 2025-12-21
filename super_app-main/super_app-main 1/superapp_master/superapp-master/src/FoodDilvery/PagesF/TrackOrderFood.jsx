import React, { useEffect, useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import HeaderInsideFood from "../ComponentsF/HeaderInsideFood";
import FooterFood from "../ComponentsF/FooterFood";
import star from "../../Icons/Star.svg";
import phone from "../ImagesF/phonecall.svg";
import km from "../ImagesF/km.svg";
import clock from "../ImagesF/clickmin.svg";
import stepper from "../ImagesF/stepperfortrackorderfood.svg";
import mapImage from "../ImagesF/mapfromFigma.svg"; // Add a static map image
import backButton from "../ImagesF/menuBack.svg";
import { useNavigate } from "react-router-dom";

const TrackOrderFood = () => {
    const navigate = useNavigate();
    const [eta, setEta] = useState("Loading...");
    const [distance, setDistance] = useState("Loading...");

    useEffect(() => {
        // Simulating distance and ETA data
        setTimeout(() => {
            setDistance("21 km");
            setEta("8 min");
        }, 1000);
    }, []);

    return (
        <div className="w-full h-screen bg-white">
            <HeaderInsideFood />

            <div className="pt-16 pb-24">
                {/* Static Map Image Section */}
                {/* Static Map Image Section */}
                <div className="relative w-full h-[300px]">
                    <img src={mapImage} alt="Map Placeholder" className="w-full h-full object-cover" />

                    {/* Back Button Positioned on Top-Left */}
                    <img
                        src={backButton}
                        alt="Back Button"
                        className="absolute top-2 left-1"
                        style={{width:"70px", height:"70px"}}  
                        onClick={()=> navigate(-1)}  
                    />
                </div>

                {/* Order Details */}
                <div className="bg-white p-6 rounded-t-3xl -mt-10 relative">
                    <h2 className="text-[20px] font-semibold">Track Order</h2>

                    {/* Driver Info */}
                    <div className="flex items-center justify-between my-3">
                        <div className="flex items-center space-x-3">
                            <img
                                src="https://randomuser.me/api/portraits/men/32.jpg"
                                alt="Driver"
                                className="rounded-full"
                                style={{ width: '56px', height: '56px' }}
                            />
                            <div>
                                <h3 className="text-lg font-semibold">Wade Warren</h3>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, index) => (
                                        <img key={index} src={star} alt="Star" className="inline-block mr-1" style={{ width: '16px', height: '16px' }} />
                                    ))}
                                    <span className="ml-1 text-[#94A3B8] font-normal text-xs">5.0 Rating</span>
                                </div>
                            </div>
                        </div>
                        <img src={phone} alt="Phone" className="h-9 w-9" />
                    </div>

                    <div className="flex items-center justify-between my-3">
                        <div className="flex items-center space-x-1">
                            <img src={km} alt="Distance" style={{ height: "16px", width: "16px" }} />
                            <span className="text-[#1B4C31] font-medium text-sm">{distance}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <img src={clock} alt="ETA" style={{ height: "16px", width: "16px" }} />
                            <span className="text-[#1B4C31] font-medium text-sm">{eta}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <img src={stepper} alt="track" className="w-5 h-[97px]" />
                        <div className="h-[97px] flex flex-col justify-between">
                            <p className="text-medium text-xs text-[#1E293B] pt-1">1901 Thornridge Cir. Shiloh, Hawaii 81063</p>
                            <p className="text-medium text-xs text-[#1E293B]">3517 W. Gray St. Utica, Pennsylvania 57867</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t pt-2">
                        <div className="text-[#475569] font-normal text-xs">Payment option</div>
                        <div className="font-semibold text-sm">UPI</div>
                    </div>

                    <div className="flex items-center justify-between border-b pb-2">
                        <div className="text-[#475569] font-normal text-xs">Total price</div>
                        <div className="font-semibold text-sm">₹ 1.99</div>
                    </div>
                    <button
                        className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px] mt-4">
                        Cancel Order
                    </button>
                </div>
            </div>

            <FooterFood />
        </div>
    );
};

export default TrackOrderFood;
