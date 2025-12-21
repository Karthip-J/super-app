import React from "react";
import filter from "../Images/filtertcolorButton.svg";
import { useNavigate } from "react-router-dom";

function MyordersFilter() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#F8F8F8] min-h-screen flex flex-col">
      {/* Fixed Top Bar */}
      <div className="fixed top-0 left-0 w-full shadow-md flex justify-end pt-8 px-4 pb-2 z-50 bg-white">
        <img src={filter} alt="" style={{ width: "70px", height: "40px" }} />
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-28 px-4 overflow-auto">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
          />
          <div className="text-sm font-semibold">Delivered</div>
        </div>
        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
          />
          <div className="text-sm font-semibold">Not yet shipped</div>
        </div>
        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
          />
          <div className="text-sm font-semibold">Cancelled</div>
        </div>

        <div className="text-[#797979] text-sm font-medium mt-6">
          Filtered by date
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
          />
          <div className="text-sm font-semibold">Last 30 days</div>
        </div>
        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
          />
          <div className="text-sm font-semibold">Last 3 months</div>
        </div>
        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
          />
          <div className="text-sm font-semibold">2023</div>
        </div>
        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 border-2 border-[#5C3FFF] rounded-full appearance-none checked:bg-[#5C3FFF] checked:border-[#5C3FFF]"
          />
          <div className="text-sm font-semibold">2022</div>
        </div>
      </div>

      {/* Sticky Bottom Buttons */}
      <div className="fixed bottom-14 left-0 w-full px-4 py-4">
        <button
          onClick={() => navigate("/home-grocery/order-list")}
          className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px]">
          Apply
        </button>
        <button className="text-[#242424] w-full px-4 py-2 border rounded-[50px] bg-[#EEEAFF] mt-2"
          onClick={() => navigate("/home-grocery/order-list")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default MyordersFilter;
