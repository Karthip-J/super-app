import React, { useState, useEffect } from 'react';
import axios from 'axios';
import search from "../../Icons/search.svg";
import cross from "../../Icons/close-circle.svg";
import mic from "../../Icons/Mic.svg";
import shirt from "../ImagesF/noodles.svg";
import star from "../../Icons/Star.svg";
import HeaderInsideFood from '../ComponentsF/HeaderInsideFood';
import FooterFood from '../ComponentsF/FooterFood';
import banner1 from "../../Images/HomeScreen/banner1.svg";
import banner2 from "../../Images/HomeScreen/banner2.svg";
import banner3 from "../../Images/HomeScreen/banner3.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import { useNavigate, useParams } from 'react-router-dom';

const products = [
  {
    id: 1,
    name: "Men Uniforms",
    image: shirt,
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
];

const bannerImage = [
  { id: 1, mobile_image_url: banner3 },
  { id: 2, mobile_image_url: banner2 },
  { id: 3, mobile_image_url: banner1 },
];

const filters = {
  price: ["Under 500 - 1000", "2000 - 3000", "4000 - 6000", "8000 - 12000"],
  offers: ["20% Offer", "35% Offer", "50% Offer"],
  categories: ["Cotton", "Normal Fabric"],
  discount: ["20%", "35%", "50%"],
  colors: ["Green", "Red"]
};

function DishesListBasedOnCategory() {
   const {restaurentCategoryName, vendorId} = useParams();
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

  const [loading, setLoading] = useState(true);

  const [dishes, setDishes] = useState([]);
  useEffect(() => {
    const getDishes = async () => {
      try {
        const response = await axios.get(`https://yrpitsolutions.com/ecom_backend/api/get_restaurant_product_variation/${vendorId}/${restaurentCategoryName}`);
        setDishes(response.data);

        console.log(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    getDishes();

  }, []);

  const [count, setCount] = useState(0);
  return (
    <div className='min-h-screen'>
      <HeaderInsideFood />
      <div className='mt-24 pb-32 px-4'>

        <div className="flex justify-between items-center w-full mt-2">
          <div className="font-medium text-base">{dishes?.vendor?.firm_name}</div>
          <div className="flex items-center">
            <img src={star} alt="Star" className="w-4 h-4" />
            <span className="ml-1 text-[#242424] text-base font-medium">{dishes?.vendor?.average_rating}</span>
          </div>
        </div>

        <div className="w-full">
          <Swiper
            spaceBetween={16}
            slidesPerView="auto"
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="!py-2 w-full"
          >
            {dishes?.vendor?.images?.map((imageUrl, index) => (
              <SwiperSlide key={index} className="!w-full">
                <div className="flex flex-col items-center w-full h-[140px] rounded-2xl shadow-md cursor-pointer overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`banner_image`}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </SwiperSlide>
            ))}

          </Swiper>
        </div>

        <div className="text-center font-medium text-base">Menu</div>

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
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5C3FFF]"
            />
            <img
              src={mic}
              alt="mic"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7"
            />
          </div>

          <button onClick={toggleFilters} className="ml-4 px-4 py-2 bg-[#5C3FFF] text-white rounded-full flex items-center">
            Filters
            {selectedFilters.length > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 border border-white rounded-full text-xs font-bold ml-2">
                {selectedFilters.length}
              </span>
            )}
          </button>
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

        <div className="font-medium text-base">{dishes?.vendor?.firm_name}</div>

        {/* <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 '>
          <div className=' flex row gap-2'>
            <div className='w-[120px] h-[140px]'>
              <img src={shirt} alt="product" className='w-full h-full p-3' />
            </div>
            <div className=' py-2'>
              <p className='font-semibold text-base text-[#242424]'>Chicken Tikka Delight Pizza</p>
              <p className="font-semibold text-sm text-[#242424] mb-2 mt-2">₹ 1,400 <span className="line-through text-[#C1C1C1]">₹ 1,500</span></p>
              <div className="flex justify-between items-center  w-full">
                <div className="flex items-center">
                  {count === 0 ? (
                    <button
                      onClick={() => setCount(1)}
                      className="py-1 rounded-full border border-[#CCCCCC] px-6 bg-[#F8F7FF] font-medium text-sm text-[#242424]"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center border border-[#CCCCCC] rounded-full px-3 py-1 bg-[#F8F7FF]">
                      <button
                        onClick={() => setCount(count - 1)}
                        className="text-[#242424] font-medium px-2"
                      >
                        -
                      </button>
                      <span className="px-3 text-sm font-medium text-[#242424]">{count}</span>
                      <button
                        onClick={() => setCount(count + 1)}
                        className="text-[#242424] font-medium px-2"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className='font-medium text-xs text-[#242424] px-2 pb-3'>Tikka chicken, bell pepper on top of tomato and cheese sauce with fresh homemade mozzarella cheese. [small]</div>
        </div> */}
        {dishes?.data?.map((dish, index) => (
          <div className='bg-white border border-[#E1E1E1] rounded-[20px] mt-4 '>
            <div className=' flex row gap-2'>
              <div className='w-[120px] h-[140px]'>
                <img src={dish?.images[0]} alt="product" className='w-full h-full p-3' />
              </div>
              <div className=' py-2'>
                <p className='font-semibold text-base text-[#242424]'>{dish?.product_variation_name}</p>
                <p className="font-semibold text-sm text-[#242424] mb-2 mt-2">₹ {dish.sales_price} <span className="line-through text-[#C1C1C1]">₹ {dish?.price_with}</span></p>
                <div className="flex justify-between items-center  w-full">
                  <div className="flex items-center">
                    {count === 0 ? (
                      <button
                        onClick={() => setCount(1)}
                        className="py-1 rounded-full border border-[#CCCCCC] px-6 bg-[#F8F7FF] font-medium text-sm text-[#242424]"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center border border-[#CCCCCC] rounded-full px-3 py-1 bg-[#F8F7FF]">
                        <button
                          onClick={() => setCount(count - 1)}
                          className="text-[#242424] font-medium px-2"
                        >
                          -
                        </button>
                        <span className="px-3 text-sm font-medium text-[#242424]">{count}</span>
                        <button
                          onClick={() => setCount(count + 1)}
                          className="text-[#242424] font-medium px-2"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='font-medium text-xs text-[#242424] px-2 pb-3'>{dish?.description}</div>
          </div>
        ))}
      </div>
      <FooterFood />

      {/* Filter Modal */}
      {showFilters && <FilterModal onClose={toggleFilters} onApply={applyFilters} />}
    </div>
  )
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

export default DishesListBasedOnCategory;


