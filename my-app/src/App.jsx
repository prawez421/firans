import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

import UserProtectedRoute from './components/UserProtectedRoute'; // User Guard

// Admin Dashboard Components
import ProtectedRoute from './dashboard/components/AdminProtectedRoute'; // Admin Guard
import AdminLayout from './dashboard/AdminLayout';
import Dashboard from './dashboard/pages/Dashboard';
import PdfList from './dashboard/pages/PdfList'; // Fixed Import Path
import UploadPdf from './dashboard/pages/PdfUpload';
import EditPdf from './dashboard/pages/PdfEdit';
import PdfView from './dashboard/pages/PdfView';
import Settings from './dashboard/pages/Settings';
import CategoriesPage from './dashboard/pages/CategoriesMaster'

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* User Protected Routes */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pdfs" element={<PdfList />} />
              <Route path="upload" element={<UploadPdf />} />
              <Route path="edit/:id" element={<EditPdf />} />
              <Route path="view/:id" element={<PdfView />} />
              <Route path="settings" element={<Settings />} />
              <Route path="master/categories" element={<CategoriesPage />} />
            </Route>
          </Route>

          {/* Catch-all Route (Fallback) */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}