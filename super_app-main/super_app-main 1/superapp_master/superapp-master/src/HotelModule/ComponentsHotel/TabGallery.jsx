import React from 'react';
import { useState } from 'react';
import hotel1 from "../ImagesHotel/HotelImage1.svg";
import hotel2 from "../ImagesHotel/hotel2.svg";
import hotel3 from "../ImagesHotel/hotel3.svg";
import { FaPlusSquare } from "react-icons/fa";

function TabGallery() {
    const [images, setImages] = useState([
        hotel1,
        hotel2,
        hotel3
    ]);

    const handleAddPhoto = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImages((prev) => [...prev, event.target.result]);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="">
            {/* Header */}
            <div className="flex justify-between items-center mb-2 md:mb-4 mt-1">
                <h2 className="text-xs md:text-base font-medium">
                    Gallery <span className="text-[#5C3FFF]">({images.length})</span>
                </h2>
                <button
                    className="flex items-center text-[#5C3FFF] text-xs md:text-base font-medium"
                    onClick={() => document.getElementById('gallery-photo-input').click()}
                >
                    <FaPlusSquare className="mr-1 text-xs md:text-base" /> add photo
                </button>
                <input
                    id="gallery-photo-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAddPhoto}
                />
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Gallery ${index}`}
                        className="rounded-lg object-cover w-full h-24 md:h-40"
                    />
                ))}
            </div>

        </div>
    )
}
export default TabGallery;