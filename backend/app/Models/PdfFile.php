<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PdfFile extends Model
{
    use HasFactory;

    protected $table = 'pdf_files';

    // Updated_at nahi chahiye to disable karein
    public $timestamps = false;

    protected $fillable = [
        'title',          
        'category_id',
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'created_at',
    ];

    /**
     * Category Relationship (Fixes the General issue)
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }
}