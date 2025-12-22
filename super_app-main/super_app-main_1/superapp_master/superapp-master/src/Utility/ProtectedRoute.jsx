import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  if (!isLoggedIn || !token) {
    if (isLoggedIn || token) {
      // Inconsistent state, clear all to force clean login
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
    }
    return <Navigate to="/login" replace />;
  }
  return children;
};


export default ProtectedRoute; 