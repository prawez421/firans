import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Download, 
  HardDrive, 
  Eye, 
  ArrowUpRight, 
  Plus, 
  Upload,
  Settings,
  TrendingUp,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { getDashboardStats } from '../api/adminAxios'; 

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalPdfs: 0,
      activeUsers: 0,
      totalDownloads: 0,
      storageUsed: '0 MB'
    },
    recentFiles: [], // Ensure recentFiles exist in the state structure
    activityLogs: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getDashboardStats();
        
        // Safety check to ensure we merge default values if data is missing
        setDashboardData({
          stats: data.stats || {
            totalPdfs: 0,
            activeUsers: 0,
            totalDownloads: 0,
            storageUsed: '0 MB'
          },
          recentFiles: data.recentFiles || [],
          activityLogs: data.activityLogs || []
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsList = [
    { 
      title: 'Total PDFs', 
      value: dashboardData.stats?.totalPdfs ?? 0, 
      icon: FileText, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-500/10' 
    },
    { 
      title: 'Active Users', 
      value: dashboardData.stats?.activeUsers ?? 0, 
      icon: Users, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      title: 'Total Downloads', 
      value: dashboardData.stats?.totalDownloads ?? 0, 
      icon: Download, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-500/10' 
    },
    { 
      title: 'Storage Used', 
      value: dashboardData.stats?.storageUsed || '0 MB', 
      icon: HardDrive, 
      color: 'text-purple-600 dark:text-purple-400', 
      bg: 'bg-purple-500/10' 
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 🚀 Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white p-6 rounded-3xl shadow-xl shadow-indigo-500/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back 👋</h1>
          <p className="text-xs sm:text-sm text-indigo-100/90">
            Here is what's happening with your PDF Document Portal today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button 
            onClick={() => navigate('/admin/upload')}
            className="px-4 py-2.5 bg-white text-indigo-600 hover:bg-slate-100 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" /> Upload PDF
          </button>
        </div>
      </div>

      {/* 📈 Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsList.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-800 dark:text-white">
                  {stat.value}
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> Live
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📋 Lower Layout: Recent Uploads + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Files Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Recent Documents
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest files uploaded to system
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/pdfs')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {(!dashboardData.recentFiles || dashboardData.recentFiles.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent files found.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 uppercase border-b border-slate-100 dark:border-white/5 font-semibold text-[10px]">
                  <tr>
                    <th className="pb-3 px-2">Document Name</th>
                    <th className="pb-3 px-2">Category</th>
                    <th className="pb-3 px-2">Size</th>
                    <th className="pb-3 px-2">Views</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {dashboardData.recentFiles.map((file) => (
                    <tr key={file.id || file._id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        {/* Make sure the key matches your Laravel database column, like title, name, or file_name */}
                        <span className="truncate max-w-[160px] sm:max-w-xs">{file.title || file.name || file.file_name || 'Untitled Document'}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-[10px] font-medium">
                          {/* Ensure category name is fetched correctly */}
                          {file.category?.name || file.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">
                          {/* Handles cases where size might be numeric (bytes) or string (MB) */}
                          {file.size ? (typeof file.size === 'number' ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : file.size) : 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{file.views ?? 0}</td>
                      <td className="py-3 px-2 text-right">
                        <button 
                          onClick={() => navigate(`/admin/view/${file.id || file._id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick Actions & System Log (1 Column) */}
        <div className="space-y-6">
          
          {/* Quick Shortcuts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Quick Shortcuts
            </h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button 
                onClick={() => navigate('/admin/upload')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-slate-200/60 dark:border-white/5 text-left transition-all group cursor-pointer"
              >
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Upload PDF</p>
                <p className="text-[10px] text-slate-400">Add new document</p>
              </button>

              <button 
                onClick={() => navigate('/admin/settings')}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-slate-200/60 dark:border-white/5 text-left transition-all group cursor-pointer"
              >
                <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Settings</p>
                <p className="text-[10px] text-slate-400">Configure portal</p>
              </button>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Live Activity
            </h3>

            <div className="space-y-3 text-xs">
              {dashboardData.activityLogs && dashboardData.activityLogs.length > 0 ? (
                dashboardData.activityLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{log.message}</p>
                      <span className="text-[10px] text-slate-400">{log.time || 'Recently'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-[11px]">No recent activity logged.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}