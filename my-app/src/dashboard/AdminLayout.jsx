import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Bell, 
  Search, 
  LogOut, 
  Sun, 
  Moon, 
  ShieldCheck 
} from 'lucide-react';

// 📌 Aapka Naya AdminSidebar Component Import
import AdminSidebar from './components/AdminSidebar';

// ==========================================
// 1. ADMIN NAVBAR COMPONENT
// ==========================================
function AdminNavbar({ onToggleSidebar, isDark, setIsDark }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-white/10 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between transition-colors">
      
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents, tags, categories..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Dark/Light Mode Toggle */}
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications */}
        <button 
          type="button"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer relative"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-indigo-500 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Security Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Admin</span>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>

    </header>
  );
}

// ==========================================
// 2. MAIN ADMIN LAYOUT WRAPPER
// ==========================================
export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Sync dark class on <html> element for Tailwind CSS
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex">
      
      {/* 🚀 Call Updated Sidebar Component */}
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* Main Content Area (Dynamic padding-left relative to Sidebar collapse state) */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300">
        
        {/* Navbar Component */}
        <AdminNavbar 
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)} 
          isDark={isDark} 
          setIsDark={setIsDark} 
        />

        {/* Dynamic Route Content (Outlet) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="p-4 border-t border-slate-200/80 dark:border-white/10 text-center text-xs text-slate-400 dark:text-slate-500">
          © 2026 Firans Admin Portal. All rights reserved.
        </footer>

      </div>

    </div>
  );
}