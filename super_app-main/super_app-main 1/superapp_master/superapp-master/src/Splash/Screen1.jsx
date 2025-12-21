import React from "react";
import { motion } from "framer-motion";
import quality from "../Images/Splash/Quality.svg";
import backImg from "../Images/Splash/backImg1.svg";
import step from "../Images/Splash/step1img.svg";
import you from "../Images/Splash/You.svg";
import { useNavigate } from "react-router-dom";

function Screen1() {
  const navigate = useNavigate();
  return (
    <div className="relative h-screen w-screen bg-gradient-to-b from-[#d6a1ef] via-[#FFFFFF] to-[#FFFFFF] flex flex-col justify-between items-center">

      {/* Header Text */}
      <div className="pt-8 text-center">
        <div className="flex items-center justify-center">
          <motion.img
            src={quality}
            alt="quality"
            className="h-[98px] w-[126px]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <div className="font-medium text-[26px] text-gray-900">Products</div>
        </div>
        <div className="flex items-center justify-center -mt-12">
          <div className="font-medium text-[26px] text-gray-900">Curated for</div>
          <motion.img
            src={you}
            alt="you"
            className="h-[78px] w-[100px] relative top-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>

      {/* Background and Step Image */}
      <div className="relative flex justify-center items-center w-full">
        <motion.img
          src={backImg}
          alt="background"
          className="absolute top-0 left-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        />
        <motion.img
          src={step}
          alt="step"
          className="relative h-[360px] w-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
        />
      </div>

      <div className="px-4 pb-16">
        <div className="text-center text-gray-600 text-sm font-normal">
          Shop from the comfort of your home with our easy-to-use app
        </div>
        <br />
        <div 
        onClick={() => navigate('/step')} 
        className="w-full h-[42px] bg-[#5C3FFF] text-white text-lg font-semibold rounded-full flex items-center justify-center transition duration-300 hover:bg-[#4A2FCC] hover:scale-105 active:scale-95 cursor-pointer">
          Next
        </div>
      </div>
    </div>
  );
}

export default Screen1;
