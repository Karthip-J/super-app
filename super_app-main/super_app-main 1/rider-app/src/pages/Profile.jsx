import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiTruck, FiFileText, FiBarChart2, FiSettings, 
  FiCheckCircle, FiAlertCircle, FiClock, FiUpload, FiLogOut, 
  FiTrash2, FiToggleLeft, FiToggleRight, FiEdit, FiSave, FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import authService from '../services/auth';
import tripService from '../services/trips';
import earningsService from '../services/earnings';
import { riderAPI } from '../config/superAppApi';

const Profile = ({ isOnline, toggleOnline }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [stats, setStats] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    locationSharing: true,
    autoAccept: false,
    soundAlerts: true,
    darkMode: false
  });

  // Load profile data from backend
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user from auth service
      const user = authService.getCurrentUser();
      setCurrentUser(user);

      // Load profile from backend
      const profileResponse = await riderAPI.getProfile();
      if (profileResponse.success) {
        setProfileData(profileResponse.data);
      }

      // Load trip statistics
      const tripStats = await tripService.getTripStats();
      setStats(tripStats);

      // Load settings from localStorage
      const savedSettings = localStorage.getItem('profile_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      const response = await riderAPI.updateProfile(editData);
      
      if (response.success) {
        setProfileData(response.data);
        setEditMode(false);
        setEditData({});
        
        // Update current user in auth service
        authService.updateCurrentUser(response.data);
        
        // Show success message
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Start editing
  const startEdit = (section) => {
    setEditMode(true);
    setEditData(profileData || {});
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditMode(false);
    setEditData({});
  };

  // Toggle setting
  const toggleSetting = (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    setSettings(newSettings);
    localStorage.setItem('profile_settings', JSON.stringify(newSettings));
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      navigate('/');
      return;
    }

    loadProfileData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 16 }}>🔄</div>
          <div style={{ fontSize: 16, color: '#666' }}>Loading Profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header 
        title="Profile" 
        showBackButton={true}
        onBack={() => navigate('/dashboard')}
        rightAction={
          editMode ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={cancelEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                <FiX />
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 20,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  color: isSaving ? '#ccc' : '#10B981'
                }}
              >
                <FiSave />
              </button>
            </div>
          ) : (
            <button
              onClick={() => startEdit('personal')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer'
              }}
            >
              <FiEdit />
            </button>
          )
        }
      />

      <div style={{ padding: '16px' }}>
        {/* Profile Header */}
        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 32,
            color: 'white'
          }}>
            {profileData?.name?.charAt(0) || currentUser?.name?.charAt(0) || 'R'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
            {profileData?.name || currentUser?.name || 'Rider'}
          </div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            {profileData?.vehicle_type || 'Bike'} • {profileData?.vehicle_model || 'Vehicle'}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 12px',
            borderRadius: 12,
            background: profileData?.status === 'active' ? '#10B981' : '#F59E0B',
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            <FiCheckCircle />
            {profileData?.status === 'active' ? 'Active' : 'Pending Verification'}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', background: 'white', borderRadius: 12, padding: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {['personal', 'vehicle', 'performance', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: 8,
                  background: activeTab === tab ? '#3B82F6' : 'transparent',
                  color: activeTab === tab ? 'white' : '#666',
                  fontSize: 14,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ marginBottom: 16 }}>
          {activeTab === 'personal' && (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Personal Information</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, display: 'block' }}>
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e0e0e0',
                        borderRadius: 8,
                        fontSize: 16
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 16, color: '#666' }}>
                      {profileData?.name || currentUser?.name || 'Not set'}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, display: 'block' }}>
                    Email
                  </label>
                  <div style={{ fontSize: 16, color: '#666' }}>
                    {profileData?.email || currentUser?.email || 'Not set'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, display: 'block' }}>
                    Phone Number
                  </label>
                  <div style={{ fontSize: 16, color: '#666' }}>
                    {profileData?.phone || currentUser?.phone || 'Not set'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, display: 'block' }}>
                    License Number
                  </label>
                  <div style={{ fontSize: 16, color: '#666' }}>
                    {profileData?.license_number || 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vehicle' && (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Vehicle Information</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, display: 'block' }}>
                    Vehicle Type
                  </label>
                  <div style={{ fontSize: 16, color: '#666' }}>
                    {profileData?.vehicle_type || 'Not set'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, display: 'block' }}>
                    Vehicle Model
                  </label>
                  <div style={{ fontSize: 16, color: '#666' }}>
                    {profileData?.vehicle_model || 'Not set'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, display: 'block' }}>
                    Vehicle Number
                  </label>
                  <div style={{ fontSize: 16, color: '#666' }}>
                    {profileData?.vehicle_number || 'Not set'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8, display: 'block' }}>
                    Vehicle Color
                  </label>
                  <div style={{ fontSize: 16, color: '#666' }}>
                    {profileData?.vehicle_color || 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Performance Statistics</div>
              
              {stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10B981' }}>{stats.total}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Total Trips</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3B82F6' }}>{stats.completed}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Completed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B' }}>{stats.averageRating}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Avg Rating</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#EF4444' }}>{stats.cancelled}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Cancelled</div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#666' }}>
                  No performance data available
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{
              background: 'white',
              borderRadius: 16,
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Settings</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {Object.entries(settings).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {key === 'notifications' && 'Receive push notifications'}
                        {key === 'locationSharing' && 'Share location with app'}
                        {key === 'autoAccept' && 'Automatically accept orders'}
                        {key === 'soundAlerts' && 'Play sound for notifications'}
                        {key === 'darkMode' && 'Use dark theme'}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSetting(key)}
                      style={{
                        background: value ? '#10B981' : '#e0e0e0',
                        border: 'none',
                        borderRadius: 12,
                        width: 40,
                        height: 24,
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 2,
                        left: value ? 18 : 2,
                        width: 20,
                        height: 20,
                        background: 'white',
                        borderRadius: '50%',
                        transition: 'left 0.2s'
                      }} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Logout Button */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e0e0e0' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    padding: '16px',
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  <FiLogOut />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;