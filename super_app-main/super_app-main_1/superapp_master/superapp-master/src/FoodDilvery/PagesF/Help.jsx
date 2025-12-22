import React from 'react';
 import HeaderInsideApp from '../ComponentsApp/HeaderInsideApp';

export default function Help() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      <div className="shadow">
        <HeaderInsideApp />
      </div>
      <div className="pt-4 pb-8 px-2 w-full flex justify-center items-start min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-green-700 text-center">Help & Support</h1>
          <ul className="space-y-5 mb-6">
            <li>
              <strong className="text-gray-800">How do I place a food order?</strong>
              <div className="text-gray-600 mt-1">Tap on "What are you craving?", select a restaurant, choose your items, and proceed to checkout.</div>
            </li>
            <li>
              <strong className="text-gray-800">How do I pay for my order?</strong>
              <div className="text-gray-600 mt-1">You can pay using cash, credit/debit cards, UPI, or wallet. Select your preferred payment method at checkout.</div>
            </li>
            <li>
              <strong className="text-gray-800">I received the wrong order or items are missing.</strong>
              <div className="text-gray-600 mt-1">Go to 'My Orders', select the order, and tap 'Report Issue'. Our support team will assist you.</div>
            </li>
            <li>
              <strong className="text-gray-800">App is not working or keeps crashing.</strong>
              <div className="text-gray-600 mt-1">Try restarting the app or your phone. If the issue persists, update the app or contact support below.</div>
            </li>
            <li>
              <strong className="text-gray-800">How do I cancel an order?</strong>
              <div className="text-gray-600 mt-1">Go to 'My Orders', select your order, and tap 'Cancel Order' before it is prepared.</div>
            </li>
          </ul>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-green-600">Troubleshooting</h2>
            <ul className="list-disc pl-5 text-gray-600 spacey-1">
              <li>Check your internet connection.</li>
              <li>Ensure location services are enabled for delivery tracking.</li>
              <li>Update the app to the latest version.</li>
              <li>Restart your device if issues persist.</li>
            </ul>
          </div>
          <div className="mt-8 text-center">
            <h2 className="text-lg font-semibold mb-2 text-green-600">Contact Us</h2>
            <a href="mailto:support@foodapp.com" className="block text-green-700 underline mb-1">support@foodapp.com</a>
            <a href="tel:18009876543" className="block text-green-700 underline mb-3">1800-987-6543</a>
            <button className="px-6 py-2 bg-green-600 text-white rounded font-semibold shadow hover:bg-green-500 transition">Chat with Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}