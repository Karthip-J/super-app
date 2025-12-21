import React, { useState } from 'react';
import HomeHeaderTaxi from '../ComponentsTaxi/HomeHeaderTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";

export default function Coins() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="bg-gradient-to-b from-blue-100 to-green-100 min-h-screen">
      <HomeHeaderTaxi showBack={true} />
      <div className="pt-20 flex justify-center items-start min-h-[calc(100vh-64px)]">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mt-4 border border-blue-200">
          <h1 className="text-2xl font-bold mb-4 text-center text-blue-700">Taxi Coins</h1>
          <div className="mb-2 text-center">You have <span className="font-bold text-green-600">1200</span> Taxi Coins.</div>
          <ul className="space-y-2 mb-4 text-gray-700">
            <li>💰 100 coins = ₹1</li>
            <li>Redeem coins for discounts on rides</li>
            <li>Earn coins by taking rides and referring friends</li>
          </ul>
          <button
            className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-green-600 text-white rounded font-semibold transition"
            onClick={() => setShowModal(true)}
          >
            Redeem Coins
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-xs">
            <h2 className="text-lg font-bold mb-2 text-green-700">Redemption Successful!</h2>
            <p className="mb-4 text-gray-700">Your Taxi Coins have been redeemed for discounts on your next ride.</p>
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-green-600 text-white rounded font-semibold transition"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <FooterTaxi />
    </div>
  );
} 