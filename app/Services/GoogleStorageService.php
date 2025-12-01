<?php

namespace App\Services;

use Google\Cloud\Storage\StorageClient;

class GoogleStorageService
{
    protected $bucketName = 'rafly-sandbox';
    protected $storage;

    public function __construct()
    {
        $this->storage = new StorageClient([
            'projectId' => env('GOOGLE_CLOUD_PROJECT_ID', 'snap-journal-510e0'),
            'keyFilePath' => env('GOOGLE_CLOUD_KEY_FILE', 'C:\\Users\\Al Fihra\\AppData\\Roaming\\gcloud\\application_default_credentials.json'),
            'suppressKeyFileNotice' => true,
        ]);
    }

    public function uploadBase64($base64File, $userId, $journalId)
    {
        [$meta, $fileData] = explode(',', $base64File);
        $mime = explode(';', explode(':', $meta)[1])[0];
        $ext = explode('/', $mime)[1] ?? 'bin';
        $type = $this->detectType($mime, $base64File);
        $filename = uniqid() . '.' . $ext;
        $objectPath = "uploads/videos/{$userId}/{$journalId}/{$type}/{$filename}";
        $tempPath = storage_path("app/temp/{$filename}");
        if (!is_dir(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }
        file_put_contents($tempPath, base64_decode($fileData));
        $bucket = $this->storage->bucket($this->bucketName);
        $bucket->upload(
            fopen($tempPath, 'r'),
            ['name' => $objectPath, 'predefinedAcl' => 'publicRead']
        );
        unlink($tempPath);
        return "https://storage.googleapis.com/{$this->bucketName}/{$objectPath}";
    }

    protected function detectType($mime, $base64File)
    {
        if (str_contains($mime, 'audio') || str_contains($mime, 'video')) {
            return 'recordings';
        }
        if (str_contains($mime, 'image')) {
            if ($this->isGeneratedIllustration($base64File)) {
                return 'illustrations';
            }
            return 'image_uploads';
        }
        return 'image_uploads';
    }

    protected function isGeneratedIllustration($base64File)
    {
        return str_contains($base64File, 'AI_GENERATED_') || str_contains($base64File, 'illustration');
    }
}
