<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Exception;

class UserController extends Controller
{
    // ==========================================
    // IMAGE UPLOAD DIRECTORY
    // ==========================================
    private function uploadDirectory()
    {
        return public_path('uploads/users');
    }

    // ==========================================
    // UPLOAD USER IMAGE
    // ==========================================
    private function uploadAvatar($file)
    {
        $directory = $this->uploadDirectory();

        if (!File::isDirectory($directory)) {
            File::makeDirectory(
                $directory,
                0755,
                true
            );
        }

        $filename = 'user_' .
            Str::uuid() .
            '.' .
            $file->extension();

        $file->move($directory, $filename);

        return 'uploads/users/' . $filename;
    }

    // ==========================================
    // DELETE OLD IMAGE
    // ==========================================
    private function deleteAvatar($path)
    {
        if (!$path) {
            return;
        }

        // Delete only local user images.
        if (!str_starts_with($path, 'uploads/users/')) {
            return;
        }

        $filename = basename($path);

        $fullPath = $this->uploadDirectory() .
            DIRECTORY_SEPARATOR .
            $filename;

        if (File::exists($fullPath)) {
            File::delete($fullPath);
        }
    }

    // ==========================================
    // USER RESPONSE WITH FULL IMAGE URL
    // ==========================================
    private function formatUser(User $user)
    {
        $data = $user->toArray();

        $avatar = $user->avatar;

        $data['avatar'] = $avatar
            ? (
                filter_var($avatar, FILTER_VALIDATE_URL)
                    ? $avatar
                    : asset(ltrim($avatar, '/'))
            )
            : null;

        return $data;
    }

    // ==========================================
    // GET ALL USERS
    // GET /api/admin/users
    // ==========================================
    public function index()
    {
        try {
            $users = User::latest()
                ->get()
                ->map(function ($user) {
                    return $this->formatUser($user);
                });

            return response()->json([
                'status' => true,
                'message' => 'Users fetched successfully',
                'users' => $users,
            ], 200);

        } catch (Exception $e) {
            Log::error('Users fetch failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch users'
            ], 500);
        }
    }

    // ==========================================
    // CREATE USER WITH IMAGE
    // POST /api/admin/users
    // ==========================================
    public function store(Request $request)
    {
        $avatarPath = null;

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',

                'email' => [
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')
                ],

                'password' => 'required|string|min:8',

                'role' => [
                    'required',
                    Rule::in(['admin', 'editor', 'user'])
                ],

                'bio' => 'nullable|string',

                'language' => 'nullable|string|max:100',

                'avatar' => [
                    'nullable',
                    'image',
                    'mimes:jpg,jpeg,png,webp',
                    'max:2048'
                ],
            ]);

            // Upload image
            if ($request->hasFile('avatar')) {
                $avatarPath = $this->uploadAvatar(
                    $request->file('avatar')
                );
            }

            $user = User::create([
                'name' => trim($validated['name']),

                'email' => strtolower(
                    trim($validated['email'])
                ),

                'password' => Hash::make(
                    $validated['password']
                ),

                'role' => strtolower(
                    $validated['role']
                ),

                'bio' => $validated['bio'] ?? null,

                'language' => $validated['language']
                    ?? 'English',

                // Image path saved in database
                'avatar' => $avatarPath,
            ]);

            return response()->json([
                'status' => true,
                'message' => 'User created successfully',
                'user' => $this->formatUser($user),
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => collect($e->errors())
                    ->flatten()
                    ->first() ?? 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            $this->deleteAvatar($avatarPath);

            Log::error('User creation failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to create user',
            ], 500);
        }
    }

    // ==========================================
    // UPDATE USER WITH IMAGE
    // PUT /api/admin/users/{id}
    // ==========================================
    public function update(Request $request, $id)
    {
        $newAvatar = null;

        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',

                'email' => [
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')
                        ->ignore($user->id)
                ],

                'role' => [
                    'required',
                    Rule::in(['admin', 'editor', 'user'])
                ],

                'password' => 'nullable|string|min:8',

                'bio' => 'nullable|string',

                'language' => 'nullable|string|max:100',

                'avatar' => [
                    'nullable',
                    'image',
                    'mimes:jpg,jpeg,png,webp',
                    'max:2048'
                ],

                'remove_avatar' => 'nullable|boolean',
            ]);

            $oldAvatar = $user->avatar;

            // Upload new image
            if ($request->hasFile('avatar')) {
                $newAvatar = $this->uploadAvatar(
                    $request->file('avatar')
                );
            }

            $user->name = trim($validated['name']);

            $user->email = strtolower(
                trim($validated['email'])
            );

            $user->role = strtolower(
                $validated['role']
            );

            $user->bio = $validated['bio'] ?? null;

            $user->language = $validated['language']
                ?? 'English';

            // Update password only when provided
            if (!empty($validated['password'])) {
                $user->password = Hash::make(
                    $validated['password']
                );
            }

            // Replace image
            if ($newAvatar) {
                $user->avatar = $newAvatar;
            }

            // Remove existing image
            elseif ($request->boolean('remove_avatar')) {
                $user->avatar = null;
            }

            $user->save();

            // Delete old image after successful save
            if (
                $oldAvatar &&
                $oldAvatar !== $user->avatar
            ) {
                $this->deleteAvatar($oldAvatar);
            }

            return response()->json([
                'status' => true,
                'message' => 'User updated successfully',
                'user' => $this->formatUser($user),
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => collect($e->errors())
                    ->flatten()
                    ->first() ?? 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            $this->deleteAvatar($newAvatar);

            Log::error('User update failed', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to update user',
            ], 500);
        }
    }

    // ==========================================
    // DELETE USER
    // DELETE /api/admin/users/{id}
    // ==========================================
    public function destroy($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Prevent self deletion
            if (
                auth()->check() &&
                (int) auth()->id() === (int) $user->id
            ) {
                return response()->json([
                    'status' => false,
                    'message' => 'You cannot delete your own account'
                ], 403);
            }

            $avatar = $user->avatar;

            $user->delete();

            $this->deleteAvatar($avatar);

            return response()->json([
                'status' => true,
                'message' => 'User deleted successfully'
            ], 200);

        } catch (Exception $e) {
            Log::error('User deletion failed', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to delete user'
            ], 500);
        }
    }
}
