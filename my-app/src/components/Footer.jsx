
import React from "react";
import { Link } from "react-router-dom";

import {
  FileText,
  Home,
  LogIn,
  LayoutDashboard,
  ShieldCheck,
  Heart,
  ArrowUp,
  BookOpen,
  LockKeyhole,
} from "lucide-react";

import {
  isAuthenticated,
} from "../services/authService";

// =====================================================
// FOOTER COMPONENT
// =====================================================
export default function Footer() {
  const currentYear = new Date().getFullYear();

  // =====================================================
  // AUTH STATUS
  // =====================================================
  const adminLoggedIn = isAuthenticated("admin");
  const userLoggedIn = isAuthenticated("user");

  const loggedIn = adminLoggedIn || userLoggedIn;

  // =====================================================
  // SCROLL TO TOP
  // =====================================================
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // FOOTER LINK STYLE
  // =====================================================
  const footerLinkClass = `
    inline-flex
    items-center
    gap-2
    text-sm
    text-slate-500
    dark:text-slate-400
    hover:text-indigo-600
    dark:hover:text-indigo-400
    transition-colors
    duration-200
  `;

  // =====================================================
  // UI
  // =====================================================
  return (
    <footer className="relative w-full mt-auto bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-300">

      {/* BACKGROUND DECORATION */}
      <div className="absolute -bottom-28 -left-20 w-72 h-72 rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-purple-500/5 dark:bg-purple-500/10 blur-3xl pointer-events-none" />

      {/* =====================================
          MAIN FOOTER
      ===================================== */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* =====================================
              BRAND SECTION
          ===================================== */}
          <div className="sm:col-span-2 lg:col-span-2">

            {/* LOGO */}
            <Link
              to="/"
              className="inline-flex items-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Firans
                  <span className="text-indigo-600 dark:text-indigo-400">
                    PDF
                  </span>
                </h2>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  Document Management Portal
                </p>
              </div>
            </Link>

            {/* DESCRIPTION */}
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
              A simple and modern platform to explore,
              search, manage, and view PDF documents
              in one place.
            </p>

            {/* FEATURE BADGES */}
            <div className="flex flex-wrap items-center gap-2 mt-5">

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                PDF Library
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Document Portal
              </span>
            </div>
          </div>

          {/* =====================================
              QUICK LINKS
          ===================================== */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">
              Quick Links
            </h3>

            <div className="flex flex-col items-start gap-3.5">

              {/* HOME */}
              <Link
                to="/"
                className={footerLinkClass}
              >
                <Home className="w-4 h-4" />
                Home
              </Link>

              {/* ADMIN DASHBOARD */}
              {adminLoggedIn && (
                <Link
                  to="/admin/dashboard"
                  className={footerLinkClass}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}

              {/* LOGIN */}
              {!loggedIn && (
                <Link
                  to="/login"
                  className={footerLinkClass}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* =====================================
              PORTAL INFORMATION
          ===================================== */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">
              About Portal
            </h3>

            <div className="space-y-4">

              <div className="flex items-start gap-3">

                <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    PDF Management
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Find and organize your documents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">

                <div className="w-9 h-9 shrink-0 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <LockKeyhole className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Role-Based Access
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Separate user and admin portals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          BOTTOM FOOTER
      ===================================== */}
      <div className="relative border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/40">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            {/* COPYRIGHT */}
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              © {currentYear}{" "}
              <span className="font-bold text-slate-700 dark:text-slate-200">
                Firans PDF
              </span>
              . All rights reserved.
            </p>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

              <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                Made with
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                for better document management
              </p>

              {/* SCROLL TOP BUTTON */}
              <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                title="Back to Top"
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-200"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
