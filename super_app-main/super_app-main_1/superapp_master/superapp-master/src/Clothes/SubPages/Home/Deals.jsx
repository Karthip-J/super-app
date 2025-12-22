import React from "react";
import shirt from "../../Images/shirt.svg";
import { useNavigate } from "react-router-dom";

const categories = [
    {
        image: shirt,
        title: "Uniforms",
        offer: "Upto 40% Offers",
    },
    {
        image: shirt,
        title: "Home Appliances",
        offer: "Upto 20% Offers",
    },
    {
        image: shirt,
        title: "Uniforms",
        offer: "Upto 40% Offers",
    },
    {
        image: shirt,
        title: "Home Appliances",
        offer: "Upto 20% Offers",
    },
    {
        image: shirt,
        title: "Uniforms",
        offer: "Upto 40% Offers",
    },
];

const Deals = () => {
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            {categories.map((category, index) => (
                <div
                    key={index}
                    className="bg-white border border-gray-300 rounded-2xl p-2 text-center cursor-pointer"
                >
                    <div
                        onClick={() => navigate("/home-clothes/detail-page")}
                        className="py-4 rounded-[12px] bg-[#EFECFF]">
                        <img src={category.image} alt={category.title} className="w-20 h-20 mx-auto" />
                    </div>
                    <div
                        onClick={() => navigate("/home-clothes/detail-page")}
                        className="text-left">
                        <h3 className="mt-1 text-[#000000] font-medium text-sm">{category.title}</h3>
                        <p className="text-[#5C3FFF] text-xs">{category.offer}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Deals;
