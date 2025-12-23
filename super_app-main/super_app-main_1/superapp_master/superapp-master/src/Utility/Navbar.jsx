import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { FoodCartProvider } from './FoodCartContext';
import Register from '../Auth/Register';
import OTP from '../Auth/OTP';
import SetPassword from '../Auth/SetPassword';
import Login from '../Auth/Login';
import HomeScreen from '../Pages/HomeScreen';
import PaymentTest from '../Pages/PaymentTest';
import PaymentEnhanced from '../Clothes/Pages/PaymentEnhanced';
import HomeC from '../Clothes/Pages/HomeC';

import UrbanServicesHome from '../UrbanServices/Pages/UrbanServicesHome';
import BookService from '../UrbanServices/Pages/BookService';
import BookingTracking from '../UrbanServices/Pages/BookingTracking';
import UrbanServicesPartner from '../UrbanServices/Pages/UrbanServicesPartner';
import UrbanServicesSettings from '../UrbanServices/Pages/UrbanServicesSettings';


// ✅ Essential cosmetic components for specific routes
import Lipstick from '../Clothes/Cosmetics/Lipstick';
import Conditioner from '../Clothes/Cosmetics/Conditioner';
import Shampoo from '../Clothes/Cosmetics/Shampoo';
import Sunscreen from '../Clothes/Cosmetics/Sunscreen';
import Primer from '../Clothes/Cosmetics/Primer';
import Foundation from '../Clothes/Cosmetics/Foundation';
import Eyeshadow from '../Clothes/Cosmetics/Eyeshadow';
import CompactPowder from '../Clothes/Cosmetics/Compactpowder';
import Kajal from '../Clothes/Cosmetics/Kajal';
import Highlighter from '../Clothes/Cosmetics/Highlighter';
import Settingspray from '../Clothes/Cosmetics/Settingspray';
import Mascara from '../Clothes/Cosmetics/Mascara';

// ✅ Essential page components
import DetailPage from '../Clothes/Pages/DetailPage';
import SingleProductPage from '../Clothes/Pages/SingleProductPage';
import Address from '../Clothes/Pages/Address';
import ProductDetails from '../Clothes/Pages/ProductDetails';
import ProductDetail from '../Clothes/Pages/ProductDetail';
import Payment from '../Clothes/Pages/Payment';
import OrderPlaced from '../Clothes/Pages/OrderPlaced';
import Myorders from '../Clothes/Pages/Myorders';
import MyordersFilter from '../Clothes/Pages/MyOrdersFilter';
import Cart from '../Clothes/Pages/Cart';
import Account from '../Clothes/Pages/Account';
import Categories from '../Clothes/Pages/Categories';
import Profile from '../Clothes/Pages/Profile';
import Wishlist from '../Clothes/Pages/Wishlist';
import Settings from '../Clothes/Pages/Settings';
import Notification from '../Clothes/Pages/Notification';
import TermsConditions from '../Clothes/Pages/TermsConditions';
import PrivacyPolicy from '../Clothes/Pages/PrivacyPolicy';
import About from '../Clothes/Pages/About';
import AllAddresses from '../Clothes/Pages/AllAddresses';
import EditAllAddress from '../Clothes/Pages/EditAllAddress';
import EditAddressValues from '../Clothes/Pages/EditAddressValues';

// ✅ UNIVERSAL: GenericCategoryPage handles ALL categories
import GenericCategoryPage from '../Components/GenericCategoryPage';

// Grocery imports
import HomeG from '../Grocery/Pages/HomeG';
import AddressG from '../Grocery/Pages/Address';
import EditAllAddressG from '../Grocery/Pages/EditAllAddress';
import EditAddressValuesG from '../Grocery/Pages/EditAddressValues';
import PaymentG from '../Grocery/Pages/Payment';
import PaymentGEnhanced from '../Grocery/Pages/PaymentEnhanced';
import OrderPlacedG from '../Grocery/Pages/OrderPlaced';
import MyordersG from '../Grocery/Pages/Myorders';
import InvoiceG from '../Grocery/Pages/Invoice';
import MyordersFilterG from '../Grocery/Pages/MyOrdersFilter';
import CartG from '../Grocery/Pages/Cart';
import AccountG from '../Grocery/Pages/Account';
import ProfileG from '../Grocery/Pages/Profile';
import WishlistG from '../Grocery/Pages/Wishlist';
import SettingsG from '../Grocery/Pages/Settings';
import NotificationG from '../Grocery/Pages/Notification';
import TermsConditionsG from '../Grocery/Pages/TermsConditions';
import PrivacyPolicyG from '../Grocery/Pages/PrivacyPolicy';
import AboutG from '../Grocery/Pages/About';

