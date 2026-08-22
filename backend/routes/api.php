<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\PdfController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController; // 👈 1. UserController Import किया गया

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
// Public Authentication
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Public Document & Category Viewing
Route::get('/pdfs', [PdfController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);


/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum Auth Token Required)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Global Auth Profile & Logout
    Route::get('/me', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Panel Management Group (/api/admin/...)
    Route::prefix('admin')->group(function () {
        
        // 👤 Admin Profile Routes
        Route::get('/me', [AdminController::class, 'me']);
        Route::put('/me', [AdminController::class, 'updateProfile']); // 👈 Added for Profile Update

        // 👥 User Management CRUD Routes (ADDED)
        Route::get('/users', [UserController::class, 'index']);          // Fetch all users
        Route::post('/users', [UserController::class, 'store']);         // Create new user
        Route::put('/users/{id}', [UserController::class, 'update']);     // Update user details
        Route::delete('/users/{id}', [UserController::class, 'destroy']);  // Delete user

        // 📊 Dashboard Stats
        Route::get('/dashboard-stats', [DashboardController::class, 'getStats']);

        // 📂 Categories Admin Routes
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // 📄 PDF Management Admin Routes
        Route::post('/pdf/upload', [PdfController::class, 'upload']);
        Route::post('/pdfs/bulk-delete', [PdfController::class, 'bulkDelete']);
        Route::apiResource('pdfs', PdfController::class);
        
    });

});