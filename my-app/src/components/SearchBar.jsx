import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ search, setSearch }) {
  return (
    <div className="relative w-full mb-6">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-5 h-5" />
      </div>

      {/* Input Box */}
      <input
        type="text"
        placeholder="Search PDF Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-12 pr-10 py-3.5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 font-medium outline-none transition-all duration-300 focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/20 shadow-sm dark:shadow-inner"
      />

      {/* Clear Button */}
      {search && (
        <button
          onClick={() => setSearch('')}
          aria-label="Clear Search"
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}