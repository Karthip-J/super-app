import React from 'react';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';

export default function Help() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="shadow">
        <HeaderInsideTaxi />
      </div>
      <div className="pt-4 pb-8 px-2 w-full flex justify-center items-start min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">Help & Support</h1>
          <ul className="space-y-5 mb-6">
            <li>
              <strong className="text-gray-800">How do I book a ride?</strong>
              <div className="text-gray-600 mt-1">Tap on "Where are you going?", enter your pickup and drop locations, and choose your ride type.</div>
            </li>
            <li>
              <strong className="text-gray-800">How do I pay for my ride?</strong>
              <div className="text-gray-600 mt-1">You can pay using cash, credit/debit cards, UPI, or wallet. Select your preferred payment method before confirming your ride.</div>
            </li>
            <li>
              <strong className="text-gray-800">I lost an item in the cab. What should I do?</strong>
              <div className="text-gray-600 mt-1">Go to 'My Rides', select the ride, and tap 'Report Lost Item'. Our support team will assist you.</div>
            </li>
            <li>
              <strong className="text-gray-800">App is not working or keeps crashing.</strong>
              <div className="text-gray-600 mt-1">Try restarting the app or your phone. If the issue persists, update the app or contact support below.</div>
            </li>
            <li>
              <strong className="text-gray-800">How do I cancel a ride?</strong>
              <div className="text-gray-600 mt-1">Go to 'My Rides', select your ride, and tap 'Cancel Ride'.</div>
            </li>
          </ul>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Troubleshooting</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Check your internet connection.</li>
              <li>Ensure location services are enabled.</li>
              <li>Update the app to the latest version.</li>
              <li>Restart your device if issues persist.</li>
            </ul>
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Contact Us</h2>
            <a href="mailto:support@superapp.com" className="block text-blue-700 underline mb-1">support@superapp.com</a>
            <a href="tel:18001234567" className="block text-blue-700 underline mb-3">1800-123-4567</a>
            <button className="px-6 py-2 bg-blue-600 text-white rounded font-semibold shadow hover:bg-blue-500 transition">Chat with Support</button>
          </div>
        </div>
      </div>
    </div>
  );
} 