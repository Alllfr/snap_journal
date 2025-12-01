<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasUuid;

class Journal extends Model
{
    use HasFactory, HasUuid;

    protected $fillable = [
        'title',
        'note',
        'illustrator_urls',
        'photo_url',
        'video_url',
        'user_id',
        'emotion',
        'confidence',
        'tags',
        'expression',
        'similarity',
        'chatbot_strategy',
        'chatbot_suggestion',
        'chatbot_highlight'
    ];

    protected $casts = [
        'confidence' => 'float',
        'similarity' => 'float',
        'tags' => 'array',
        'illustrator_urls' => 'array'
    ];

    protected $appends = [
        'illustrator_url',
        'last_modified',
        'created_date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    private function gcsPublicUrl(string $path): string
    {
        $bucket = env('GOOGLE_CLOUD_STORAGE_BUCKET');
        return "https://storage.googleapis.com/{$bucket}/{$path}";
    }

    public function getPhotoUrlAttribute($value)
    {
        if (!$value) return null;
        return str_starts_with($value, 'http')
            ? $value
            : $this->gcsPublicUrl($value);
    }

    public function getVideoUrlAttribute($value)
    {
        if (!$value) return null;
        return str_starts_with($value, 'http')
            ? $value
            : $this->gcsPublicUrl($value);
    }

    public function getIllustratorUrlAttribute()
    {
        if (!$this->illustrator_urls) return null;

        return collect($this->illustrator_urls)->map(function ($url) {
            return str_starts_with($url, 'http')
                ? $url
                : $this->gcsPublicUrl($url);
        })->toArray();
    }

    public function getLastModifiedAttribute()
    {
        return $this->updated_at
            ? $this->updated_at->format('d M Y H:i')
            : null;
    }

    public function getCreatedDateAttribute()
    {
        return $this->created_at
            ? $this->created_at->format('d M Y H:i')
            : null;
    }

    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}
