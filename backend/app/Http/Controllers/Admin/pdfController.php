<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PdfFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PdfController extends Controller
{
    /**
     * Fetch All PDFs (with Search & Category Filters)
     */
    public function index(Request $request)
    {
        // 🟢 FIX: with('category') add kiya gaya hai taaki category join ho kar aaye
        $query = PdfFile::with('category');

        // 1. Search Filter (Title ya Original Name par)
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('original_name', 'like', '%' . $search . '%');
            });
        }

        // 2. Category Filter (Category ID ya Name ke base par)
        if ($request->filled('category')) {
            $category = $request->category;
            
            if (is_numeric($category)) {
                $query->where('category_id', $category);
            } else {
                $query->where('category_id', $category)
                      ->orWhereHas('category', function ($q) use ($category) {
                          $q->where('name', $category);
                      });
            }
        }

        $files = $query->latest()->get();

        return response()->json([
            'success' => true,
            'data'    => $files,
        ], 200);
    }

    /**
     * Dedicated Upload Endpoint (/api/admin/pdf/upload)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'pdf'         => 'required|file|mimes:pdf|max:10240', // Max 10MB
            'title'       => 'nullable|string|max:255',
            'category_id' => 'nullable',
        ]);

        if ($request->hasFile('pdf')) {
            $file = $request->file('pdf');
            $path = $file->store('pdfs', 'public');

            // Default title fallback if none is sent from frontend
            $title = $request->input('title') ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

            $data = [
                'title'         => $title,
                'category_id'   => $request->input('category_id'),
                'original_name' => $file->getClientOriginalName(),
                'file_path'     => $path,
                'file_size'     => $file->getSize(),
                'mime_type'     => $file->getClientMimeType(),
            ];

            $newPdf = PdfFile::create($data);

            return response()->json([
                'success' => true,
                'message' => 'PDF uploaded successfully',
                'data'    => $newPdf,
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'No PDF file attached',
        ], 400);
    }

    /**
     * Upload PDF (RESTful store method)
     */
    public function store(Request $request)
    {
        return $this->upload($request);
    }

    /**
     * Fetch Single PDF details
     */
    public function show($id)
    {
        // 🟢 FIX: with('category') yahan bhi add kiya gaya hai
        $file = PdfFile::with('category')->find($id);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $file,
        ], 200);
    }

    /**
     * Update Single PDF
     */
    public function update(Request $request, $id)
    {
        $file = PdfFile::find($id);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        $request->validate([
            'title'       => 'nullable|string|max:255',
            'category_id' => 'nullable',
            'pdf'         => 'nullable|file|mimes:pdf|max:10240',
        ]);

        if ($request->has('title')) {
            $file->title = $request->input('title');
        }
        if ($request->has('category_id')) {
            $file->category_id = $request->input('category_id');
        }

        if ($request->hasFile('pdf')) {
            if (Storage::disk('public')->exists($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
            }

            $newFile = $request->file('pdf');
            $path = $newFile->store('pdfs', 'public');

            $file->original_name = $newFile->getClientOriginalName();
            $file->file_path     = $path;
            $file->file_size     = $newFile->getSize();
            $file->mime_type     = $newFile->getClientMimeType();
        }

        $file->save();

        return response()->json([
            'success' => true,
            'message' => 'PDF updated successfully',
            'data'    => $file,
        ], 200);
    }

    /**
     * Delete Single PDF
     */
    public function destroy($id)
    {
        $file = PdfFile::find($id);

        if (!$file) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        if (Storage::disk('public')->exists($file->file_path)) {
            Storage::disk('public')->delete($file->file_path);
        }

        $file->delete();

        return response()->json([
            'success' => true,
            'message' => 'PDF deleted successfully',
        ], 200);
    }

    /**
     * Bulk Delete PDFs
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:pdf_files,id',
        ]);

        $files = PdfFile::whereIn('id', $request->ids)->get();

        if ($files->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No files found to delete',
            ], 404);
        }

        $paths = $files->pluck('file_path')->toArray();
        Storage::disk('public')->delete($paths);

        PdfFile::whereIn('id', $files->pluck('id'))->delete();

        return response()->json([
            'success' => true,
            'message' => 'Selected PDFs deleted successfully',
        ], 200);
    }
}