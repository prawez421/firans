import React, { useState, useEffect } from 'react';
import { getPdfs, getCategories } from '../api/UsersAxios';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import PdfCard from '../components/PdfCard';
import PdfViewerModal from '../components/PdfViewerModal';
import Footer from '../components/Footer';
import { Loader2, FolderX, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [pdfs, setPdfs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Modal Data State
  const [activePdf, setActivePdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🚀 1. Fetch Categories Once
  useEffect(() => {
    getCategories()
      .then((res) => {
        const catData = Array.isArray(res) ? res : (res?.data || []);
        setCategories(catData);
      })
      .catch((err) => {
        console.error('Error fetching categories:', err);
        setCategories([]);
      });
  }, []);

  // 🚀 2. Fetch PDFs when Search or Selected Category changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    getPdfs(search, selectedCategory)
      .then((res) => {
        if (!isMounted) return;
        
        // Response normalization (Handles Direct Array or Paginated Object)
        const pdfData = Array.isArray(res) ? res : (res?.data || []);
        setPdfs(pdfData);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching PDFs:', err);
        setError('Backend se documents load nahi ho paye. Kripya backend server verify karein.');
        setPdfs([]);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, selectedCategory]);

  // Handler when View PDF is clicked
  const handleViewPdf = (url, pdfObject) => {
    setActivePdf({
      url: url,
      name: pdfObject?.original_name || pdfObject?.title || pdfObject?.name || 'Document.pdf'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-purple-500 selection:text-white transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto my-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white">
            Welcome to <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Firans</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium">
            Explore, search, and view all system documents seamlessly.
          </p>
        </section>

        {/* Search Input */}
        <SearchBar search={search} setSearch={setSearch} />

        {/* Category Filters */}
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory} 
          setCategory={setSelectedCategory} 
        />

        {/* Backend Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* PDF Grid Container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
            <p className="font-medium text-sm">Loading documents from backend...</p>
          </div>
        ) : pdfs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.map((pdf) => (
              <PdfCard 
                key={pdf.id} 
                pdf={pdf} 
                onView={(url, pdfObj) => handleViewPdf(url, pdfObj || pdf)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm">
            <FolderX className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No PDFs found matching your criteria.</p>
          </div>
        )}

        {/* PDF Viewer Modal */}
        <PdfViewerModal 
          fileUrl={activePdf?.url} 
          fileName={activePdf?.name}
          onClose={() => setActivePdf(null)} 
        />
      </main>

      <Footer />
    </div>
  );
}