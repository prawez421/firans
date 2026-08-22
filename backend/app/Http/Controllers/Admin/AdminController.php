<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    /**
     * Get Logged-in Admin Profile Details
     * GET /api/admin/me
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Update Admin Profile Details
     * PUT /api/admin/me
     */
    public function updateProfile(Request $request)
    {
        $admin = $request->user();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($admin->id),
            ],
            'bio'      => 'nullable|string|max:1000',
            'language' => 'nullable|string|max:50',
            'avatar'   => 'nullable|string',
        ]);

        $admin->update($validated);

        return response()->json([
            'status'  => true,
            'message' => 'Admin profile updated successfully',
            'user'    => $admin,
        ], 200);
    }

    /**
     * Create New User (Admin Action)
     * POST /api/admin/users
     */
    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'nullable|string|in:user,admin,editor',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'] ?? 'user',
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'User created successfully',
            'user'    => $user,
        ], 201);
    }
}