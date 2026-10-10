
import { useState } from "react";
import { Outlet } from "react-router-dom";

import {
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";

import {
  getCurrentUser,
} from "../../services/authService";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const admin = getCurrentUser("admin");

  return (
    <div className="min-h-screen bg-slate-50">

      {/* SIDEBAR COMPONENT */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN CONTENT AREA */}
      <div
        className={`
          min-h-screen
          transition-all duration-300

          ${
            collapsed
              ? "lg:ml-20"
              : "lg:ml-64"
          }
        `}
      >
        {/* TEMPORARY NAVBAR */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">

          <div className="flex items-center gap-3">

            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={23} />
            </button>

            {/* DESKTOP COLLAPSE */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:flex"
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              {collapsed ? (
                <ChevronRight size={22} />
              ) : (
                <ChevronLeft size={22} />
              )}
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Admin Dashboard
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your Firans platform
              </p>
            </div>
          </div>

          {/* ADMIN PROFILE */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {admin?.name || "Administrator"}
              </p>

              <p className="text-xs text-slate-500">
                Admin
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100vh-72px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
