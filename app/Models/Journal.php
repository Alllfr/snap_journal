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
        'illustrator',
        'image_path',
        'user_id',
        'emotion',
        'confidence',
        'tags',
        'chatbot_strategy',
        'chatbot_suggestion',
        'chatbot_highlight',
    ];

    protected $casts = [
        'illustrator' => 'array',
        'confidence'  => 'float',
        'tags'        => 'array',
    ];

    protected $appends = [
        'illustrator_urls',
        'photo_url',
        'last_modified',
        'created_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getIllustratorUrlsAttribute()
    {
        if (!$this->illustrator) {
            return [];
        }

        return collect($this->illustrator)->map(function ($path) {
            return Storage::url($path);
        })->toArray();
    }

    public function getPhotoUrlAttribute()
    {
        return $this->image_path
            ? Storage::url($this->image_path)
            : null;
    }

    public function getLastModifiedAttribute()
    {
        return $this->updated_at ? $this->updated_at->format('d M Y H:i') : null;
    }

    public function getCreatedDateAttribute()
    {
        return $this->created_at ? $this->created_at->format('d M Y H:i') : null;
    }

    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
