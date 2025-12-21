import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiArrowLeft,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLocationMarker,
  HiOutlineCurrencyRupee,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineFilter,
  HiOutlineSearch
} from 'react-icons/hi';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import tripService from '../services/trips.jsx';
import authService from '../services/auth.jsx';

const Trips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  // Load trips data
  const loadTripsData = async () => {
    try {
      setIsLoading(true);
      
      // Load trips from backend
      const tripsData = await tripService.getTrips();
      setTrips(tripsData);
      setFilteredTrips(tripsData);
      
      // Load trip statistics
      const tripStats = await tripService.getTripStats();
      setStats(tripStats);
      
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter trips based on selected criteria
  const filterTrips = () => {
    let filtered = trips;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === selectedFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(trip => 
        trip.pickup?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.dropoff?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTrips(filtered);
  };

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/');
      return;
    }

    loadTripsData();
  }, [navigate]);

  useEffect(() => {
    filterTrips();
  }, [trips, selectedFilter, searchTerm]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  // Removed order type filtering as it's no longer required

  // Handle trip click
  const handleTripClick = (trip) => {
    navigate(`/trip-details/${trip.id}`, { state: { trip } });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'active': return '#3B82F6';
      case 'accepted': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'pending': return '#6B7280';
      default: return '#6B7280';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <HiOutlineCheckCircle />;
      case 'active': return <HiOutlineClock />;
      case 'accepted': return <HiOutlineClock />;
      case 'cancelled': return <HiOutlineXCircle />;
      case 'pending': return <HiOutlineClock />;
      default: return <HiOutlineClock />;
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🔄</div>
          <div style={{ fontSize: 16, color: '#666' }}>Loading Trips...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header 
        title="My Trips" 
        showBackButton={true}
        onBack={() => navigate('/dashboard')}
        rightAction={
          <button 
            onClick={loadTripsData}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer'
            }}
          >
            🔄
          </button>
        }
      />

      <div style={{ padding: '16px' }}>
        {/* Statistics Summary */}
        {stats && (
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Trip Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>{stats.total}</div>
                <div style={{ fontSize: 12, color: '#666' }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6' }}>{stats.completed}</div>
                <div style={{ fontSize: 12, color: '#666' }}>Completed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B' }}>{stats.active}</div>
                <div style={{ fontSize: 12, color: '#666' }}>Active</div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            position: 'relative',
            background: 'white',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <HiOutlineSearch style={{ marginRight: 8, color: '#666' }} />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                flex: 1,
                fontSize: 16
              }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Filter by Status</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {['all', 'active', 'completed', 'cancelled'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                style={{
                  background: selectedFilter === filter ? '#3B82F6' : 'white',
                  color: selectedFilter === filter ? 'white' : '#666',
                  border: 'none',
                  borderRadius: 20,
                  padding: '8px 16px',
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Order Type Filter - Removed as not required */}

        {/* Trips List */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            Trips ({filteredTrips.length})
          </div>
          
          {filteredTrips.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              color: '#666',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>No trips found</div>
              <div style={{ fontSize: 14 }}>Try adjusting your filters or search terms</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => handleTripClick(trip)}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

// Trip Card Component
const TripCard = ({ trip, onClick, formatDate, formatTime, getStatusColor, getStatusIcon }) => (
  <div
    onClick={onClick}
    style={{
      background: 'white',
      borderRadius: 12,
      padding: 16,
      cursor: 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}
  >
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          background: getStatusColor(trip.status),
          color: 'white',
          padding: '4px 8px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          {getStatusIcon(trip.status)}
          {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
        </div>
        <div style={{
          background: '#F3F4F6',
          color: '#374151',
          padding: '4px 8px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 'bold'
        }}>
          {trip.order_type?.charAt(0).toUpperCase() + trip.order_type?.slice(1)}
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#10B981' }}>
        ₹{trip.fare || 0}
      </div>
    </div>

    {/* Route */}
    <div style={{ marginBottom: 12 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
         <HiOutlineLocationMarker style={{ color: '#3B82F6' }} />
         <div style={{ fontSize: 14, fontWeight: 'bold' }}>Pickup</div>
       </div>
      <div style={{ fontSize: 14, color: '#666', marginLeft: 24, marginBottom: 12 }}>
        {trip.pickup || 'Pickup location'}
      </div>
      
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
         <HiOutlineLocationMarker style={{ color: '#EF4444' }} />
         <div style={{ fontSize: 14, fontWeight: 'bold' }}>Dropoff</div>
       </div>
      <div style={{ fontSize: 14, color: '#666', marginLeft: 24 }}>
        {trip.dropoff || 'Dropoff location'}
      </div>
    </div>

    {/* Details */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <HiOutlineCalendar style={{ color: '#666' }} />
        <div style={{ fontSize: 12, color: '#666' }}>
          {formatDate(trip.startTime)}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <HiOutlineClock style={{ color: '#666' }} />
        <div style={{ fontSize: 12, color: '#666' }}>
          {formatTime(trip.startTime)}
        </div>
      </div>
    </div>

    {/* Customer and Rating */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 'bold' }}>
        {trip.customerName || 'Customer'}
      </div>
      {trip.rating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <HiOutlineStar style={{ color: '#F59E0B' }} />
          <div style={{ fontSize: 14, fontWeight: 'bold' }}>{trip.rating}</div>
        </div>
      )}
    </div>

    {/* Trip ID */}
    <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
      ID: {trip.id}
    </div>
  </div>
);

export default Trips; 