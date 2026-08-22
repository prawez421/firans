<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Exception;

class UserController extends Controller
{
    /**
     * 1. Get List of All Users
     * GET /api/admin/users
     */
    public function index()
    {
        try {
            $users = User::latest()->get();
            return response()->json([
                'status'  => true,
                'message' => 'Users fetched successfully',
                'users'   => $users
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to fetch users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 2. Create a New User/Admin
     * POST /api/admin/users
     */
    public function store(Request $request)
    {
        try {
            // Role case-insensitive validation support
            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:6',
                'role'     => 'nullable|string|in:admin,editor,user,Admin,Editor,User'
            ]);

            $user = User::create([
                'name'     => $validated['name'],
                'email'    => strtolower($validated['email']),
                'password' => Hash::make($validated['password']),
                'role'     => strtolower($validated['role'] ?? 'user'),
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'User created successfully',
                'user'    => $user
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => collect($e->errors())->first()[0] ?? 'Validation failed',
                'errors'  => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to create user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 3. Update Existing User Details
     * PUT /api/admin/users/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validated = $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => [
                    'required',
                    'string',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                'role'     => 'required|string|in:admin,editor,user,Admin,Editor,User',
                'password' => 'nullable|string|min:6'
            ]);

            $user->name  = $validated['name'];
            $user->email = strtolower($validated['email']);
            $user->role  = strtolower($validated['role']);

            if (!empty($validated['password'])) {
                $user->password = Hash::make($validated['password']);
            }

            $user->save();

            return response()->json([
                'status'  => true,
                'message' => 'User updated successfully',
                'user'    => $user
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => false,
                'message' => collect($e->errors())->first()[0] ?? 'Validation failed',
                'errors'  => $e->errors()
            ], 422);
        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 4. Delete User
     * DELETE /api/admin/users/{id}
     */
    public function destroy($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not found'
                ], 404);
            }

            $user->delete();

            return response()->json([
                'status'  => true,
                'message' => 'User deleted successfully'
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Failed to delete user: ' . $e->getMessage()
            ], 500);
        }
    }
}