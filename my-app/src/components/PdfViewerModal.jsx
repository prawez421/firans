import { useEffect, useState } from 'react';
import { FileText, X, Download, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export default function PdfViewerModal({ fileUrl, fileName = 'Document.pdf', onClose }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 🟢 1. Helper Function: Convert relative path into absolute backend URL
  const resolveBackendUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    // Apna Backend Host (Laravel/Node) URL yahan set karein
    const baseUrl = 'http://localhost:8000';
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    
    // Auto prefix '/storage/' if missing
    if (!cleanPath.startsWith('/storage/') && !cleanPath.startsWith('/uploads/')) {
      return `${baseUrl}/storage${cleanPath}`;
    }
    return `${baseUrl}${cleanPath}`;
  };

  const finalUrl = resolveBackendUrl(fileUrl);

  // 🟢 2. Fetch PDF as Blob to handle CORS & Authentication securely
  useEffect(() => {
    if (!finalUrl) return;

    let isMounted = true;
    setLoading(true);
    setError(false);

    const token = localStorage.getItem('admin_token');

    fetch(finalUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load PDF');
        return res.blob();
      })
      .then((blob) => {
        if (isMounted) {
          const pdfBlobUrl = URL.createObjectURL(
            new Blob([blob], { type: 'application/pdf' })
          );
          setBlobUrl(pdfBlobUrl);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('PDF Fetch Error:', err);
        if (isMounted) {
          // Fallback directly to URL if fetch/blob fails
          setBlobUrl(finalUrl);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fileUrl]);

  // ESC key se close karna aur body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    if (fileUrl) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fileUrl, onClose]);

  if (!fileUrl) return null;

  // ⬇️ Download Handler
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = blobUrl || finalUrl;
    a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl shadow-purple-500/10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <FileText className="w-5 h-5 text-indigo-500 shrink-0"/>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm sm:text-base" title={fileName}>
              {fileName}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 🔗 Open in New Tab */}
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/10 text-xs font-medium transition-all duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5"/>
              Open
            </a>

            {/* ⬇️ Download PDF Button */}
            <button
              onClick={handleDownload}
              title="Download PDF"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5"/>
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* ❌ Close Modal */}
            <button 
              onClick={onClose}
              aria-label="Close Modal"
              className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30 text-xs font-medium transition-all duration-200 cursor-pointer"
            >
              <X className="w-4 h-4"/> 
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* PDF Frame & Loading Screen */}
        <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 relative flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span>Backend se PDF Load ho raha hai...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-2 text-red-500 text-xs p-4 text-center">
              <AlertCircle className="w-8 h-8" />
              <span>PDF render karne me dikkat aayi. Check karein backend URL aur CORS settings.</span>
              <a href={finalUrl} target="_blank" rel="noreferrer" className="underline text-indigo-500 mt-2">
                Direct Open Karein
              </a>
            </div>
          )}

          {!loading && blobUrl && (
            <iframe 
              src={`${blobUrl}#toolbar=1&navpanes=0`}
              title="PDF Viewer" 
              className="w-full h-full border-none"
              onError={() => setError(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}