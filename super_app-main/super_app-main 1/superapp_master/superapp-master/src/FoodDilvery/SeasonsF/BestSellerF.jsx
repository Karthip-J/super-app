import React, { useState } from "react";
import { Heart } from "lucide-react";
import star from "../../Icons/Star.svg";
import "./BestSellerF.css";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BestSellerF = ({ product }) => {

    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);

    const formatAmount = (amount) => amount.toLocaleString("en-IN");

    return (
        <div className="relative bg-white p-4 rounded-2xl border border-gray-300 shadow-md flex flex-col mx-2">
            {/* Like Button */}
            <div className="absolute top-2 right-2 z-20">
                <div
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-[#684DFF] shadow-md cursor-pointer"
                    onClick={() => setIsLiked((prev) => !prev)}
                >
                    {isLiked ? <Heart size={20} fill="#684DFF" stroke="#684DFF" /> : <Heart size={20} stroke="#684DFF" />}
                </div>
            </div>

            {/* Ribbon */}
            <div className="absolute top-0 right-0 w-[60px] h-[60px] bg-[#684DFF] clip-ribbon flex items-center justify-center rounded-tr-2xl"></div>

            {/* Product Image */}
            <div
                onClick={() => navigate(`/home-food/single-product-details/68885a4e339d105ec85f30b8`)}
                className="relative w-[120px] h-[120px] mx-auto pt-2 flex items-center justify-center overflow-hidden rounded-md cursor-pointer"
            >
                <img src={product.image} alt={product.name} className="object-contain w-full h-full" />
            </div>

            {/* Product Info */}
            <div className="mt-3 flex flex-col items-start text-left w-full">
                {/* Badge & Rating */}
                <div className="flex items-center justify-between w-full mt-1">
                   <p className="text-[#684DFF] text-xs font-medium">{product.deliveryTime}</p>
                    <div className="flex items-center">
                        <img src={star} alt="Star" className="w-4 h-4" />
                        <span className="ml-1 text-[#242424] text-xs font-medium">{product.rating}</span>
                    </div>
                </div>

                {/* Product Name */}
                <h3 className="text-[#242424] font-medium text-base truncate w-full">{product.name}</h3>
               
                {/* Pricing */}
                <div className="flex items-center space-x-2">
                    <p className="text-[#1FA300] font-semibold text-xs"> {product.discount}</p>

                </div>

                {/* <div className="mt-1 w-full text-center bg-[#5C3FFF] rounded-full text-white font-normal text-sm py-1">Add to Cart</div> */}
            </div>
        </div>
    );
};


export default BestSellerF;
