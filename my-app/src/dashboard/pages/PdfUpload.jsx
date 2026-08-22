import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  ArrowLeft, 
  FolderPlus,
  Tag,
  AlignLeft,
  Eye,
  Loader2
} from 'lucide-react';

export default function PdfUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic Categories State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form Fields State
  const [metadata, setMetadata] = useState({
    title: '',
    category_id: '', // Storing selected Category ID
    status: 'Published',
    tags: '',
    description: '',
  });

  // 🚀 Fetch Dynamic Categories from Laravel Backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('admin_token'); // Sanctum auth token
        const response = await axios.get('http://localhost:8000/api/admin/categories', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const categoryData = response.data.data || response.data;
        setCategories(categoryData);

        // Auto-select first active category if available
        if (categoryData.length > 0) {
          setMetadata((prev) => ({ ...prev, category_id: categoryData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  // Process File Selection
  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      if (!metadata.title) {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setMetadata((prev) => ({ ...prev, title: cleanName }));
      }
    } else {
      alert('Kripya sirf valid PDF file hi upload karein!');
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Clear Selected File
  const handleRemoveFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 🚀 Upload Form to Laravel Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Pehle ek PDF file select ya drag karein!');
      return;
    }

    setIsUploading(true);
    setIsSuccess(false);
    setUploadProgress(0);

    const token = localStorage.getItem('admin_token');
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', metadata.title);
    formData.append('category_id', metadata.category_id);
    formData.append('status', metadata.status);
    formData.append('tags', metadata.tags);
    formData.append('description', metadata.description);

    try {
      const response = await axios.post('http://localhost:8000/api/admin/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        setIsUploading(false);
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      setIsUploading(false);
      alert(error.response?.data?.message || 'Upload fail ho gaya!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/pdfs')}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Back to PDF List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
              Upload New PDF Document
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Drag and drop your file or select manually to publish to the portal.
            </p>
          </div>
        </div>
      </div>

      {/* Main Upload Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Section: Dropzone & Description */}
        <div className="md:col-span-2 space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500/50 cursor-pointer'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden"
            />

            {!file ? (
              <div className="space-y-3 pointer-events-none">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span className="text-indigo-600 dark:text-indigo-400 underline">Click to upload</span> or drag & drop PDF here
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Maximum file size up to 10MB (PDF files only)
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isUploading && (
                  <div className="space-y-1.5 text-left">
                    <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                      <span>Uploading document...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {isSuccess && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> PDF Uploaded & Published Successfully!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-indigo-500" /> Document Summary / Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={metadata.description}
              onChange={handleInputChange}
              placeholder="Brief overview of what this document contains..."
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
          </div>
        </div>

        {/* Right Section: Settings & Backend Categories */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3">
              Document Settings
            </h3>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                Document Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={metadata.title}
                onChange={handleInputChange}
                placeholder="e.g. Annual Report 2026"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Dynamic Category Select */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FolderPlus className="w-3.5 h-3.5 text-slate-400" /> Category
                </span>
                {loadingCategories && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
              </label>
              
              <select
                name="category_id"
                value={metadata.category_id}
                onChange={handleInputChange}
                disabled={loadingCategories || categories.length === 0}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="">No categories available</option>
                )}
              </select>
            </div>

            {/* Visibility Status */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> Visibility Status
              </label>
              <select
                name="status"
                value={metadata.status}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                <option value="Published" className="bg-white dark:bg-slate-900">Published (Visible to all)</option>
                <option value="Draft" className="bg-white dark:bg-slate-900">Draft (Admin only)</option>
                <option value="Archived" className="bg-white dark:bg-slate-900">Archived</option>
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Tags (Comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={metadata.tags}
                onChange={handleInputChange}
                placeholder="2026, finance, audit"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!file || isUploading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-95"
              >
                {isUploading ? (
                  `Uploading (${uploadProgress}%)...`
                ) : isSuccess ? (
                  'Done! Upload Another'
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" /> Save & Publish
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}