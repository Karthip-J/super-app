import React, { useState } from 'react';
import ClothesHeader from "../Header/ClothesHeader";
import search from "../../Icons/search.svg";
import cross from "../../Icons/close-circle.svg";
import mic from "../../Icons/Mic.svg";
import { FaFilter } from 'react-icons/fa';
import Product from '../SubPages/AllProducts/Product';
import shirt from "../Images/shirt.svg";
import Footer from '../../Utility/Footer';

const products = [
  {
    id: 1,
    name: "Men Uniforms",
    image: shirt, // Replace with actual image URL
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
  {
    id: 2,
    name: "Men Uniforms",
    image: shirt,
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
  {
    id: 3,
    name: "Men Uniforms",
    image: shirt,
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
  {
    id: 4,
    name: "Men Uniforms",
    image: shirt,
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
  {
    id: 5,
    name: "Men Uniforms",
    image: shirt,
    price: 4000,
    originalPrice: 5000,
    discount: "30% Off",
    rating: 4.2,
    bestSeller: true,
  },
];

const filters = {
  price: ["Under 500 - 1000", "2000 - 3000", "4000 - 6000", "8000 - 12000"],
  offers: ["20% Offer", "35% Offer", "50% Offer"],
  categories: ["Cotton", "Normal Fabric"],
  discount: ["20%", "35%", "50%"],
  colors: ["Green", "Red"]
};

function DetailPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const toggleFilters = () => setShowFilters(!showFilters);

  const applyFilters = (filters) => {
    setSelectedFilters(filters);
    setShowFilters(false);
  };

  const removeFilter = (filterToRemove) => {
    setSelectedFilters(selectedFilters.filter(filter => filter !== filterToRemove));
  };

  return (
    <div className='min-h-screen'>
      <ClothesHeader />

      <div className='pt-24 pb-28 px-4 bg-white'>

      <div className="flex justify-center mt-2 items-center bg-white">
        <div className="relative w-full max-w-md">
          <img
            src={search}
            alt="search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-7 h-7"
          />
          <input
            type="text"
            placeholder="What do you want.."
            className="w-full pl-10 pr-24 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF]"
          />
          <img
            src={mic}
            alt="mic"
            className="absolute right-14 top-1/2 transform -translate-y-1/2 w-7 h-7 cursor-pointer"
          />
          <button 
            onClick={toggleFilters} 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            title="Filters"
          >
            <FaFilter className="w-5 h-5 text-[#5C3FFF]" />
            {selectedFilters.length > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold">
                {selectedFilters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Selected Filters Display */}
      <div className="overflow-x-auto whitespace-nowrap mt-2 mb-3">
        <div className="flex gap-2">
          {selectedFilters.map((filter, index) => (
            <span
              key={index}
              className="text-[#484848] text-xs px-3 py-2 bg-[#F7F5FF] border border-[#5C3FFF] rounded-full cursor-pointer inline-block"
              onClick={() => removeFilter(filter)}
            >
              {filter} ✕
            </span>
          ))}
        </div>
      </div>
    
        <div className="grid grid-cols-2 gap-4 w-full mt-2">
          {products.map((product) => (
            <Product key={product.id} product={product} />
          ))}
        </div>
      </div>
      <Footer />
      {/* Filter Modal */}
      {showFilters && <FilterModal onClose={toggleFilters} onApply={applyFilters} />}
    </div>
  );
}

// filters
function FilterModal({ onClose, onApply }) {
  const [selectedFilters, setSelectedFilters] = useState([]);

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end">
      <div className="bg-[#F8F8F8] w-full p-6 rounded-t-[30px] max-h-[75vh] flex flex-col relative">

        {/* 🔹 Fixed Header */}
        <div className="sticky top-0 left-0 right-0 bg-[#F8F8F8] z-10 flex justify-between items-center">
          <h2 className="text-sm py-3 font-medium bg-[#5C3FFF] rounded-[60px] px-8 text-white">
            Filters
          </h2>
          <img onClick={onClose} src={cross} alt="Close" className="cursor-pointer w-5 h-5" />
        </div>

        {/* 🔹 Scrollable Filter Options */}
        <div className="flex-1 overflow-auto mt-4 mb-12">
          {Object.entries(filters).map(([category, options]) => (
            <div key={category} className="mb-4">
              <h3 className="font-medium text-lg mt-4 text-[#242424]">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {options.map((option) => (
                  <button
                    key={option}
                    className={`text-xs px-3 py-1 rounded-full border ${selectedFilters.includes(option) ? 'bg-[#5C3FFF] text-white' : 'bg-[#F8F8F8] border-[#CCCCCC] text-[#484848]'
                      }`}
                    onClick={() => toggleFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 🔹 Fixed Bottom Buttons */}
        <div className="sticky bottom-16 left-0 right-0 bg-white flex flex-col gap-2 mt-6">
          <button
            onClick={() => onApply(selectedFilters)}
            className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px]"
          >
            Apply
          </button>
          <button
            onClick={() => setSelectedFilters([])}
            className="text-[#242424] w-full px-4 py-2 border rounded-[50px] bg-[#EEEAFF]"
          >
            Clear
          </button>
        </div>

      </div>

    </div>

  );
}

export default DetailPage;
