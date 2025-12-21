import React, { useState, useRef, useEffect } from "react";
import Dropdown from "components/dropdown";
import { FiMenu } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import navbarimage from "assets/img/layout/Navbar.png";
import { BsArrowBarUp } from "react-icons/bs";
import { FiSearch } from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import {
  IoMdNotificationsOutline,
  IoMdInformationCircleOutline,
} from "react-icons/io";
import avatar from "assets/img/avatars/avatar4.png";
import { authService } from "../../services/authService";
import API_CONFIG from "../../config/api.config";
import { useTheme } from "../../contexts/ThemeContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = (props) => {
  const { brandText } = props;
  const navigate = useNavigate();
  const { theme, actualTheme, toggleTheme, setThemeMode, isDark } = useTheme();
  const location = useLocation(); // Get current location
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);


  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const accessToken = localStorage.getItem('OnlineShop-accessToken') || localStorage.getItem('token') || 'demo-token';
        const apiUrl = API_CONFIG.getUrl('/api/admin/profiles') || 'https://yrpitsolutions.com/ecom_backend/api/admin/profiles';

        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const data = response.data && response.data[0] ? response.data[0] : response.data;
        if (data) {
          // Format logo URL if needed
          if (data.logo && !data.logo.startsWith('http')) {
            if (data.logo.startsWith('/uploads')) {
              data.logo = API_CONFIG.getUrl(data.logo);
            } else if (data.logo.startsWith('uploads')) {
              data.logo = API_CONFIG.getUrl(`/${data.logo}`);
            } else {
              data.logo = API_CONFIG.getUrl(`/uploads/${data.logo}`);
            }
          }
          setProfileData(data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch admin profile:', err);
        setError("Failed to fetch profile data");
        setLoading(false);
      }
    };

    fetchAdminProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchAdminProfile();
    };

    window.addEventListener('adminProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('adminProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      // Clear all auth-related items from localStorage
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
      localStorage.removeItem('OnlineShop-accessToken');
      localStorage.removeItem('OnlineShop-tokenExpiration');

      // Redirect to login page
      window.location.href = API_CONFIG.ROUTES.LOGIN;
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, we should still clear local data and redirect
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(API_CONFIG.STORAGE_KEYS.TOKEN_EXPIRATION);
      localStorage.removeItem('OnlineShop-accessToken');
      localStorage.removeItem('OnlineShop-tokenExpiration');
      window.location.href = API_CONFIG.ROUTES.LOGIN;
    } finally {
      setIsLoggingOut(false);
      setShowModal(false);
    }
  };

  const confirmLogout = () => {
    handleLogout();
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [awbOrderNo, setAwbOrderNo] = useState("");

  // Function to handle modal toggle
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  const buttonRef = useRef(null);

  // Handle form submission - search for order
  const handleSubmit = async () => {
    if (!awbOrderNo.trim()) {
      toast.error("Please enter an AWB/Order No.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setIsSearching(true);
    try {
      const accessToken = localStorage.getItem('OnlineShop-accessToken') || localStorage.getItem('token') || 'demo-token';
      const orderNumber = awbOrderNo.trim();
      const apiUrl = API_CONFIG.getUrl(`/api/admin/orders/search/${encodeURIComponent(orderNumber)}`);

      console.log('Searching for order:', orderNumber);
      console.log('API URL:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      console.log('Search response:', response.data);

      if (response.data && response.data.success && response.data.data) {
        const order = response.data.data;
        const orderType = response.data.order_type || 'regular';
        const orderId = order._id || order.id;

        console.log('Order found:', order);
        console.log('Order type:', orderType);
        console.log('Order ID:', orderId);

        // Close modal
        setIsModalOpen(false);
        setAwbOrderNo("");

        // Navigate to appropriate order page based on order type with order data in state
        if (orderType === 'grocery') {
          // Navigate to grocery orders page with order data
          navigate('/admin/grocery-orders', {
            state: {
              searchedOrder: order,
              highlightOrderId: orderId,
              orderNumber: order.order_number
            }
          });
          // Show toast with order info
          toast.success(`Found grocery order: ${order.order_number}`, {
            position: "top-right",
            autoClose: 3000,
          });
        } else if (orderType === 'restaurant' || orderType === 'food') {
          // Navigate to restaurant orders page with order data
          navigate('/admin/restaurant-orders', {
            state: {
              searchedOrder: order,
              highlightOrderId: orderId,
              orderNumber: order.order_number
            }
          });
          toast.success(`Found restaurant order: ${order.order_number}`, {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          // Navigate to regular orders page with order data
          navigate('/admin/orders', {
            state: {
              searchedOrder: order,
              highlightOrderId: orderId,
              orderNumber: order.order_number
            }
          });
          toast.success(`Found order: ${order.order_number}`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } else {
        console.log('Order not found in response:', response.data);
        toast.error("Order not found", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error searching for order:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);

      let errorMessage = "Failed to search for order";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = error.response.data?.message || "Order not found";
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please login again.";
        } else if (error.response.status === 403) {
          errorMessage = "Access denied. You don't have permission to search orders.";
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  };





  return (
    <nav
      className="sticky top-0 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl p-2 backdrop-blur-xl shadow-sm transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="ml-[6px] flex items-center">
        {/* Brand and Breadcrumbs */}
        <div>
          <div className="h-6 w-[224px] pt-1">
            <a
              className="text-sm font-normal hover:underline transition-colors"
              style={{ color: 'var(--text-primary)' }}
              href=" "
            >
              Admin
              <span className="mx-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                {" "}/ {" "}
              </span>
            </a>
            <Link
              className="text-sm font-normal capitalize hover:underline transition-colors"
              style={{ color: 'var(--text-primary)' }}
              to="#"
            >
              {brandText}
            </Link>
          </div>
          {/* Removed duplicate large page title */}
        </div>
      </div>

      <div
        className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-1 rounded-full px-2 py-2 shadow-xl transition-colors duration-300 md:w-[300px] md:flex-grow-0 md:gap-1 xl:w-[365px] xl:gap-2"
        style={{
          backgroundColor: 'var(--bg-card)',
          boxShadow: '0 10px 15px -3px var(--shadow-color), 0 4px 6px -2px var(--shadow-color)'
        }}
      >
        {/* <div className="flex h-full items-center rounded-full bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
          <p className="pl-3 pr-2 text-xl">
            <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
          </p>
          <input
            type="text"
            placeholder="Search..."
            class="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white sm:w-fit"
          />
        </div> */}
        {/* Only show Track Order button on orders pages */}
        {location.pathname.includes('orders') && (
          <button
            ref={buttonRef}
            onClick={toggleModal}
            className="px-6 py-2 bg-[#4318ff] text-white rounded-lg hover:bg-[#4318ff] transition-colors"
          >
            Track Order
          </button>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 margin-top-60">
            <div
              className="p-8 rounded-lg shadow-lg w-96 mt-80 transition-colors duration-300"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)'
              }}
            >
              <button
                onClick={toggleModal}
                className="absolute -mt-8 text-3xl ml-[310px] transition-colors hover:opacity-80"
                style={{ color: 'var(--text-primary)' }}
              >
                &times;
              </button>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Track Your Order</h2>
              <div className="mb-4">
                <label htmlFor="awbOrderNo" className="block text-lg mb-2 text-3xl" style={{ color: 'var(--text-secondary)' }}>
                  AWB/Order No:
                </label>
                <input
                  type="text"
                  id="awbOrderNo"
                  value={awbOrderNo}
                  onChange={(e) => setAwbOrderNo(e.target.value)}
                  className="w-full p-3 border rounded-md transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter AWB or Order No."
                />
              </div>
              {/* Search Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  disabled={isSearching}
                  className={`flex items-center space-x-2 py-3 px-6 bg-[#4318ff] text-white rounded-lg shadow-md hover:bg-[#3300cc] transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4318ff] focus:ring-offset-2 ${isSearching ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isSearching ? (
                    <>
                      <FaSpinner className="w-5 h-5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-4.35-4.35M18 10a8 8 0 11-8-8 8 8 0 018 8z"
                        />
                      </svg>
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>



            </div>
          </div>
        )}





        {/* Theme Toggle */}
        <div className="relative">
          <div
            className="cursor-pointer p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: 'var(--text-primary)' }}
            onClick={toggleTheme}
            title={`Current: ${theme === 'auto' ? 'Auto (System)' : theme === 'dark' ? 'Dark' : 'Light'}. Click to cycle.`}
          >
            {actualTheme === 'dark' ? (
              <RiSunFill className="h-4 w-4" />
            ) : (
              <RiMoonFill className="h-4 w-4" />
            )}
          </div>
          {/* Theme indicator badge */}
          {theme === 'auto' && (
            <span
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: '#4318ff' }}
              title="Auto mode (follows system)"
            />
          )}
        </div>
        {/* Profile & Dropdown */}
        {/* <Dropdown
          button={
            <img
              className="h-10 w-10 rounded-full"
              src={avatar}
              alt="Elon Musk"
            />
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Hey, Adela
                  </p>{" "}
                </div>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="flex flex-col p-4">
                <a
                  href=" "
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Profile Settings
                </a>
                <a
                  href=" "
                  className="mt-3 text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Newsletter Settings
                </a>
                <button
                  onClick={handleLogout}
                  className="mt-3 text-left text-sm font-semibold text-red-600 hover:text-red-700 transition-colors duration-200 ease-in-out px-3 py-2"
                >
                  Log Out
                </button>
              
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        /> */}
        <Dropdown
          button={
            <img
              className="h-10 w-10 rounded-full"
              src={profileData?.logo || avatar}
              alt={profileData?.name || "Admin"}
            />
          }
          children={
            <div
              className="flex w-56 flex-col justify-start rounded-[20px] bg-cover bg-no-repeat shadow-xl transition-colors duration-300"
              style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                boxShadow: '0 20px 25px -5px var(--shadow-color), 0 10px 10px -5px var(--shadow-color)'
              }}
            >
              <div className="p-4">
                <div className="flex flex-col gap-1">
                  {profileData?.business_name && (
                    <p className="text-xs font-semibold text-gray-500" style={{ color: 'var(--text-secondary)' }}>
                      {profileData.business_name}
                    </p>
                  )}
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    👋 Hey, {profileData?.name || "Admin"}
                  </p>
                  {profileData?.email && (
                    <p className="text-xs text-gray-500" style={{ color: 'var(--text-secondary)' }}>
                      {profileData.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="h-px w-full" style={{ backgroundColor: 'var(--border-color)' }} />

              <div className="flex flex-col p-4">
                <Link
                  to="/admin/profile"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={(e) => {
                    // Close dropdown when navigating
                    const dropdown = e.target.closest('.dropdown-container');
                    if (dropdown) {
                      // Dropdown will close automatically on navigation
                    }
                  }}
                >
                  Profile Settings
                </Link>
                {/* <a
                  href="#"
                  className="mt-3 text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Newsletter Settings
                </a> */}

                <button
                  onClick={() => setShowModal(true)} // Open the modal
                  className="mt-3 text-left text-sm font-semibold text-red-600 hover:text-red-700 transition-colors duration-200 ease-in-out px-3 py-2"
                >
                  Log Out
                </button>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />

        {/* Modal for logout confirmation */}
        {showModal && (
          <div className="fixed inset-0 flex justify-center items-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl mt-96">
              <p className="text-xl font-semibold mb-4">Are you sure you want to log out?</p>
              <p className="text-md mb-4 text-gray-600">
                You will be logged out and your session will end.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelLogout}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center justify-center"
                  disabled={isLoggingOut} // Disable button while logging out
                >
                  {isLoggingOut ? (
                    <FaSpinner className="animate-spin mr-2" /> // Show spinner when logging out
                  ) : (
                    "Log Out"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;