// Food imports
import HomeScreenF from '../FoodDilvery/PagesF/HomeScreenF';
import DetailPageF from '../FoodDilvery/PagesF/DetailPageF';
import RestaurentPageCategory from '../FoodDilvery/PagesF/RestaurentPageCategory';
import SingleProductFood from '../FoodDilvery/PagesF/SingleProductFood';
import DishesListBasedOnCategory from '../FoodDilvery/PagesF/DishesListBasedOnCategory';
import CartFood from '../FoodDilvery/PagesF/CartFood';
import ChooseAddressFood from '../FoodDilvery/PagesF/ChooseAddressFood';
import AddDilveryAddressFood from '../FoodDilvery/PagesF/AddDilveryAddressFood';
import ProductDetailsFood from '../FoodDilvery/PagesF/ProductDetailsFood';
import PaymentFood from '../FoodDilvery/PagesF/PaymentFood';
import PaymentFoodEnhanced from '../FoodDilvery/PagesF/PaymentFoodEnhanced';
import OrderPlacedFood from '../FoodDilvery/PagesF/OrderPlacedFood';
import OrdersHistoryFood from '../FoodDilvery/PagesF/OrdersHistoryFood';
import AccountFood from '../FoodDilvery/PagesF/AccountFood';
import TrackOrderFood from '../FoodDilvery/PagesF/TrackOrderFood';
import CustomerProfileFood from '../FoodDilvery/PagesF/CustomerprofileFood';
import EditOptionforalladdresses from '../FoodDilvery/PagesF/EditOptionforalladdresses';
import SettingsFood from '../FoodDilvery/PagesF/SettingsFood';
import AboutFood from '../FoodDilvery/PagesF/AboutFood';
import TermsConditionFood from '../FoodDilvery/PagesF/TermsConditionFood';
import PrivacyPolicyFood from '../FoodDilvery/PagesF/PrivacyPolicyFood';
import NotificationFood from '../FoodDilvery/PagesF/NotificationFood';
import CategoriesFood from '../FoodDilvery/PagesF/CategoriesFood';
import RestaurantDetails from '../FoodDilvery/PagesF/RestaurantDetails';
import EditDilveryAddressFood from '../FoodDilvery/PagesF/EditDilveryAddressFood';

// Hotel imports - ✅ FIX: Add missing hotel home component
import HomeH from '../HotelModule/PagesHotel/HomeH';
import ParticularHotelDetails from '../HotelModule/PagesHotel/ParticularHotelDetails';
import HotelSearchResults from '../HotelModule/PagesHotel/HotelSearchResults';
import UserDashboard from '../HotelModule/PagesHotel/UserDashboard';
import PaymentPage from '../HotelModule/PagesHotel/PaymentPage';
import PaymentPageEnhanced from '../HotelModule/PagesHotel/PaymentPageEnhanced';
import Dashboard from '../HotelModule/PagesHotel/Dashboard';
// import RestaurentPageCategory from '../FoodDelivery/PagesF/RestaurentPageCategory';
import AccountHotel from '../HotelModule/PagesHotel/AccountHotel';
import BookingHotel from '../HotelModule/PagesHotel/BookingHotel';
import HotelLogin from '../HotelModule/PagesHotel/HotelLogin';
import HotelOTP from '../HotelModule/PagesHotel/HotelOTP';
import HotelAddresses from '../HotelModule/PagesHotel/HotelAddresses';
import HotelSupport from '../HotelModule/PagesHotel/HotelSupport';
import PaymentSuccess from '../HotelModule/PagesHotel/PaymentSuccess';
// Taxi imports
import HomeScreenTaxi from '../TaxiApp/PagesTaxi/HomeScreenTaxi';
import SelectLocationScreen from '../TaxiApp/PagesTaxi/SelectLocationScreen';
import RideConfirmationScreen from '../TaxiApp/PagesTaxi/RideConfirmationScreen';
import SelectPickupPointScreen from '../TaxiApp/PagesTaxi/SelectPickupPointScreen';
import RideFindingScreen from '../TaxiApp/PagesTaxi/RideFindingScreen';
import CaptainOnTheWay from '../TaxiApp/PagesTaxi/CaptainOnTheWay';
import LocationSrcDes from '../TaxiApp/PagesTaxi/LocationSrcDes';
import SettingsTaxi from '../TaxiApp/PagesTaxi/SettingsTaxi';
import AccountTaxi from '../TaxiApp/PagesTaxi/AccountTaxi';
import ProfileTaxi from '../TaxiApp/PagesTaxi/ProfileTaxi';
import TermsConditionsTaxi from '../TaxiApp/PagesTaxi/TermsConditionsTaxi';
import PrivacyTaxi from '../TaxiApp/PagesTaxi/PrivacyTaxi';
import AboutTaxi from '../TaxiApp/PagesTaxi/AboutTaxi';
import PaymentTaxi from '../TaxiApp/PagesTaxi/PaymentTaxi';
import MyRidesTaxi from '../TaxiApp/PagesTaxi/MyRidesTaxi';
import RideCompleted from '../TaxiApp/PagesTaxi/RideCompleted';
import Help from '../TaxiApp/PagesTaxi/Help';

