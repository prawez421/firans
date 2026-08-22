import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPdfById, updatePdf, deletePdf, getCategories } from '../api/adminAxios';
import { 
  ArrowLeft, 
  FileText, 
  Save, 
  Trash2, 
  FolderPlus, 
  Tag, 
  AlignLeft, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  UploadCloud,
  Clock,
  HardDrive,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function PdfEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const replaceFileInputRef = useRef(null);

  // Form & Document State
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    status: 'Published',
    tags: '',
    description: '',
    size: '0 MB',
    date: '',
    views: 0
  });

  // UI States & Dynamic Categories List
  const [categoriesList, setCategoriesList] = useState([]);
  const [replacementFile, setReplacementFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch PDF Data & Categories Independently
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // --- STEP 1: Categories Fetching ---
        if (typeof getCategories === 'function') {
          try {
            const catRes = await getCategories();
            console.log("1. Raw Categories Response:", catRes);

            // Handle multiple backend response structures (Array check)
            let extractedList = [];
            if (Array.isArray(catRes)) {
              extractedList = catRes;
            } else if (Array.isArray(catRes?.data)) {
              extractedList = catRes.data;
            } else if (Array.isArray(catRes?.data?.data)) {
              extractedList = catRes.data.data;
            } else if (Array.isArray(catRes?.data?.categories)) {
              extractedList = catRes.data.categories;
            }

            console.log("2. Processed Categories List:", extractedList);
            setCategoriesList(extractedList);
          } catch (catErr) {
            console.error("Categories Fetch Error:", catErr);
          }
        }

        // --- STEP 2: PDF Details Fetching ---
        const pdfResponse = await getPdfById(id);
        const apiData = pdfResponse?.data?.data || pdfResponse?.data || pdfResponse;

        // Size formatting helper
        const formattedSize = apiData.file_size 
          ? `${(apiData.file_size / (1024 * 1024)).toFixed(2)} MB` 
          : 'N/A';

        // Get Category ID / Name safely
        const rawCatId = apiData.category_id ?? apiData.category?.id ?? apiData.category ?? '';

        setFormData({
          title: apiData.original_name || apiData.title || '',
          category_id: String(rawCatId), // String conversion for <select>
          status: apiData.status || 'Published',
          tags: apiData.tags ? (Array.isArray(apiData.tags) ? apiData.tags.join(', ') : apiData.tags) : '',
          description: apiData.description || '',
          size: formattedSize,
          date: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString() : 'N/A',
          views: apiData.views_count || apiData.views || 0
        });

      } catch (err) {
        console.error("API Fetch Error:", err);
        setError(err.response?.data?.message || 'Failed to load document details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Input Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setIsSaved(false);
  };

  // Replace File Selection
  const handleReplaceFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newFile = e.target.files[0];
      if (newFile.type === 'application/pdf') {
        setReplacementFile(newFile);
        setIsSaved(false);
      } else {
        alert('Please select a valid PDF file.');
      }
    }
  };

  // 2. Submit Form Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaved(false);
    setError(null);

    try {
      const payload = new FormData();
      payload.append('_method', 'PUT'); // Laravel Multipart PUT Spoofing
      payload.append('title', formData.title);
      payload.append('category_id', formData.category_id);
      payload.append('status', formData.status);
      payload.append('tags', formData.tags);
      payload.append('description', formData.description);

      if (replacementFile) {
        payload.append('pdf', replacementFile);
      }

      await updatePdf(id, payload);

      setIsSaved(true);
      if (replacementFile) {
        setFormData((prev) => ({
          ...prev,
          size: `${(replacementFile.size / (1024 * 1024)).toFixed(2)} MB`
        }));
        setReplacementFile(null);
      }
    } catch (err) {
      console.error("API Save Error:", err);
      setError(err.response?.data?.message || 'Failed to update document.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this document?')) {
      try {
        await deletePdf(id);
        navigate('/admin/pdfs');
      } catch (err) {
        alert(err.response?.data?.message || 'Delete operation failed.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-slate-500">Loading document details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/pdfs')}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
            title="Back to List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Edit PDF Document
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono">
                #{id}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Update document details, replace file, or modify access settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/view/${id}`)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>

          <button
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {isSaved && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Document metadata has been successfully updated!
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3">
              General Information
            </h2>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                Document Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-indigo-500" /> Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a brief overview of this PDF..."
                className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-500" /> Replace Attached PDF
            </h2>

            <input
              type="file"
              ref={replaceFileInputRef}
              onChange={handleReplaceFile}
              accept="application/pdf"
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                    {replacementFile ? replacementFile.name : formData.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {replacementFile 
                      ? `New File: ${(replacementFile.size / (1024 * 1024)).toFixed(2)} MB` 
                      : `Current: ${formData.size}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => replaceFileInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" /> {replacementFile ? 'Change Selection' : 'Upload Replacement'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3">
              Publishing Options
            </h3>

            {/* Dynamic Category Select */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-slate-400" /> Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="">Select Category</option>
                {categoriesList.length === 0 ? (
                  <option value="" disabled>No Categories Available</option>
                ) : (
                  categoriesList.map((cat, index) => {
                    const val = String(cat.id ?? cat._id ?? cat.category_id ?? cat.value ?? cat);
                    const label = String(cat.name ?? cat.title ?? cat.category_name ?? cat.label ?? cat);
                    return (
                      <option key={val !== 'undefined' ? val : index} value={val} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                        {label}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> Visibility Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Published" className="bg-white dark:bg-slate-900">Published</option>
                <option value="Draft" className="bg-white dark:bg-slate-900">Draft</option>
                <option value="Archived" className="bg-white dark:bg-slate-900">Archived</option>
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-3 shadow-sm text-xs">
            <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/10 pb-2">
              File Details
            </h3>

            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Uploaded Date</span>
              <strong className="text-slate-800 dark:text-slate-200">{formData.date}</strong>
            </div>

            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-slate-400" /> File Size</span>
              <strong className="text-slate-800 dark:text-slate-200 font-mono">{formData.size}</strong>
            </div>

            <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-slate-400" /> Total Views</span>
              <strong className="text-slate-800 dark:text-slate-200">{formData.views} views</strong>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}