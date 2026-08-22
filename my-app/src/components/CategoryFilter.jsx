import React from 'react';
import { Folder } from 'lucide-react';

export default function CategoryFilter({ categories = [], selectedCategory, setCategory }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
      {/* "All" Category Button */}
      <button
        onClick={() => setCategory('')}
        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
          selectedCategory === ''
            ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
            : 'bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        All
      </button>

      {/* Dynamic Categories List */}
      {Array.isArray(categories) &&
        categories.map((cat) => {
          // Extract Name & ID safely
          const catName = typeof cat === 'object' ? cat.name : cat;
          const catId = typeof cat === 'object' ? cat.id : cat;

          return (
            <button
              key={catId}
              onClick={() => setCategory(catId)} // FIX: Sets Category ID instead of Name
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                String(selectedCategory) === String(catId) // FIX: Matches with ID
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 scale-105'
                  : 'bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Folder className="w-4 h-4" /> {catName}
            </button>
          );
        })}
    </div>
  );
}