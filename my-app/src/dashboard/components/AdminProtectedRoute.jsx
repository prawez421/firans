import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('admin_token');
  const userRole = localStorage.getItem('userRole');

  // Agar Token missing hai ya User Role 'admin' nahi hai -> Login page bhej do
  if (!token || userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}