// Porter imports
import PHome from '../Porter/PHome';
import Tracking from '../Porter/Tracking';
import Booking from '../Porter/Booking';
import PorterProfile from '../Porter/PorterProfile';
import LiveTrackingWrapper from '../Porter/LiveTracking';
import ProtectedRoute from './ProtectedRoute';

function LogoutButton() {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };
  // Only show logout button on /home
  if (location.pathname !== '/home') return null;
  return (
    <div style={{ position: 'fixed', top: 16, right: 20, zIndex: 9999 }}>
      <button
        onClick={handleLogout}
        style={{
          background: '#fff',
          border: 'none', // No border
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          outline: 'none',
          transition: 'background 0.2s',
          padding: 0,
        }}
        title="Logout"
      >
        {/* Heroicons ArrowRightOnRectangleIcon (outline) */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2563eb" style={{ width: 24, height: 24 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H9m0 0l3-3m-3 3l3 3" />
        </svg>
      </button>
    </div>
  );
}

function Navbar() {
  return (
    <FoodCartProvider>
      <BrowserRouter>
        <LogoutButton />
        <Routes>
          {/* Public Routes */}
          <Route path='/' element={<Navigate to="/home" replace />} />
          <Route path='/home' element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
          <Route path='/payment-test' element={<ProtectedRoute><PaymentTest /></ProtectedRoute>} />
          <Route path='/payment-enhanced' element={<ProtectedRoute><PaymentEnhanced /></ProtectedRoute>} />
          <Route path='/register' element={<Register />} />
          <Route path='/otp' element={<OTP />} />
          <Route path='/set-password' element={<SetPassword />} />
          <Route path='/login' element={<Login />} />

          {/* Clothes */}
          <Route path='/home-clothes' element={<ProtectedRoute><HomeC /></ProtectedRoute>} />
          <Route path='/home-clothes/detail-page' element={<ProtectedRoute><DetailPage /></ProtectedRoute>} />
          <Route path='/home-clothes/single-product-page' element={<ProtectedRoute><SingleProductPage /></ProtectedRoute>} />
          <Route path='/home-clothes/address' element={<ProtectedRoute><Address /></ProtectedRoute>} />
          <Route path='/home-clothes/all-addresses' element={<ProtectedRoute><AllAddresses /></ProtectedRoute>} />
          <Route path='/home-clothes/edit-all-addresses' element={<ProtectedRoute><EditAllAddress /></ProtectedRoute>} />
          <Route path='/home-clothes/edit-address-values' element={<ProtectedRoute><EditAddressValues /></ProtectedRoute>} />
          <Route path='/home-clothes/product-detail' element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
          <Route path='/product/:id' element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
          <Route path='/home-clothes/payment' element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path='/home-clothes/order' element={<ProtectedRoute><OrderPlaced /></ProtectedRoute>} />
          <Route path='/home-clothes/order-list' element={<ProtectedRoute><Myorders /></ProtectedRoute>} />
          <Route path='/home-clothes/order-list-filter' element={<ProtectedRoute><MyordersFilter /></ProtectedRoute>} />
          <Route path='/home-clothes/cart' element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path='/home-clothes/account' element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path='/home-clothes/categories' element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path='/home-clothes/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path='/home-clothes/wishlist' element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path='/home-clothes/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path='/home-clothes/notification' element={<ProtectedRoute><Notification /></ProtectedRoute>} />
          <Route path='/home-clothes/terms-conditions' element={<ProtectedRoute><TermsConditions /></ProtectedRoute>} />
          <Route path='/home-clothes/privacy-policy' element={<ProtectedRoute><PrivacyPolicy /></ProtectedRoute>} />
          <Route path='/home-clothes/about' element={<ProtectedRoute><About /></ProtectedRoute>} />

          {/* Groceries */}
          <Route path='/home-grocery' element={<ProtectedRoute><HomeG /></ProtectedRoute>} />
          <Route path='/home-grocery/address' element={<ProtectedRoute><AddressG /></ProtectedRoute>} />
          <Route path='/home-grocery/edit-all-addresses' element={<ProtectedRoute><EditAllAddressG /></ProtectedRoute>} />
          <Route path='/home-grocery/edit-address-values' element={<ProtectedRoute><EditAddressValuesG /></ProtectedRoute>} />
          <Route path='/home-grocery/payment' element={<ProtectedRoute><PaymentG /></ProtectedRoute>} />
          <Route path='/home-grocery/payment-enhanced' element={<ProtectedRoute><PaymentGEnhanced /></ProtectedRoute>} />
          <Route path='/home-grocery/order' element={<ProtectedRoute><OrderPlacedG /></ProtectedRoute>} />
          <Route path='/home-grocery/order-list' element={<ProtectedRoute><MyordersG /></ProtectedRoute>} />
          <Route path='/home-grocery/invoice/:orderId' element={<ProtectedRoute><InvoiceG /></ProtectedRoute>} />
          <Route path='/home-grocery/order-list-filter' element={<ProtectedRoute><MyordersFilterG /></ProtectedRoute>} />
          <Route path='/home-grocery/cart' element={<ProtectedRoute><CartG /></ProtectedRoute>} />
          <Route path='/home-grocery/account' element={<ProtectedRoute><AccountG /></ProtectedRoute>} />
          <Route path='/home-grocery/profile' element={<ProtectedRoute><ProfileG /></ProtectedRoute>} />
          <Route path='/home-grocery/wishlist' element={<ProtectedRoute><WishlistG /></ProtectedRoute>} />
          <Route path='/home-grocery/settings' element={<ProtectedRoute><SettingsG /></ProtectedRoute>} />
          <Route path='/home-grocery/notification' element={<ProtectedRoute><NotificationG /></ProtectedRoute>} />
          <Route path='/home-grocery/terms-conditions' element={<ProtectedRoute><TermsConditionsG /></ProtectedRoute>} />
          <Route path='/home-grocery/privacy-policy' element={<ProtectedRoute><PrivacyPolicyG /></ProtectedRoute>} />
          <Route path='/home-grocery/about' element={<ProtectedRoute><AboutG /></ProtectedRoute>} />

          {/* Cosmetics */}
          <Route path='cosmetics/lipstick' element={<ProtectedRoute><Lipstick /></ProtectedRoute>} />
          <Route path='cosmetics/foundation' element={<ProtectedRoute><Foundation /></ProtectedRoute>} />
          <Route path='cosmetics/primer' element={<ProtectedRoute><Primer /></ProtectedRoute>} />
          <Route path='cosmetics/sunscreen' element={<ProtectedRoute><Sunscreen /></ProtectedRoute>} />
          <Route path='cosmetics/shampoo' element={<ProtectedRoute><Shampoo /></ProtectedRoute>} />
          <Route path='cosmetics/conditioner' element={<ProtectedRoute><Conditioner /></ProtectedRoute>} />
          <Route path='cosmetics/eyeshadow' element={<ProtectedRoute><Eyeshadow /></ProtectedRoute>} />
          <Route path='cosmetics/compactpowder' element={<ProtectedRoute><CompactPowder /></ProtectedRoute>} />
          <Route path='cosmetics/kajal' element={<ProtectedRoute><Kajal /></ProtectedRoute>} />
          <Route path='cosmetics/settingspray' element={<ProtectedRoute><Settingspray /></ProtectedRoute>} />
          <Route path='cosmetics/highlighter' element={<ProtectedRoute><Highlighter /></ProtectedRoute>} />
          <Route path='cosmetics/mascara' element={<ProtectedRoute><Mascara /></ProtectedRoute>} />

          {/* Universal Categories */}
          <Route path='/categories' element={<ProtectedRoute><Categories /></ProtectedRoute>} />

          {/* Food */}
          <Route path='/home-food' element={<ProtectedRoute><HomeScreenF /></ProtectedRoute>} />
          <Route path='/home-food/detail-page' element={<ProtectedRoute><DetailPageF /></ProtectedRoute>} />
          <Route path='/home-food/restaurent-list-based-on-category/:restaurentCategoryName/restaurant/:restaurant' element={<ProtectedRoute><RestaurentPageCategory /></ProtectedRoute>} />
          <Route path='/home-food/restaurent-list-based-on-category/:restaurentCategoryName' element={<ProtectedRoute><RestaurentPageCategory /></ProtectedRoute>} />
          <Route path='/home-food/single-product-details/:vendorId' element={<ProtectedRoute><SingleProductFood /></ProtectedRoute>} />
          <Route path='/home-food/dishes-list-based-on-category-and-hotel/:vendorId/:restaurentCategoryName' element={<ProtectedRoute><DishesListBasedOnCategory /></ProtectedRoute>} />
          <Route path='/home-food/cart' element={<ProtectedRoute><CartFood /></ProtectedRoute>} />
          <Route path='/home-food/choose-address' element={<ProtectedRoute><ChooseAddressFood /></ProtectedRoute>} />
          <Route path='/home-food/add-address' element={<ProtectedRoute><AddDilveryAddressFood /></ProtectedRoute>} />
          <Route path='/home-food/product-details' element={<ProtectedRoute><ProductDetailsFood /></ProtectedRoute>} />
          <Route path='/home-food/payment-type' element={<ProtectedRoute><PaymentFood /></ProtectedRoute>} />
          <Route path='/checkout/payment' element={<ProtectedRoute><PaymentFood /></ProtectedRoute>} />
          <Route path='/checkout/payment-enhanced' element={<ProtectedRoute><PaymentFoodEnhanced /></ProtectedRoute>} />
          <Route path='/home-food/order-placed' element={<ProtectedRoute><OrderPlacedFood /></ProtectedRoute>} />
          <Route path='/order/success' element={<ProtectedRoute><OrderPlacedFood /></ProtectedRoute>} />
          <Route path='/home-food/orders-history' element={<ProtectedRoute><OrdersHistoryFood /></ProtectedRoute>} />
          <Route path='/home-food/account' element={<ProtectedRoute><AccountFood /></ProtectedRoute>} />
          <Route path='/home-food/food-order-tracking' element={<ProtectedRoute><TrackOrderFood /></ProtectedRoute>} />
          <Route path='/home-food/customerProfile-details' element={<ProtectedRoute><CustomerProfileFood /></ProtectedRoute>} />
          <Route path='/home-food/edit-option-all-address' element={<ProtectedRoute><EditOptionforalladdresses /></ProtectedRoute>} />
          <Route path='/home-food/settings' element={<ProtectedRoute><SettingsFood /></ProtectedRoute>} />
          <Route path='/home-food/about' element={<ProtectedRoute><AboutFood /></ProtectedRoute>} />
          <Route path='/home-food/terms-conditions' element={<ProtectedRoute><TermsConditionFood /></ProtectedRoute>} />
          <Route path='/home-food/privacy' element={<ProtectedRoute><PrivacyPolicyFood /></ProtectedRoute>} />
          <Route path='/home-food/notification' element={<ProtectedRoute><NotificationFood /></ProtectedRoute>} />
          <Route path='/home-food/categories' element={<ProtectedRoute><CategoriesFood /></ProtectedRoute>} />
          <Route path='/home-food/restaurant-details' element={<ProtectedRoute><RestaurantDetails /></ProtectedRoute>} />
          <Route path='/home-food/edit-dilvery-address' element={<ProtectedRoute><EditDilveryAddressFood /></ProtectedRoute>} />
          <Route path='/account/orders' element={<ProtectedRoute><OrdersHistoryFood /></ProtectedRoute>} />

          {/* Taxi App */}
          <Route path='/home-taxi' element={<ProtectedRoute><HomeScreenTaxi /></ProtectedRoute>} />
          <Route path='/select-location' element={<ProtectedRoute><SelectLocationScreen /></ProtectedRoute>} />
          <Route path='/ride-confirmation' element={<ProtectedRoute><RideConfirmationScreen /></ProtectedRoute>} />
          <Route path='/select-pickup-point' element={<ProtectedRoute><SelectPickupPointScreen /></ProtectedRoute>} />
          <Route path='/ride-finding' element={<ProtectedRoute><RideFindingScreen /></ProtectedRoute>} />
          <Route path='/captain-on-the-way' element={<ProtectedRoute><CaptainOnTheWay /></ProtectedRoute>} />
          <Route path='/home-taxi/src-dest' element={<ProtectedRoute><LocationSrcDes /></ProtectedRoute>} />
          <Route path='/home-taxi/settings' element={<ProtectedRoute><SettingsTaxi /></ProtectedRoute>} />
          <Route path='/home-taxi/account' element={<ProtectedRoute><AccountTaxi /></ProtectedRoute>} />
          <Route path='/home-taxi/profile' element={<ProtectedRoute><ProfileTaxi /></ProtectedRoute>} />
          <Route path='/home-taxi/terms-conditions' element={<ProtectedRoute><TermsConditionsTaxi /></ProtectedRoute>} />
          <Route path='/home-taxi/privacy' element={<ProtectedRoute><PrivacyTaxi /></ProtectedRoute>} />
          <Route path='/home-taxi/about' element={<ProtectedRoute><AboutTaxi /></ProtectedRoute>} />
          <Route path='/home-taxi/payment' element={<ProtectedRoute><PaymentTaxi /></ProtectedRoute>} />
          <Route path='/home-taxi/my-rides' element={<ProtectedRoute><MyRidesTaxi /></ProtectedRoute>} />
          <Route path='/ride-completed' element={<ProtectedRoute><RideCompleted /></ProtectedRoute>} />
          <Route path='/home-taxi/help' element={<ProtectedRoute><Help /></ProtectedRoute>} />

          {/* Hotel */}
          <Route path='/home-hotel' element={<ProtectedRoute><HomeH /></ProtectedRoute>} />
          <Route path='/home-hotel/particular-hotel-details' element={<ProtectedRoute><ParticularHotelDetails /></ProtectedRoute>} />
          <Route path='/hotel-search-results' element={<ProtectedRoute><HotelSearchResults /></ProtectedRoute>} />
          <Route path='/home-hotel/profile' element={<ProtectedRoute><AccountHotel /></ProtectedRoute>} />
          <Route path='/home-hotel/bookings' element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path='/hotel-details/:id' element={<ProtectedRoute><ParticularHotelDetails /></ProtectedRoute>} />
          <Route path='/hotel-booking' element={<ProtectedRoute><BookingHotel /></ProtectedRoute>} />
          <Route path='/hotel-payment' element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path='/hotel-payment-enhanced' element={<ProtectedRoute><PaymentPageEnhanced /></ProtectedRoute>} />
          <Route path='/home-hotel-booking/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path='/hotel-login' element={<HotelLogin />} />
          <Route path='/hotel-otp' element={<HotelOTP />} />
          <Route path='/hotel-addresses' element={<ProtectedRoute><HotelAddresses /></ProtectedRoute>} />
          <Route path='/hotel-support' element={<ProtectedRoute><HotelSupport /></ProtectedRoute>} />
          <Route path='/hotel-payment-success' element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />

          {/* Porter */}
          <Route path='/porter' element={<ProtectedRoute><PHome /></ProtectedRoute>} />
          <Route path='/porter/tracking' element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
          <Route path="/porter/history" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
          <Route path="/porter/profile" element={<ProtectedRoute><PorterProfile /></ProtectedRoute>} />
          <Route path='/porter/live-tracking/:bookingId' element={<ProtectedRoute><LiveTrackingWrapper /></ProtectedRoute>} />

          {/* Universal Category System */}
          <Route path='/categories/:parentSlug/:subcategorySlug' element={<ProtectedRoute><GenericCategoryPage /></ProtectedRoute>} />
          <Route path='/categories/:categorySlug' element={<ProtectedRoute><Categories /></ProtectedRoute>} />

          {/* Rider App */}

          <Route path='/urban-services' element={<ProtectedRoute><UrbanServicesHome /></ProtectedRoute>} />
          <Route path='/urban-services/category/:slug' element={<ProtectedRoute><BookService /></ProtectedRoute>} />
          <Route path='/urban-services/booking/:bookingId' element={<ProtectedRoute><BookingTracking /></ProtectedRoute>} />
                    <Route path='/urban-services/partner' element={<ProtectedRoute><UrbanServicesPartner /></ProtectedRoute>} />
          <Route path='/urban-services/settings' element={<ProtectedRoute><UrbanServicesSettings /></ProtectedRoute>} />
          <Route path='/settings' element={<ProtectedRoute><UrbanServicesSettings /></ProtectedRoute>} />

        </Routes>
      </BrowserRouter>
    </FoodCartProvider>
  )
}

export default Navbar; 