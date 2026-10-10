<?php

namespace App\Http\Controllers\Admin;


use App\Http\Controllers\Controller;
use App\Models\PdfFile;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use Throwable;

class DashboardController extends Controller
{
    // ==========================================
    // GET DASHBOARD STATISTICS
    // ==========================================
    public function getStats(): JsonResponse
    {
        try {
            // =====================================
            // 1. TOTAL USERS
            // =====================================
            $totalUsers = User::count();

            // =====================================
            // 2. TOTAL PDF FILES
            // =====================================
            $totalPdfs = PdfFile::count();

            // =====================================
            // 3. TOTAL CATEGORIES
            // =====================================
            $totalCategories = Category::count();

            // =====================================
            // 4. TOTAL DOWNLOADS
            // =====================================
            $totalDownloads = 0;

            if (Schema::hasColumn('pdf_files', 'downloads')) {
                $totalDownloads = (int) PdfFile::sum('downloads');
            } elseif (Schema::hasColumn('pdf_files', 'download_count')) {
                $totalDownloads = (int) PdfFile::sum('download_count');
            }

            // =====================================
            // 5. MONTHLY PDF UPLOADS
            // LAST 12 MONTHS
            // =====================================
            $monthlyUploads = [];

            $startMonth = Carbon::now()
                ->startOfMonth()
                ->subMonths(11);

            $monthlyCounts = PdfFile::query()
                ->selectRaw(
                    "YEAR(created_at) as year, 
                     MONTH(created_at) as month_number,
                     COUNT(*) as total"
                )
                ->where('created_at', '>=', $startMonth)
                ->groupBy(
                    DB::raw('YEAR(created_at)'),
                    DB::raw('MONTH(created_at)')
                )
                ->get()
                ->keyBy(function ($item) {
                    return sprintf(
                        '%04d-%02d',
                        $item->year,
                        $item->month_number
                    );
                });

            for ($i = 0; $i < 12; $i++) {
                $date = $startMonth->copy()->addMonths($i);

                $key = $date->format('Y-m');

                $monthlyUploads[] = [
                    'month' => $date->format('M Y'),
                    'uploads' => (int) (
                        $monthlyCounts->get($key)?->total ?? 0
                    ),
                ];
            }

            // =====================================
            // 6. RECENT 5 PDF FILES
            // =====================================
            $recentPdfs = PdfFile::query()
                ->with('category')
                ->latest()
                ->take(5)
                ->get();

            // =====================================
            // 7. RECENT 5 USERS
            // =====================================
            $recentUsers = User::query()
                ->select([
                    'id',
                    'name',
                    'email',
                    'created_at',
                ])
                ->latest()
                ->take(5)
                ->get();

            // =====================================
            // 8. STORAGE USED
            // =====================================
            $storageUsed = 0;

            if (Schema::hasColumn('pdf_files', 'file_size')) {
                $storageUsed = (int) PdfFile::sum('file_size');
            }

            $storageUsedMb = round(
                $storageUsed / (1024 * 1024),
                2
            );

            // =====================================
            // 9. SUCCESS RESPONSE
            // =====================================
            return response()->json([
                'success' => true,

                'message' => 'Dashboard data fetched successfully',

                'stats' => [
                    'totalUsers' => $totalUsers,
                    'totalPdfs' => $totalPdfs,
                    'totalCategories' => $totalCategories,
                    'totalDownloads' => $totalDownloads,
                    'storageUsed' => $storageUsedMb . ' MB',
                ],

                'monthlyUploads' => $monthlyUploads,

                'recentPdfs' => $recentPdfs,

                'recentUsers' => $recentUsers,

            ], 200);

        } catch (Throwable $e) {

            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard stats',
            ], 500);
        }
    }
}
