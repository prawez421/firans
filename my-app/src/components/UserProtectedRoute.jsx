import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function UserProtectedRoute() {
  const token = localStorage.getItem('admin_token');

  // Agar Token nahi hai toh LoginPage par bhej do
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}