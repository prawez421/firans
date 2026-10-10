<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PdfFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PdfController extends Controller
{
    // ==========================================
    // GET ALL PDFS
    // ==========================================
    public function index(Request $request)
    {
        $query = PdfFile::with('category');

        // Search by title or original filename
        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere(
                      'original_name',
                      'like',
                      "%{$search}%"
                  );
            });
        }

        // Filter by category ID or name
        if ($request->filled('category')) {
            $category = $request->category;

            $query->where(function ($q) use ($category) {
                if (is_numeric($category)) {
                    $q->where('category_id', $category);
                } else {
                    $q->whereHas(
                        'category',
                        function ($subQuery) use ($category) {
                            $subQuery->where(
                                'name',
                                $category
                            );
                        }
                    );
                }
            });
        }

        $files = $query
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'PDFs fetched successfully',
            'data' => $files,
        ], 200);
    }

    // ==========================================
    // UPLOAD PDF
    // ==========================================
    public function upload(Request $request)
    {
        $validated = $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240',
            'title' => 'nullable|string|max:255',
            'category_id' => 'nullable|integer|exists:categories,id',
        ]);

        $file = $request->file('pdf');

        if (!$file || !$file->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid PDF file',
            ], 422);
        }

        // Save inside storage/app/public/pdfs
        $path = $file->store('pdfs', 'public');

        if (!$path) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to store PDF file',
            ], 500);
        }

        $title = $validated['title']
            ?? pathinfo(
                $file->getClientOriginalName(),
                PATHINFO_FILENAME
            );

        try {
            $pdf = PdfFile::create([
                'title' => $title,
                'category_id' => $validated['category_id'] ?? null,
                'original_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => 'application/pdf',
            ]);

            $pdf->load('category');

            return response()->json([
                'success' => true,
                'message' => 'PDF uploaded successfully',
                'data' => $pdf,
            ], 201);

        } catch (\Throwable $e) {
            // Remove newly uploaded file if DB save fails
            Storage::disk('public')->delete($path);

            throw $e;
        }
    }

    // ==========================================
    // RESTFUL STORE
    // ==========================================
    public function store(Request $request)
    {
        return $this->upload($request);
    }

    // ==========================================
    // SHOW PDF DETAILS
    // ==========================================
    public function show($id)
    {
        $pdf = PdfFile::with('category')->find($id);

        if (!$pdf) {
            return response()->json([
                'success' => false,
                'message' => 'PDF record not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'PDF details fetched successfully',
            'data' => $pdf,
        ], 200);
    }

    // ==========================================
    // PREVIEW ACTUAL PDF FILE
    // ==========================================
    public function preview($id)
    {
        $pdf = PdfFile::find($id);

        if (!$pdf) {
            return response()->json([
                'success' => false,
                'message' => 'PDF record not found',
            ], 404);
        }

        $disk = Storage::disk('public');

        if (
            empty($pdf->file_path) ||
            !$disk->exists($pdf->file_path)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'PDF file not found in storage',
            ], 404);
        }

        $filename = $pdf->original_name ?: 'document.pdf';

        return $disk->response(
            $pdf->file_path,
            $filename,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store',
            ]
        );
    }

    // ==========================================
    // DOWNLOAD PDF
    // ==========================================
    public function download($id)
    {
        $pdf = PdfFile::find($id);

        if (!$pdf) {
            return response()->json([
                'success' => false,
                'message' => 'PDF record not found',
            ], 404);
        }

        $disk = Storage::disk('public');

        if (
            empty($pdf->file_path) ||
            !$disk->exists($pdf->file_path)
        ) {
            return response()->json([
                'success' => false,
                'message' => 'PDF file not found in storage',
            ], 404);
        }

        return $disk->download(
            $pdf->file_path,
            $pdf->original_name ?: 'document.pdf',
            [
                'Content-Type' => 'application/pdf',
            ]
        );
    }

    // ==========================================
    // UPDATE PDF
    // ==========================================
    public function update(Request $request, $id)
    {
        $pdf = PdfFile::find($id);

        if (!$pdf) {
            return response()->json([
                'success' => false,
                'message' => 'PDF record not found',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|nullable|string|max:255',
            'category_id' => 'sometimes|nullable|integer|exists:categories,id',
            'pdf' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $oldPath = $pdf->file_path;
        $newPath = null;

        if (array_key_exists('title', $validated)) {
            $pdf->title = $validated['title']
                ?: pathinfo(
                    $pdf->original_name,
                    PATHINFO_FILENAME
                );
        }

        if (array_key_exists('category_id', $validated)) {
            $pdf->category_id = $validated['category_id'];
        }

        if ($request->hasFile('pdf')) {
            $newFile = $request->file('pdf');

            $newPath = $newFile->store(
                'pdfs',
                'public'
            );

            if (!$newPath) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to store new PDF',
                ], 500);
            }

            $pdf->original_name =
                $newFile->getClientOriginalName();

            $pdf->file_path = $newPath;
            $pdf->file_size = $newFile->getSize();
            $pdf->mime_type = 'application/pdf';
        }

        try {
            $pdf->save();
        } catch (\Throwable $e) {
            // Remove new file if DB update fails
            if ($newPath) {
                Storage::disk('public')->delete($newPath);
            }

            throw $e;
        }

        // Delete old PDF only after DB update succeeds
        if (
            $newPath &&
            $oldPath &&
            $oldPath !== $newPath
        ) {
            Storage::disk('public')->delete($oldPath);
        }

        $pdf->load('category');

        return response()->json([
            'success' => true,
            'message' => 'PDF updated successfully',
            'data' => $pdf,
        ], 200);
    }

    // ==========================================
    // DELETE SINGLE PDF
    // ==========================================
    public function destroy($id)
    {
        $pdf = PdfFile::find($id);

        if (!$pdf) {
            return response()->json([
                'success' => false,
                'message' => 'PDF record not found',
            ], 404);
        }

        $path = $pdf->file_path;

        // Delete DB record first
        $pdf->delete();

        // Delete physical PDF
        if ($path) {
            Storage::disk('public')->delete($path);
        }

        return response()->json([
            'success' => true,
            'message' => 'PDF deleted successfully',
        ], 200);
    }

    // ==========================================
    // BULK DELETE PDFS
    // ==========================================
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|distinct|exists:pdf_files,id',
        ]);

        $files = PdfFile::whereIn(
            'id',
            $validated['ids']
        )->get();

        if ($files->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No PDFs found to delete',
            ], 404);
        }

        $paths = $files
            ->pluck('file_path')
            ->filter()
            ->unique()
            ->values()
            ->all();

        $count = $files->count();

        // Delete DB records
        PdfFile::whereIn(
            'id',
            $files->pluck('id')->all()
        )->delete();

        // Delete physical files
        if (!empty($paths)) {
            Storage::disk('public')->delete($paths);
        }

        return response()->json([
            'success' => true,
            'message' => "{$count} PDFs deleted successfully",
            'deleted_count' => $count,
        ], 200);
    }
}
