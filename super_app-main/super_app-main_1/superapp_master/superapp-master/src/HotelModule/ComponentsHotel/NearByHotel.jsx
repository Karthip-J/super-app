import React, { useState } from "react";
import { Heart } from "lucide-react";
import star from "../../Icons/Star.svg";
import { useNavigate } from "react-router-dom";
import locationIcon from "../ImagesHotel/locationIcon.svg";

const NearByHotel = ({ product }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);

    return (
        <div className=" border-[1px] relative flex items-center rounded-2xl shadow-lg p-3 bg-white w-full">
            {/* Image Section */}
            <div
                className="relative cursor-pointer rounded-xl overflow-hidden w-1/2"
                onClick={() => navigate(`/home-hotel/particular-hotel-details`)}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[100px] object-cover rounded-xl"
                    onError={(e) => {
                        console.error('Failed to load hotel image:', product.image);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = '/placeholder-image.png';
                        e.target.alt = `${product.name} - Image not available`;
                    }}
                />
                <div
                    className="absolute top-2 right-2 bg-white rounded-full p-1 cursor-pointer shadow-md"
                    onClick={(e) => { e.stopPropagation(); setIsLiked((prev) => !prev); }}
                >
                    {isLiked ? (
                        <Heart size={18} fill="#5C3FFF" stroke="#5C3FFF" />
                    ) : (
                        <Heart size={18} stroke="#5C3FFF" />
                    )}
                </div>
            </div>
           

            {/* Hotel Details Section */}
            <div className="w-2/3 pl-3">
                {/* Discount and Rating */}
                <div className="flex justify-between items-center">
                    <span className="text-xs text-[#1FA300] font-medium">{product.discount}</span>
                    <div className="flex items-center">
                        <img src={star} alt="star" className="w-3 h-3" />
                        <span className="text-xs font-medium ml-1 ">{product.rating}</span>
                    </div>
                </div>

                {/* Hotel Name & Location */}
                <h3 className="text-sm font-semibold mt-1 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 flex items-center">
                    <img src={locationIcon} alt="location" className="w-3 h-3 mr-1" />
                    {product.location || "New York, USA"}
                </p>

                {/* Price */}
                <p className="text-[#5C3FFF] font-medium text-sm mt-1">
                    ₹ {product.price} <span className="text-[#AEACAC] font-medium text-xs">/Day</span>
                </p>
            </div>
        </div>
    );
};

export default NearByHotel;
