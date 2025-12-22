import React from 'react';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';
import FooterTaxi from "../ComponentsTaxi/FooterTaxi";

export default function PowerPass() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="shadow">
        <HeaderInsideTaxi />
      </div>
      <div className="pt-4 pb-8 px-2 w-full flex justify-center items-start min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">Power Pass</h1>
          <div className="mb-4 text-center">Unlock unlimited rides at discounted rates with Power Pass!</div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">How Power Pass Works</h2>
            <ul className="list-decimal pl-5 text-gray-600 space-y-1">
              <li>Buy a Power Pass for a fixed monthly fee.</li>
              <li>Enjoy discounted rides and exclusive offers.</li>
              <li>Cancel anytime, no hidden charges.</li>
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Compare</h2>
            <table className="w-full text-sm mb-2">
              <thead>
                <tr className="text-left text-blue-700">
                  <th className="py-1">Feature</th>
                  <th className="py-1">Regular</th>
                  <th className="py-1">Power Pass</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Ride Discount</td><td>0%</td><td>10%</td></tr>
                <tr><td>Priority Support</td><td>No</td><td>Yes</td></tr>
                <tr><td>Free Cancellations</td><td>No</td><td>Yes</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">FAQ</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Can I cancel Power Pass anytime? <span className="text-gray-500">Yes, you can cancel anytime from your account settings.</span></li>
              <li>Are there any hidden charges? <span className="text-gray-500">No, all charges are transparent.</span></li>
            </ul>
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded font-semibold w-full shadow hover:bg-blue-500 transition mb-4">Buy Power Pass</button>
          <div className="text-center mt-2">
            <a href="#" className="text-blue-600 underline text-sm">Power Pass Terms & Conditions</a>
          </div>
        </div>
      </div>
      <FooterTaxi />
    </div>
  );
} 