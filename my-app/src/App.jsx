
import { Routes, Route, Navigate } from "react-router-dom";

// ==========================================
// AUTH
// ==========================================
import LoginPage from "./auth/LoginPage";

import {
  isAuthenticated,
  isAdmin,
} from "./services/authService";

// ==========================================
// USER PANEL
// ==========================================
import UserLayout from "./users/layouts/UserLayout";
import UserDashboard from "./users/pages/Dashboard";
import MyPDFs from "./users/pages/MyPDFs";
import UserProfile from "./users/pages/Profile";

// ==========================================
// ADMIN PANEL
// ==========================================
import AdminLayout from "./admin/components/AdminLayout";

import Dashboard from "./admin/pages/Dashboard";
import Users from "./admin/pages/Users";
import PdfManagement from "./admin/pages/PdfManagement";
import Categories from "./admin/pages/Categories";
import Settings from "./admin/pages/Settings";

// ==========================================
// PROTECTED ROUTE
// ==========================================
function ProtectedRoute({ children, type = "user" }) {
  const allowed =
    type === "admin"
      ? isAdmin()
      : isAuthenticated("user");

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ==========================================
// APP ROUTES
// ==========================================
export default function App() {
  return (
    <Routes>
      {/* =====================================
          PUBLIC LOGIN
      ===================================== */}
      <Route
        path="/"
        element={<LoginPage />}
      />

      {/* =====================================
          USER PANEL
      ===================================== */}
      <Route
        path="/user"
        element={
          <ProtectedRoute type="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        {/* USER DASHBOARD */}
        <Route
          index
          element={<UserDashboard />}
        />

        {/* MY PDFS */}
        <Route
          path="pdfs"
          element={<MyPDFs />}
        />

        {/* USER PROFILE */}
        <Route
          path="profile"
          element={<UserProfile />}
        />
      </Route>

      {/* =====================================
          ADMIN PANEL
      ===================================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute type="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* DEFAULT ADMIN ROUTE */}
        <Route
          index
          element={
            <Navigate to="dashboard" replace />
          }
        />

        {/* DASHBOARD */}
        <Route
          path="dashboard"
          element={<Dashboard />}
        />

        {/* USERS MANAGEMENT */}
        <Route
          path="users"
          element={<Users />}
        />

        {/* PDF MANAGEMENT */}
        <Route
          path="pdfs"
          element={<PdfManagement />}
        />

        {/* CATEGORIES MANAGEMENT */}
        <Route
          path="categories"
          element={<Categories />}
        />

        {/* SETTINGS */}
        <Route
          path="settings"
          element={<Settings />}
        />
      </Route>

      {/* =====================================
          404 FALLBACK
      ===================================== */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
