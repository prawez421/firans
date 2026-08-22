import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function PdfList() {
  const navigate = useNavigate();

  // API & Data States
  const [pdfs, setPdfs] = useState([]);
  const [categories, setCategories] = useState(['All']); // Dynamic categories state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedItems, setSelectedItems] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Status Filter List
  const statuses = ['All', 'Published', 'Draft', 'Archived'];

  // Helper for Auth Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      token,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };
  };

  // Helper Function: Convert bytes to readable File Size
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // 🟢 Fetch Categories from Backend API
  const fetchCategories = useCallback(async () => {
    try {
      const { headers } = getAuthHeaders();
      const response = await axios.get('http://localhost:8000/api/admin/categories', { headers });
      const categoryData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      
      // Extract names from response
      const catNames = categoryData.map(c => typeof c === 'object' ? c.name : c);
      setCategories(['All', ...catNames]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // 🚀 Fetch PDF List from Backend
  const fetchPdfs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const { token, headers } = getAuthHeaders();

      if (!token) {
        setError('Authentication token nahi mila. Kripya login karein.');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:8000/api/admin/pdfs', { headers });
      const apiData = Array.isArray(response.data) ? response.data : (response.data.data || []);

      const formattedPdfs = apiData.map((pdf) => ({
        id: pdf.id,
        title: pdf.original_name || pdf.title || pdf.name || `Document #${pdf.id}`,
        
        // 🟢 FIX: Category Name extraction with fallback checks
        category: pdf.category?.name || pdf.category_name || (typeof pdf.category === 'string' ? pdf.category : 'General'),
        
        size: formatFileSize(pdf.file_size || pdf.size),
        date: pdf.created_at ? new Date(pdf.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        views: pdf.views_count || pdf.views || 0,
        status: pdf.status || 'Published',
      }));

      setPdfs(formattedPdfs);
    } catch (err) {
      console.error('Error fetching PDFs:', err);

      if (err.response?.status === 401) {
        setError('Token Expired ya Invalid hai (401 Unauthorized). Dobara login karein.');
      } else if (err.response?.status === 404) {
        setError('API Endpoint nahi mila (404 Not Found). Backend route verify karein.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Backend Server Down hai ya CORS issue hai. Verify `php artisan serve`.');
      } else {
        setError(err.response?.data?.message || 'Backend se documents fetch nahi ho paye.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchPdfs();
  }, [fetchCategories, fetchPdfs]);

  // Client-side Filter Logic
  const filteredPdfs = useMemo(() => {
    return pdfs.filter((pdf) => {
      const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || pdf.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesStatus = selectedStatus === 'All' || pdf.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [pdfs, searchQuery, selectedCategory, selectedStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPdfs.length / itemsPerPage);
  const paginatedPdfs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPdfs.slice(start, start + itemsPerPage);
  }, [filteredPdfs, currentPage, itemsPerPage]);

  // Checkbox Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(paginatedPdfs.map((pdf) => pdf.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete Action
  const handleDelete = async (id) => {
    if (!window.confirm('Kya aap is PDF ko delete karna chahte hain?')) return;

    try {
      const { headers } = getAuthHeaders();
      await axios.delete(`http://localhost:8000/api/admin/pdfs/${id}`, { headers });

      setPdfs((prev) => prev.filter((pdf) => pdf.id !== id));
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      console.error('Error deleting PDF:', err);
      alert(err.response?.data?.message || 'Delete karne me dikkat aayi.');
    }
  };

  // Bulk Delete Action
  const handleBulkDelete = async () => {
    if (!window.confirm(`Kya aap selected ${selectedItems.length} PDFs ko delete karna chahte hain?`)) return;

    try {
      const { headers } = getAuthHeaders();
      await axios.post(
        'http://localhost:8000/api/admin/pdfs/bulk-delete',
        { ids: selectedItems },
        { headers }
      );

      setPdfs((prev) => prev.filter((pdf) => !selectedItems.includes(pdf.id)));
      setSelectedItems([]);
    } catch (err) {
      console.error('Error in bulk delete:', err);
      alert(err.response?.data?.message || 'Bulk delete process nahi ho paya.');
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            PDF Document Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            View, search, filter, and manage all documents across the portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { fetchCategories(); fetchPdfs(); }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            title="Reload List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/admin/upload')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Upload New PDF
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-4 rounded-2xl shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by file title..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0">

          {/* Dynamic Backend Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-xl">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {statuses.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                  {st === 'All' ? 'All Status' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Delete Action Button */}
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedItems.length})
            </button>
          )}

        </div>

      </div>

      {/* Main Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden">

        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedPdfs.length > 0 && selectedItems.length === paginatedPdfs.length}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Document Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Upload Date</th>
                <th className="py-3.5 px-4 text-center">Views</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                      <span>Loading documents from backend...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedPdfs.length > 0 ? (
                paginatedPdfs.map((pdf) => {
                  const isSelected = selectedItems.includes(pdf.id);
                  return (
                    <tr 
                      key={pdf.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors ${
                        isSelected ? 'bg-indigo-50/40 dark:bg-indigo-500/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(pdf.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* File Name & Icon */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="truncate" title={pdf.title}>{pdf.title}</span>
                        </div>
                      </td>

                      {/* Category Badge - Shows Dynamic Backend Category */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-[10px] font-semibold">
                          {pdf.category}
                        </span>
                      </td>

                      {/* File Size */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {pdf.size}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          pdf.status === 'Published' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : pdf.status === 'Draft' 
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                        }`}>
                          {pdf.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {pdf.date}
                      </td>

                      {/* Views */}
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-semibold">
                        {pdf.views}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/view/${pdf.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                            title="View PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => navigate(`/admin/edit/${pdf.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                            title="Edit Info"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(pdf.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400">
                    No PDF documents found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-800 dark:text-white">{filteredPdfs.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> to <strong className="text-slate-800 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredPdfs.length)}</strong> of <strong className="text-slate-800 dark:text-white">{filteredPdfs.length}</strong> documents
          </span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}