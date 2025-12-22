import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RtlLayout from "layouts/rtl";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import ProtectedRoute from "components/auth/ProtectedRoute";

import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";
import API_CONFIG from "./config/api.config";

const App = () => {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthLayout />} />
      <Route
        path="admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route path="rtl/*" element={<RtlLayout />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<Navigate to={API_CONFIG.ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

export default App;
