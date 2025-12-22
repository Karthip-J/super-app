import React, { useState } from "react";
import { FaArrowLeft, FaCreditCard } from "react-icons/fa";
import { Heart } from "lucide-react";
import star from "../../Icons/Star.svg";
import { useNavigate } from "react-router-dom";
import locationIcon from "../ImagesHotel/locationIcon.svg";
import hotel1 from "../ImagesHotel/HotelImage1.svg";
import rightsuccess from "../ImagesHotel/paymentSuccess.gif";

function ReviewSummary() {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState("Debit Card");
    const [isLiked, setIsLiked] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="h-screen flex justify-center pt-8 relative">
            <div className="bg-white w-full max-w-md rounded-xl px-4">
                <div className="flex items-center gap-4 text-gray-700 mb-4">
                    <div className="bg-[#F5F5F5] p-2 rounded-full" onClick={() => navigate(-1)}>
                        <FaArrowLeft className="text-xl" />
                    </div>
                    <h2 className="text-lg font-semibold">Review Summary</h2>
                </div>

                {/* Hotel Details */}
                <div className="mt-6 border-[1px] relative flex items-center rounded-2xl shadow-lg p-3 bg-white w-full">
                    <div className="relative cursor-pointer rounded-xl overflow-hidden w-1/2">
                        <img src={hotel1} alt="hotel" className="w-full h-[100px] object-cover rounded-xl" />
                        <div
                            className="absolute top-2 right-2 bg-white rounded-full p-1 cursor-pointer shadow-md"
                            onClick={(e) => { e.stopPropagation(); setIsLiked(prev => !prev); }}
                        >
                            {isLiked ? <Heart size={18} fill="#5C3FFF" stroke="#5C3FFF" /> : <Heart size={18} stroke="#5C3FFF" />}
                        </div>
                    </div>

                    <div className="w-2/3 pl-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#1FA300] font-medium">10% off</span>
                            <div className="flex items-center">
                                <img src={star} alt="star" className="w-3 h-3" />
                                <span className="text-xs font-medium ml-1 ">4.8</span>
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold mt-1 truncate">Golden Valley</h3>
                        <p className="text-xs text-gray-500 flex items-center">
                            <img src={locationIcon} alt="location" className="w-3 h-3 mr-1" />
                            New York, USA
                        </p>
                        <p className="text-[#5C3FFF] font-medium text-sm mt-1">
                            ₹ 150 <span className="text-[#AEACAC] font-medium text-xs">/Day</span>
                        </p>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="mt-6 text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between items-center text-xs font-medium">
                        <div className="text-[#999999]">Booking Date</div>
                        <div>September 24, 2023 | 2:00 PM</div>
                    </div>
                    <div className="pt-1 flex justify-between items-center text-xs font-medium">
                        <div className="text-[#999999]">Check In</div>
                        <div>November 10, 2023</div>
                    </div>
                    <div className="pt-1 flex justify-between items-center text-xs font-medium">
                        <div className="text-[#999999]">Check Out</div>
                        <div>December 04, 2023</div>
                    </div>
                    <div className="pt-1 pb-1 flex justify-between items-center text-xs font-medium">
                        <div className="text-[#999999]">Guest</div>
                        <div>05 Person</div>
                    </div>
                    <hr />
                    <div className="pt-1 flex justify-between items-center text-xs font-medium">
                        <div className="text-[#999999]">Amount</div>
                        <div>₹150.00</div>
                    </div>
                    <div className="pt-1 flex justify-between items-center text-xs font-medium">
                        <div className="text-[#999999]">Tax & Fees</div>
                        <div>₹50.00</div>
                    </div>
                    <div className="pt-1 pb-1 flex justify-between items-center text-xs font-medium">
                        <div className="text-[#999999]">Total</div>
                        <div>₹200.00</div>
                    </div>
                    <hr />
                </div>

                {/* Payment Method */}
                <div className="mt-2 flex justify-between items-center text-gray-700">
                    <div className="flex items-center gap-2">
                        <FaCreditCard className="text-lg" />
                        <span>{paymentMethod}</span>
                    </div>
                    <button className="text-[#5C3FFF] text-xs font-semibold">Change</button>
                </div>
            </div>

            {/* Pay Now Button */}
            <div className="fixed bottom-0 w-full bg-white border-t px-8 pb-12">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full mt-4 bg-[#5C3FFF] text-white py-2 rounded-full text-lg font-medium"
                >
                    Pay Now
                </button>
            </div>

            {/* Modal Popup */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white w-80 p-6 rounded-[30px] shadow-lg">
                        <img src={rightsuccess} alt="success" className="w-[160px] h-[160px] mx-auto mb-4" />
                        <div className="text-xl font-medium mb-4 text-center">Thank You!</div>
                        <div className="text-xl font-medium mb-4 text-center">Your hotel room has been booked.</div>
                        <div className="text-xl font-medium mb-8 text-center">Enjoy Your Day!</div>
                        <div className="flex justify-center gap-4">

                            <button
                                onClick={() => {
                                    // setIsModalOpen(false);
                                    // alert("Payment Successful!"); 
                                    navigate("/home-hotel");
                                }}
                                className="bg-[#5C3FFF] text-white w-full py-3 rounded-full text-sm"
                            >
                              Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReviewSummary;
