import React from 'react';
import { FileText, Heart, Shield, HelpCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 mt-20 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-indigo-500/30">
                F
              </div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Firans
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm font-medium">
              A modern, fast, and secure document portal for managing and viewing all your PDF resources seamlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <a href="#documents" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> All Documents
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
              <li>
                <a href="#help" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> Help Center
                </a>
              </li>
              <li>
                <a href="mailto:support@firans.com" className="hover:text-purple-500 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> Contact Us
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Firans Portal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> for seamless document management.
          </p>
        </div>

      </div>
    </footer>
  );
}