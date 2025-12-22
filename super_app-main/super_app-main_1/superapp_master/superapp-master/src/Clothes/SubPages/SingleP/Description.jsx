import React, { useState } from "react";
import arrow from "../../../Icons/arrow-right-black.svg";
import downarrow from "../../../Icons/arrow-down.svg";
import star from "../../../Icons/Star.svg";
import rightbutton from "../../../Icons/rigtharrowbutton.svg";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Product from "../AllProducts/Product";
import shirt from "../../Images/shirt.svg";

const reviews = [
    {
        id: 1,
        name: "Breeza Finn",
        rating: 4.2,
        text: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
        id: 2,
        name: "John Doe",
        rating: 4.5,
        text: "Great product! Really improved my workflow. Highly recommended.",
        avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
        id: 3,
        name: "Jane Smith",
        rating: 4.8,
        text: "Absolutely love it! The UI is smooth and easy to use.",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
];



const Description = () => {
    const [view, setView] = useState("list");
    const [activeIndex, setActiveIndex] = useState(0);
    const totalSlides = reviews.length;
    const [showDescription, setShowDescription] = useState(false);
    return (
        <div className="max-w-3xl mx-auto mt-4">
            <div className=" border-t border-[#CCCCCC] py-3 px-4 ">
                <div className="flex justify-between items-centercursor-pointer" onClick={() => setShowDescription(!showDescription)}>
                    <h2 className="text-sm font-medium">Description</h2>
                    <img src={arrow} className={`w-4 h-4 transform transition-transform ${showDescription ? "rotate-90" : ""}`} alt="Toggle view" />
                </div>
                {showDescription && (
                    <div className="px-4 py-3  text-sm text-gray-700">
                        This is a great product with high-quality materials and excellent craftsmanship.
                    </div>
                )}
            </div>
            <div className="px-4 py-3 border-t border-b border-[#CCCCCC]">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-medium">Customer Reviews</h2>
                    <img
                        src={view === "list" ? arrow : downarrow}
                        onClick={() => setView(view === "list" ? "carousel" : "list")}
                        className="w-4 h-4 cursor-pointer transform transition-transform"
                        alt="Toggle view"
                    />
                </div>
                {view === "carousel" && (
                    <div className="mt-3 relative flex flex-col items-center px-4">
                        <div className="mb-3 flex items-center justify-between w-full">
                            <div className="flex items-center">
                                <img src={star} alt="Star" className="w-4 h-4" />
                                <span className="ml-1 text-[#484848] text-sm font-medium">4.2</span>
                                <span className="ml-1 text-[#684DFF] text-sm font-medium">{"(1491 Reviews)"}</span>
                            </div>
                            <p className="text-white text-sm font-medium bg-[#684DFF] px-3 py-2 rounded-[60px]">Add Reviews</p>
                        </div>

                        <Swiper
                            modules={[Navigation]}
                            spaceBetween={20}
                            slidesPerView={1}
                            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                            navigation={{ prevEl: ".custom-prev", nextEl: ".custom-next" }}
                            style={{ width: "100%", height: "auto", paddingBottom: "10px" }}
                        >
                            {reviews.map((review) => (
                                <SwiperSlide key={review.id}>
                                    <div className="bg-[#F7F5FF] rounded-[20px] p-4 border border-[#5C3FFF]">
                                        <div className="flex items-center gap-3">
                                            <img src={review.avatar} alt={review.name} className="rounded-full w-[50px] h-[50px]" />
                                            <div>
                                                <div className="text-base font-semibold">{review.name}</div>
                                                <div className="flex items-center">
                                                    <img src={star} alt="Star" className="w-4 h-4" />
                                                    <span className="ml-1 text-[#484848] text-base font-medium">{review.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-2 text-xs text-[#484848]">{review.text}</div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        <div className="flex justify-center gap-4 mt-4">
                            <button className={`custom-prev w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${activeIndex === 0 ? " border border-gray-400 text-gray-400 cursor-not-allowed" : "border border-[#684DFF] text-[#684DFF] "}`} disabled={activeIndex === 0}>
                                <FaChevronLeft />
                            </button>

                            <button className={`custom-next w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${activeIndex === totalSlides - 1 ? "border border-gray-400 text-gray-400 cursor-not-allowed" : "border border-[#684DFF] text-[#684DFF] "}`} disabled={activeIndex === totalSlides - 1}>
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center  py-3 px-4">
                <h2 className="text-sm font-medium">Similar Products</h2>
                <img src={rightbutton} className="w-4 h-4 cursor-pointer" alt="Toggle view" />
            </div>
            {/* <div className="grid grid-cols-2 gap-4 w-full mt-2 px-4">
                {products.map((product) => (
                    <Product key={product.id} product={product} />
                ))}
            </div> */}
        </div>
    );
};

export default Description;
