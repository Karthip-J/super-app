import React, { useState } from "react";
import { FaUsers, FaBed, FaCity, FaRulerCombined, } from "react-icons/fa";
import { CheckCircle, Info, Circle } from "lucide-react";
import leftarrow from "../../Icons/arrow-left.svg";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import hotel1 from "../ImagesHotel/hotel2.svg";

const roomsData = [
  {
    id: 1,
    type: "Deluxe Room",
    size: "150 sq.ft (11 sq.m)",
    maxGuests: 4,
    bed: "Double Bed",
    view: "City View",
    price: 1620,
    originalPrice: 1850,
    cancellation: "Free Cancellation before 28 Mar 12:59 PM",
    available: 10,
    images: [hotel1, hotel1],
  },
  {
    id: 2,
    type: "Studio Room",
    size: "150 sq.ft (11 sq.m)",
    maxGuests: 2,
    bed: "Double Bed",
    view: "City View",
    price: 1620,
    originalPrice: 1850,
    available: 5,
    images: [hotel1, hotel1],
  },
];

const Rooms = () => {
  const navigate = useNavigate();
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [currentIndex, setCurrentIndex] = useState({});

  const handleSlideChange = (roomId, swiper) => {
    setCurrentIndex((prev) => ({ ...prev, [roomId]: swiper.activeIndex + 1 }));
  };

  const [selectedRoom, setSelectedRoom] = useState(null);
  
  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md pt-8 px-4 pb-2 z-50">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <img
            src={leftarrow}
            alt="arrow"
            className="w-6 h-6 cursor-pointer"
            onClick={() => navigate(-1)}
          />
          Hotel Galaxy
        </h1>
        <p className="text-gray-500 text-sm pl-8">28 Mar - 29 Mar, 2 Adults</p>
      </div>

      {/* Room Cards */}
      <div className="pt-24 pb-32 space-y-4 w-full max-w-md px-4">
        {roomsData.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl overflow-hidden border">

            <div className="p-1 pl-2 border-b border-l-4 border-l-[#5C3FFF]">
              <div className="text-lg font-semibold text-gray-800">{room.type}</div>
            </div>

            {/* Image Slider */}
            <div className="w-full relative">
              <Swiper
                modules={[Pagination]}
                pagination={{ clickable: true }}
                className="w-full h-36"
                onSlideChange={(swiper) => handleSlideChange(room.id, swiper)}
              >
                {room.images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={image}
                      alt={`Room ${room.type} Image ${index + 1}`}
                      className="w-full h-36 object-cover"
                      onError={(e) => {
                        console.error('Failed to load room image:', image);
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = '/placeholder-image.png';
                        e.target.alt = `Room ${room.type} - Image not available`;
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              {/* Image Counter */}
              <div className="z-20 absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-lg">
                {currentIndex[room.id] || 1} / {room.images.length}
              </div>
            </div>

            {/* Room Details */}
            <div className="p-3">
              <div className="flex items-center space-x-6 text-gray-600 text-sm">
                <div className="flex items-center">
                  <FaRulerCombined className="mr-1" />
                  <span>{room.size}</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="mr-1" />
                  <span>Max {room.maxGuests} Guests</span>
                </div>
              </div>

              <div className="flex items-center space-x-16 mt-2 text-gray-600 text-sm">
                <div className="flex items-center">
                  <FaBed className="mr-1" />
                  <span>{room.bed}</span>
                </div>
                <div className="flex items-center">
                  <FaCity className="mr-1" />
                  <span>{room.view}</span>
                </div>
              </div>

              {/* Toggle More Info */}
              <button
                onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                className="text-blue-600 font-semibold text-sm mt-3"
              >
                {expandedRoom === room.id ? "- Hide room info" : "+ More room info"}
              </button>

              {/* Expanded Room Info */}
              {expandedRoom === room.id && (
                <div className="border rounded-lg p-4 shadow-sm bg-white w-full max-w-md flex flex-col gap-0">
                  {/* Title */}
                  <div>
                    <div className="font-semibold text-sm">1. Room with free cancellation</div>

                    {/* Cancellation Info */}
                    <p className="text-xs text-green-600 mt-1">
                      Free Cancellation before <strong>28 Mar 12:59 PM</strong>
                    </p>

                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                    </div>

                    <div className="text-right">
                      <div >
                        <p className="text-gray-400 text-sm line-through text-right pt-2">₹1000</p>
                        <p className="text-green-600 font-bold text-lg">₹800</p>
                        <p className="text-gray-500 text-xs">+ ₹100 taxes & fees</p>
                      </div>
                      <div
                        className={`ml-auto mt-2 flex items-center w-[80px] py-1 pl-3 rounded-lg text-sm font-medium ${selectedRoom === room.id ? "bg-white text-[#5C3FFF] w-full pl-6" : "bg-[#5C3FFF] text-white"
                          }`}
                        onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
                      >
                        {selectedRoom === room.id ? (
                          <>
                            <CheckCircle size={14} className="mr-1" />
                            Selected
                          </>
                        ) : (
                          <>
                            <Circle size={14} className="mr-1" />
                            Select
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className=" fixed bottom-0 w-full bg-white shadow-md flex justify-between items-center  py-1 border-t pb-12 z-50 px-4">
      <div>
        <p className="text-gray-400 text-sm"><span className="line-through">₹4,860</span> <span className="text-blue-500 text-sm font-medium">1 offer applied</span></p>
        <p className="text-black font-bold text-lg">₹1,620<span className="text-gray-500 font-normal text-sm"> /night</span></p>
        <p className="text-gray-500 text-sm">+ ₹388 taxes & fees</p>
      </div>
      <button
      onClick={() => navigate("/home-hotel/review-summary")}
      className="bg-[#5C3FFF] text-white font-semibold px-4 py-2 rounded-md shadow">Continue</button>
    </div>
    </div>
  );
};

export default Rooms;
