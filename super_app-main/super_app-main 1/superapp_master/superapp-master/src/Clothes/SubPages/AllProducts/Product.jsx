import React, { useState } from "react";
import { Heart } from "lucide-react";
import star from "../../../Icons/Star.svg";
import "./Product.css";
import { useNavigate } from "react-router-dom";

const Product = ({ product }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);

    const formatAmount = (amount) => {
        return amount.toLocaleString("en-IN");
    };

    function handleLikeClick() {
        setIsLiked((prev) => !prev); // Toggle state
    }
    return (
        <div className="relative bg-white p-4 rounded-2xl border border-gray-300 shadow-md w-40 h-[230px] flex flex-col ">
            {/* ✅ Ribbon with Half-Diagonal Cut */}
            <div className="absolute top-2 right-2 z-20">
                <div
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-[#684DFF] shadow-md"
                    onClick={() => handleLikeClick()}
                >
                    {isLiked ? (

                        <Heart size={20} fill="#684DFF" stroke="#684DFF" />
                    ) : (

                        <Heart size={20} stroke="#684DFF" />

                    )}

                </div>
            </div>
            <div>
                <div className=" rounded-tr-[10px] absolute top-0 right-0 w-[60px] h-[60px] bg-[#684DFF] clip-ribbon flex items-center justify-center">
                </div>

                {/* Product Image */}
                <div 
                onClick={() => navigate(`/home-clothes/single-product-page`)}
                className="relative w-[120px] h-[120px] mx-auto pt-2 flex items-center justify-center overflow-hidden rounded-md">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="object-contain w-full h-full"
                    />
                </div>
            </div>
            {/* Product Info */}
            <div className="mt-3 flex flex-col items-start text-left w-full">
                {/* Badge & Rating */}
                <div className="flex items-center justify-between w-full mt-1">
                    {product.bestSeller && (
                        <p className="text-[#684DFF] text-xs font-medium">Best seller</p>
                    )}
                    <div className="flex items-center">
                        <img src={star} alt="Star" className="w-4 h-4" />
                        <span className="ml-1 text-[#242424] text-xs font-medium">{product.rating}</span>
                    </div>
                </div>

                {/* Product Name */}
                <h3 className="text-[#242424] font-medium text-sm truncate w-full">
                    {product.name}
                </h3>

                {/* Discount Info */}
                <p className="text-[#1FA300] text-[10px] font-semibold">{product.discount}</p>

                {/* Pricing */}
                <div className="flex items-center space-x-2 mt-1">
                    <p className="text-[#242424] font-medium text-sm">₹ {formatAmount(product.price)}</p>
                    <p className="text-[#C1C1C1] line-through text-[10px]">
                        ₹{formatAmount(product.originalPrice)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Product;
