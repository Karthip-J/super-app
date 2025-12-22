import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AvailableRooms() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get("hotel_id"); // Get hotel_id from URL
  const [rooms, setRooms] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [status, setStatus] = useState('Available');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [locationName, setLocationName] = useState(''); // Added state for location_name
  const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [roomPrice, setRoomPrice] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!productId) {
      toast.error('Hotel ID is missing');
      return;
    }

    // Fetch rooms data
    axios.get(`https://yrpitsolutions.com/tourism_dup_api/api/hotels/${productId}/rooms`)
      .then((response) => {
        console.log(response.data.data);
        const roomsData = Array.isArray(response.data.data) ? response.data.data : [];
        setRooms(roomsData);
      })
      .catch((error) => {
        console.error('Error fetching rooms data:', error);
        toast.error('Failed to load rooms data');
      });
  }, [productId]);

  const handleRoomClick = (room) => {
    setActiveRoom(room);

    // Reset calendar events before making the API calls
    setCalendarEvents([]);

    axios.get(`https://yrpitsolutions.com/tourism_dup_api/api/admin/hotel_rooms/${room.id}`)
      .then((response) => {
        console.log("Room Details: ", response.data.room);
        const locationName = response.data.room.location_name;
        const salePrice = response.data.room.sale_price; // Extract the sale price
        setLocationName(locationName);
        setRoomPrice(salePrice); // Set the sale price

        axios.get(`https://yrpitsolutions.com/tourism_dup_api/api/admin/get_room_management_by_room_id/${room.id}`)
          .then((calendarResponse) => {
            const calendarData = calendarResponse.data;
            console.log("Room Management Data: ", calendarData);

            if (calendarData && calendarData.length > 0) {
              const events = calendarData.map((item) => ({
                title: `${item.room_price} × ${item.no_of_rooms}`,
                start: formatDate(item.start_date),
                price: item.room_price,
                roomsAvailable: item.no_of_rooms,
                roomId: room.id,
              }));

              // Update calendar events
              setCalendarEvents(events);
            } else {
              toast.error("No availability data found for this room.");
            }
          })
          .catch((error) => {
            console.error('Error fetching room availability data:', error);
            toast.error('Failed to load room availability data for calendar');
          });
      })
      .catch((error) => {
        console.error('Error fetching room details:', error);
        toast.error('Failed to load room details');
      });
  };

  const onSubmit = async (data) => {
    if (!startDate || !endDate || !(startDate instanceof Date) || !(endDate instanceof Date) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error('Please select a valid date range');
      return;
    }

    const roomId = activeRoom.id;
    const hotelId = activeRoom.hotel_id;
    const location = locationName || '';
    const payload = {
      hotel_id: hotelId,
      room_id: roomId,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      room_price: data.roomPrice,
      no_of_rooms: data.numberOfRooms,
      status: status,
      location_name: location,
    };

    const accessToken = localStorage.getItem("tourism_token");

    if (!accessToken) {
      console.error("Access token is missing. Please login.");
      toast.error("Access token is missing. Please login.");
      return;
    }

    try {
      const response = await axios.post(
        "https://yrpitsolutions.com/tourism_dup_api/api/admin/save_room_management",
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Room availability Added successfully');
        setCalendarEvents((prevEvents) => [
          ...prevEvents,
          {
            title: `${data.roomPrice} × ${data.numberOfRooms}`,
            start: formatDate(startDate),
            end: formatDate(endDate),
            price: data.roomPrice,
            roomsAvailable: data.numberOfRooms,
            status: status,
          },
        ]);
        setModalOpen(false);
        setStartDate(null);
        setEndDate(null);
        setStatus('Active');
        reset();

        // After successful save, fetch the updated room and availability data
        axios.get(`https://yrpitsolutions.com/tourism_dup_api/api/admin/hotel_rooms/${roomId}`)
          .then((response) => {
            console.log("Updated Room Details: ", response.data.room);
            setLocationName(response.data.room.location_name);

            // Fetch updated room management data
            axios.get(`https://yrpitsolutions.com/tourism_dup_api/api/admin/get_room_management_by_room_id/${roomId}`)
              .then((calendarResponse) => {
                const calendarData = calendarResponse.data;
                if (calendarData && calendarData.length > 0) {
                  const events = calendarData.map((item) => ({
                    title: `${item.room_price} × ${item.no_of_rooms}`,
                    start: formatDate(item.start_date),
                    price: item.room_price,
                    roomsAvailable: item.no_of_rooms,
                    roomId: roomId,
                  }));
                  setCalendarEvents(events);
                } else {
                  toast.error("No availability data found for this room.");
                }
              })
              .catch((error) => {
                console.error('Error fetching updated room availability data:', error);
                toast.error('Failed to load room availability data for calendar');
              });
          })
          .catch((error) => {
            console.error('Error fetching updated room details:', error);
            toast.error('Failed to load room details');
          });
      } else {
        toast.error('Failed to update room availability');
      }
    } catch (error) {
      console.error('Error saving room availability:', error);
      toast.error('Failed to update room availability');
    }
  };

  const onUpdate = async (data) => {
    if (!startDate || !endDate) {
      toast.error('Please select a valid date range');
      return;
    }

    const roomId = activeRoom.id;
    const hotelId = activeRoom.hotel_id;
    const location = locationName || '';
    const roomManagementId = selectedEvent?.id; // Ensure this is properly checked

    const payload = {
      room_management_id: roomManagementId,
      hotel_id: hotelId,
      room_id: roomId,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      room_price: data.roomPrice,
      no_of_rooms: data.numberOfRooms,
      status: status,
      location_name: location,
    };

    const accessToken = localStorage.getItem("tourism_token");

    if (!accessToken) {
      toast.error("Access token is missing. Please login.");
      return;
    }

    try {
      const response = await axios.put(
        `https://yrpitsolutions.com/tourism_dup_api/api/admin/update_room_management_by_rooms_id/${roomId}`,
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 200) {
        toast.success('Room availability updated successfully');

        // Remove existing events within the date range before adding the new event
        const updatedEvents = calendarEvents.filter(event => {
          const eventStartDate = new Date(event.start);
          const eventEndDate = new Date(event.end);
          return eventEndDate < new Date(startDate) || eventStartDate > new Date(endDate);
        });

        // Add the new event
        updatedEvents.push({
          id: roomManagementId,
          title: `${data.roomPrice} × ${data.numberOfRooms}`,
          start: formatDate(startDate),
          end: formatDate(endDate),
          price: data.roomPrice,
          roomsAvailable: data.numberOfRooms,
          roomId: roomId,
        });

        setCalendarEvents(updatedEvents);
        setUpdateModalOpen(false);

        // Fetch the updated room and availability data
        axios.get(`https://yrpitsolutions.com/tourism_dup_api/api/admin/hotel_rooms/${roomId}`)
          .then((response) => {
            setLocationName(response.data.room.location_name);

            // Fetch updated room management data
            axios.get(`https://yrpitsolutions.com/tourism_dup_api/api/admin/get_room_management_by_room_id/${roomId}`)
              .then((calendarResponse) => {
                const calendarData = calendarResponse.data;
                if (calendarData && calendarData.length > 0) {
                  const events = calendarData.map((item) => ({
                    id: item.id,
                    title: `${item.room_price} × ${item.no_of_rooms}`,
                    start: formatDate(item.start_date),
                    end: formatDate(item.end_date),
                    price: item.room_price,
                    roomsAvailable: item.no_of_rooms,
                    roomId: roomId,
                  }));
                  setCalendarEvents(events);
                } else {
                  toast.error("No availability data found for this room.");
                }
              })
              .catch((error) => {
                console.error('Error fetching updated room availability data:', error);
                toast.error('Failed to load room availability data for calendar');
              });
          })
          .catch((error) => {
            console.error('Error fetching updated room details:', error);
            toast.error('Failed to load room details');
          });
      } else {
        toast.error('Failed to update room availability');
      }
    } catch (error) {
      toast.error('Failed to update room availability');
    }
  };

  const handleDateClick = (info) => {
    // Check if there are events on this date
    const clickedDate = info.dateStr; // Get the clicked date as a string (YYYY-MM-DD format)

    // Find if there are any events for the clicked date
    const existingEvent = calendarEvents.find(event => formatDate(event.start) === clickedDate);

    if (existingEvent) {
      // If an event exists on the clicked date, open the edit popup
      const selectedEvent = existingEvent;
      setSelectedEvent(selectedEvent);
      setStartDate(new Date(selectedEvent.start));
      setEndDate(new Date(selectedEvent.end));
      setUpdateModalOpen(true);
    } else {
      // If no event exists on the clicked date, open the save popup
      setStartDate(info.date);
      setEndDate(info.date);
      setModalOpen(true);
    }
  };

  const handleEventClick = (info) => {
    // Find the event in your calendar data
    const selectedEvent = calendarEvents.find(event => event.id === info.event.id);

    if (selectedEvent) {
      // If the event exists, set the data and open the update modal
      setSelectedEvent(selectedEvent);

      // Parse the start and end dates as Date objects
      const startDate = new Date(selectedEvent.start_date);
      const endDate = new Date(selectedEvent.end_date);

      // Ensure the dates are valid
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        setStartDate(startDate);
        setEndDate(endDate);
        setUpdateModalOpen(true);
      } else {
        console.error("Invalid start or end date");
      }
    }
  };

  // const formatDate = (date) => {
  //   // Assuming your formatDate function is something like this to get YYYY-MM-DD format
  //   return date.toISOString().split('T')[0];
  // };


  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);  // Set end date when it's selected
    setCalendarVisible(false); // Hide the calendar after date selection
  };

  return (
    <>
      
      <div className="min-h-screen justify-center items-center bg-gray-50">
        <ToastContainer />
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-8xl mt-10 flex">
          {/* Left Sidebar (Room List) */}
          <div className="w-1/4 p-4">
            <h2 className="text-xl font-semibold mb-4">Rooms</h2>
            <div className="space-y-2">
              {Array.isArray(rooms) && rooms.length > 0 ? (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    className={`w-full text-left px-4 py-2 rounded-md ${activeRoom?.id === room.id ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleRoomClick(room)}
                  >
                    {room.room_name.length > 20 ? room.room_name.slice(0, 20) + '...' : room.room_name}
                  </button>
                ))
              ) : (
                <p>No rooms available</p> // Add a fallback message when rooms are not available
              )}
            </div>

          </div>

          {/* Right Section (Calendar) */}
          <div className="w-3/4 p-4 mb-32">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
            />

          </div>
        </div>

        {/* Modal for Date Selection */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl" style={{ height: 'auto', width: '580px' }}>
              <h2 className="text-xl font-semibold mb-4">Set Room Availability</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Date Range Picker */}
                  <div>
                    <label className="block mb-2">Date Range</label>
                    <div className="relative">
                      <input
                        type="text"
                        onClick={() => setCalendarVisible(true)}  // Show the calendar when clicked
                        value={startDate && endDate ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` : ''}  // Display both start and end dates
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                        placeholder="Select a date range"
                      />


                      {calendarVisible && (
                        <div className="absolute top-full left-0 mt-2 w-full max-h-70">
                          <DatePicker
                            selected={startDate}
                            onChange={handleDateRangeChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                            dateFormat="dd/MM/yyyy"
                          />
                        </div>
                      )}
                    </div>
                  </div>



                  {/* Room Price */}
                  <div>
                    <label className="block mb-2">Room Price</label>
                    <Controller
                      control={control}
                      name="roomPrice"
                      defaultValue={roomPrice} // Prefill room price
                      rules={{ required: 'Room price is required', min: { value: 1, message: 'Price must be greater than 0' } }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                          placeholder="Enter room price"
                        />
                      )}
                    />
                    {errors.roomPrice && <p className="text-red-500 text-sm">{errors.roomPrice.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div>
                    <label className="block mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Number of Rooms */}
                  <div>
                    <label className="block mb-2">Number of Rooms Available</label>
                    <Controller
                      control={control}
                      name="numberOfRooms"
                      rules={{ required: 'Number of rooms is required', min: { value: 1, message: 'Must have at least one room available' } }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                          placeholder="Enter number of rooms"
                        />
                      )}
                    />
                    {errors.numberOfRooms && <p className="text-red-500 text-sm">{errors.numberOfRooms.message}</p>}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {updateModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl" style={{ height: 'auto', width: '580px' }}>
              <h2 className="text-xl font-semibold mb-4">Update Room Availability</h2>
              <form onSubmit={handleSubmit(onUpdate)} className="space-y-4 h-full flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Date Range Picker */}
                  <div>
                    <div>
                      <label className="block mb-2">Date Range</label>
                      <div className="relative">
                        <input
                          type="text"
                          onClick={() => setCalendarVisible(true)}
                          value={
                            startDate && endDate
                              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                              : ""
                          }
                          readOnly
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                          placeholder="Select a date range"
                        />
                      </div>
                    </div>

                    {calendarVisible && (
                      <div className="absolute z-50 mt-2">
                        <DatePicker
                          selected={startDate}
                          onChange={(dates) => {
                            setStartDate(dates[0]);
                            setEndDate(dates[1]);
                            setCalendarVisible(false); // Close the calendar after selecting the date range
                          }}
                          startDate={startDate}
                          endDate={endDate}
                          selectsRange
                          inline
                          dateFormat="dd/MM/yyyy"
                        />
                      </div>
                    )}
                  </div>
                  {/* Room Price */}
                  <div>
                    <label className="block mb-2">Room Price</label>
                    <Controller
                      control={control}
                      name="roomPrice"
                      rules={{ required: 'Room price is required', min: { value: 1, message: 'Price must be greater than 0' } }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                          placeholder="Enter room price"
                        />
                      )}
                    />
                    {errors.roomPrice && <p className="text-red-500 text-sm">{errors.roomPrice.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status */}
                  <div>
                    <label className="block mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Number of Rooms */}
                  <div>
                    <label className="block mb-2">Number of Rooms Available</label>
                    <Controller
                      control={control}
                      name="numberOfRooms"
                      rules={{ required: 'Number of rooms is required', min: { value: 1, message: 'Must have at least one room available' } }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none"
                          placeholder="Enter number of rooms"
                        />
                      )}
                    />
                    {errors.numberOfRooms && <p className="text-red-500 text-sm">{errors.numberOfRooms.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                    onClick={() => setUpdateModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default AvailableRooms;
