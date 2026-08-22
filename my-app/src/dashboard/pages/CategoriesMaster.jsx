import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  FolderCheck, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';

// AdminAPI Services Import
import { 
  getAdminProfile, 
  getAdminCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../api/adminAxios'; // Update according to your file path

export default function CategoriesMaster() {
  // State Management
  const [categories, setCategories] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', status: 'active' });
  const [submitting, setSubmitting] = useState(false);

  // 🔔 Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Helper Function: Show Toast Popup
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500); // Disappears automatically after 3.5 seconds
  };

  // 🔄 1. Fetch Admin Info & Categories from Backend
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, categoriesRes] = await Promise.all([
        getAdminProfile(),
        getAdminCategories()
      ]);

      setAdminProfile(profileRes.data || profileRes);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : categoriesRes.data || []);
    } catch (err) {
      const apiMsg = err.response?.data?.message || 'Failed to fetch categories data.';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-generate Slug on Name Change
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, name, slug });
  };

  // ➕/✏️ 2. Handle Create / Update Category via Axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        showToast('Category updated successfully!', 'success');
      } else {
        await createCategory(formData);
        showToast('New category added successfully!', 'success');
      }

      await fetchData();
      closeModal();
    } catch (err) {
      const apiMsg = err.response?.data?.message || 'Failed to save category.';
      showToast(apiMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // 🗑️ 3. Handle Delete Category via Axios
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
      showToast('Category deleted successfully.', 'success');
    } catch (err) {
      const apiMsg = err.response?.data?.message || 'Failed to delete category.';
      showToast(apiMsg, 'error');
    }
  };

  // Modal Control Helpers
  const openModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ 
        name: category.name || '', 
        slug: category.slug || '', 
        description: category.description || '', 
        status: category.status || 'active' 
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', status: 'active' });
  };

  // Filter Categories
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = (cat.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (cat.slug || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cat.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">

      {/* 🔔 Toast Notification Popup */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100 dark:bg-emerald-950 dark:text-emerald-200' 
            : 'bg-rose-900/90 border-rose-500/50 text-rose-100 dark:bg-rose-950 dark:text-rose-200'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button 
            onClick={() => setToast({ ...toast, show: false })}
            className="ml-2 text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 👤 1. Admin Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-emerald-600/20 shrink-0">
            {adminProfile?.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                {adminProfile ? adminProfile.name : 'Loading Profile...'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                {adminProfile?.role || 'Administrator'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {adminProfile?.email || 'email@domain.com'}
            </p>
          </div>
        </div>

        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* 📊 2. Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Categories</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{categories.length}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Categories</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {categories.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Inactive Categories</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {categories.filter(c => c.status === 'inactive').length}
            </p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-xl text-rose-600 dark:text-rose-400">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 🔍 3. Controls & Action Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Search & Filter Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search category or slug..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white"
            />
          </div>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-40 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Add Category Button */}
        <button
          onClick={() => openModal()}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* 📋 4. Categories Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm">Fetching categories data...</p>
          </div>
        ) : error ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2 text-rose-500">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <FolderCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        {cat.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-500 dark:text-slate-400">
                      {cat.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        cat.status === 'active' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                          : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}>
                        {cat.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openModal(cat)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                          title="Edit Category"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 📝 5. Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Category Name *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Legal Documents"
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  URL Slug
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="legal-documents"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-mono text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea 
                  rows="3"
                  placeholder="Optional brief details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}