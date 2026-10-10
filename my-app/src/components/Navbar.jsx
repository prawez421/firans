
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

import {
  FileText,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  LayoutDashboard,
  Home,
  Loader2,
  AlertCircle,
} from "lucide-react";

import {
  getStoredAuthUser,
  isAuthenticated,
  logoutUserSession,
  logoutAdminSession,
  clearAuthSession,
} from "../services/authService";

// =====================================================
// NAVBAR COMPONENT
// =====================================================
export default function Navbar() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const profileRef = useRef(null);

  const isDark = resolvedTheme === "dark";

  // =====================================================
  // AUTHENTICATION STATUS
  // =====================================================
  const adminLoggedIn = isAuthenticated("admin");
  const userLoggedIn = isAuthenticated("user");

  const currentRole = adminLoggedIn
    ? "admin"
    : userLoggedIn
      ? "user"
      : null;

  const loggedIn = Boolean(currentRole);

  const currentUser = currentRole
    ? getStoredAuthUser(currentRole)
    : null;

  const userName =
    currentUser?.name ||
    currentUser?.full_name ||
    currentUser?.username ||
    (currentRole === "admin" ? "Administrator" : "User");

  const userEmail = currentUser?.email || "";

  const userInitial = String(userName)
    .trim()
    .charAt(0)
    .toUpperCase() || "U";

  // =====================================================
  // CLOSE PROFILE DROPDOWN ON OUTSIDE CLICK
  // =====================================================
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // =====================================================
  // THEME TOGGLE
  // =====================================================
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // =====================================================
  // CLOSE MENUS
  // =====================================================
  const closeMenus = () => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = async () => {
    if (!currentRole || loggingOut) return;

    setLoggingOut(true);
    setLogoutError("");
    closeMenus();

    try {
      if (currentRole === "admin") {
        await logoutAdminSession();
      } else {
        await logoutUserSession();
      }

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout Error:", error);

      // Local session is cleared by the logout service,
      // even if the backend request fails.
      clearAuthSession(currentRole);

      setLogoutError(
        "Server logout could not be confirmed. Your local session was cleared."
      );

      navigate("/login", {
        replace: true,
      });
    } finally {
      setLoggingOut(false);
    }
  };

  // =====================================================
  // NAV LINK CLASS
  // =====================================================
  const navLinkClass = ({ isActive }) =>
    `
      inline-flex items-center gap-2
      px-4 py-2.5 rounded-xl
      text-sm font-semibold
      transition-all duration-200
      ${
        isActive
          ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400"
      }
    `;

  // =====================================================
  // UI
  // =====================================================
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 shadow-sm">

      {/* MAIN NAVBAR */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px] gap-3">

          {/* =====================================
              LOGO
          ===================================== */}
          <Link
            to="/"
            onClick={closeMenus}
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Firans
                <span className="text-indigo-600 dark:text-indigo-400">
                  PDF
                </span>
              </h1>

              <p className="hidden sm:block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Document Management Portal
              </p>
            </div>
          </Link>

          {/* =====================================
              DESKTOP NAVIGATION
          ===================================== */}
          <div className="hidden md:flex items-center gap-1">

            <NavLink
              to="/"
              end
              className={navLinkClass}
            >
              <Home className="w-4 h-4" />
              Home
            </NavLink>

            {currentRole === "admin" && (
              <NavLink
                to="/admin/dashboard"
                className={navLinkClass}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>
            )}
          </div>

          {/* =====================================
              RIGHT ACTIONS
          ===================================== */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* THEME BUTTON */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title="Toggle Theme"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* =====================================
                DESKTOP LOGIN / PROFILE
            ===================================== */}
            <div className="hidden md:flex items-center">

              {!loggedIn ? (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              ) : (
                <div
                  ref={profileRef}
                  className="relative"
                >
                  {/* PROFILE TRIGGER */}
                  <button
                    type="button"
                    onClick={() =>
                      setProfileMenuOpen((prev) => !prev)
                    }
                    aria-expanded={profileMenuOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm">
                      {userInitial}
                    </div>

                    <div className="text-left max-w-[130px]">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {userName}
                      </p>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                        {currentRole}
                      </p>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        profileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* PROFILE DROPDOWN */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 overflow-hidden">

                      {/* USER INFO */}
                      <div className="px-4 py-4 border-b border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          {currentRole === "admin" ? (
                            <ShieldCheck className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <User className="w-4 h-4 text-indigo-500" />
                          )}

                          <span className="text-xs font-bold text-slate-800 dark:text-white">
                            {userName}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {userEmail || "Signed in"}
                        </p>
                      </div>

                      {/* ADMIN DASHBOARD */}
                      {currentRole === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          onClick={closeMenus}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}

                      {/* LOGOUT */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        {loggingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4" />
                        )}

                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =====================================
                MOBILE MENU BUTTON
            ===================================== */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((prev) => !prev)
              }
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* =====================================
            MOBILE NAVIGATION
        ===================================== */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-3 border-t border-slate-100 dark:border-white/10">

            <div className="flex flex-col gap-1">

              {/* HOME */}
              <NavLink
                to="/"
                end
                onClick={closeMenus}
                className={navLinkClass}
              >
                <Home className="w-4 h-4" />
                Home
              </NavLink>

              {/* ADMIN DASHBOARD */}
              {currentRole === "admin" && (
                <NavLink
                  to="/admin/dashboard"
                  onClick={closeMenus}
                  className={navLinkClass}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </NavLink>
              )}

              {/* AUTH SECTION */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10">

                {!loggedIn ? (
                  <Link
                    to="/login"
                    onClick={closeMenus}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                ) : (
                  <>
                    {/* USER DETAILS */}
                    <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-100 dark:bg-slate-900">

                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
                        {userInitial}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                          {userName}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {userEmail || currentRole}
                        </p>
                      </div>
                    </div>

                    {/* LOGOUT */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {loggingOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}

                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* LOGOUT ERROR */}
      {logoutError && (
        <div
          role="alert"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-xs"
        >
          <AlertCircle className="w-4 h-4" />
          {logoutError}
        </div>
      )}
    </header>
  );
}
