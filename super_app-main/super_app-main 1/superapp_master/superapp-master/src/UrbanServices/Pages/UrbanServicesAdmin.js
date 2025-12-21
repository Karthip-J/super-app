import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';


const UrbanServicesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [partnerFilter, setPartnerFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = API_CONFIG.getAuthHeaders();


      // Fetch categories
      const categoriesRes = await axios.get(API_CONFIG.getUrl(API_CONFIG.ENDPOINTS.URBAN_CATEGORIES), {
        headers
      });

      setCategories(categoriesRes.data.data || []);

      // Fetch all partners from backend
      const partnersRes = await axios.get(API_CONFIG.getUrl('/api/partners/all'), {
        headers
      });

      setPartners(partnersRes.data.partners || []);

      // For now, use mock data for bookings
      setBookings([
        {
          _id: '1',
          bookingNumber: 'USR123456',
          title: 'Home Cleaning Service',
          status: 'pending',
          createdAt: new Date()
        },
        {
          _id: '2',
          bookingNumber: 'USR123457',
          title: 'Plumbing Service',
          status: 'confirmed',
          createdAt: new Date()
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays on error
      setCategories([]);
      setBookings([]);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePartner = async (partnerId) => {
    try {
      const headers = API_CONFIG.getAuthHeaders();
      await axios.post(API_CONFIG.getUrl(`/api/partners/${partnerId}/approve`), {}, {
        headers
      });


      // Refresh partners list
      fetchDashboardData();
      alert('Partner approved successfully!');
    } catch (error) {
      console.error('Error approving partner:', error);
      alert('Failed to approve partner');
    }
  };

  const handleRejectPartner = async (partnerId) => {
    try {
      const headers = API_CONFIG.getAuthHeaders();
      await axios.post(API_CONFIG.getUrl(`/api/partners/${partnerId}/reject`), {}, {
        headers
      });


      // Refresh partners list
      fetchDashboardData();
      alert('Partner rejected');
    } catch (error) {
      console.error('Error rejecting partner:', error);
      alert('Failed to reject partner');
    }
  };

  const stats = {
    totalCategories: categories.length,
    totalBookings: bookings.length,
    totalPartners: partners.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">City Bell Admin</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
            <div className="text-gray-600">Service Categories</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.totalBookings}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{stats.totalPartners}</div>
            <div className="text-gray-600">Service Partners</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{stats.pendingBookings}</div>
            <div className="text-gray-600">Pending Bookings</div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.bookingNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partners Management */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Partners Management</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setPartnerFilter('all')}
                className={`px-3 py-1 rounded text-sm ${partnerFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                All ({partners.length})
              </button>
              <button
                onClick={() => setPartnerFilter('pending')}
                className={`px-3 py-1 rounded text-sm ${partnerFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Pending ({partners.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setPartnerFilter('approved')}
                className={`px-3 py-1 rounded text-sm ${partnerFilter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Approved ({partners.filter(p => p.status === 'approved').length})
              </button>
              <button
                onClick={() => setPartnerFilter('rejected')}
                className={`px-3 py-1 rounded text-sm ${partnerFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Rejected ({partners.filter(p => p.status === 'rejected').length})
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.filter(p => partnerFilter === 'all' || p.status === partnerFilter).map((partner) => (
                  <tr key={partner._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{partner.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{partner.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{partner.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {partner.serviceCategories?.slice(0, 2).join(', ')}
                      {partner.serviceCategories?.length > 2 && '...'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(partner.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        partner.status === 'approved' ? 'bg-green-100 text-green-800' :
                          partner.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {partner.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprovePartner(partner._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 mr-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPartner(partner._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {partner.status === 'approved' && (
                        <span className="text-green-600 text-xs font-medium">Approved</span>
                      )}
                      {partner.status === 'rejected' && (
                        <span className="text-red-600 text-xs font-medium">Rejected</span>
                      )}
                    </td>
                  </tr>
                ))}
                {partners.filter(p => partnerFilter === 'all' || p.status === partnerFilter).length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No partners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrbanServicesAdmin;
