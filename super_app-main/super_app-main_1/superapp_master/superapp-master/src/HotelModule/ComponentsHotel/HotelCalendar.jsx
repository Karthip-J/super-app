import React, { useState } from 'react';

const HotelCalendar = ({ onClose, onSelectDate, minDate = null, selectedDate: propSelectedDate = null, title = null }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(() => {
        if (propSelectedDate) {
            try {
                return new Date(propSelectedDate);
            } catch (e) {
                return null;
            }
        }
        return null;
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getMonthStart = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    };

    const getMonthEnd = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    };

    const formatDate = (date) => {
        const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const formatMonthYear = (date) => {
        const options = { month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const isSameMonth = (date1, date2) => {
        return date1.getMonth() === date2.getMonth() && 
               date1.getFullYear() === date2.getFullYear();
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isPastDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // If minDate is provided, use the later of today or minDate
        const minAllowedDate = minDate ? new Date(Math.max(today.getTime(), minDate.getTime())) : today;
        minAllowedDate.setHours(0, 0, 0, 0);
        
        return date < minAllowedDate;
    };

    const monthStart = getMonthStart(currentDate);
    const monthEnd = getMonthEnd(currentDate);
    const startDay = monthStart.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
    const daysInMonth = monthEnd.getDate();

    // Create an array for the calendar days, including padding for the start of the month
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
        calendarDays.push(null); // Placeholder for empty cells
    }

    // Add the actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }

    const handleDateClick = (date) => {
        setSelectedDate(date);
        onSelectDate(formatDate(date));
    };

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    return (
        <div className="w-full max-w-xs md:max-w-md bg-white rounded-2xl shadow-2xl p-2 md:p-8 mx-auto">
            <div className="flex justify-between items-center mb-2 md:mb-6">
                <button
                    onClick={handlePrevMonth}
                    className="p-0.5 md:p-2 hover:bg-sky-50 rounded-full text-sky-600 text-base md:text-xl font-bold"
                >
                    &#8592;
                </button>
                <h2 className="text-xs md:text-xl font-bold text-gray-800">{formatMonthYear(currentDate)}</h2>
                <button
                    onClick={handleNextMonth}
                    className="p-0.5 md:p-2 hover:bg-sky-50 rounded-full text-sky-600 text-base md:text-xl font-bold"
                >
                    &#8594;
                </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 md:gap-2 mb-1 md:mb-2">
                {days.map(day => (
                    <div
                        key={day}
                        className="text-center text-[10px] md:text-sm font-semibold text-gray-400 py-0.5 md:py-2 uppercase tracking-wide"
                    >
                        {day}
                    </div>
                ))}
                {calendarDays.map((date, index) => {
                    if (!date) {
                        // Render empty cells for padding
                        return (
                            <div
                                key={index}
                                className="w-5 h-5 md:w-10 md:h-10 flex items-center justify-center text-center"
                            />
                        );
                    }

                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const isSelected = selectedDate && 
                        date.getDate() === selectedDate.getDate() &&
                        date.getMonth() === selectedDate.getMonth() &&
                        date.getFullYear() === selectedDate.getFullYear();
                    const isCurrentDay = isToday(date);
                    const isPast = isPastDate(date);

                    return (
                        <button
                            key={index}
                            onClick={() => !isPast && handleDateClick(date)}
                            className={`
                                w-5 h-5 md:w-10 md:h-10 flex items-center justify-center text-center rounded-full transition-all
                                text-[10px] md:text-base font-semibold
                                ${!isCurrentMonth ? 'text-gray-300' : ''}
                                ${isPast ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : ''}
                                ${isSelected ? 'bg-sky-600 text-white shadow-lg' : ''}
                                ${isCurrentDay && !isSelected && !isPast ? 'border-2 border-sky-600 text-sky-600' : ''}
                                ${isCurrentMonth && !isSelected && !isCurrentDay && !isPast ? 'hover:bg-sky-50' : ''}
                            `}
                            disabled={!isCurrentMonth || isPast}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="mt-2 md:mt-6 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-2 md:px-5 py-0.5 md:py-2 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-sky-50 hover:text-sky-600 transition text-xs md:text-base"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default HotelCalendar;