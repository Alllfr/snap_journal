<?php

namespace App\Services\Journal;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class JournalFileService
{
    private function makePath($type, $userId, $journalId, $ext)
    {
        $filename = uniqid() . '.' . strtolower($ext);
        return "users/{$userId}/journals/{$journalId}/{$type}/{$filename}";
    }

    public function uploadUploadedFile($file, $type, $userId, $journalId, $ext = null)
    {
        $ext = $ext ?: $file->getClientOriginalExtension();
        $path = $this->makePath($type, $userId, $journalId, $ext);

        Storage::disk('gcs')->put($path, file_get_contents($file));

        return $path;
    }

    public function uploadBase64($base64, $type, $userId, $journalId, $ext)
    {
        $path = $this->makePath($type, $userId, $journalId, $ext);

        $binary = base64_decode(
            preg_replace('#^data:.*;base64,#', '', $base64)
        );

        Storage::disk('gcs')->put($path, $binary);

        return $path;
    }

    public function uploadBinary($binary, $type, $userId, $journalId, $ext)
    {
        $path = $this->makePath($type, $userId, $journalId, $ext);

        Storage::disk('gcs')->put($path, $binary);

        return $path;
    }

    public function delete($path)
    {
        if (!$path) return;

        try {
            Storage::disk('gcs')->delete($path);
        } catch (\Exception $e) {
            Log::warning("GCS delete failed: " . $e->getMessage());
        }
    }

    public function publicUrl($path)
    {
        $bucket = env('GOOGLE_CLOUD_STORAGE_BUCKET');
        return "https://storage.googleapis.com/{$bucket}/{$path}";
    }
}
