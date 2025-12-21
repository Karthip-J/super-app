import API_CONFIG from "../../config/api.config.js";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HotelCalendar from "../ComponentsHotel/HotelCalendar";
import { ArrowLeftIcon } from "@heroicons/react/24/outline"; // Import the back arrow icon

const BookingPage = () => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [special, setSpecial] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  const hotel = location.state?.hotel;
  const room = location.state?.room;

  useEffect(() => {
    if (!hotel || !room) {
      setError("Missing hotel or room information.");
      navigate("/hotels"); // or another fallback
    }
  }, [hotel, room, navigate]);

  const hotelId = hotel?._id;
  const roomId = room?._id;
  const pricePerNight = room?.price_per_night || 0;

  const getDays = () => {
    if (!checkIn || !checkOut) return 0;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  // Validate dates
  const validateDates = () => {
    if (!checkIn || !checkOut) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    
    // Check-in date cannot be in the past
    if (inDate < today) return false;
    
    // Check-out date must be after check-in date
    if (outDate <= inDate) return false;
    
    return true;
  };

  const days = getDays();
  const totalAmount = rooms * days * pricePerNight;

  const handleContactChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setContact(value);
      if (error) setError("");
    }
  };

  const handleGuestChange = (setter, value, min) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= min) setter(num);
    else if (value === "") setter("");
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  const handleConfirm = async () => {
    const guests = parseInt(adults, 10) + parseInt(children, 10);

    if (!hotelId || !roomId) {
      setError("Hotel or room ID missing.");
      return;
    }

    if (contact.length !== 10) {
      setError("Contact number must be exactly 10 digits.");
      return;
    }

    if (checkIn && checkOut && guests > 0 && name && contact && rooms > 0 && validateDates() && days > 0) {
      try {
        const bookingData = {
          hotel_id: hotelId,
          room_id: roomId,
          check_in_date: checkIn,
          check_out_date: checkOut,
          guests: {
            adults: parseInt(adults, 10),
            children: parseInt(children, 10),
            infants: 0,
          },
          total_nights: days,
          rooms: rooms,
          price_per_night: pricePerNight,
          total_amount: totalAmount,
          final_amount: totalAmount,
          name: name,
          contact_number: contact,
          special_requests: special,
        };

        console.log("Booking Data =>", bookingData);

        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.BOOKINGS), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`, // TODO: Add proper auth check
          },
          body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Booking failed");
        }

        const createdBooking = await response.json();
        console.log("Backend response:", createdBooking);
        
        // Store booking data in localStorage as backup
        const completeBookingData = {
          ...createdBooking,
          // Ensure name and contact_number are included
          name: bookingData.name,
          contact_number: bookingData.contact_number
        };
        localStorage.setItem('hotelBookingData', JSON.stringify(completeBookingData));
        
        // Pass both the original booking data and the backend response
        navigate("/hotel-payment", { 
          state: { 
            booking: completeBookingData
          } 
        });
      } catch (err) {
        setError(err.message || "Something went wrong while booking.");
      }
    } else {
      if (!checkIn || !checkOut) {
        setError("Please select both check-in and check-out dates.");
      } else if (!validateDates()) {
        const inDate = new Date(checkIn);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (inDate < today) {
          setError("Check-in date cannot be in the past. Please select a future date.");
        } else if (new Date(checkOut) <= new Date(checkIn)) {
          setError("Check-out date must be after check-in date.");
        } else {
          setError("Please select valid dates.");
        }
      } else if (!name || !contact) {
        setError("Please fill in your name and contact number.");
      } else if (contact.length !== 10) {
        setError("Contact number must be exactly 10 digits.");
      } else if (guests <= 0) {
        setError("Please select at least 1 guest.");
      } else if (rooms <= 0) {
        setError("Please select at least 1 room.");
      } else {
        setError("Please fill all required fields and select valid dates.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
        {/* Back button and title */}
        <div className="flex items-center mb-4">
          <button 
            onClick={handleBack}
            className="mr-2 p-1 rounded-full hover:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-sky-600">Book Your Stay</h2>
        </div>

        <div className="space-y-4">
          {/* Check-in Date */}
          <div>
            <label>Check-in Date</label>
            <div onClick={() => setShowCheckInCalendar(true)} className="border p-2 rounded cursor-pointer bg-gray-100">
              {checkIn || "Select date"}
            </div>
            {showCheckInCalendar && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded shadow p-4">
                  <HotelCalendar
                    onClose={() => setShowCheckInCalendar(false)}
                    onSelectDate={(date) => {
                      setCheckIn(date);
                      // Reset check-out date if it's before or equal to new check-in date
                      if (checkOut && new Date(checkOut) <= new Date(date)) {
                        setCheckOut("");
                      }
                      setShowCheckInCalendar(false);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Check-out Date */}
          <div>
            <label>Check-out Date</label>
            <div onClick={() => setShowCheckOutCalendar(true)} className="border p-2 rounded cursor-pointer bg-gray-100">
              {checkOut || "Select date"}
            </div>
            {showCheckOutCalendar && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded shadow p-4">
                  <HotelCalendar
                    onClose={() => setShowCheckOutCalendar(false)}
                    onSelectDate={(date) => {
                      // Only allow dates after check-in date
                      if (checkIn && new Date(date) > new Date(checkIn)) {
                        setCheckOut(date);
                        setShowCheckOutCalendar(false);
                      }
                    }}
                    minDate={checkIn ? new Date(checkIn) : null}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Guests and Rooms */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label>Adults</label>
              <input
                type="number"
                value={adults}
                min="1"
                onChange={(e) => handleGuestChange(setAdults, e.target.value, 1)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label>Children</label>
              <input
                type="number"
                value={children}
                min="0"
                onChange={(e) => handleGuestChange(setChildren, e.target.value, 0)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex-1">
              <label>Rooms</label>
              <input
                type="number"
                value={rooms}
                min="1"
                onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label>Contact Number</label>
            <input
              type="tel"
              value={contact}
              onChange={handleContactChange}
              maxLength={10}
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Special Requests */}
          <div>
            <label>Special Requests</label>
            <textarea
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
              rows="3"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Booking Summary */}
          <div className="bg-sky-50 p-4 rounded text-center">
            <div>Rooms: <strong>{rooms}</strong> | Days: <strong>{days}</strong> | Rate: ₹<strong>{pricePerNight}</strong></div>
            <div className="mt-2 font-bold text-sky-700">Total: ₹{isNaN(totalAmount) ? 0 : totalAmount}</div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            onClick={handleConfirm}
            className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition"
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;