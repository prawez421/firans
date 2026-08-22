import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { 
  Lock, Mail, Eye, EyeOff, Sun, Moon, 
  ArrowRight, ShieldCheck, User, Loader2 
} from 'lucide-react';
import API from '../api/UsersAxios';

export default function LoginPage() {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  
  const [uiRole, setUiRole] = useState('user'); // 'user' ya 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isDark = resolvedTheme === 'dark';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRoleSwitch = (role) => {
    setUiRole(role);
    setErrorMsg(''); // Tab change hone par purana error clear kar dein
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await API.post('/login', {
        email: formData.email,
        password: formData.password,
        role: uiRole // Backend validation ke liye role bhi bhej rahe hain
      });

      if (response.data.status) {
        const actualUserRole = response.data.user.role; // Backend se aaya hua real role

        // STRICT ROLE MATCHING CHECK:
        // Agar Selected Tab aur Actual Role Match Nahi karte toh Error Dikhayein
        if (uiRole !== actualUserRole) {
          setErrorMsg(
            uiRole === 'admin' 
              ? 'Access Denied: This account is not an Admin account.' 
              : 'Access Denied: Please use Admin Login tab for Admin accounts.'
          );
          setLoading(false);
          return;
        }

        // LocalStorage Updates
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.user));
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Navbar Sync
        localStorage.setItem('userRole', actualUserRole);

        // Routing based on validated role
        if (actualUserRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Server connection failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">

      {/* Background Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle Button */}
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="absolute top-6 right-6 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md shadow-sm"
        aria-label="Toggle Theme"
      >
        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
      </button>

      {/* Main Form Container */}
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-purple-500/5 relative z-10">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mb-3">
            {uiRole === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to your {uiRole === 'admin' ? 'Firans Admin' : 'Firans User'} Portal
          </p>
        </div>

        {/* Role Switcher */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 mb-6">
          <button
            type="button"
            onClick={() => handleRoleSwitch('user')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              uiRole === 'user' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              uiRole === 'admin' 
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium text-center animate-in fade-in duration-200">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={uiRole === 'admin' ? 'admin@pdfportal.com' : 'user@firans.com'}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              Remember me
            </label>
            <a 
              href="#forgot-password" 
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In as {uiRole === 'admin' ? 'Admin' : 'User'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <a href="#signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Register Here
          </a>
        </div>

      </div>
    </div>
  );
}