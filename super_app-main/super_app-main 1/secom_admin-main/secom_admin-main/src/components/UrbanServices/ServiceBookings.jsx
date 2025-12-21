import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import BookingTracking from './BookingTracking';
import PartnerAssignment from './PartnerAssignment';

const ServiceBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [showPartnerAssignment, setShowPartnerAssignment] = useState(false);
  const [availablePartners, setAvailablePartners] = useState([]);
  const [assigningBookingId, setAssigningBookingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  useEffect(() => {
    fetchAvailablePartners();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        page: 1
      };

      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await apiService.get('/api/urban-services/admin/bookings', { params });
      setBookings(response.data || []);

      // If no real data and no filter, show demo data only if needed (optional)
      if ((!response.data || response.data.length === 0) && filter === 'all') {
        // setBookings(getDemoBookings()); // Commented out to prioritize real empty state
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]); // Clear bookings on error
    } finally {
      setLoading(false);
    }
  };

  const getDemoBookings = () => {
    return [
      {
        _id: 'demo1',
        bookingNumber: 'US000001',
        customer: {
          name: 'John Doe',
          phone: '+91 98765 43210',
          email: 'john.doe@email.com'
        },
        category: {
          name: 'Home Cleaning'
        },
        service: {
          name: 'Deep Cleaning Service'
        },
        partner: null,
        title: 'Complete home deep cleaning',
        customAddress: {
          addressLine1: '123, Main Street, Apartment 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          pinCode: '400001'
        },
        scheduledDate: '2024-12-15',
        scheduledTime: '10:00 AM',
        pricing: {
          currency: 'INR',
          totalAmount: 2500
        },
        status: 'pending',
        createdAt: new Date()
      },
      {
        _id: 'demo2',
        bookingNumber: 'US000002',
        customer: {
          name: 'Jane Smith',
          phone: '+91 87654 32109',
          email: 'jane.smith@email.com'
        },
        category: {
          name: 'Plumbing'
        },
        service: {
          name: 'Pipe Repair Service'
        },
        partner: {
          businessName: 'QuickFix Plumbing',
          user: {
            name: 'Raj Kumar',
            phone: '+91 98765 12345'
          }
        },
        title: 'Kitchen sink pipe repair',
        customAddress: {
          addressLine1: '456, Park Avenue, House 12',
          city: 'Delhi',
          state: 'Delhi',
          pinCode: '110001'
        },
        scheduledDate: '2024-12-14',
        scheduledTime: '2:00 PM',
        pricing: {
          currency: 'INR',
          totalAmount: 1500
        },
        status: 'accepted',
        createdAt: new Date()
      },
      {
        _id: 'demo3',
        bookingNumber: 'US000003',
        customer: {
          name: 'Mike Johnson',
          phone: '+91 76543 21098',
          email: 'mike.j@email.com'
        },
        category: {
          name: 'Electrical'
        },
        service: {
          name: 'AC Repair Service'
        },
        partner: {
          businessName: 'CoolTech Services',
          user: {
            name: 'Amit Sharma',
            phone: '+91 91234 56789'
          }
        },
        title: 'Split AC repair and servicing',
        customAddress: {
          addressLine1: '789, Tech Park, Building 3',
          city: 'Bangalore',
          state: 'Karnataka',
          pinCode: '560001'
        },
        scheduledDate: '2024-12-13',
        scheduledTime: '11:00 AM',
        pricing: {
          currency: 'INR',
          totalAmount: 1800
        },
        status: 'completed',
        createdAt: new Date()
      }
    ];
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      // For demo data, just update local state
      if (bookingId.startsWith('demo')) {
        setBookings(bookings.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        ));
        alert(`Demo: Booking ${bookingId} status updated to ${newStatus}`);
        return;
      }

      // For real data, call API which will trigger WebSocket broadcast
      await apiService.put(`/api/urban-services/bookings/${bookingId}/status`,
        { status: newStatus }
      );

      // Update local state
      setBookings(bookings.map(booking =>
        booking._id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      ));

      alert(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(`Failed to update booking status: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchAvailablePartners = async () => {
    try {
      const response = await apiService.get('/api/urban-services/admin/partners');
      // Filter only active and verified partners
      const activePartners = (response.data || []).filter(
        partner => partner.isVerified && partner.status === 'active'
      );
      setAvailablePartners(activePartners);
    } catch (error) {
      console.error('Error fetching partners:', error);
      setAvailablePartners([]);
    }
  };

  const handleAssignPartner = async (bookingId, partnerId) => {
    if (!partnerId) return;

    try {
      setAssigningBookingId(bookingId);
      await apiService.put(`/api/urban-services/bookings/${bookingId}/assign-partner`, {
        partnerId: partnerId
      });

      // Find the partner details
      const assignedPartner = availablePartners.find(p => p._id === partnerId);

      // Update local state with the assigned partner
      setBookings(bookings.map(booking =>
        booking._id === bookingId
          ? { ...booking, partner: assignedPartner }
          : booking
      ));

      alert('Partner assigned successfully!');
    } catch (error) {
      console.error('Error assigning partner:', error);
      alert(error.response?.data?.message || 'Failed to assign partner');
    } finally {
      setAssigningBookingId(null);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      on_the_way: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredBookings = bookings;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Bookings</h1>
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="on_the_way">On the Way</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Export Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.bookingNumber}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.customer?.name || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.customer?.phone || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.category?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {booking.service?.name || booking.title || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {booking.customAddress?.addressLine1
                      ? `${booking.customAddress.addressLine1}, ${booking.customAddress.city || ''}`
                      : booking.address?.addressLine1
                        ? `${booking.address.addressLine1}, ${booking.address.city || ''}`
                        : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {booking.partner ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.partner?.businessName || 'Partner Assigned'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.partner?.user?.name || 'N/A'}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Not Assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.scheduledDate}</div>
                  <div className="text-sm text-gray-500">{booking.scheduledTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.pricing?.currency || 'INR'} {booking.pricing?.totalAmount || booking.amount || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Partner Assignment Dropdown */}
                    <select
                      onChange={(e) => handleAssignPartner(booking._id, e.target.value)}
                      disabled={assigningBookingId === booking._id}
                      className={`text-sm border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${booking.partner
                        ? 'border-gray-200 text-gray-700 hover:border-gray-300'
                        : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                        }`}
                      value={booking.partner?._id || ""}
                    >
                      <option value="" disabled>
                        {assigningBookingId === booking._id ? 'Assigning...' : 'Assign Partner'}
                      </option>
                      {availablePartners.map((partner) => (
                        <option key={partner._id} value={partner._id}>
                          {partner.businessName} - {partner.user?.name || 'N/A'}
                        </option>
                      ))}
                      {availablePartners.length === 0 && (
                        <option value="" disabled>
                          No partners available
                        </option>
                      )}
                    </select>

                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowTracking(true);
                        setShowPartnerAssignment(false);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Track
                    </button>

                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'accepted')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking._id, 'rejected')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'accepted' && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'on_the_way')}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Dispatch
                      </button>
                    )}
                    {['pending', 'accepted', 'on_the_way', 'in_progress'].includes(booking.status) && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No bookings found</div>
          <div className="text-gray-400 text-sm mt-2">
            {filter === 'all' ? 'No bookings available yet' : `No ${filter} bookings found`}
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {showTracking && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Booking Tracking - {selectedBooking.bookingNumber}</h2>
                <button
                  onClick={() => setShowTracking(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <BookingTracking bookingId={selectedBooking._id} />
            </div>
          </div>
        </div>
      )}

      {/* Partner Assignment Modal */}
      {showPartnerAssignment && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Assign Partner - {selectedBooking.bookingNumber}</h2>
                <button
                  onClick={() => setShowPartnerAssignment(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <PartnerAssignment
                bookingId={selectedBooking._id}
                onPartnerAssigned={(partnerId) => {
                  setBookings(bookings.map(booking =>
                    booking._id === selectedBooking._id
                      ? { ...booking, partner: { _id: partnerId } }
                      : booking
                  ));
                  setShowPartnerAssignment(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceBookings;