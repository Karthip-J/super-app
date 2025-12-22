import React, { useEffect, useState } from 'react';
import HotelService from './HotelService';

const getUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const HotelRoomStatusDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError(null);
      try {
        const allHotels = await HotelService.getAllHotels();
        const user = getUserData();
        let filteredHotels = allHotels;
        if (user && user.role !== 'admin') {
          filteredHotels = allHotels.filter(hotel => hotel.created_by === user._id || hotel.created_by === user.id);
        }
        setHotels(filteredHotels);
        if (filteredHotels.length === 1) {
          setSelectedHotelId(filteredHotels[0]._id || filteredHotels[0].id);
        }
      } catch (err) {
        setError('Failed to fetch hotels.');
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  useEffect(() => {
    if (!selectedHotelId) return;
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await HotelService.getRoomsWithBookingStatus(selectedHotelId);
        setRooms(data || []);
      } catch (err) {
        setError('Failed to fetch room status data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [selectedHotelId]);

  return (
    <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Room Booking Status Dashboard</h2>
      {loading ? (
        <div style={{ color: 'var(--text-primary)' }}>Loading...</div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400">{error}</div>
      ) : hotels.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)' }}>No hotels available for your account.</div>
      ) : (
        <>
          {hotels.length > 1 && (
            <div className="mb-4">
              <label className="font-medium mr-2" style={{ color: 'var(--text-primary)' }}>Select Hotel:</label>
              <select
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
                value={selectedHotelId}
                onChange={e => setSelectedHotelId(e.target.value)}
              >
                <option value="" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>-- Select --</option>
                {hotels.map(hotel => (
                  <option key={hotel._id} value={hotel._id} style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                    {hotel.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedHotelId && hotels.find(h => h._id === selectedHotelId) && (
            <table 
              className="min-w-full border transition-colors"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Room Number</th>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Type</th>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Status</th>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Price/Night</th>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Current Booking</th>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Guest</th>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Check-in</th>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Check-out</th>
                  <th className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Booking Price</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr 
                    key={room._id} 
                    className="border-b transition-colors duration-150"
                    style={{ borderColor: 'var(--border-color)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                    }}
                  >
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{room.room_number}</td>
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{room.type}</td>
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{room.status}</td>
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>${room.price_per_night}</td>
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                      {room.current_booking ? room.current_booking.status : 'No Booking'}
                    </td>
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                      {room.current_booking ? room.current_booking.guest : '-'}
                    </td>
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                      {room.current_booking ? room.current_booking.check_in_date : '-'}
                    </td>
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                      {room.current_booking ? room.current_booking.check_out_date : '-'}
                    </td>
                    <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                      {room.current_booking && room.current_booking.final_amount ? `$${room.current_booking.final_amount}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default HotelRoomStatusDashboard; 