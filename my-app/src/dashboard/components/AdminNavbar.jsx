import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminNavbar({ isCollapsed, setIsCollapsed }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Hydration fix for next-themes in Client Components
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (resolvedTheme || theme) === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleLogout = () => {
    // Clear all Admin related session data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 md:px-6 flex items-center justify-between transition-colors duration-300">
      
      {/* 🔍 Left Side: Sidebar Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-md">
        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all md:hidden cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents, users..."
            className="w-full pl-10 pr-4 py-2 text-xs md:text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* ⚙️ Right Side: Theme Toggle, Notifications, & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* 🌙 Theme Toggle Button */}
        {mounted && (
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        )}

        {/* 🔔 Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Notifications Dropdown Body */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <span className="text-xs font-semibold text-slate-800 dark:text-white">Notifications</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs transition-colors cursor-pointer">
                  <p className="font-medium text-slate-800 dark:text-slate-200">New PDF Uploaded</p>
                  <span className="text-[10px] text-slate-400">2 minutes ago</span>
                </div>
                <div className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-xs transition-colors cursor-pointer">
                  <p className="font-medium text-slate-800 dark:text-slate-200">System Update Available</p>
                  <span className="text-[10px] text-slate-400">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 my-auto hidden sm:block" />

        {/* 👤 Admin Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-indigo-500/20">
              AD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                Admin User
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Super Admin
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <button 
                type="button"
                onClick={() => {
                  navigate('/admin/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile
              </button>
              <button 
                type="button"
                onClick={() => {
                  navigate('/admin/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                Settings
              </button>
              <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}