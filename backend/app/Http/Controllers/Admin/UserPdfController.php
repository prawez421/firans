<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PdfFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class UserPdfController extends Controller
{
    // ==========================================
    // GET ALL AVAILABLE PDFS
    // GET /api/user/pdfs
    // ==========================================
    public function index(Request $request)
    {
        $query = PdfFile::query()
            ->with('category')
            ->latest();

        // Only show active PDFs if status exists
        if (Schema::hasColumn('pdf_files', 'status')) {
            $query->where('status', 1);
        }

        // SEARCH
        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('original_name', 'like', "%{$search}%");
            });
        }

        // CATEGORY FILTER
        if ($request->filled('category_id')) {
            $query->where(
                'category_id',
                $request->category_id
            );
        }

        $pdfs = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'PDFs fetched successfully',
            'data' => $pdfs,
        ]);
    }

    // ==========================================
    // GET SINGLE PDF DETAILS
    // GET /api/user/pdfs/{id}
    // ==========================================
    public function show($id)
    {
        $pdf = $this->findAvailablePdf($id);

        return response()->json([
            'success' => true,
            'data' => $pdf,
        ]);
    }

    // ==========================================
    // PREVIEW PDF
    // GET /api/user/pdfs/{id}/preview
    // ==========================================
    public function preview($id)
    {
        $pdf = $this->findAvailablePdf($id);

        $disk = Storage::disk('public');

        if (!$pdf->file_path || !$disk->exists($pdf->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'PDF file not found in storage',
            ], Response::HTTP_NOT_FOUND);
        }

        $path = $disk->path($pdf->file_path);

        return response()->file($path, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' =>
                'inline; filename="document.pdf"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    // ==========================================
    // DOWNLOAD PDF
    // GET /api/user/pdfs/{id}/download
    // ==========================================
    public function download($id)
    {
        $pdf = $this->findAvailablePdf($id);

        $disk = Storage::disk('public');

        if (!$pdf->file_path || !$disk->exists($pdf->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'PDF file not found in storage',
            ], Response::HTTP_NOT_FOUND);
        }

        // Increment downloads if column exists
        if (Schema::hasColumn('pdf_files', 'downloads')) {
            $pdf->increment('downloads');
        } elseif (Schema::hasColumn('pdf_files', 'download_count')) {
            $pdf->increment('download_count');
        }

        $filename = $pdf->original_name
            ?: 'document-' . $pdf->id . '.pdf';

        return $disk->download(
            $pdf->file_path,
            $filename,
            [
                'Content-Type' => 'application/pdf',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    // ==========================================
    // SHARED PDF LOOKUP
    // ==========================================
    private function findAvailablePdf($id)
    {
        $query = PdfFile::query()->with('category');

        if (Schema::hasColumn('pdf_files', 'status')) {
            $query->where('status', 1);
        }

        return $query->findOrFail($id);
    }
}
