import React from 'react';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";

export default function Refer() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="shadow">
        <HeaderInsideTaxi />
      </div>
      <div className="pt-4 pb-8 px-2 w-full flex justify-center items-start min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">Refer & Earn</h1>
          <div className="mb-4 text-center">Invite your friends and earn <span className="font-bold text-yellow-600">₹50</span> for each successful referral!</div>
          <div className="bg-yellow-50 rounded-lg p-4 mb-6 flex flex-col items-center">
            <div className="font-mono text-lg">Your Code: <span className="font-bold">RAPIDO50</span></div>
            <button className="mt-3 px-6 py-2 bg-yellow-400 rounded text-black font-semibold shadow hover:bg-yellow-300 transition">Copy Code</button>
            <button className="mt-3 px-6 py-2 bg-green-500 text-white rounded font-semibold shadow hover:bg-green-400 transition">Share via WhatsApp</button>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">How it works</h2>
            <ol className="list-decimal pl-5 text-gray-600 space-y-1">
              <li>Share your referral code with friends.</li>
              <li>Your friend signs up and takes their first ride.</li>
              <li>You both get rewards instantly!</li>
            </ol>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Your Referrals</h2>
            <ul className="text-gray-700 text-sm">
              <li className="flex justify-between py-1"><span>Arun Kumar</span><span className="text-green-600 font-semibold">₹50 earned</span></li>
              <li className="flex justify-between py-1"><span>Priya S</span><span className="text-yellow-600 font-semibold">Pending</span></li>
              <li className="flex justify-between py-1"><span>Rahul Dev</span><span className="text-green-600 font-semibold">₹50 earned</span></li>
            </ul>
          </div>
          <div className="text-center mt-4">
            <a href="#" className="text-blue-600 underline text-sm">Referral Terms & Conditions</a>
          </div>
        </div>
      </div>
      <FooterTaxi />
    </div>
  );
} 