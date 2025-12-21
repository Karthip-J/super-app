import React from 'react'
import { useState, useRef } from 'react';
import ClothesHeader from "../Header/ClothesHeader";
import { Dialog } from "@headlessui/react";
import { useNavigate, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import shirt from "../Images/shirt.svg";
import arrow from "../../Icons/rigtharrowbutton.svg";
import star from "../../Icons/Star.svg";
import cross from "../../Icons/close-circle.svg";
import Description from '../SubPages/SingleP/Description';
import Footer from '../../Utility/Footer';
import SimilarProducts from '../SubPages/SingleP/SimilarProducts';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import share from "../../Icons/shareicon.svg";
import HeartPage from '../SubPages/SingleP/HeartPage';
import { useCart } from '../../Utility/CartContext';

const images = [
  { src: shirt, alt: "Blue Blazer" },
  { src: shirt, alt: "Green Blazer" },
  { src: shirt, alt: "Yellow Blazer" },
];

const colorOptions = [
  { name: "Blue", image: shirt },
  { name: "Green", image: shirt },
  { name: "Yellow", image: shirt },
];

const sizeOptions = [
  { size: "S", cm: "24-34" },
  { size: "M", cm: "34-46" },
  { size: "L", cm: "46-60" },
];


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

function SingleProductPage() {
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { id } = useParams(); // Get product ID from URL params if available

  const settings = {
    dots: true, 
    infinite: true,
    speed: 500,
    slidesToShow: 2, 
    slidesToScroll: 1,
    arrows: false,
  };

  const handleShare = async () => {
    const productName = "Men Uniforms";
    const productPrice = "₹4,000";
    const shareText = `Check out this amazing product: ${productName} - ${productPrice} on Super App!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} - Super App`,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('Product link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Final fallback: show the URL
        prompt('Copy this link:', shareUrl);
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      // Use product ID from URL params
      if (!id) {
        alert('Product ID not found. Please navigate from a product listing.');
        return;
      }
      
      console.log('Adding to cart:', { productId: id, quantity });
      const result = await addToCart(id, quantity);
      
      if (result.success) {
        alert(`Added ${quantity} item(s) to cart!`);
      } else {
        alert('Failed to add to cart: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  return (
    <div className='min-h-screen'>
      <ClothesHeader />
      <div className="mt-20 pb-32">
        <div className="bg-[#F7F5FF] h-[300px] relative pt-4">
          <div className="relative flex justify-end space-x-3 px-4">
            <HeartPage />
            <div 
              onClick={handleShare}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
            >
              <img src={share} alt="Share" style={{ width: '30px', height: '30px' }} />
            </div>
          </div>

          <Swiper
            modules={[Navigation]}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="w-full max-w-md"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className='h-[250px] px-4'>
                <img src={image.src} alt={image.alt} className="w-full rounded-lg" style={{ height: '210px' }} />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Dots */}
          <div className="flex justify-center mt-2 space-x-2">
            {images.map((_, index) => (
              <span key={index} className={`text-lg ${activeIndex === index ? "text-[#5C3FFF]" : "text-[#EBEBEB]"}`}>
                •
              </span>
            ))}
          </div>
        </div>
        {/* Product Details */}
        <div className="mt-4 ">
          <div className='font-medium text-sm text-[#000000] px-4'>Variants</div>
          <div className="flex gap-2 pt-2 px-4">
            <span
              onClick={() => setIsColorModalOpen(true)}
              className="flex items-center gap-1 text-[#484848] text-xs px-3 py-2 bg-[#F8F7FF] border border-[#CCCCCC] rounded-full cursor-pointer">
              Color <img src={arrow} alt="cross" className="w-4 h-4" />
            </span>
            <span
              onClick={() => setIsSizeModalOpen(true)}
              className="flex items-center gap-1 text-[#484848] text-xs px-3 py-2 bg-[#F8F7FF] border border-[#CCCCCC] rounded-full cursor-pointer">
              Size <img src={arrow} alt="cross" className="w-4 h-4" />
            </span>
          </div>

          <div className='border border-b-[#CCCCCC] border-t-[#CCCCCC] mt-4 px-4 py-2'>
            <div className="flex items-center justify-between w-full ">

              <p className="text-[#684DFF] text-base font-semibold">Best seller</p>

              <div className="flex items-center">
                <img src={star} alt="Star" className="w-4 h-4" />
                <span className="ml-1 text-[#484848] text-sm font-medium">4.2</span>
                <span className="ml-1 text-[#684DFF] text-sm font-medium">{"(1491)"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between w-full mt-0">
              <p className="text-lg font-bold text-[#242424]">Men Uniforms</p>
              <div className="flex items-center">
                <span className="ml-1 text-base font-semibold text-[#1FA300]">{"30% Off"}</span>
              </div>
            </div>
            <p className="text-lg font-semibold text-[#242424]">₹4,000 <span className="line-through text-[#C1C1C1]">₹5,000</span></p>
          </div>
          {/* Quantity and Cart */}
          <div className="mt-2 flex justify-between items-center px-4">
            <p className='font-medium text-sm text-[#000000]'>Quantity</p>
            <select 
              className=" py-0 rounded-full border border-[#CCCCCC] px-2"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="mt-4 space-y-2 px-4">
            <button 
              onClick={handleAddToCart}
              className="text-[#242424] w-full px-4 py-2 rounded-[50px] bg-[#EEEAFF] border border-[#5C3FFF]"
            >
              Add to Cart
            </button>
            <button
              onClick={() => navigate("/home-clothes/all-addresses")}
              className="w-full px-4 py-2 bg-[#5C3FFF] text-white rounded-[50px]"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Color Modal */}
        <Dialog open={isColorModalOpen} onClose={() => setIsColorModalOpen(false)} className="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end w-full border-none">
          <div className="absolute inset-0" onClick={() => setIsColorModalOpen(false)}></div>

          <div className="bg-[#F8F8F8] w-full py-6 px-4 rounded-t-[30px] max-h-[75vh] relative z-10">
            <div className="sticky top-0 left-0 right-0 bg-[#F8F8F8] z-10 flex justify-between items-center">
              <h2 className="py-3 font-semibold text-lg">Color Variants</h2>
              <img onClick={() => setIsColorModalOpen(false)} src={cross} alt="Close" className="cursor-pointer w-5 h-5" />
            </div>
            <div className="flex space-x-4 mt-4 pb-16">
              {colorOptions.map((color, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center p-2 border rounded-lg h-[80px] w-[80px]">
                    <img src={color.image} alt={color.name} className="max-h-full max-w-full" />
                  </div>
                  <p className="font-medium text-xs">{color.name}</p>
                </div>
              ))}
            </div>
          </div>
        </Dialog>


        {/* Size Modal */}
        <Dialog open={isSizeModalOpen} onClose={() => setIsSizeModalOpen(false)} className="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end w-full border-none">
          <div className="absolute inset-0" onClick={() => setIsSizeModalOpen(false)}></div>
          <div className="bg-[#F8F8F8] w-full py-6 px-4 rounded-t-[30px] max-h-[75vh]">
            <div className="sticky top-0 left-0 right-0 bg-[#F8F8F8] z-10 flex justify-between items-center">
              <h2 className=" py-3 font-semibold text-lg ">
                Product size
              </h2>
              <img onClick={() => setIsSizeModalOpen(false)} src={cross} alt="Close" className="cursor-pointer w-5 h-5" />
            </div >
            <div className="flex space-x-4 mt-4 pb-16">
              {sizeOptions?.map((size, index) => (
                <div key={index} className="text-center">
                  <div className="flex flex-col items-center justify-center p-2 border rounded-lg h-[80px] w-[80px] bg-white">
                    <div className="font-medium">{size?.size}</div>
                    <div className="text-sm text-gray-500">{size.cm}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </Dialog>

        <Description />
        <div className="w-full p-4">
          <Slider {...settings} className="w-full">
            {products.map((product, index) => (
              <SimilarProducts key={index} product={product} />
            ))}
          </Slider>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SingleProductPage;