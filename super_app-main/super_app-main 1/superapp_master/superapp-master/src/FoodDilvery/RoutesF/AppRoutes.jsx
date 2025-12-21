import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import HeaderF from '../ComponentsF/HeaderF';
import FooterFood from '../ComponentsF/FooterFood';
import PrivateRoute from '../ComponentsF/PrivateRoute';

// Auth Pages
import Login from '../PagesF/Auth/Login';
import Register from '../PagesF/Auth/Register';
import ForgotPassword from '../PagesF/Auth/ForgotPassword';

// Main Pages
import HomeFood from '../PagesF/HomeFood';
import RestaurantDetails from '../PagesF/RestaurantDetails';
import CuisineDetails from '../PagesF/CuisineDetails';
import CategoriesFood from '../PagesF/CategoriesFood';
import DishesListBasedOnCategory from '../PagesF/DishesListBasedOnCategory';

// Cart & Checkout
import CartFood from '../PagesF/CartFood';
import ChooseAddressFood from '../PagesF/ChooseAddressFood';
import AddDilveryAddressFood from '../PagesF/AddDilveryAddressFood';
import EditDilveryAddressFood from '../PagesF/EditDilveryAddressFood';
import PaymentFood from '../PagesF/PaymentFood';
import PaymentFoodEnhanced from '../PagesF/PaymentFoodEnhanced';
import OrderPlacedFood from '../PagesF/OrderPlacedFood';

// User Account
import AccountFood from '../PagesF/AccountFood';
import CustomerprofileFood from '../PagesF/CustomerprofileFood';
import OrdersHistoryFood from '../PagesF/OrdersHistoryFood';
import TrackOrderFood from '../PagesF/TrackOrderFood';
import SettingsFood from '../PagesF/SettingsFood';
import NotificationFood from '../PagesF/NotificationFood';

// Other Pages
import AboutFood from '../PagesF/AboutFood';
import TermsConditionFood from '../PagesF/TermsConditionFood';
import PrivacyPolicyFood from '../PagesF/PrivacyPolicyFood';

function AppRoutes() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-center" />
            <HeaderF />
            <main className="pt-16">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomeFood />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/about" element={<AboutFood />} />
                    <Route path="/terms" element={<TermsConditionFood />} />
                    <Route path="/privacy" element={<PrivacyPolicyFood />} />
                    
                    {/* Restaurant & Food Routes */}
                    <Route path='/restaurant-details' element={<RestaurantDetails />} />
                    <Route path="/cuisine/:region/:subCuisine?" element={<CuisineDetails />} />
                    <Route path="/categories" element={<CategoriesFood />} />
                    <Route path="/category/:categoryId/dishes" element={<DishesListBasedOnCategory />} />
                    
                    {/* Protected Routes */}
                    <Route path="/cart" element={
                        <PrivateRoute>
                            <CartFood />
                        </PrivateRoute>
                    } />
                    <Route path="/checkout/address" element={
                        <PrivateRoute>
                            <ChooseAddressFood />
                        </PrivateRoute>
                    } />
                    <Route path="/checkout/address/add" element={
                        <PrivateRoute>
                            <AddDilveryAddressFood />
                        </PrivateRoute>
                    } />
                    <Route path="/checkout/address/edit/:id" element={
                        <PrivateRoute>
                            <EditDilveryAddressFood />
                        </PrivateRoute>
                    } />
                    <Route path="/checkout/payment" element={
                        <PrivateRoute>
                            <PaymentFood />
                        </PrivateRoute>
                    } />
                    <Route path="/checkout/payment-enhanced" element={
                        <PrivateRoute>
                            <PaymentFoodEnhanced />
                        </PrivateRoute>
                    } />
                    <Route path="/order/success" element={
                        <PrivateRoute>
                            <OrderPlacedFood />
                        </PrivateRoute>
                    } />
                    
                    {/* User Account Routes */}
                    <Route path="/account" element={
                        <PrivateRoute>
                            <AccountFood />
                        </PrivateRoute>
                    } />
                    <Route path="/account/profile" element={
                        <PrivateRoute>
                            <CustomerprofileFood />
                        </PrivateRoute>
                    } />
                    <Route path="/account/orders" element={
                        <PrivateRoute>
                            <OrdersHistoryFood />
                        </PrivateRoute>
                    } />
                    <Route path="/account/orders/:orderId/track" element={
                        <PrivateRoute>
                            <TrackOrderFood />
                        </PrivateRoute>
                    } />
                    <Route path="/account/settings" element={
                        <PrivateRoute>
                            <SettingsFood />
                        </PrivateRoute>
                    } />
                    <Route path="/account/notifications" element={
                        <PrivateRoute>
                            <NotificationFood />
                        </PrivateRoute>
                    } />
                </Routes>
            </main>
            <FooterFood />
        </div>
    );
}

export default AppRoutes; 