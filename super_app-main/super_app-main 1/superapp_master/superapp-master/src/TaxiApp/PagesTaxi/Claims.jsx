import React from 'react';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";

export default function Claims() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="shadow">
        <HeaderInsideTaxi />
      </div>
      <div className="pt-4 pb-8 px-2 w-full flex justify-center items-start min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">Claims & Support</h1>
          <div className="mb-4 text-center">If you faced any issues with your ride, you can raise a claim below:</div>
          <form className="space-y-4 mb-6">
            <div>
              <label className="block mb-1 font-medium">Ride ID</label>
              <input className="w-full border rounded px-3 py-2" placeholder="Enter Ride ID" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Issue</label>
              <textarea className="w-full border rounded px-3 py-2" placeholder="Describe your issue"></textarea>
            </div>
            <button className="px-4 py-2 bg-red-500 text-white rounded font-semibold w-full">Submit Claim</button>
          </form>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Claim Status</h2>
            <ul className="text-gray-700 text-sm">
              <li className="flex justify-between py-1"><span>Ride #12345</span><span className="text-green-600 font-semibold">Resolved</span></li>
              <li className="flex justify-between py-1"><span>Ride #12346</span><span className="text-yellow-600 font-semibold">Pending</span></li>
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Common Issues</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Driver did not arrive</li>
              <li>Payment not processed</li>
              <li>Lost item in cab</li>
              <li>Fare discrepancy</li>
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">My Previous Claims</h2>
            <ul className="text-gray-700 text-sm">
              <li className="flex justify-between py-1"><span>Ride #12222</span><span className="text-green-600 font-semibold">Resolved</span></li>
              <li className="flex justify-between py-1"><span>Ride #12223</span><span className="text-red-600 font-semibold">Rejected</span></li>
            </ul>
          </div>
          <div className="mt-8 text-center">
            <button className="px-6 py-2 bg-blue-600 text-white rounded font-semibold shadow hover:bg-blue-500 transition">Contact Support</button>
          </div>
        </div>
      </div>
      <FooterTaxi />
    </div>
  );
} 