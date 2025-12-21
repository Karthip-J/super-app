import React from 'react';
import HomeHeaderHotel from '../ComponentsHotel/HomeHeaderHotel';
import NearByHotel from '../ComponentsHotel/NearByHotel';
import hotel1 from "../ImagesHotel/HotelImage1.svg";
import FooterHotel from '../ComponentsHotel/FooterHotel';

const products = [
    {
        id: 1,
        name: "Hotel Galaxy",
        image: hotel1,
        price: 4000,
        originalPrice: 5000,
        discount: "10% Off",
        rating: 4.2,
        deliveryTime: "20-25 mins",
    },
    {
        id: 2,
        name: "Hotel Galaxy",
        image: hotel1,
        price: 4000,
        originalPrice: 5000,
        discount: "10% Off",
        rating: 4.2,
        deliveryTime: "20-25 mins",
    },
    {
        id: 3,
        name: "Hotel Galaxy",
        image: hotel1,
        price: 4000,
        originalPrice: 5000,
        discount: "10% Off",
        rating: 4.2,
        deliveryTime: "20-25 mins",
    },
]

function Favourites() {
    return (
        <div>
            <HomeHeaderHotel />
            <div className="px-4 pt-20">  
                <div className="flex justify-between items-center w-full mt-3 mb-2 ">
                    <div className="font-medium text-[16px]">Nearby Hotel </div>
                    <div></div>
                </div>
                {products.map((product, index) => (
                    <div key={index} className="py-2">
                        <NearByHotel product={product} />
                    </div>
                ))}
            </div>
            <FooterHotel/>
        </div>
    );
}
export default Favourites;