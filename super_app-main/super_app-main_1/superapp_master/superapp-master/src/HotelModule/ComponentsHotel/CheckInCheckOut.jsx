import React from 'react';
import star from "../../Icons/Star.svg";
import { useState } from 'react';

const dates = [
    { day: "Today", date: "10 Nov" },
    { day: "Mon", date: "11 Nov" },
    { day: "Tue", date: "12 Nov" },
    { day: "Wed", date: "13 Nov" },
];

const checkoutDates = [
    { day: "Sun", date: "4 Dec" },
    { day: "Mon", date: "5 Dec" },
    { day: "Tue", date: "6 Dec" },
    { day: "Wed", date: "7 Dec" },
];

function CheckInCheckOut({openGuests}) {
    const [checkIn, setCheckIn] = useState(dates[0].date);
    const [checkOut, setCheckOut] = useState(checkoutDates[0].date);
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col items-center py-10 px-2">
            {/* Card Container */}
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-4 md:p-10 mx-auto mt-8 mb-32">
                {/* Heading */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-sky-600 mb-1 drop-shadow">Book Hotel</h1>
                    <p className="text-gray-600 text-base">Select your check-in and check-out dates, and leave a note for the owner.</p>
                </div>
                {/* Hotel Info & Rating */}
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-green-600 font-medium">20% off</span>
                    <div className="flex items-center">
                        <img src={star} alt="star" className="w-4 h-4" />
                        <span className="text-xs font-medium ml-1">4.8 <span className="text-sm font-medium text-gray-400">(107 reviews)</span></span>
                    </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Hotel Galaxy</h2>
                        <p className="text-gray-400 text-sm font-medium">New York, USA</p>
                    </div>
                </div>
                <hr className="mb-6" />
                {/* Check-In Section */}
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Check-In</h3>
                <div className="flex gap-2 md:gap-3 mb-6 flex-wrap">
                    {dates.map(({ day, date }) => (
                        <button
                            key={date}
                            className={`w-20 h-10 md:w-24 md:h-14 text-xs md:text-sm rounded-xl border-2 transition-all flex flex-col items-center justify-center font-medium shadow-sm ${checkIn === date ? "bg-sky-600 text-white border-sky-600" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-sky-50"}`}
                            onClick={() => setCheckIn(date)}
                        >
                            <span className={`block text-[10px] md:text-xs ${checkIn === date ? "text-white" : "text-gray-400"}`}>{day}</span>
                            <span className={`text-sm md:text-base font-semibold ${checkIn === date ? "text-white" : "text-gray-900"}`}>{date}</span>
                        </button>
                    ))}
                </div>
                {/* Check-Out Section */}
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Check-Out</h3>
                <div className="flex gap-2 md:gap-3 mb-6 flex-wrap">
                    {checkoutDates.map(({ day, date }) => (
                        <button
                            key={date}
                            className={`w-20 h-10 md:w-24 md:h-14 text-xs md:text-sm rounded-xl border-2 transition-all flex flex-col items-center justify-center font-medium shadow-sm ${checkOut === date ? "bg-sky-600 text-white border-sky-600" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-sky-50"}`}
                            onClick={() => setCheckOut(date)}
                        >
                            <span className={`block text-[10px] md:text-xs ${checkOut === date ? "text-white" : "text-gray-400"}`}>{day}</span>
                            <span className={`text-sm md:text-base font-semibold ${checkOut === date ? "text-white" : "text-gray-900"}`}>{date}</span>
                        </button>
                    ))}
                </div>
                {/* Review Input */}
                <label className="block font-medium text-base mb-2 text-gray-700">Note to Owner</label>
                <textarea
                    className="w-full h-28 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 text-sm mb-2"
                    placeholder="Enter here"
                ></textarea>
            </div>
            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 w-full bg-white border-t px-4 pb-12 z-50">
                <button
                    onClick={openGuests}
                    className="w-full mt-4 bg-sky-600 text-white py-3 rounded-xl text-lg font-semibold shadow hover:bg-sky-700 transition"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}
export default CheckInCheckOut;