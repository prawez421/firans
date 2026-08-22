<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PdfFile; // Correct Model Import
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    public function getStats(): JsonResponse
    {
        try {
            // 1. Total Counts (Safe checks with imported Model)
            $totalPdfs = PdfFile::count();
            $activeUsers = class_exists(User::class) ? User::count() : 0;

            // 2. Dynamic aggregate sum (Column exist hone par hi sum karega, varna 0 return karega)
            $totalDownloads = Schema::hasColumn('pdf_files', 'downloads') 
                ? PdfFile::sum('downloads') 
                : 0;

            // 3. Recent 5 PDFs (Dynamic column fetch)
            $recentFiles = PdfFile::latest()->take(5)->get();

            return response()->json([
                'stats' => [
                    'totalPdfs' => $totalPdfs,
                    'activeUsers' => $activeUsers,
                    'totalDownloads' => $totalDownloads,
                    'storageUsed' => '0 MB',
                ],
                'recentFiles' => $recentFiles,
                'activityLogs' => [
                    ['message' => 'System dashboard synced successfully', 'time' => 'Just now'],
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching dashboard stats',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}