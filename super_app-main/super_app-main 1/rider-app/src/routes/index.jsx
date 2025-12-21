import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Trips from '../pages/Trips.jsx';
import Profile from '../pages/Profile.jsx';
import Earnings from '../pages/Earnings.jsx';
import ActiveTrip from '../pages/ActiveTrip.jsx';
import HeadToPickup from '../pages/HeadToPickup.jsx';
import RidingToDestination from '../pages/RidingToDestination.jsx';
import Wallet from '../pages/Wallet.jsx';
import NavigationMap from '../pages/NavigationMap.jsx';
import NavigateToPickup from '../pages/NavigateToPickup.jsx';
import Analytics from '../pages/Analytics.jsx';
import TripCompleted from '../pages/TripCompleted.jsx';
import Register from '../pages/Register.jsx';
import NotificationCenter from '../pages/NotificationCenter.jsx';
import ProfessionalSelect from '../pages/ProfessionalSelect.jsx';
import DeliveryNavigateToPickup from '../pages/DeliveryNavigateToPickup.jsx';
import DeliveryInProgress from '../pages/DeliveryInProgress.jsx';
import DeliveryCompleted from '../pages/DeliveryCompleted.jsx';
import DeliveryNavigationMap from '../pages/DeliveryNavigationMap.jsx';
import Deliveries from '../pages/Deliveries.jsx';
import DeliveryEarnings from '../pages/DeliveryEarnings.jsx';
import DeliveryWallet from '../pages/DeliveryWallet.jsx';
import GoOnline from '../pages/GoOnline.jsx';
import DeliveryPickupNavigationMap from '../pages/DeliveryPickupNavigationMap.jsx';

const AppRoutes = ({ isOnline, toggleOnline }) => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/select-profession" element={<ProfessionalSelect />} />
      <Route path="/dashboard" element={<Dashboard isOnline={isOnline} toggleOnline={toggleOnline} />} />
      <Route path="/trips" element={<Trips isOnline={isOnline} toggleOnline={toggleOnline} />} />
      <Route path="/profile" element={<Profile isOnline={isOnline} toggleOnline={toggleOnline} />} />
      <Route path="/earnings" element={<Earnings isOnline={isOnline} toggleOnline={toggleOnline} />} />
      <Route path="/active-trip" element={<ActiveTrip isOnline={isOnline} toggleOnline={toggleOnline} />} />
      <Route path="/head-to-pickup" element={<HeadToPickup isOnline={isOnline} toggleOnline={toggleOnline} />} />
      <Route path="/riding-to-destination" element={<RidingToDestination isOnline={isOnline} toggleOnline={toggleOnline} />} />
      <Route path="/wallet" element={<Wallet isOnline={isOnline} toggleOnline={toggleOnline} />} />
      <Route path="/navigation-map" element={<NavigationMap />} />
      <Route path="/navigate-to-pickup" element={<NavigateToPickup />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/trip-completed" element={<TripCompleted />} />
      <Route path="/register" element={<Register />} />
      <Route path="/notification-center" element={<NotificationCenter />} />
      <Route path="/delivery-navigate-to-pickup" element={<DeliveryNavigateToPickup />} />
      <Route path="/delivery-in-progress" element={<DeliveryInProgress />} />
      <Route path="/delivery-completed" element={<DeliveryCompleted />} />
      <Route path="/delivery-navigation-map" element={<DeliveryNavigationMap />} />
      <Route path="/deliveries" element={<Deliveries />} />
      <Route path="/delivery-earnings" element={<DeliveryEarnings />} />
      <Route path="/delivery-wallet" element={<DeliveryWallet />} />
      <Route path="/go-online" element={<GoOnline />} />
      <Route path="/delivery-pickup-navigation-map" element={<DeliveryPickupNavigationMap />} />
    </Routes>
  </Router>
);

export default AppRoutes; 