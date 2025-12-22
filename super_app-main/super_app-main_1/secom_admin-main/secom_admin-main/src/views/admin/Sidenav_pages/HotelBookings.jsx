import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEdit, FaEllipsisV, FaTrashAlt } from 'react-icons/fa';
import hotelBookingService from '../../../services/hotelBookingService';

const HotelBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await hotelBookingService.getAllBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch hotel bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await hotelBookingService.updateBookingStatus(bookingId, newStatus);
      toast.success('Booking status updated successfully');
      fetchBookings(); // Refresh the list
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      await hotelBookingService.deleteBooking(bookingId);
      toast.success('Booking deleted successfully');
      fetchBookings(); // Refresh the list
    } catch (err) {
      toast.error('Failed to delete booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <span className="ml-2" style={{ color: 'var(--text-primary)' }}>Loading hotel bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button
          onClick={fetchBookings}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Hotel Bookings</h2>
        {/* <div className="flex gap-2">
          <button
            onClick={fetchBookings}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div> */}
      </div>

      <div className="overflow-x-auto">
        <table 
          className="min-w-full border transition-colors"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
              {/* <th className="px-4 py-2 border text-left">Booking ID</th> */}
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Guest</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Hotel</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Room</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Check-in</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Check-out</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Guests</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Total Amount</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Booking Status</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Payment Status</th>
              <th className="px-4 py-2 border text-left transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Created At</th>
              {/* <th className="px-4 py-2 border text-left">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-2 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No hotel bookings found
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr 
                  key={booking._id} 
                  className="border-b transition-colors duration-150"
                  style={{ borderColor: 'var(--border-color)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                  }}
                >
                  {/* <td className="px-4 py-2 border">
                    <span className="font-mono text-sm">{booking._id?.slice(-8)}</span>
                  </td> */}
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <div>
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {booking.name || booking.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {booking.contact_number || booking.user?.phone || booking.user?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    {booking.hotel ? (
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{booking.hotel.name}</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{booking.hotel.address?.city || 'N/A'}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Hotel not found</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    {booking.room ? (
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{booking.room.name}</div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{booking.room.type}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Room not found</span>
                    )}
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {formatDate(booking.check_in_date)}
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    {formatDate(booking.check_out_date)}
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      <div>Adults: {booking.guests?.adults || 0}</div>
                      <div>Children: {booking.guests?.children || 0}</div>
                      <div>Infants: {booking.guests?.infants || 0}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatCurrency(booking.final_amount)}</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {booking.total_nights} night{booking.total_nights !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <select
                      value={booking.booking_status}
                      onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        booking.booking_status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        booking.booking_status === 'no_show' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <option value="pending" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Pending</option>
                      <option value="confirmed" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Confirmed</option>
                      <option value="completed" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Completed</option>
                      <option value="cancelled" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>Cancelled</option>
                      <option value="no_show" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>No Show</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      booking.payment_status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      booking.payment_status === 'refunded' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <div>{formatDateTime(booking.createdAt)}</div>
                    </div>
                  </td>
                  {/* <td className="px-4 py-2 border">
                    <div className="relative inline-block group">
                      <button className="text-gray-600 hover:text-gray-900">
                        <FaEllipsisV />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <FaTrashAlt className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotelBookings; 