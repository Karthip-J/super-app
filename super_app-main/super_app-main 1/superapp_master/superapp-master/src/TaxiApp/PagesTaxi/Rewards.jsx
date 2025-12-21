import React from 'react';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";

export default function Rewards() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="shadow">
        <HeaderInsideTaxi />
      </div>
      <div className="pt-4 pb-8 px-2 w-full flex justify-center items-start min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">My Rewards</h1>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Reward History</h2>
            <ul className="text-gray-700 text-sm">
              <li className="flex justify-between py-1"><span>5% Cashback</span><span className="text-green-600 font-semibold">₹25</span></li>
              <li className="flex justify-between py-1"><span>Gold Member</span><span className="text-yellow-600 font-semibold">Active</span></li>
              <li className="flex justify-between py-1"><span>Free Ride Coupon</span><span className="text-blue-600 font-semibold">FREERIDE</span></li>
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">How to earn more rewards?</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Take more rides to unlock cashback offers.</li>
              <li>Refer friends to earn bonus rewards.</li>
              <li>Participate in special promotions.</li>
            </ul>
          </div>
          <button className="px-6 py-2 bg-yellow-400 text-black rounded font-semibold w-full shadow hover:bg-yellow-300 transition mb-4">Redeem Rewards</button>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Reward Tiers</h2>
            <ul className="text-gray-700 text-sm">
              <li><span className="font-bold">Silver:</span> 0-10 rides/month</li>
              <li><span className="font-bold">Gold:</span> 11-30 rides/month</li>
              <li><span className="font-bold">Platinum:</span> 31+ rides/month</li>
            </ul>
          </div>
        </div>
      </div>
      <FooterTaxi />
    </div>
  );
} 