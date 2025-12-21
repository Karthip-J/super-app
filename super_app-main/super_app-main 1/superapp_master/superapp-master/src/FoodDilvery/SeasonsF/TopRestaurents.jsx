import React from "react";
import noodels from "../ImagesF/noodles.svg";
import { useNavigate } from "react-router-dom";
import star from "../../Icons/Star.svg";

const categories = [
    {
        image: noodels,
        title: "Chinese Wok",
        deliveryTime: "20-25 mins",
        rating: 4.3,
    },
    {
        image: noodels,
        title: "Chinese Wok",
        deliveryTime: "20-25 mins",
        rating: 4.3,
    },
    {
        image: noodels,
        title: "Chinese Wok",
        deliveryTime: "20-25 mins",
        rating: 4.3,
    },
    {
        image: noodels,
        title: "Chinese Wok",
        deliveryTime: "20-25 mins",
        rating: 4.3,
    },
    {
        image: noodels,
        title: "Chinese Wok",
        deliveryTime: "20-25 mins",
        rating: 4.3,
    },
];

const TopRestaurents = () => {
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            {categories.map((category, index) => (
                <div
                    key={index}
                    className="bg-white border border-gray-300 rounded-2xl p-2 text-center cursor-pointer"
                >
                    <div
                        onClick={() => navigate("/home-food/single-product-details/68885a4e339d105ec85f30b8")}
                        className="py-4 rounded-[12px] bg-[#EFECFF]">
                        <img src={category.image} alt={category.title} className="w-20 h-20 mx-auto" />
                    </div>
                    <div
                        onClick={() => navigate("/home-food/single-product-details/68885a4e339d105ec85f30b8")}
                        className="text-left">
                        <h3 className="mt-1 text-[#000000] font-medium text-sm">{category.title}</h3>

                    </div>
                    <div className="flex items-center justify-between w-full mt-1">
                        <div className="flex items-center">
                            <img src={star} alt="Star" className="w-4 h-4" />
                            <span className="ml-1 text-[#242424] text-xs font-medium">{category.rating}</span>
                        </div>
                        <p className="text-[#684DFF] text-xs font-medium">{category.deliveryTime}</p>

                    </div>
                </div>
            ))}
        </div>
    );
};

export default TopRestaurents;
