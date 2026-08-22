import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Sun, Moon, User, 
  Settings, Lock, LogOut, ChevronDown, Package, AlertTriangle 
} from 'lucide-react';
import API from '../api/UsersAxios';

export default function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Dynamic User State
  const [userData, setUserData] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    role: 'user',
  });

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // LocalStorage se Login User ka Data Fetch karna
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.name) {
          setUserData(parsedUser);
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await API.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear(); // Clear all tokens and user data
      navigate('/login', { replace: true });
    }
  };

  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <nav className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md">
          <div className="relative w-full hidden sm:block">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents, pdfs..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Dark / Light Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-1" />

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {/* Dynamic Initials Avatar */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                {userData.name ? userData.name.substring(0, 2) : 'US'}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-white leading-tight capitalize">
                  {userData.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                  {userData.role}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Profile Dropdown Popup */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize">
                    {userData.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userData.email}
                  </p>
                </div>

                <div className="py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <a href="#profile" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <User className="w-4 h-4 text-slate-400" /> My Profile
                  </a>
                  <a href="#settings" className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <Settings className="w-4 h-4 text-slate-400" /> Settings
                  </a>
                </div>

                <div className="pt-1 border-t border-slate-100 dark:border-white/10">
                  <button 
                    onClick={handleLogout} 
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}