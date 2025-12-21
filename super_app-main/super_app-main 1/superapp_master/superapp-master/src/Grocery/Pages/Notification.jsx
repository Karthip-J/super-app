import React from 'react'
import arrow from "../../Icons/arrow-right.svg";
import Footer from '../SubPages/Footer';
import Header from '../SubPages/Header';
import banner2 from "../../Images/HomeScreen/banner2.svg";

function Notification() {
    return (
        <div className='bg-[#F8F8F8] min-h-screen'>
            <Header />
            <div className='px-4 pt-24 pb-28'>
                <div className='font-medium text-base'>Notification</div>

                <div className="pt-4 flex flex-col items-center w-full h-[120px] rounded-2xl shadow-md cursor-pointer overflow-hidden">
                    <img
                        src={banner2}
                        alt="banner_image"
                        className="w-full h-full object-cover rounded-2xl"
                    />
                </div>
            </div>
            <Footer />
        </div>
    )
}
export default Notification;