<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // 👈 1. Import Sanctum

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // 👈 2. Add HasApiTokens

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // Optional: Admin / User role ke liye
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}