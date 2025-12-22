import React from 'react';
import HeaderInsideTaxi from '../ComponentsTaxi/HeaderInsideTaxi';

export default function Safety() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="shadow">
        <HeaderInsideTaxi />
      </div>
      <div className="pt-4 pb-8 px-2 w-full flex justify-center items-start min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-blue-700 text-center">Safety & Emergency</h1>
          <ul className="space-y-5 mb-6">
            <li><strong className="text-gray-800">Share your ride:</strong> <span className="text-gray-600 mt-1">Use the app to share your live ride status with friends or family.</span></li>
            <li><strong className="text-gray-800">Emergency button:</strong> <span className="text-gray-600 mt-1">Tap the red SOS button in the app to alert local authorities.</span></li>
            <li><strong className="text-gray-800">Driver verification:</strong> <span className="text-gray-600 mt-1">All drivers are background checked and verified.</span></li>
            <li><strong className="text-gray-800">In-ride safety tips:</strong> <span className="text-gray-600 mt-1">Always wear your seatbelt, check the vehicle details before boarding, and avoid sharing personal info with the driver.</span></li>
          </ul>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">What to do in an emergency?</h2>
            <ul className="list-decimal pl-5 text-gray-600 space-y-1">
              <li>Tap the SOS button in the app immediately.</li>
              <li>Call local authorities at <span className="font-bold text-red-600">112</span>.</li>
              <li>Share your ride details with trusted contacts.</li>
              <li>Move to a safe location if possible.</li>
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Verify Your Driver</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Check the driver's photo and vehicle number in the app before boarding.</li>
              <li>Do not board if the details do not match.</li>
            </ul>
          </div>
          <div className="mt-8 text-center">
            <button className="px-6 py-2 bg-red-600 text-white rounded font-semibold shadow hover:bg-red-500 transition">Report Safety Issue</button>
          </div>
        </div>
      </div>
    </div>
  );
} 