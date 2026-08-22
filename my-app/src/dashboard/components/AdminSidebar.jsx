import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { 
  LayoutDashboard, FileText, Upload, Settings, LogOut, 
  ChevronLeft, ChevronRight, ShieldCheck, Sun, Moon, 
  SlidersHorizontal, Tags, ChevronDown 
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  const [adminProfile, setAdminProfile] = useState({ name: 'Admin User', email: 'admin@firans.com', initials: 'AD' });

  const isMasterActive = location.pathname.startsWith('/admin/master');
  const [isMasterOpen, setIsMasterOpen] = useState(isMasterActive);

  useEffect(() => {
    setMounted(true);
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const name = user.name || user.fullName || 'Admin User';
        const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';
        setAdminProfile({ name, email: user.email || 'admin@firans.com', initials });
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isMasterActive) setIsMasterOpen(true);
  }, [location.pathname, isMasterActive]);

  const isDark = (resolvedTheme || theme) === 'dark';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <>
      {!isCollapsed && (
        <div onClick={() => setIsCollapsed(true)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden" />
      )}

      <aside className={`h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 flex flex-col justify-between transition-all duration-300 z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        
        {/* Top Header */}
        <div className="overflow-y-auto">
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className={`flex items-center gap-2.5 ${isCollapsed ? 'mx-auto' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-800 dark:text-white text-sm truncate">Firans Admin</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate">Management Portal</span>
                </div>
              )}
            </div>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            
            {/* 1. Dashboard */}
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">Dashboard</span>}
            </NavLink>

            {/* 2. Master Setup (Categories & Tags) - Directly below Dashboard */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  setIsMasterOpen(!isMasterOpen);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isMasterOpen || isMasterActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100/80 dark:bg-white/5'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">Master Setup</span>}
                </div>
                {!isCollapsed && <ChevronDown className={`w-4 h-4 transition-transform ${isMasterOpen ? 'rotate-180' : ''}`} />}
              </button>

              {/* Sub-items (Categories) */}
              {isMasterOpen && !isCollapsed && (
                <div className="pl-9 pr-1 py-1 space-y-1">
                  <NavLink
                    to="/admin/master/categories"
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    <Tags className="w-4 h-4 shrink-0" />
                    <span className="truncate">Categories & Tags</span>
                  </NavLink>
                </div>
              )}
            </div>

            
              {/* 4. Upload PDF */}
            <NavLink to="/admin/upload" className={navLinkClass}>
              <Upload className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">Upload PDF</span>}
            </NavLink>

            {/* 3. PDF Documents */}
            <NavLink to="/admin/pdfs" className={navLinkClass}>
              <FileText className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">PDF Documents</span>}
            </NavLink>

          

            {/* 5. Settings */}
            <NavLink to="/admin/settings" className={navLinkClass}>
              <Settings className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">Settings</span>}
            </NavLink>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-2">
          {mounted && (
            <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
              {isDark ? <Sun className="w-5 h-5 text-amber-400 shrink-0" /> : <Moon className="w-5 h-5 text-slate-600 shrink-0" />}
              {!isCollapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          )}

          {/* Profile Card */}
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
              {adminProfile.initials}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{adminProfile.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{adminProfile.email}</span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 ${isCollapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}