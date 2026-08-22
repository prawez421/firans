import React, { useState } from 'react';
import { 
  User, 
  CheckCircle2, 
  Upload, 
  Mail,
  Globe,
  UserPlus,
  Users,
  Trash2,
  Save
} from 'lucide-react';

export default function Settings() {
  // Active Tab State (केवल Profile और User Management)
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings updated successfully!');

  // Admin Profile Form State
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@pdfportal.com',
    role: 'Super Administrator',
    bio: 'Managing corporate PDF library and document workflows.',
    language: 'English',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  });

  // New User Creation State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  });

  // Sample Users List
  const [usersList, setUsersList] = useState([
    { id: 1, name: 'Admin User', email: 'admin@pdfportal.com', role: 'Super Admin' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul@pdfportal.com', role: 'Editor' },
    { id: 3, name: 'Priya Verma', email: 'priya@pdfportal.com', role: 'User' }
  ]);

  // Handlers
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setIsSaved(false);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSuccessMessage('Admin profile updated successfully!');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Handle Create New User
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill all required fields!');
      return;
    }

    const created = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    };

    setUsersList([created, ...usersList]);
    setNewUser({ name: '', email: '', password: '', role: 'User' });
    
    setSuccessMessage(`New User "${created.name}" created successfully!`);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Handle Delete User
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      setUsersList(usersList.filter((u) => u.id !== id));
    }
  };

  const tabs = [
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'users', label: 'User Management', icon: Users }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* 🚀 Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
          Admin Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your admin profile and create or manage portal users.
        </p>
      </div>

      {/* 🟢 Save Confirmation Toast */}
      {isSaved && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* 🗂 Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 📦 Content Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        
        {/* 👤 TAB 1: ADMIN PROFILE */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-white/10">
              <img
                src={profile.avatar}
                alt="Admin Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-sm"
              />
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Admin Profile Photo</h3>
                <p className="text-xs text-slate-400">JPG, PNG or GIF. Max size 2MB.</p>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload New Photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Role Title</label>
                <input
                  type="text"
                  disabled
                  value={profile.role}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> Preferred Language
                </label>
                <select
                  name="language"
                  value={profile.language}
                  onChange={handleProfileChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="English" className="bg-white dark:bg-slate-900">English</option>
                  <option value="Hindi" className="bg-white dark:bg-slate-900">Hindi</option>
                  <option value="Spanish" className="bg-white dark:bg-slate-900">Spanish</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Bio / Description</label>
              <textarea
                name="bio"
                rows={3}
                value={profile.bio}
                onChange={handleProfileChange}
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </form>
        )}

        {/* 🟢 TAB 2: USER MANAGEMENT (CREATE & LIST) */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            
            {/* Create New User Section */}
            <form onSubmit={handleCreateUser} className="space-y-4 border-b border-slate-100 dark:border-white/10 pb-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-500" /> Create New User
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@pdfportal.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="User" className="bg-white dark:bg-slate-900">User (View Only)</option>
                    <option value="Editor" className="bg-white dark:bg-slate-900">Editor (Upload & Edit)</option>
                    <option value="Admin" className="bg-white dark:bg-slate-900">Administrator</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4" /> Create User
              </button>
            </form>

            {/* Existing Users Table List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" /> Existing Users ({usersList.length})
              </h3>

              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                          {u.name}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {u.role !== 'Super Admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}