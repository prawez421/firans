<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\PdfController;
use App\Http\Controllers\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| Public Routes (Frontend / Home Page Access)
|--------------------------------------------------------------------------
*/
// 🟢 Public Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// 🟢 Public Document & Category Viewing (Fixes "Backend se load nahi ho paye")
Route::get('/pdfs', [PdfController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Auth Token Required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Profile & Logout
    Route::get('/me', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Panel Management Group
    Route::prefix('admin')->group(function () {
        
        // Admin Profile
        Route::get('/me', [AdminController::class, 'me']);

        // Dashboard Stats Route
        Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);

        // Categories Admin CRUD Routes
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);


        Route::post('/pdf/upload', [PdfController::class, 'upload']);
        // PDF Management Admin Routes
        Route::apiResource('pdfs', PdfController::class);
        // Bulk Delete
    Route::post('/pdfs/bulk-delete', [PdfController::class, 'bulkDelete']);
        
    });

});