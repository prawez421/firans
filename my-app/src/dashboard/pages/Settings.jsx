import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle2, 
  Upload, 
  Mail,
  Globe,
  UserPlus,
  Users,
  Trash2,
  Save,
  Loader2,
  Edit2,
  X,
  AlertCircle
} from 'lucide-react';

// API Functions
import { 
  getAdminProfile, 
  updateAdminProfile,
  getAllUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from '../api/adminAxios';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [error, setError] = useState('');

  // Admin Profile Form State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    bio: '',
    language: 'English',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  });

  // New User Creation State (Role is standard string value)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Users List State
  const [usersList, setUsersList] = useState([]);

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState(null);

  // 🔄 Initial Data Fetching
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Admin Profile
      const profileData = await getAdminProfile();
      setProfile((prev) => ({
        ...prev,
        name: profileData?.name || profileData?.data?.name || '',
        email: profileData?.email || profileData?.data?.email || '',
        role: profileData?.role || profileData?.data?.role || 'Admin',
        bio: profileData?.bio || profileData?.data?.bio || '',
        language: profileData?.language || 'English',
        avatar: profileData?.avatar || prev.avatar,
      }));

      // 2. Fetch Users List
      const usersData = await getAllUsers();
      const loadedUsers = Array.isArray(usersData) 
        ? usersData 
        : usersData?.users || usersData?.data || [];
      
      setUsersList(loadedUsers);
    } catch (err) {
      console.error("Backend Fetch Error:", err);
      setError('Failed to load data! Please check your login session or API connection.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // --- Admin Profile Handlers ---
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError('');
    try {
      await updateAdminProfile(profile);
      showSuccess('Admin profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to update admin profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // --- User Management Handlers ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields!');
      return;
    }

    setSavingUser(true);
    setError('');
    try {
      // Payload for database save with role
      const payload = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role || 'user'
      };

      const response = await createAdminUser(payload);
      const createdUser = response?.user || response?.data || { id: Date.now(), ...payload };
      
      setUsersList([createdUser, ...usersList]);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      showSuccess(`New user "${createdUser.name}" created successfully!`);
    } catch (err) {
      console.error(err);
      setError('Failed to create new user. Please check your network or inputs.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingUser(true);
    setError('');
    try {
      const targetId = editingUser.id || editingUser._id;
      const updatePayload = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role
      };

      await updateAdminUser(targetId, updatePayload);
      setUsersList(usersList.map((u) => 
        (u.id === targetId || u._id === targetId) ? { ...u, ...updatePayload } : u
      ));
      setEditingUser(null);
      showSuccess(`User "${editingUser.name}" updated successfully!`);
    } catch (err) {
      console.error(err);
      setError('Failed to update user details.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setError('');
      try {
        await deleteAdminUser(id);
        setUsersList(usersList.filter((u) => u.id !== id && u._id !== id));
        showSuccess('User deleted successfully!');
      } catch (err) {
        console.error(err);
        setError('Failed to delete user.');
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'users', label: 'User Management', icon: Users }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
          Admin Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your admin profile and create or manage portal users.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Success Banner */}
      {isSaved && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Tabs Header */}
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

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        {/* TAB 1: ADMIN PROFILE */}
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
              disabled={savingProfile}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </button>
          </form>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-8">
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
                    <option value="user" className="bg-white dark:bg-slate-900">User (View Only)</option>
                    <option value="editor" className="bg-white dark:bg-slate-900">Editor (Upload & Edit)</option>
                    <option value="admin" className="bg-white dark:bg-slate-900">Administrator</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingUser}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Create User
              </button>
            </form>

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
                    {usersList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => {
                        const userId = u.id || u._id;
                        return (
                          <tr key={userId} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="p-3 font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              {u.name}
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                            <td className="p-3">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 capitalize">
                                {u.role || 'user'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {u.role !== 'Super Admin' && u.role !== 'superadmin' && (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setEditingUser(u)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all cursor-pointer"
                                    title="Edit User"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(userId)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-500" /> Edit User
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={editingUser.role ? editingUser.role.toLowerCase() : 'user'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="user" className="bg-white dark:bg-slate-900">User (View Only)</option>
                  <option value="editor" className="bg-white dark:bg-slate-900">Editor (Upload & Edit)</option>
                  <option value="admin" className="bg-white dark:bg-slate-900">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  {savingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}