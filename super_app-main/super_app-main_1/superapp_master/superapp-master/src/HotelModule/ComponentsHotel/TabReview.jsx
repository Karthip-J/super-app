import React from 'react';
import { useState } from 'react';
import { Pencil } from "lucide-react";
import profilepic from '../../Clothes/Images/profilepic.svg';
import search from "../../Icons/search.svg";
import mic from "../../Icons/Mic.svg";

function TabReview() {
    const [selectedFilters, setSelectedFilters] = useState(["Verified", "Latest"]);
    return (
        <div>
            <div className="flex justify-between items-center mt-1">
                <h3 className="text-black font-medium text-base">Reviews</h3>
                <button className="flex items-center text-[#5C3FFF]">
                    <div className="mr-1 pb-[1px] border-b-2 border-[#5C3FFF] inline-flex">
                        <Pencil size={16} />
                    </div>
                    <span className="font-medium text-base">add Review</span>
                </button>

            </div>
            <div className="flex justify-center mt-3 ">
                <div className="relative w-full ">
                    <img
                        src={search}
                        alt="search"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-7 h-7"
                    />
                    <input
                        type="text"
                        placeholder="What do you want.."
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF]"
                    />
                    <img
                        src={mic}
                        alt="mic"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7"
                    />
                </div>
            </div>
            <div className="pt-4">
                {/* Filter Buttons */}
                <div className="flex justify-between items-center">
                    <button className="px-2 py-1  text-xs font-medium bg-[#F4F3F3] rounded-full">
                        Filter ▼
                    </button>
                    <button className="px-2 py-1 text-white bg-[#5C3FFF] rounded-full text-xs font-medium">
                        Verified
                    </button>
                    <button className="px-2 py-1 text-white bg-[#5C3FFF] rounded-full text-xs font-medium">
                        Latest
                    </button>
                    <button className="px-2 py-1 bg-[#F4F3F3] rounded-full text-xs font-medium">
                        With Photos
                    </button>
                </div>

                {/* User Review */}
                <div className="flex items-center mt-4 space-x-3">
                    <img
                        src={profilepic}
                        alt="User"
                        className="w-11 h-11 rounded-full"
                    />
                    <div>
                        <p className="font-medium text-gray-900">John Dey</p>
                    </div>
                    <p className="ml-auto text-sm text-gray-400">10 months ago</p>
                </div>
            </div>
        </div>
    )
}
export default TabReview;