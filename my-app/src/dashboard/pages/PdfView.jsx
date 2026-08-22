import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Printer, 
  Edit3, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  FileText, 
  Calendar, 
  HardDrive, 
  Eye, 
  Tag, 
  Folder,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function PdfView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // API Data & Loading States
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Viewer Controls
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState(true);

  // Helper for Authorization Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
      token,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      }
    };
  };

  // 🚀 Fetch Single PDF from Backend API
  const fetchPdfDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const { token, headers } = getAuthHeaders();

      if (!token) {
        setError('Authentication token missing. Please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:8000/api/admin/pdfs/${id}`, { headers });
      const apiData = response.data?.data || response.data;

      // Construct Public URL for storage file
      const rawPath = apiData.file_path || '';
      const formattedUrl = rawPath.startsWith('http') 
        ? rawPath 
        : `http://localhost:8000/storage/${rawPath.replace(/^public\//, '')}`;

      // Format Bytes to Readable Size
      const formatBytes = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
      };

      setDoc({
        id: apiData.id,
        title: apiData.original_name || apiData.title || `Document_${apiData.id}.pdf`,
        category: apiData.category?.name || apiData.category || 'General',
        size: formatBytes(apiData.file_size),
        date: apiData.created_at ? new Date(apiData.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
        views: apiData.views_count || apiData.views || 0,
        totalPages: apiData.total_pages || 1,
        author: apiData.uploaded_by || 'Admin',
        status: apiData.status || 'Published',
        tags: apiData.tags ? (typeof apiData.tags === 'string' ? JSON.parse(apiData.tags) : apiData.tags) : ['document'],
        description: apiData.description || 'Uploaded PDF file stored in server repository.',
        pdfUrl: formattedUrl
      });

    } catch (err) {
      console.error('Error loading PDF:', err);
      setError(err.response?.data?.message || 'Document ko load karne me dikkat aayi. Endpoint ya token verify karein.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPdfDetails();
  }, [fetchPdfDetails]);

  // View Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleDownload = () => {
    if (!doc?.pdfUrl) return;
    const link = document.createElement('a');
    link.href = doc.pdfUrl;
    link.target = '_blank';
    link.download = doc.title;
    link.click();
  };

  const handlePrint = () => {
    if (doc?.pdfUrl) {
      const printWindow = window.open(doc.pdfUrl, '_blank');
      printWindow?.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Document viewer load ho raha hai...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 space-y-4">
        <AlertCircle className="w-8 h-8 mx-auto" />
        <p className="text-sm font-semibold">{error || 'PDF document nahi mila.'}</p>
        <button
          onClick={() => navigate('/admin/pdfs')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-all cursor-pointer"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate('/admin/pdfs')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0"
            title="Back to List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white truncate">
              {doc.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold">
                {doc.category}
              </span>
              <span>•</span>
              <span>{doc.size}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate(`/admin/edit/${id}`)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-indigo-500" /> Edit Metadata
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" /> Download
          </button>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showDetails 
                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle Sidebar"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 🛠 Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-md">
        <div className="flex items-center gap-2 text-xs">
          <button 
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-mono text-slate-300">
            Page <strong className="text-white">{currentPage}</strong> of <strong>{doc.totalPages}</strong>
          </span>

          <button 
            disabled={currentPage >= doc.totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, doc.totalPages))}
            className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 cursor-pointer transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1 text-xs">
            <button 
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold w-12 text-center">{zoom}%</span>
            <button 
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={handleRotate}
            className="p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all text-xs flex items-center gap-1"
            title="Rotate Clockwise"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button 
            onClick={handlePrint}
            className="p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-all text-xs"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 📺 Embedded PDF Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className={`transition-all duration-300 ${showDetails ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div className="bg-slate-200 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 rounded-3xl p-4 sm:p-6 min-h-[650px] flex items-center justify-center overflow-auto relative shadow-inner">
            
            <div 
              className="transition-all duration-200 ease-out origin-center bg-white shadow-2xl rounded-xl overflow-hidden w-full"
              style={{
                width: `${zoom}%`,
                transform: `rotate(${rotation}deg)`
              }}
            >
              <iframe
                src={`${doc.pdfUrl}#page=${currentPage}`}
                title={doc.title}
                className="w-full h-[650px] border-none"
              />
            </div>

          </div>
        </div>

        {/* ℹ️ Sidebar Metadata */}
        {showDetails && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Document Overview
            </h3>

            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Description</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {doc.description}
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5 text-slate-400" /> Category</span>
                <strong className="text-slate-800 dark:text-slate-200">{doc.category}</strong>
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Uploaded</span>
                <strong className="text-slate-800 dark:text-slate-200">{doc.date}</strong>
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-slate-400" /> Size</span>
                <strong className="text-slate-800 dark:text-slate-200 font-mono">{doc.size}</strong>
              </div>

              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-slate-400" /> Views</span>
                <strong className="text-slate-800 dark:text-slate-200">{doc.views} views</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Document link copied to clipboard!');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-indigo-500" /> Share Document Link
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}