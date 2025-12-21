import React, { useState } from "react";
import { Heart } from "lucide-react";
import star from "../../Icons/Star.svg";
import { useNavigate } from "react-router-dom";
import locationIcon from "../ImagesHotel/locationIcon.svg";

const SlidingCaurosel = ({ product }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
   

    return (
        <div className="relative rounded-xl shadow-lg p-2 bg-white border-[1px] mx-2">
            {/* Image with Heart Icon */}
            <div
                className="relative cursor-pointer rounded-lg overflow-hidden"
                onClick={() => navigate(`/home-hotel/particular-hotel-details`)}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-[140px] object-cover rounded-lg"
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

            {/* Discount and Rating */}
            <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[10px] text-[#1FA300] font-medium">{product.discount}</span>
                <div className="flex items-center">
                    <img src={star} alt="star" className="w-3 h-3" />
                    <span className="text-xs font-medium ml-1">{product.rating}</span>
                </div>
            </div>

            {/* Hotel Name & Location */}
            <h3 className="text-sm font-semibold mt-1 px-1 truncate">{product.name}</h3>
            <p className="text-xs text-gray-500 px-1 flex items-center">
                <img src={locationIcon} alt="location" className="w-3 h-3 mr-1" />
                {product.location || "New York, USA"}
            </p>

            {/* Price */}
            <p className="text-[#5C3FFF] font-medium text-sm px-1">
                ₹ {product.price} <span className="text-[#AEACAC] font-medium text-xs">/Day</span>
            </p>
        </div>
    );
};

export default SlidingCaurosel;
