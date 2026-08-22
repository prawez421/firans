import React from 'react';
import { FileText, Folder, Eye } from 'lucide-react';

export default function PdfCard({ pdf, onView }) {
  // 🟢 1. Safe Title Extraction (Backend original_name, title, or name fallback)
  const pdfTitle = pdf?.original_name || pdf?.title || pdf?.name || `Document #${pdf?.id || 'N/A'}`;

  // 🟢 2. Safe Category Extraction (Object ya String handle karne ke liye)
  const pdfCategory = typeof pdf?.category === 'object' 
    ? pdf?.category?.name 
    : pdf?.category || 'General';

  // 🟢 3. Safe File URL Resolution (Relative URL ko absolute URL me convert karna)
  const getPdfUrl = () => {
    const rawUrl = pdf?.file_url || pdf?.file_path || pdf?.url || pdf?.file;
    if (!rawUrl) return '';

    // Agar URL me 'http' ya 'https' nahi hai to base URL add karein
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      return `http://localhost:8000/storage/${rawUrl.replace(/^\/+/, '')}`;
    }
    return rawUrl;
  };

  const handleViewClick = () => {
    const finalUrl = getPdfUrl();
    if (onView) {
      onView(finalUrl, pdf);
    } else if (finalUrl) {
      window.open(finalUrl, '_blank');
    }
  };

  return (
    <div className="group relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300">
      <div>
        {/* Title & Icon */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 
            className="font-semibold text-lg text-slate-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors line-clamp-2"
            title={pdfTitle}
          >
            {pdfTitle}
          </h3>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Category Badge */}
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 mb-6">
          <Folder className="w-3.5 h-3.5 text-purple-500" /> {pdfCategory}
        </span>
      </div>

      {/* View PDF Button */}
      <button
        type="button"
        onClick={handleViewClick}
        className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 active:scale-95 shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Eye className="w-4 h-4" /> View PDF
      </button>
    </div>
  );
}