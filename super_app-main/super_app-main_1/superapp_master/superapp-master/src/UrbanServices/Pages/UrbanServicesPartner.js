import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User,
  MapPin,
  Calendar,
  Clock,
  IndianRupee,
  Navigation,
  CheckCircle2,
  X,
  ArrowRight,
  Shield,
  Smartphone,
  CreditCard,
  Wallet,
  Landmark,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';

const UrbanServicesPartner = () => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('cod');

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: <IndianRupee size={18} /> },
    { id: 'online', name: 'Online Payment', icon: <Smartphone size={18} /> },
    { id: 'card', name: 'Card Payment', icon: <CreditCard size={18} /> },
    { id: 'wallet', name: 'Wallet / UPI', icon: <Wallet size={18} /> }
  ];

  useEffect(() => {
    fetchPartnerData();
  }, [activeTab]);

  const fetchPartnerData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('urban_partner_token') || localStorage.getItem('token');
      if (!token) {
        console.warn('No token found');
        setBookings([]);
        return;
      }

      // For partner, we either get available (pending+unassigned) or assigned (accepted, on_the_way, in_progress, completed)
      const endpoint = activeTab === 'available'
        ? '/api/urban-services/bookings/available'
        : '/api/urban-services/partner/bookings';

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.data) {
        setBookings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingStatus(bookingId);
    try {
      const token = localStorage.getItem('urban_partner_token') || localStorage.getItem('token');
      const response = await axios.put(`/api/urban-services/bookings/${bookingId}/status`,
        {
          status: newStatus,
          notes: newStatus === 'completed' ? `Payment received via ${selectedPayment}` : ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Booking status updated to ${newStatus.replace('_', ' ')}`);
        fetchPartnerData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleStartNavigation = (booking) => {
    const address = booking.customAddress?.addressLine1 || booking.address?.address;
    if (address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
    } else {
      toast.error('Address not available for navigation');
    }
  };

  const getStatusButton = (booking) => {
    const isUpdating = updatingStatus === booking._id;

    switch (booking.status) {
      case 'pending':
        return (
          <button
            onClick={() => handleUpdateStatus(booking._id, 'accepted')}
            disabled={isUpdating}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {isUpdating ? 'Accepting...' : 'Accept Booking'}
            <CheckCircle2 size={18} />
          </button>
        );
      case 'accepted':
        return (
          <button
            onClick={() => handleUpdateStatus(booking._id, 'on_the_way')}
            disabled={isUpdating}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
          >
            {isUpdating ? 'Updating...' : 'On the Way'}
            <Navigation size={18} />
          </button>
        );
      case 'on_the_way':
        return (
          <div className="space-y-3">
            <button
              onClick={() => handleStartNavigation(booking)}
              className="w-full bg-white border-2 border-orange-500 text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
            >
              Navigate to Client
              <Navigation size={18} />
            </button>
            <button
              onClick={() => handleUpdateStatus(booking._id, 'in_progress')}
              disabled={isUpdating}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
            >
              {isUpdating ? 'Updating...' : 'Start Service'}
              <Clock size={18} />
            </button>
          </div>
        );
      case 'in_progress':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Record Payment Method</h4>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(method => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-bold transition-all ${selectedPayment === method.id
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
                      }`}
                  >
                    {method.icon}
                    {method.name}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleUpdateStatus(booking._id, 'completed')}
              disabled={isUpdating}
              className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {isUpdating ? 'Completing...' : 'Mark Service as Completed'}
              <CheckCircle2 size={18} />
            </button>
          </div>
        );
      case 'completed':
        return (
          <div className="bg-green-50 text-green-700 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2 border border-green-100 uppercase tracking-widest text-xs">
            Completed <Check size={18} />
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'accepted': return 'bg-orange-100 text-orange-700';
      case 'on_the_way': return 'bg-yellow-100 text-yellow-700';
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans antialiased">
      {/* Premium Header */}
      <div className="bg-white border-b border-gray-100 px-6 h-20 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center rotate-3 transform transition-transform hover:rotate-0">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">UC Partner</h1>
            <p className="text-[10px] items-center flex gap-1 text-green-600 font-black uppercase tracking-widest mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Earnings Today</p>
            <p className="text-xl font-black text-gray-900">₹1,240</p>
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
            <User size={24} className="text-gray-900" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs - Mobile Style */}
        <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'available'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Available
          </button>
          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'my_bookings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Active
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading bookings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-[32px]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-gray-300" size={40} />
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">No bookings found</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">Check back later for new service requests in your area.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden group">
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 group-hover:scale-105 transition-transform duration-300">
                          <CheckCircle2 size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 leading-tight">
                            {booking.title || booking.service?.name || booking.category?.name || `Service #${booking.bookingNumber}`}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                              <Clock size={12} /> {booking.bookingNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pay</p>
                        <p className="text-2xl font-black text-gray-900">₹{booking.pricing?.totalAmount || booking.price}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="bg-gray-50 p-4 rounded-2xl flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                          <p className="text-sm font-bold text-gray-900">{booking.customer?.name || 'Customer Not Found'}</p>
                          <p className="text-xs text-gray-500 font-medium">{booking.customer?.phone || '+91 98765 43210'}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl flex items-start gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Schedule</p>
                          <p className="text-sm font-bold text-gray-900">{new Date(booking.scheduledDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                          <p className="text-xs text-gray-500 font-medium">{booking.scheduledTime}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mb-8 bg-black/5 p-4 rounded-2xl border border-black/5">
                      <MapPin className="text-gray-400 shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Service Location</p>
                        <p className="text-sm font-bold text-gray-900 leading-relaxed">
                          {booking.customAddress?.addressLine1 || booking.address?.address || 'Address details not shown'}
                        </p>
                      </div>
                    </div>

                    {getStatusButton(booking)}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Outfit', sans-serif !important; }
      `}} />
    </div>
  );
};

export default UrbanServicesPartner;

