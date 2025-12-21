import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const GuestsHotel = ({ closeGuests, roomsGuests, setRoomsGuests, onClose }) => {
    const navigate = useNavigate();
    const [guests, setGuests] = useState({
        adults: 1,
        children: 0,
        infants: 0,
        rooms: 1,
    });

    const handleIncrement = (type) => {
        setGuests((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    };

    const handleDecrement = (type) => {
        setGuests((prev) => ({
            ...prev,
            [type]: prev[type] > 0 ? prev[type] - 1 : 0,
        }));
    };

    const handleDone = () => {
        const guestText = `${guests.rooms} Room${guests.rooms > 1 ? 's' : ''}, ${guests.adults} Adult${guests.adults > 1 ? 's' : ''}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? 'ren' : ''}` : ''}${guests.infants > 0 ? `, ${guests.infants} Infant${guests.infants > 1 ? 's' : ''}` : ''}`;
        if (setRoomsGuests) {
            setRoomsGuests(guestText);
        }
        if (onClose) {
            onClose();
        }
        if (closeGuests) {
            closeGuests(guestText);
        }
    };

    return (
        <div className="w-full max-w-[170px] md:max-w-md bg-white rounded-2xl shadow-2xl p-1 md:p-8 mx-auto">
            <h2 className="text-base md:text-2xl font-bold text-sky-600 mb-2 md:mb-6 text-center drop-shadow">Select Guests</h2>

            {/* Adults */}
            <div className="flex justify-between items-center mb-2 md:mb-6">
                <div>
                    <h3 className="font-semibold text-[10px] md:text-base text-gray-800">Adults</h3>
                    <p className="text-[8px] md:text-xs text-gray-500">Ages 18 or above</p>
                </div>
                <div className="flex items-center gap-0.5 md:gap-3">
                    <button
                        onClick={() => handleDecrement('adults')}
                        className="w-4 h-4 md:w-9 md:h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs md:text-lg font-bold text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition disabled:opacity-40"
                        disabled={guests.adults <= 0}
                    >
                        -
                    </button>
                    <span className="w-3 md:w-8 text-center text-xs md:text-lg font-semibold">{guests.adults}</span>
                    <button
                        onClick={() => handleIncrement('adults')}
                        className="w-4 h-4 md:w-9 md:h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs md:text-lg font-bold text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Children */}
            <div className="flex justify-between items-center mb-2 md:mb-6">
                <div>
                    <h3 className="font-semibold text-[10px] md:text-base text-gray-800">Children</h3>
                    <p className="text-[8px] md:text-xs text-gray-500">Ages 2-17</p>
                </div>
                <div className="flex items-center gap-0.5 md:gap-3">
                    <button
                        onClick={() => handleDecrement('children')}
                        className="w-4 h-4 md:w-9 md:h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs md:text-lg font-bold text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition disabled:opacity-40"
                        disabled={guests.children <= 0}
                    >
                        -
                    </button>
                    <span className="w-3 md:w-8 text-center text-xs md:text-lg font-semibold">{guests.children}</span>
                    <button
                        onClick={() => handleIncrement('children')}
                        className="w-4 h-4 md:w-9 md:h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs md:text-lg font-bold text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Infants */}
            <div className="flex justify-between items-center mb-2 md:mb-6">
                <div>
                    <h3 className="font-semibold text-[10px] md:text-base text-gray-800">Infants</h3>
                    <p className="text-[8px] md:text-xs text-gray-500">Under 2</p>
                </div>
                <div className="flex items-center gap-0.5 md:gap-3">
                    <button
                        onClick={() => handleDecrement('infants')}
                        className="w-4 h-4 md:w-9 md:h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs md:text-lg font-bold text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition disabled:opacity-40"
                        disabled={guests.infants <= 0}
                    >
                        -
                    </button>
                    <span className="w-3 md:w-8 text-center text-xs md:text-lg font-semibold">{guests.infants}</span>
                    <button
                        onClick={() => handleIncrement('infants')}
                        className="w-4 h-4 md:w-9 md:h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs md:text-lg font-bold text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Rooms */}
            <div className="flex justify-between items-center mb-4 md:mb-8">
                <div>
                    <h3 className="font-semibold text-[10px] md:text-base text-gray-800">Rooms</h3>
                </div>
                <div className="flex items-center gap-0.5 md:gap-3">
                    <button
                        onClick={() => handleDecrement('rooms')}
                        className="w-4 h-4 md:w-9 md:h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs md:text-lg font-bold text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition disabled:opacity-40"
                        disabled={guests.rooms <= 0}
                    >
                        -
                    </button>
                    <span className="w-3 md:w-8 text-center text-xs md:text-lg font-semibold">{guests.rooms}</span>
                    <button
                        onClick={() => handleIncrement('rooms')}
                        className="w-4 h-4 md:w-9 md:h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs md:text-lg font-bold text-gray-500 hover:bg-sky-50 hover:text-sky-600 transition"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Done Button */}
            <button
                onClick={handleDone}
                className="w-full bg-sky-600 text-white py-1 md:py-3 rounded-xl text-xs md:text-base font-semibold shadow hover:bg-sky-700 transition"
            >
                Done
            </button>
        </div>
    );
};

export default GuestsHotel;
