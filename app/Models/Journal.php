<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Journal extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'note',
        'image_path',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getPhotoUrlAttribute()
    {
        return $this->image_path 
            ? Storage::url($this->photo_path)
            : null;
    }
}
